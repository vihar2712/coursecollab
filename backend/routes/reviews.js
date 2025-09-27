const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, assignment, status, type } = req.query;
    const query = { reviewer: req.user._id };
    
    if (assignment) query.assignment = assignment;
    if (status) query.status = status;
    
    const reviews = await Review.find(query)
      .populate('assignment', 'title dueDate')
      .populate('submission', 'status submittedAt')
      .populate('reviewee', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments(query);
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('assignment', 'title description peerReview')
      .populate('submission', 'files textSubmission')
      .populate('reviewer', 'firstName lastName')
      .populate('reviewee', 'firstName lastName');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user has access to this review
    if (review.reviewer.toString() !== req.user._id.toString() && 
        review.reviewee.toString() !== req.user._id.toString() &&
        req.user.role !== 'instructor' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', auth, [
  body('submission').isMongoId().withMessage('Valid submission ID is required'),
  body('criteria').isArray({ min: 1 }).withMessage('At least one criterion is required'),
  body('criteria.*.name').notEmpty().withMessage('Criterion name is required'),
  body('criteria.*.score').isNumeric().withMessage('Criterion score must be numeric'),
  body('criteria.*.maxScore').isNumeric().withMessage('Criterion max score must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { submission, criteria, feedback } = req.body;
    
    // Check if submission exists
    const submissionDoc = await Submission.findById(submission)
      .populate('assignment');
    
    if (!submissionDoc) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if assignment has peer review enabled
    if (!submissionDoc.assignment.peerReview.enabled) {
      return res.status(400).json({ message: 'Peer review is not enabled for this assignment' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      submission,
      reviewer: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this submission' });
    }
    
    // Check if user is reviewing their own submission
    if (submissionDoc.submitter.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot review your own submission' });
    }
    
    // Create review
    const review = new Review({
      assignment: submissionDoc.assignment._id,
      submission,
      reviewer: req.user._id,
      reviewee: submissionDoc.submitter,
      team: submissionDoc.team,
      criteria,
      feedback,
      status: 'draft'
    });
    
    await review.save();
    
    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', auth, [
  body('criteria').optional().isArray().withMessage('Criteria must be an array'),
  body('criteria.*.name').optional().notEmpty().withMessage('Criterion name cannot be empty'),
  body('criteria.*.score').optional().isNumeric().withMessage('Criterion score must be numeric'),
  body('criteria.*.maxScore').optional().isNumeric().withMessage('Criterion max score must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (review.status === 'submitted') {
      return res.status(400).json({ message: 'Cannot update submitted review' });
    }
    
    const { criteria, feedback } = req.body;
    
    if (criteria) {
      review.criteria = criteria;
    }
    
    if (feedback) {
      review.feedback = feedback;
    }
    
    await review.save();
    
    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/submit
// @desc    Submit review
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns this review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (review.status === 'submitted') {
      return res.status(400).json({ message: 'Review already submitted' });
    }
    
    // Validate review has required criteria
    if (!review.criteria || review.criteria.length === 0) {
      return res.status(400).json({ message: 'Review must have at least one criterion' });
    }
    
    // Get assignment to check review due date
    const assignment = await Assignment.findById(review.assignment);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Update review status
    review.status = 'submitted';
    review.submittedAt = new Date();
    
    // Check if review is late
    if (assignment.peerReview.reviewDueDate && 
        review.submittedAt > assignment.peerReview.reviewDueDate) {
      review.isLate = true;
      review.status = 'late';
    }
    
    await review.save();
    
    // Update assignment statistics
    assignment.statistics.reviewsSubmitted += 1;
    await assignment.save();
    
    res.json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/assignment/:assignmentId
// @desc    Get reviews for assignment
// @access  Private
router.get('/assignment/:assignmentId', auth, async (req, res) => {
  try {
    const { status, reviewee } = req.query;
    const query = { assignment: req.params.assignmentId };
    
    if (status) query.status = status;
    if (reviewee) query.reviewee = reviewee;
    
    const reviews = await Review.find(query)
      .populate('reviewer', 'firstName lastName')
      .populate('reviewee', 'firstName lastName')
      .populate('submission', 'status submittedAt')
      .sort({ submittedAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get assignment reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/feedback
// @desc    Add feedback to review
// @access  Private
router.post('/:id/feedback', auth, [
  body('helpfulness').optional().isInt({ min: 1, max: 5 }).withMessage('Helpfulness must be between 1 and 5'),
  body('quality').optional().isInt({ min: 1, max: 5 }).withMessage('Quality must be between 1 and 5'),
  body('timeliness').optional().isInt({ min: 1, max: 5 }).withMessage('Timeliness must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the reviewee
    if (review.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { helpfulness, quality, timeliness, feedback } = req.body;
    
    if (helpfulness !== undefined) review.helpfulness = helpfulness;
    if (quality !== undefined) review.quality = quality;
    if (timeliness !== undefined) review.timeliness = timeliness;
    if (feedback !== undefined) review.reviewerFeedback = feedback;
    
    await review.save();
    
    res.json({
      message: 'Feedback added successfully',
      review
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
