const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { auth, isInstructor, isEnrolledInCourse, isCourseInstructor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, course, status, type } = req.query;
    const query = {};
    
    if (course) query.course = course;
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Get assignments based on user role and enrollment
    const userCourses = await Course.find({
      $or: [
        { instructor: req.user._id },
        { teachingAssistants: req.user._id },
        { students: req.user._id }
      ]
    }).select('_id');
    
    const courseIds = userCourses.map(course => course._id);
    query.course = { $in: courseIds };
    
    const assignments = await Assignment.find(query)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName')
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Assignment.countDocuments(query);
    
    res.json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user has access to this assignment
    const course = await Course.findById(assignment.course._id);
    const hasAccess = course.instructor.toString() === req.user._id.toString() ||
                     course.teachingAssistants.includes(req.user._id) ||
                     course.students.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Instructor only)
router.post('/', auth, isInstructor, [
  body('title').trim().isLength({ min: 1 }).withMessage('Assignment title is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('type').isIn(['individual', 'team']).withMessage('Type must be individual or team'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('maxPoints').isInt({ min: 1 }).withMessage('Max points must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const assignmentData = {
      ...req.body,
      instructor: req.user._id
    };
    
    const assignment = new Assignment(assignmentData);
    await assignment.save();
    
    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Course instructor only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('maxPoints').optional().isInt({ min: 1 }).withMessage('Max points must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Course instructor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Assignment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/publish
// @desc    Publish assignment
// @access  Private (Course instructor only)
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    assignment.isPublished = true;
    await assignment.save();
    
    res.json({ message: 'Assignment published successfully' });
  } catch (error) {
    console.error('Publish assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id/statistics
// @desc    Get assignment statistics
// @access  Private (Course instructor only)
router.get('/:id/statistics', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if user is instructor of the course
    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({
      statistics: assignment.statistics,
      totalStudents: course.students.length,
      submissionRate: course.students.length > 0 ? 
        (assignment.statistics.totalSubmissions / course.students.length) * 100 : 0
    });
  } catch (error) {
    console.error('Get assignment statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
