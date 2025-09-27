const express = require('express');
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { auth, isEnrolledInCourse } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/teams
// @desc    Get teams for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, assignment, course } = req.query;
    const query = {};
    
    if (assignment) query.assignment = assignment;
    if (course) query.course = course;
    
    // Get teams where user is a member or where user can join
    const teams = await Team.find({
      $or: [
        { 'members.user': req.user._id },
        { course: course || { $exists: true } }
      ],
      ...query
    })
    .populate('assignment', 'title dueDate')
    .populate('course', 'title code')
    .populate('members.user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await Team.countDocuments({
      $or: [
        { 'members.user': req.user._id },
        { course: course || { $exists: true } }
      ],
      ...query
    });
    
    res.json({
      teams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('assignment', 'title dueDate type')
      .populate('course', 'title code')
      .populate('members.user', 'firstName lastName email studentId');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user has access to this team
    const isMember = team.members.some(member => member.user._id.toString() === req.user._id.toString());
    const course = await Course.findById(team.course._id);
    const hasCourseAccess = course.instructor.toString() === req.user._id.toString() ||
                           course.teachingAssistants.includes(req.user._id) ||
                           course.students.includes(req.user._id);
    
    if (!isMember && !hasCourseAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams
// @desc    Create new team
// @access  Private
router.post('/', auth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Team name is required'),
  body('assignment').isMongoId().withMessage('Valid assignment ID is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('maxMembers').optional().isInt({ min: 2, max: 8 }).withMessage('Max members must be between 2 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, assignment, description, maxMembers = 4, skills } = req.body;
    
    // Check if assignment exists and user has access
    const assignmentDoc = await Assignment.findById(assignment)
      .populate('course');
    
    if (!assignmentDoc) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    if (assignmentDoc.type !== 'team') {
      return res.status(400).json({ message: 'Assignment is not a team assignment' });
    }
    
    // Check if user is enrolled in the course
    const course = await Course.findById(assignmentDoc.course._id);
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Check if user is already in a team for this assignment
    const existingTeam = await Team.findOne({
      assignment,
      'members.user': req.user._id
    });
    
    if (existingTeam) {
      return res.status(400).json({ message: 'Already in a team for this assignment' });
    }
    
    const teamData = {
      name,
      assignment,
      course: assignmentDoc.course._id,
      description,
      maxMembers,
      skills: skills || [],
      members: [{
        user: req.user._id,
        role: 'leader',
        joinedAt: new Date()
      }]
    };
    
    const team = new Team(teamData);
    await team.save();
    
    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/teams/:id
// @desc    Update team
// @access  Private (Team leader only)
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Team name cannot be empty'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team leader
    const leader = team.members.find(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'leader'
    );
    
    if (!leader) {
      return res.status(403).json({ message: 'Only team leader can update team' });
    }
    
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Team updated successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams/:id/join
// @desc    Join team
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if team is locked
    if (team.isLocked) {
      return res.status(400).json({ message: 'Team is locked' });
    }
    
    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is full' });
    }
    
    // Check if user is already in the team
    if (team.members.some(member => member.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already in this team' });
    }
    
    // Check if user is already in another team for this assignment
    const existingTeam = await Team.findOne({
      assignment: team.assignment,
      'members.user': req.user._id
    });
    
    if (existingTeam) {
      return res.status(400).json({ message: 'Already in a team for this assignment' });
    }
    
    team.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });
    
    await team.save();
    
    res.json({ message: 'Successfully joined team' });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/teams/:id/leave
// @desc    Leave team
// @access  Private
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is in the team
    const memberIndex = team.members.findIndex(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this team' });
    }
    
    // If user is the leader, transfer leadership or delete team
    if (team.members[memberIndex].role === 'leader') {
      if (team.members.length === 1) {
        // Delete team if only member
        await Team.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Team deleted as you were the only member' });
      } else {
        // Transfer leadership to another member
        const newLeader = team.members.find(member => member.user.toString() !== req.user._id.toString());
        if (newLeader) {
          newLeader.role = 'leader';
        }
      }
    }
    
    team.members.splice(memberIndex, 1);
    await team.save();
    
    res.json({ message: 'Successfully left team' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teams/:id/lock
// @desc    Lock team
// @access  Private (Team leader only)
router.post('/:id/lock', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team leader
    const leader = team.members.find(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'leader'
    );
    
    if (!leader) {
      return res.status(403).json({ message: 'Only team leader can lock team' });
    }
    
    team.isLocked = true;
    await team.save();
    
    res.json({ message: 'Team locked successfully' });
  } catch (error) {
    console.error('Lock team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
