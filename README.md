# CourseCollab: Team-Based Coursework & Peer-Review Platform

A full-stack web application built with React and Node.js for collaborative coursework management and peer review.

## Features

- **User Management**: Student and instructor registration/authentication
- **Course Management**: Create and manage courses with assignments
- **Team Formation**: Automatic and manual team formation for assignments
- **Assignment Submission**: Upload and manage coursework submissions
- **Peer Review System**: Anonymous peer review and feedback
- **Grade Management**: Instructor grading and feedback
- **Real-time Collaboration**: Live updates and notifications

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time features
- Multer for file uploads

### Frontend
- React 18 with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls
- Socket.io-client for real-time updates

## Project Structure

```
coursecollab/
├── backend/          # Node.js backend
├── frontend/         # React frontend
├── shared/           # Shared types and utilities
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up environment variables (see .env.example files)

5. Start the development servers:
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm start
   ```

## API Documentation

The API follows RESTful principles with the following main endpoints:

- `/api/auth` - Authentication
- `/api/courses` - Course management
- `/api/assignments` - Assignment management
- `/api/teams` - Team management
- `/api/submissions` - Submission handling
- `/api/reviews` - Peer review system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
