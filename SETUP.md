# CourseCollab Setup Guide

This guide will help you set up and run the CourseCollab application with realistic dummy data.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB (if not already installed)
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string

### 2. Backend Setup

```bash
# Navigate to backend directory
cd coursecollab/backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your MongoDB connection string
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017/coursecollab
# For Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coursecollab

# Seed the database with dummy data
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd coursecollab/frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔑 Login Credentials

After seeding, you can login with these accounts:

### Instructors
- **Email**: sarah.johnson@university.edu
- **Password**: password123
- **Role**: Instructor (CSC 591 - Software Engineering)

- **Email**: michael.chen@university.edu  
- **Password**: password123
- **Role**: Instructor (CSC 540 - Database Systems)

### Students
- **Email**: john.smith@university.edu
- **Password**: password123
- **Role**: Student (Team Alpha Leader)

- **Email**: emily.davis@university.edu
- **Password**: password123
- **Role**: Student (Team Alpha Member)

- **Email**: sarah.wilson@university.edu
- **Password**: password123
- **Role**: Student (Team Beta Leader)

- **Email**: david.brown@university.edu
- **Password**: password123
- **Role**: Student (Team Beta Member)

- **Email**: lisa.garcia@university.edu
- **Password**: password123
- **Role**: Student (Team Gamma Leader)

- **Email**: alex.martinez@university.edu
- **Password**: password123
- **Role**: Student (Team Gamma Member)

## 📊 Seeded Data

The database will be populated with:

### Users (8 total)
- 2 Instructors
- 6 Students

### Courses (2 total)
- **CSC 591 - Software Engineering** (Dr. Sarah Johnson)
- **CSC 540 - Database Systems** (Dr. Michael Chen)

### Teams (4 total)
- **Team Alpha** (CSC 591) - John Smith, Emily Davis
- **Team Beta** (CSC 591) - Sarah Wilson, David Brown  
- **Team Gamma** (CSC 591) - Lisa Garcia, Alex Martinez
- **Database Team 1** (CSC 540) - Emily Davis, David Brown

### Assignments (3 total)
- **Project Proposal** (CSC 591) - Due Sep 15, 2024
- **System Design Document** (CSC 591) - Due Oct 15, 2024
- **Database Schema Design** (CSC 540) - Due Sep 30, 2024

### Submissions (4 total)
- 3 Project Proposal submissions (Teams Alpha, Beta, Gamma)
- 1 Database Schema submission (Database Team 1)

### Reviews (3 total)
- Peer reviews for Project Proposal submissions
- All reviews include detailed criteria scores and feedback

## 🛠️ Development Commands

### Backend Commands
```bash
# Start development server
npm run dev

# Seed database (clears existing data)
npm run seed

# Start production server
npm start

# Run tests
npm test
```

### Frontend Commands
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🔄 Resetting Data

To clear and reseed the database:

```bash
cd coursecollab/backend
npm run seed
```

This will:
- Clear all existing data
- Create fresh dummy data
- Update statistics

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify network access for Atlas

### Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 3000
- Change ports in respective `package.json` files if needed

### Authentication Issues
- Clear browser localStorage
- Ensure JWT_SECRET is set in `.env`
- Check token expiration

## 📁 Project Structure

```
coursecollab/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication, upload
│   ├── scripts/         # Database seeding
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── App.tsx      # Main app component
│   └── public/          # Static files
└── README.md
```

## 🚀 Next Steps

1. **Explore the Application**: Login and navigate through different features
2. **Test Peer Review**: Create reviews and see the feedback system
3. **Team Management**: Join/leave teams and manage team activities
4. **Assignment Submission**: Submit assignments and track progress
5. **Instructor Features**: Create courses, assignments, and manage students

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check network connectivity for API calls

Happy coding! 🎉
