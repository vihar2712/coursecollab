const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  type: {
    type: String,
    enum: ['individual', 'team'],
    required: [true, 'Assignment type is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  lateSubmissionAllowed: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  maxPoints: {
    type: Number,
    required: [true, 'Maximum points are required'],
    min: [1, 'Points must be at least 1']
  },
  instructions: {
    type: String,
    maxlength: [10000, 'Instructions cannot exceed 10000 characters']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  submissionFormat: {
    allowedTypes: [String],
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    },
    maxFiles: {
      type: Number,
      default: 5
    }
  },
  peerReview: {
    enabled: {
      type: Boolean,
      default: false
    },
    requiredReviews: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    reviewDueDate: Date,
    criteria: [{
      name: String,
      description: String,
      maxPoints: Number,
      weight: Number
    }],
    anonymous: {
      type: Boolean,
      default: true
    }
  },
  rubric: [{
    criterion: String,
    description: String,
    points: Number,
    levels: [{
      name: String,
      description: String,
      points: Number
    }]
  }],
  plagiarismCheck: {
    enabled: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    totalSubmissions: { type: Number, default: 0 },
    onTimeSubmissions: { type: Number, default: 0 },
    lateSubmissions: { type: Number, default: 0 },
    reviewsSubmitted: { type: Number, default: 0 },
    averageGrade: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Virtual for time remaining
assignmentSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = due - now;
  
  if (diff <= 0) return 'Overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} days, ${hours} hours`;
  if (hours > 0) return `${hours} hours, ${minutes} minutes`;
  return `${minutes} minutes`;
});

// Check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.dueDate);
});

// Check if peer review is overdue
assignmentSchema.virtual('isReviewOverdue').get(function() {
  if (!this.peerReview.enabled || !this.peerReview.reviewDueDate) return false;
  return new Date() > new Date(this.peerReview.reviewDueDate);
});

// Index for efficient queries
assignmentSchema.index({ course: 1, isActive: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);