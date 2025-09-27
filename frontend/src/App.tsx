import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Teams from './pages/Teams';
import Submissions from './pages/Submissions';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1, pt: user ? 8 : 0 }}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/courses" 
            element={user ? <Courses /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/courses/:id" 
            element={user ? <CourseDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/assignments" 
            element={user ? <Assignments /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/assignments/:id" 
            element={user ? <AssignmentDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/teams" 
            element={user ? <Teams /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/submissions" 
            element={user ? <Submissions /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reviews" 
            element={user ? <Reviews /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reviews/:id" 
            element={user ? <ReviewDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
