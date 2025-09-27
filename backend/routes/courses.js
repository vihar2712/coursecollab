const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { auth, isInstructor, isEnrolledInCourse, isCourseInstructor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, semester, year } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    
    // Get courses based on user role
    if (req.user.role === 'instructor' || req.user.role === 'admin') {
      query.$or = [
        { instructor: req.user._id },
        { teachingAssistants: req.user._id },
        { students: req.user._id }
      ];
    } else {
      query.students = req.user._id;
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .populate('teachingAssistants', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, isEnrolledInCourse, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email')
      .populate('teachingAssistants', 'firstName lastName email')
      .populate('students', 'firstName lastName email studentId');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Instructor only)
router.post('/', auth, isInstructor, [
  body('title').trim().isLength({ min: 1 }).withMessage('Course title is required'),
  body('code').matches(/^[A-Z]{2,4}\d{3,4}$/).withMessage('Invalid course code format'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('semester').isIn(['Fall', 'Spring', 'Summer']).withMessage('Invalid semester'),
  body('year').isInt({ min: 2020 }).withMessage('Invalid year'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('capacity').isInt({ min: 1, max: 500 }).withMessage('Capacity must be between 1 and 500')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const courseData = {
      ...req.body,
      instructor: req.user._id
    };
    
    const course = new Course(courseData);
    await course.save();
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Course instructor only)
router.put('/:id', auth, isCourseInstructor, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Course title cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('capacity').optional().isInt({ min: 1, max: 500 }).withMessage('Capacity must be between 1 and 500')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Course instructor only)
router.delete('/:id', auth, isCourseInstructor, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private
router.post('/:id/enroll', auth, [
  body('enrollmentCode').optional().trim()
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Check capacity
    if (course.currentEnrollment >= course.capacity) {
      return res.status(400).json({ message: 'Course is full' });
    }
    
    // Check enrollment code if required
    if (course.settings.allowSelfEnrollment && course.enrollmentCode) {
      if (req.body.enrollmentCode !== course.enrollmentCode) {
        return res.status(400).json({ message: 'Invalid enrollment code' });
      }
    }
    
    course.students.push(req.user._id);
    course.currentEnrollment += 1;
    await course.save();
    
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id/enroll
// @desc    Unenroll from course
// @access  Private
router.delete('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.students = course.students.filter(id => id.toString() !== req.user._id.toString());
    course.currentEnrollment = Math.max(0, course.currentEnrollment - 1);
    await course.save();
    
    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
