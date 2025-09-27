const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxMembers: {
    type: Number,
    default: 4,
    min: 2,
    max: 8
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  preferences: {
    meetingTimes: [String],
    communicationMethod: {
      type: String,
      enum: ['slack', 'discord', 'teams', 'email', 'other'],
      default: 'email'
    },
    workStyle: {
      type: String,
      enum: ['collaborative', 'independent', 'mixed'],
      default: 'mixed'
    }
  },
  statistics: {
    submissionsCount: { type: Number, default: 0 },
    averageGrade: { type: Number, default: 0 },
    participationScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for available spots
teamSchema.virtual('availableSpots').get(function() {
  return this.maxMembers - this.members.length;
});

// Check if team is full
teamSchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

// Check if user is member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Add member to team
teamSchema.methods.addMember = function(userId, role = 'member') {
  if (this.isFull) {
    throw new Error('Team is full');
  }
  
  if (this.isMember(userId)) {
    throw new Error('User is already a member');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
};

// Remove member from team
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
};

// Get team leader
teamSchema.methods.getLeader = function() {
  const leader = this.members.find(member => member.role === 'leader');
  return leader ? leader.user : null;
};

// Index for efficient queries
teamSchema.index({ assignment: 1, course: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isActive: 1 });

module.exports = mongoose.model('Team', teamSchema);