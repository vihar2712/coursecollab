const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CSC591']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teachingAssistants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Fall', 'Spring', 'Summer']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  capacity: {
    type: Number,
    required: [true, 'Course capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500']
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  waitlistCapacity: {
    type: Number,
    default: 50
  },
  currentWaitlist: {
    type: Number,
    default: 0
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: {
      start: String,
      end: String
    },
    location: String
  },
  settings: {
    allowSelfEnrollment: {
      type: Boolean,
      default: false
    },
    teamFormation: {
      type: String,
      enum: ['manual', 'automatic', 'student-choice'],
      default: 'manual'
    },
    peerReviewEnabled: {
      type: Boolean,
      default: true
    },
    anonymousReviews: {
      type: Boolean,
      default: true
    },
    autoWaitlist: {
      type: Boolean,
      default: true
    }
  },
  enrollmentCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    totalAssignments: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageGrade: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Generate enrollment code
courseSchema.pre('save', function(next) {
  if (this.isNew && this.settings.allowSelfEnrollment) {
    this.enrollmentCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.currentEnrollment;
});

// Virtual for waitlist availability
courseSchema.virtual('waitlistAvailable').get(function() {
  return this.waitlistCapacity - this.currentWaitlist;
});

// Virtual for enrollment status
courseSchema.virtual('enrollmentStatus').get(function() {
  if (this.currentEnrollment < this.capacity) {
    return 'open';
  } else if (this.currentWaitlist < this.waitlistCapacity) {
    return 'waitlist';
  } else {
    return 'closed';
  }
});

// Virtual for full course name
courseSchema.virtual('fullName').get(function() {
  return `${this.code} - ${this.title}`;
});

// Index for efficient queries
courseSchema.index({ instructor: 1 });
courseSchema.index({ code: 1, semester: 1, year: 1 });
courseSchema.index({ isActive: 1 });

module.exports = mongoose.model('Course', courseSchema);