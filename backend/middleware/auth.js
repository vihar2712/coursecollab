const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is instructor
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Instructor role required.' });
  }
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user is student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  next();
};

// Check if user owns resource or is instructor/admin
const isOwnerOrInstructor = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user.role === 'instructor') {
    return next();
  }
  
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied' });
};

// Check if user is enrolled in course
const isEnrolledInCourse = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.body.courseId;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is instructor, TA, or student
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isTA = course.teachingAssistants.includes(req.user._id);
    const isStudent = course.students.includes(req.user._id);
    
    if (!isInstructor && !isTA && !isStudent) {
      return res.status(403).json({ message: 'Access denied. Not enrolled in course.' });
    }
    
    req.course = course;
    next();
  } catch (error) {
    console.error('Course enrollment check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is course instructor
const isCourseInstructor = async (req, res, next) => {
  try {
    const Course = require('../models/Course');
    const courseId = req.params.courseId || req.body.courseId;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Course instructor required.' });
    }
    
    req.course = course;
    next();
  } catch (error) {
    console.error('Course instructor check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  auth,
  isInstructor,
  isAdmin,
  isStudent,
  isOwnerOrInstructor,
  isEnrolledInCourse,
  isCourseInstructor
};
