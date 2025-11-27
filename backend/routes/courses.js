const express = require('express');
const { body } = require('express-validator');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
} = require('../controllers/coursesController');
const { auth, isInstructor, isCourseInstructor, isEnrolledInCourse } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getCourses);
router.get('/:id', auth, isEnrolledInCourse, getCourseById);

router.post(
  '/',
  auth,
  isInstructor,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Course title is required'),
    body('code').matches(/^[A-Z]{2,4}\d{3,4}$/).withMessage('Invalid course code format'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('semester').isIn(['Fall', 'Spring', 'Summer']).withMessage('Invalid semester'),
    body('year').isInt({ min: 2020 }).withMessage('Invalid year'),
    body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
    body('capacity').isInt({ min: 1, max: 500 }).withMessage('Capacity must be between 1 and 500'),
  ],
  createCourse
);

router.put('/:id', auth, isCourseInstructor, updateCourse);
router.delete('/:id', auth, isCourseInstructor, deleteCourse);
router.post('/:id/enroll', auth, enrollInCourse);
router.delete('/:id/enroll', auth, unenrollFromCourse);

module.exports = router;
