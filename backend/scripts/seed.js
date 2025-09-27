const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Review = require('../models/Review');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coursecollab', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Assignment.deleteMany({});
  await Team.deleteMany({});
  await Submission.deleteMany({});
  await Review.deleteMany({});
  console.log('Database cleared');
};

// Create users
const createUsers = async () => {
  console.log('Creating users...');
  
  const users = [
    {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'instructor',
      department: 'Computer Science',
      officeLocation: 'EBII 1234',
      officeHours: 'Mon, Wed 2:00-4:00 PM',
      phone: '(919) 515-1234',
      bio: 'Professor of Software Engineering with 15 years of experience in industry and academia.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      email: 'michael.chen@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'instructor',
      department: 'Computer Science',
      officeLocation: 'EBII 1235',
      officeHours: 'Tue, Thu 10:00-12:00 PM',
      phone: '(919) 515-1235',
      bio: 'Associate Professor specializing in Database Systems and Software Architecture.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      studentId: '2024001',
      major: 'Computer Science',
      year: 'Graduate',
      gpa: 3.8,
      bio: 'Graduate CS student interested in software engineering and web development.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      studentId: '2024002',
      major: 'Computer Science',
      year: '2nd',
      gpa: 3.9,
      bio: 'Passionate about machine learning and data science.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      studentId: '2024003',
      major: 'Computer Science',
      year: 'Graduate',
      gpa: 3.7,
      bio: 'Interested in cybersecurity and software testing.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      studentId: '2024004',
      major: 'Computer Science',
      year: '1st',
      gpa: 3.6,
      bio: 'Focused on mobile app development and user experience design.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      studentId: '2024005',
      major: 'Computer Science',
      year: 'Graduate',
      gpa: 3.9,
      bio: 'Interested in artificial intelligence and natural language processing.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    },
    {
      firstName: 'Alex',
      lastName: 'Martinez',
      email: 'alex.martinez@university.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      studentId: '2024006',
      major: 'Computer Science',
      year: '1st',
      gpa: 3.5,
      bio: 'Passionate about game development and computer graphics.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Create courses
const createCourses = async (instructors) => {
  console.log('Creating courses...');
  
  const courses = [
    {
      title: 'Software Engineering',
      code: 'CSC591',
      description: 'Advanced software engineering principles, methodologies, and practices. Covers software development lifecycle, design patterns, testing, and project management.',
      instructor: instructors[0]._id,
      semester: 'Fall',
      year: 2024,
      credits: 3,
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: {
          start: '2:00 PM',
          end: '3:15 PM',
        },
        location: 'EBII 1234'
      },
      prerequisites: ['CSC 316', 'CSC 326'],
      capacity: 30,
      currentEnrollment: 8,
      status: 'active',
      syllabus: 'https://example.com/syllabus/csc591.pdf',
      resources: [
        { title: 'Course Textbook', url: 'https://example.com/textbook', type: 'book' },
        { title: 'GitHub Repository', url: 'https://github.com/csc591/assignments', type: 'repository' }
      ]
    },
    {
      title: 'Database Systems',
      code: 'CSC540',
      description: 'Database design, implementation, and management. Covers relational databases, SQL, normalization, indexing, and database administration.',
      instructor: instructors[1]._id,
      semester: 'Fall',
      year: 2024,
      credits: 3,
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: {
          start: '10:00 AM',
          end: '11:15 AM',
        },
        location: 'EBII 1235'
      },
      prerequisites: ['CSC 316'],
      capacity: 25,
      currentEnrollment: 6,
      status: 'active',
      syllabus: 'https://example.com/syllabus/csc540.pdf',
      resources: [
        { title: 'Database Design Guide', url: 'https://example.com/db-guide', type: 'guide' }
      ]
    }
  ];

  const createdCourses = await Course.insertMany(courses);
  console.log(`Created ${createdCourses.length} courses`);
  return createdCourses;
};

// Create teams
const createTeams = async (courses, students, assignments) => {
  console.log('Creating teams...');
  
  const teams = [
    {
      name: 'Team Alpha',
      course: courses[0]._id,
      assignment: assignments[0]._id,
      members: [{user: students[0]._id, role: 'leader'}, {user: students[1]._id, role: 'member'}],
      leader: students[0]._id,
      description: 'Focused on web application development',
      status: 'active',
      createdAt: new Date('2024-08-15')
    },
    {
      name: 'Team Beta',
      course: courses[0]._id,
      assignment: assignments[0]._id,
      members: [{user: students[2]._id, role: 'leader'}, {user: students[3]._id, role: 'member'}],
      leader: students[2]._id,
      description: 'Specializing in mobile app development',
      status: 'active',
      createdAt: new Date('2024-08-16')
    },
    {
      name: 'Team Gamma',
      course: courses[0]._id,
      assignment: assignments[0]._id,
      members: [{user: students[4]._id, role: 'leader'}, {user: students[5]._id, role: 'member'}],
      leader: students[4]._id,
      description: 'AI and machine learning focused',
      status: 'active',
      createdAt: new Date('2024-08-17')
    },
    {
      name: 'Database Team 1',
      assignment: assignments[1]._id,
      course: courses[1]._id,
      members: [{user: students[1]._id, role: 'leader'}, {user: students[3]._id, role: 'member'}],
      leader: students[1]._id,
      description: 'Database design and optimization',
      status: 'active',
      createdAt: new Date('2024-08-20')
    }
  ];

  const createdTeams = await Team.insertMany(teams);
  console.log(`Created ${createdTeams.length} teams`);
  return createdTeams;
};

// Create assignments
const createAssignments = async (courses, instructors) => {
  console.log('Creating assignments...');
  
  const assignments = [
    {
      title: 'Project Proposal',
      description: 'Create a detailed project proposal for your software engineering project. Include problem statement, solution approach, technology stack, timeline, and team roles.',
      course: courses[0]._id,
      type: 'team',
      instructor: instructors[0]._id,
      dueDate: new Date('2024-09-15T23:59:59Z'),
      maxPoints: 100,
      instructions: 'Submit a 3-5 page project proposal document. Include diagrams and references.',
      resources: [
        { title: 'Proposal Template', url: 'https://example.com/proposal-template.docx', type: 'template' },
        { title: 'Writing Guidelines', url: 'https://example.com/writing-guidelines.pdf', type: 'guide' }
      ],
      peerReview: {
        enabled: true,
        criteria: [
          { name: 'Clarity', description: 'How clear and well-structured is the proposal?', maxScore: 10, weight: 0.3 },
          { name: 'Completeness', description: 'Does the proposal cover all required sections?', maxScore: 10, weight: 0.3 },
          { name: 'Feasibility', description: 'Is the proposed solution realistic and achievable?', maxScore: 10, weight: 0.4 }
        ],
        reviewDueDate: new Date('2024-09-20T23:59:59Z'),
        minReviews: 2,
        maxReviews: 3
      },
      submission: {
        allowedTypes: ['pdf', 'doc', 'docx'],
        maxFileSize: 10485760, // 10MB
        maxFiles: 3,
        allowTextSubmission: true
      },
      status: 'active',
      statistics: {
        totalSubmissions: 0,
        onTimeSubmissions: 0,
        lateSubmissions: 0,
        reviewsSubmitted: 0,
        averageScore: 0
      }
    },
    {
      title: 'System Design Document',
      description: 'Design the system architecture for your project. Include component diagrams, database schema, API specifications, and deployment strategy.',
      course: courses[0]._id,
      instructor: instructors[0]._id,
      type: 'team',
      dueDate: new Date('2024-10-15T23:59:59Z'),
      maxPoints: 150,
      instructions: 'Create a comprehensive system design document with visual diagrams and technical specifications.',
      resources: [
        { title: 'Design Patterns Guide', url: 'https://example.com/design-patterns.pdf', type: 'guide' },
        { title: 'Architecture Examples', url: 'https://example.com/architecture-examples', type: 'examples' }
      ],
      peerReview: {
        enabled: true,
        criteria: [
          { name: 'Architecture', description: 'Quality of system architecture design', maxScore: 15, weight: 0.4 },
          { name: 'Scalability', description: 'How well does the design handle scaling?', maxScore: 15, weight: 0.3 },
          { name: 'Security', description: 'Security considerations and implementation', maxScore: 15, weight: 0.3 }
        ],
        reviewDueDate: new Date('2024-10-20T23:59:59Z'),
        minReviews: 2,
        maxReviews: 3
      },
      submission: {
        allowedTypes: ['pdf', 'doc', 'docx', 'png', 'jpg'],
        maxFileSize: 20971520, // 20MB
        maxFiles: 5,
        allowTextSubmission: true
      },
      status: 'active',
      statistics: {
        totalSubmissions: 0,
        onTimeSubmissions: 0,
        lateSubmissions: 0,
        reviewsSubmitted: 0,
        averageScore: 0
      }
    },
    {
      title: 'Database Schema Design',
      description: 'Design a normalized database schema for your project. Include entity relationship diagrams, table definitions, and indexing strategy.',
      course: courses[1]._id,
      instructor: instructors[1]._id,
      type: 'team',
      dueDate: new Date('2024-09-30T23:59:59Z'),
      maxPoints: 100,
      instructions: 'Submit ERD diagrams and SQL DDL statements for your database schema.',
      resources: [
        { title: 'Normalization Guide', url: 'https://example.com/normalization.pdf', type: 'guide' },
        { title: 'ERD Tools', url: 'https://example.com/erd-tools', type: 'tools' }
      ],
      peerReview: {
        enabled: true,
        criteria: [
          { name: 'Normalization', description: 'Proper database normalization', maxScore: 10, weight: 0.4 },
          { name: 'Performance', description: 'Query performance considerations', maxScore: 10, weight: 0.3 },
          { name: 'Relationships', description: 'Correct entity relationships', maxScore: 10, weight: 0.3 }
        ],
        reviewDueDate: new Date('2024-10-05T23:59:59Z'),
        minReviews: 2,
        maxReviews: 3
      },
      submission: {
        allowedTypes: ['pdf', 'sql', 'png', 'jpg'],
        maxFileSize: 10485760, // 10MB
        maxFiles: 3,
        allowTextSubmission: true
      },
      status: 'active',
      statistics: {
        totalSubmissions: 0,
        onTimeSubmissions: 0,
        lateSubmissions: 0,
        reviewsSubmitted: 0,
        averageScore: 0
      }
    }
  ];

  const createdAssignments = await Assignment.insertMany(assignments);
  console.log(`Created ${createdAssignments.length} assignments`);
  return createdAssignments;
};

// Create submissions
const createSubmissions = async (assignments, teams, students) => {
  console.log('Creating submissions...');
  
  const submissions = [
    {
      assignment: assignments[0]._id,
      type: 'team',
      submitter: students[0]._id,
      team: teams[0]._id,
      textSubmission: 'Our project proposal focuses on developing a comprehensive task management application for small businesses. The application will help teams organize, track, and collaborate on various projects efficiently.',
      files: [
        {
          filename: 'project_proposal.pdf',
          originalName: 'project_proposal.pdf',
          mimeType: 'application/pdf',
          path: 'https://example.com/submissions/proposal_team_alpha.pdf',
          size: 2048576,
          uploadedAt: new Date('2024-09-10T14:30:00Z')
        }
      ],
      status: 'submitted',
      submittedAt: new Date('2024-09-10T14:30:00Z'),
      isLate: false,
      grade: {maxPoints: 100},
      feedback: null
    },
    {
      assignment: assignments[0]._id,
      type: 'team',
      submitter: students[2]._id,
      team: teams[1]._id,
      textSubmission: 'We propose developing a mobile fitness tracking application that integrates with wearable devices to provide personalized workout recommendations and progress monitoring.',
      files: [
        {
          filename: 'fitness_app_proposal.pdf',
          originalName: 'fitness_app_proposal.pdf',
          mimeType: 'application/pdf',
          path: 'https://example.com/submissions/proposal_team_beta.pdf',
          size: 1536000,
          uploadedAt: new Date('2024-09-12T16:45:00Z')
        }
      ],
      status: 'submitted',
      submittedAt: new Date('2024-09-12T16:45:00Z'),
      isLate: false,
      grade: {maxPoints: 100},
      feedback: null
    },
    {
      assignment: assignments[0]._id,
      type: 'team',
      submitter: students[4]._id,
      team: teams[2]._id,
      textSubmission: 'Our AI-powered customer service chatbot will help businesses automate their customer support while maintaining high-quality interactions through natural language processing.',
      files: [
        {
          filename: 'ai_chatbot_proposal.pdf',
          originalName: 'ai_chatbot_proposal.pdf',
          mimeType: 'application/pdf',
          path: 'https://example.com/submissions/proposal_team_gamma.pdf',
          size: 3072000,
          uploadedAt: new Date('2024-09-14T11:20:00Z')
        }
      ],
      status: 'submitted',
      submittedAt: new Date('2024-09-14T11:20:00Z'),
      isLate: false,
      grade: {maxPoints: 100},
      feedback: null
    },
    {
      assignment: assignments[2]._id,
      type: 'team',
      submitter: students[1]._id,
      team: teams[3]._id,
      textSubmission: 'Database schema for the task management application including users, projects, tasks, and collaboration features.',
      files: [
        {
          filename: 'database_schema.sql',
          originalName: 'database_schema.sql',
          path: 'https://example.com/submissions/db_schema_team1.sql',
          mimeType: 'text/sql',
          size: 512000,
          uploadedAt: new Date('2024-09-25T09:15:00Z')
        },
        {
          filename: 'erd_diagram.png',
          originalName: 'erd_diagram.png',
          path: 'https://example.com/submissions/erd_team1.png',
          mimeType: 'image/png',
          size: 1024000,
          uploadedAt: new Date('2024-09-25T09:15:00Z')
        }
      ],
      status: 'submitted',
      submittedAt: new Date('2024-09-25T09:15:00Z'),
      isLate: false,
      grade: {maxPoints: 100},
      feedback: null
    }
  ];

  const createdSubmissions = await Submission.insertMany(submissions);
  console.log(`Created ${createdSubmissions.length} submissions`);
  return createdSubmissions;
};

// Create reviews
const createReviews = async (assignments, submissions, students) => {
  console.log('Creating reviews...');
  
  const reviews = [
    {
      assignment: assignments[0]._id,
      submission: submissions[0]._id,
      reviewer: students[2]._id,
      reviewee: students[0]._id,
      team: submissions[0].team,
      criteria: [
        {
          name: 'Clarity',
          score: 8,
          maxScore: 10,
          feedback: 'Very clear and well-structured proposal. The problem statement is well-defined and the solution approach is logical.'
        },
        {
          name: 'Completeness',
          score: 7,
          maxScore: 10,
          feedback: 'Good coverage of most required sections. Could benefit from more detailed timeline and risk assessment.'
        },
        {
          name: 'Feasibility',
          score: 8,
          maxScore: 10,
          feedback: 'The proposed solution is realistic and achievable within the given timeframe. Technology choices are appropriate.'
        }
      ],
      feedback: 'Overall, this is a solid project proposal. The team has clearly thought through the problem and proposed a reasonable solution. The technical approach is sound, though I would recommend adding more detail about the user interface design and testing strategy.',
      status: 'submitted',
      submittedAt: new Date('2024-09-18T15:30:00Z'),
      isLate: false,
      helpfulness: 4,
      quality: 4,
      timeliness: 5,
      reviewerFeedback: 'This review was very helpful and constructive. Thank you for the detailed feedback!'
    },
    {
      assignment: assignments[0]._id,
      submission: submissions[1]._id,
      reviewer: students[0]._id,
      reviewee: students[2]._id,
      team: submissions[1].team,
      criteria: [
        {
          name: 'Clarity',
          score: 9,
          maxScore: 10,
          feedback: 'Excellent clarity in explaining the mobile app concept. The proposal is easy to follow and understand.'
        },
        {
          name: 'Completeness',
          score: 8,
          maxScore: 10,
          feedback: 'Comprehensive coverage of all required sections. Good attention to detail in the technical specifications.'
        },
        {
          name: 'Feasibility',
          score: 7,
          maxScore: 10,
          feedback: 'The project is ambitious but achievable. Consider breaking down into smaller milestones for better manageability.'
        }
      ],
      feedback: 'This is an innovative and well-thought-out proposal. The integration with wearable devices adds significant value. The team demonstrates strong technical knowledge and realistic project planning.',
      status: 'submitted',
      submittedAt: new Date('2024-09-19T10:45:00Z'),
      isLate: false,
      helpfulness: 5,
      quality: 5,
      timeliness: 5,
      reviewerFeedback: 'Great review! The suggestions about breaking down milestones were particularly helpful.'
    },
    {
      assignment: assignments[0]._id,
      submission: submissions[2]._id,
      reviewer: students[1]._id,
      reviewee: students[4]._id,
      team: submissions[2].team,
      criteria: [
        {
          name: 'Clarity',
          score: 9,
          maxScore: 10,
          feedback: 'Very clear explanation of the AI chatbot concept. The technical approach is well-articulated.'
        },
        {
          name: 'Completeness',
          score: 9,
          maxScore: 10,
          feedback: 'Excellent coverage of all sections. The proposal includes detailed technical specifications and implementation plan.'
        },
        {
          name: 'Feasibility',
          score: 8,
          maxScore: 10,
          feedback: 'The project is technically challenging but well-planned. The team has considered the complexity appropriately.'
        }
      ],
      feedback: 'Outstanding proposal! The AI integration is sophisticated and the team clearly understands the technical challenges. The business case is compelling and the implementation timeline is realistic.',
      status: 'submitted',
      submittedAt: new Date('2024-09-19T14:20:00Z'),
      isLate: false,
      helpfulness: 5,
      quality: 5,
      timeliness: 5,
      reviewerFeedback: 'Excellent review with very detailed and constructive feedback. Thank you!'
    }
  ];

  const createdReviews = await Review.insertMany(reviews);
  console.log(`Created ${createdReviews.length} reviews`);
  return createdReviews;
};

// Update assignment statistics
const updateAssignmentStats = async (assignments, submissions, reviews) => {
  console.log('Updating assignment statistics...');
  
  for (const assignment of assignments) {
    const assignmentSubmissions = submissions.filter(sub => sub.assignment.toString() === assignment._id.toString());
    const assignmentReviews = reviews.filter(rev => rev.assignment.toString() === assignment._id.toString());
    
    const onTimeSubmissions = assignmentSubmissions.filter(sub => !sub.isLate).length;
    const lateSubmissions = assignmentSubmissions.filter(sub => sub.isLate).length;
    const submittedReviews = assignmentReviews.filter(rev => rev.status === 'submitted').length;
    
    const totalScore = assignmentReviews.reduce((sum, rev) => {
      return sum + rev.criteria.reduce((critSum, crit) => critSum + crit.score, 0);
    }, 0);
    const totalMaxScore = assignmentReviews.reduce((sum, rev) => {
      return sum + rev.criteria.reduce((critSum, crit) => critSum + crit.maxScore, 0);
    }, 0);
    const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    
    await Assignment.findByIdAndUpdate(assignment._id, {
      $set: {
        'statistics.totalSubmissions': assignmentSubmissions.length,
        'statistics.onTimeSubmissions': onTimeSubmissions,
        'statistics.lateSubmissions': lateSubmissions,
        'statistics.reviewsSubmitted': submittedReviews,
        'statistics.averageScore': averageScore
      }
    });
  }
  
  console.log('Assignment statistics updated');
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    const users = await createUsers();
    const instructors = users.filter(user => user.role === 'instructor');
    const students = users.filter(user => user.role === 'student');
    
    const courses = await createCourses(instructors);
    const assignments = await createAssignments(courses, instructors);
    const teams = await createTeams(courses, students, assignments);
    const submissions = await createSubmissions(assignments, teams, students);
    const reviews = await createReviews(assignments, submissions, students);
    
    await updateAssignmentStats(assignments, submissions, reviews);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${users.length} users (${instructors.length} instructors, ${students.length} students)`);
    console.log(`   - ${courses.length} courses`);
    console.log(`   - ${teams.length} teams`);
    console.log(`   - ${assignments.length} assignments`);
    console.log(`   - ${submissions.length} submissions`);
    console.log(`   - ${reviews.length} reviews`);
    console.log('\n🔑 Login credentials:');
    console.log('   Instructor: sarah.johnson@university.edu / password123');
    console.log('   Student: john.smith@university.edu / password123');
    console.log('\n🚀 You can now start the application and test with real data!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
