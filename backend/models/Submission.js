const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitter is required']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  type: {
    type: String,
    enum: ['individual', 'team'],
    required: [true, 'Submission type is required']
  },
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  textSubmission: {
    type: String,
    maxlength: [10000, 'Text submission cannot exceed 10000 characters']
  },
  submissionText: {
    type: String,
    maxlength: [5000, 'Submission text cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late', 'graded'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0
  },
  grade: {
    points: {
      type: Number,
      min: 0
    },
    maxPoints: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    },
    feedback: {
      type: String,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    rubricScores: [{
      criterion: String,
      points: Number,
      maxPoints: Number,
      feedback: String
    }]
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    files: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String,
      uploadedAt: Date
    }],
    textSubmission: String,
    submittedAt: Date,
    version: Number
  }],
  metadata: {
    wordCount: Number,
    pageCount: Number,
    totalSize: Number,
    lastModified: Date
  }
}, {
  timestamps: true
});

// Calculate if submission is late
submissionSchema.pre('save', function(next) {
  if (this.status === 'submitted' && this.submittedAt) {
    const assignment = this.assignment;
    if (assignment && this.submittedAt > assignment.dueDate) {
      this.isLate = true;
      this.status = 'late';
    }
  }
  next();
});

// Calculate grade percentage
submissionSchema.methods.calculatePercentage = function() {
  if (this.grade.points && this.grade.maxPoints) {
    this.grade.percentage = Math.round((this.grade.points / this.grade.maxPoints)) * 100;
  }
};

// Calculate letter grade
submissionSchema.methods.calculateLetterGrade = function() {
  const percentage = this.grade.percentage;
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

// Get submission status
submissionSchema.virtual('statusText').get(function() {
  switch (this.status) {
    case 'draft': return 'Draft';
    case 'submitted': return 'Submitted';
    case 'late': return 'Late Submission';
    case 'graded': return 'Graded';
    default: return 'Unknown';
  }
});

// Index for efficient queries
submissionSchema.index({ assignment: 1, submitter: 1 });
submissionSchema.index({ team: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
