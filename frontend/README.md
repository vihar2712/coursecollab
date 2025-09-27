# CourseCollab Frontend

React frontend for CourseCollab - Team-Based Coursework & Peer-Review Platform.

## Features

- **Modern UI**: Built with Material-UI (MUI) for a professional look
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Authentication**: Secure login and registration system
- **Dashboard**: Overview of courses, assignments, and activities
- **Course Management**: View and manage enrolled courses
- **Assignment System**: Submit assignments and track progress
- **Team Formation**: Join and manage teams for group projects
- **Peer Review**: Submit and manage peer reviews
- **Profile Management**: Update user profile and preferences

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **React Query** for data fetching
- **Axios** for API calls
- **React Hook Form** for form handling
- **Date-fns** for date formatting
- **Socket.io** for real-time updates

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   └── LoadingSpinner.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Courses.tsx     # Course listing
│   ├── CourseDetail.tsx # Course details
│   ├── Assignments.tsx # Assignment listing
│   ├── AssignmentDetail.tsx # Assignment details
│   ├── Teams.tsx       # Team management
│   ├── Submissions.tsx # Submission tracking
│   ├── Reviews.tsx     # Peer review management
│   └── Profile.tsx     # User profile
├── App.tsx             # Main app component
├── index.tsx           # App entry point
└── index.css           # Global styles
```

## Features Overview

### Authentication
- Secure login and registration
- JWT token-based authentication
- Role-based access control (Student, Instructor, Admin)

### Dashboard
- Overview of courses and assignments
- Recent activity tracking
- Quick action buttons
- Statistics display

### Course Management
- View enrolled courses
- Course details and information
- Assignment listings
- Team management

### Assignment System
- Submit assignments
- Track submission status
- View grades and feedback
- File upload support

### Team Formation
- Create and join teams
- Team member management
- Skill-based team matching
- Team communication

### Peer Review
- Submit peer reviews
- Review criteria and scoring
- Feedback collection
- Review quality ratings

### Profile Management
- Update personal information
- Change password
- Notification preferences
- Theme settings

## API Integration

The frontend communicates with the backend through REST APIs:

- **Authentication**: `/api/auth/*`
- **Courses**: `/api/courses/*`
- **Assignments**: `/api/assignments/*`
- **Teams**: `/api/teams/*`
- **Submissions**: `/api/submissions/*`
- **Reviews**: `/api/reviews/*`

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Deployment

### Production Build

```bash
npm run build
```

This builds the app for production to the `build` folder.

### Docker

```bash
# Build Docker image
docker build -t coursecollab-frontend .

# Run container
docker run -p 3000:3000 coursecollab-frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
