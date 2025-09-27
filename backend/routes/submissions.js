const express = require('express');
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Team = require('../models/Team');
const { auth, isEnrolledInCourse } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/submissions
// @desc    Get submissions for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, assignment, status, type } = req.query;
    const query = { submitter: req.user._id };
    
    if (assignment) query.assignment = assignment;
    if (status) query.status = status;
    if (type) query.type = type;
    
    const submissions = await Submission.find(query)
      .populate('assignment', 'title dueDate maxPoints')
      .populate('team', 'name')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Submission.countDocuments(query);
    
    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get submission by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'title description dueDate maxPoints instructions')
      .populate('submitter', 'firstName lastName email')
      .populate('team', 'name members');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user has access to this submission
    if (submission.submitter.toString() !== req.user._id.toString() && 
        req.user.role !== 'instructor' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/submissions
// @desc    Create new submission
// @access  Private
router.post('/', auth, [
  body('assignment').isMongoId().withMessage('Valid assignment ID is required'),
  body('type').isIn(['individual', 'team']).withMessage('Type must be individual or team'),
  body('textSubmission').optional().isLength({ max: 10000 }).withMessage('Text submission too long')
], uploadMultiple('files', 10), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { assignment, type, textSubmission, team } = req.body;
    
    // Check if assignment exists and is published
    const assignmentDoc = await Assignment.findById(assignment);
    if (!assignmentDoc) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (!assignmentDoc.isPublished) {
      return res.status(400).json({ message: 'Assignment is not published yet' });
    }
    
    // Check if assignment type matches
    if (assignmentDoc.type !== type) {
      return res.status(400).json({ message: `Assignment is ${assignmentDoc.type}, not ${type}` });
    }
    
    // For team submissions, check if user is in the team
    if (type === 'team' && team) {
      const teamDoc = await Team.findById(team);
      if (!teamDoc) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      if (!teamDoc.members.some(member => member.user.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Not a member of this team' });
      }
    }
    
    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      assignment,
      submitter: req.user._id,
      type
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'Submission already exists for this assignment' });
    }
    
    // Prepare files data
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    })) : [];
    
    // Create submission
    const submission = new Submission({
      assignment,
      submitter: req.user._id,
      type,
      team: team || null,
      files,
      textSubmission,
      status: 'draft'
    });
    
    await submission.save();
    
    res.status(201).json({
      message: 'Submission created successfully',
      submission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission
// @access  Private
router.put('/:id', auth, [
  body('textSubmission').optional().isLength({ max: 10000 }).withMessage('Text submission too long')
], uploadMultiple('files', 10), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user owns this submission
    if (submission.submitter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (submission.status === 'submitted') {
      return res.status(400).json({ message: 'Cannot update submitted submission' });
    }
    
    const { textSubmission } = req.body;
    
    // Handle file updates
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      }));
      
      // Store current files as previous version
      if (submission.files.length > 0) {
        submission.previousVersions.push({
          files: submission.files,
          textSubmission: submission.textSubmission,
          submittedAt: submission.submittedAt,
          version: submission.version
        });
      }
      
      submission.files = newFiles;
      submission.version += 1;
    }
    
    if (textSubmission !== undefined) {
      submission.textSubmission = textSubmission;
    }
    
    await submission.save();
    
    res.json({
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/submissions/:id/submit
// @desc    Submit submission for grading
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user owns this submission
    if (submission.submitter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (submission.status === 'submitted') {
      return res.status(400).json({ message: 'Submission already submitted' });
    }
    
    // Get assignment to check due date
    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Update submission status
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    
    // Check if submission is late
    if (submission.submittedAt > assignment.dueDate) {
      submission.isLate = true;
      submission.status = 'late';
    }
    
    await submission.save();
    
    // Update assignment statistics
    assignment.statistics.totalSubmissions += 1;
    if (submission.isLate) {
      assignment.statistics.lateSubmissions += 1;
    } else {
      assignment.statistics.onTimeSubmissions += 1;
    }
    await assignment.save();
    
    res.json({
      message: 'Submission submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submit submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/:id/reviews
// @desc    Get reviews for submission
// @access  Private
router.get('/:id/reviews', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check access
    if (submission.submitter.toString() !== req.user._id.toString() && 
        req.user.role !== 'instructor' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const Review = require('../models/Review');
    const reviews = await Review.find({ submission: req.params.id })
      .populate('reviewer', 'firstName lastName')
      .populate('reviewee', 'firstName lastName')
      .sort({ submittedAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/:id/grade
// @desc    Get grade for submission
// @access  Private
router.get('/:id/grade', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check access
    if (submission.submitter.toString() !== req.user._id.toString() && 
        req.user.role !== 'instructor' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const Grade = require('../models/Grade');
    const grade = await Grade.findOne({ submission: req.params.id })
      .populate('instructor', 'firstName lastName')
      .populate('peerReviews.review');
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    
    res.json(grade);
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
