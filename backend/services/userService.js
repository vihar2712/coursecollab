const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Review = require('../models/Review');

async function getUserStatistics(userId) {
  // Aggregate counts
  const [courses, submissions, reviews] = await Promise.all([
    Course.countDocuments({
      $or: [
        { instructor: userId },
        { teachingAssistants: userId },
        { students: userId }
      ]
    }),
    Submission.countDocuments({ submitter: userId }),
    Review.countDocuments({ reviewer: userId })
  ]);

  return { courses, submissions, reviews };
}

module.exports = { getUserStatistics };