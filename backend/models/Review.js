const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: [true, 'Submission is required']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  criteria: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    maxScore: {
      type: Number,
      required: true,
      default: 100
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    weight: {
      type: Number,
      default: 1
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    strengths: {
      type: String,
      maxlength: [2000, 'Strengths feedback cannot exceed 2000 characters']
    },
    improvements: {
      type: String,
      maxlength: [2000, 'Improvements feedback cannot exceed 2000 characters']
    },
    general: {
      type: String,
      maxlength: [2000, 'General feedback cannot exceed 2000 characters']
    }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  helpfulness: {
    type: Number,
    min: 1,
    max: 5
  },
  quality: {
    type: Number,
    min: 1,
    max: 5
  },
  timeliness: {
    type: Number,
    min: 1,
    max: 5
  },
  reviewerFeedback: {
    type: String,
    maxlength: [1000, 'Reviewer feedback cannot exceed 1000 characters']
  },
  metadata: {
    timeSpent: Number, // in minutes
    wordCount: Number,
    lastModified: Date
  }
}, {
  timestamps: true
});

// Calculate overall score
reviewSchema.pre('save', function(next) {
  if (this.criteria && this.criteria.length > 0) {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    this.criteria.forEach(criterion => {
      const weight = criterion.weight || 1;
      const percentage = (criterion.score / criterion.maxScore) * 100;
      totalWeightedScore += percentage * weight;
      totalWeight += weight;
    });
    
    if (totalWeight > 0) {
      this.overallScore = Math.round(totalWeightedScore / totalWeight);
    }
  }
  next();
});

// Check if review is late
reviewSchema.pre('save', function(next) {
  if (this.status === 'submitted' && this.submittedAt) {
    // Get assignment due date for peer review
    // This would need to be populated or fetched
    // For now, we'll assume it's handled in the route
  }
  next();
});

// Get review status text
reviewSchema.virtual('statusText').get(function() {
  switch (this.status) {
    case 'draft': return 'Draft';
    case 'submitted': return 'Submitted';
    case 'late': return 'Late';
    default: return 'Unknown';
  }
});

// Get grade letter for overall score
reviewSchema.virtual('gradeLetter').get(function() {
  if (!this.overallScore) return null;
  
  if (this.overallScore >= 97) return 'A+';
  if (this.overallScore >= 93) return 'A';
  if (this.overallScore >= 90) return 'A-';
  if (this.overallScore >= 87) return 'B+';
  if (this.overallScore >= 83) return 'B';
  if (this.overallScore >= 80) return 'B-';
  if (this.overallScore >= 77) return 'C+';
  if (this.overallScore >= 73) return 'C';
  if (this.overallScore >= 70) return 'C-';
  if (this.overallScore >= 67) return 'D+';
  if (this.overallScore >= 63) return 'D';
  if (this.overallScore >= 60) return 'D-';
  return 'F';
});

// Index for efficient queries
reviewSchema.index({ assignment: 1, reviewer: 1 });
reviewSchema.index({ submission: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ team: 1 });

// Ensure one review per reviewer per submission
reviewSchema.index({ submission: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
