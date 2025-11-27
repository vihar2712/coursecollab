// controllers/coursesController.js
const { validationResult } = require('express-validator');
const courseService = require('../services/courseService');

exports.getCourses = async (req, res) => {
    try {
        const data = await courseService.getCoursesForUser(req.user, req.query);
        res.json(data);
    } catch (err) {
        console.error('Get courses error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        res.json(course);
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Course not found' });
        console.error('Get course error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const course = await courseService.createCourse(req.user, req.body);
        res.status(201).json({ message: 'Course created successfully', course });
    } catch (err) {
        console.error('Create course error:', err);
        if (err.code === 11000)
            return res.status(400).json({ message: 'Course code already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const course = await courseService.updateCourse(req.params.id, req.body);
        res.json({ message: 'Course updated successfully', course });
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Course not found' });
        console.error('Update course error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await courseService.deleteCourse(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Course not found' });
        console.error('Delete course error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.enrollInCourse = async (req, res) => {
    try {
        const result = await courseService.enrollUser(req.params.id, req.user, req.body.enrollmentCode);
        res.json(result);
    } catch (err) {
        console.error('Enroll course error:', err);
        const errorMap = {
            NOT_FOUND: [404, 'Course not found'],
            ALREADY_ENROLLED: [400, 'Already enrolled in this course'],
            COURSE_FULL: [400, 'Course is full'],
            INVALID_CODE: [400, 'Invalid enrollment code'],
        };
        const [status, message] = errorMap[err.message] || [500, 'Server error'];
        res.status(status).json({ message });
    }
};

exports.unenrollFromCourse = async (req, res) => {
    try {
        const result = await courseService.unenrollUser(req.params.id, req.user);
        res.json(result);
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Course not found' });
        console.error('Unenroll course error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
