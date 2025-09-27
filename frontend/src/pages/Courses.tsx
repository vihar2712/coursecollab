import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  School,
  Search,
  Add,
  People,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: string;
  semester: string;
  year: number;
  credits: number;
  capacity: number;
  currentEnrollment: number;
  schedule: {
    days: string[];
    time: {
      start: string;
      end: string;
    };
    location: string;
  };
}

const Courses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Software Engineering',
        code: 'CSC 591',
        description: 'Advanced software engineering principles and practices.',
        instructor: 'Dr. Smith',
        semester: 'Fall',
        year: 2024,
        credits: 3,
        capacity: 30,
        currentEnrollment: 25,
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: { start: '10:00 AM', end: '11:30 AM' },
          location: 'Room 101',
        },
      },
      {
        id: '2',
        title: 'Database Systems',
        code: 'CSC 540',
        description: 'Database design, implementation, and management.',
        instructor: 'Dr. Johnson',
        semester: 'Fall',
        year: 2024,
        credits: 3,
        capacity: 25,
        currentEnrollment: 20,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: { start: '2:00 PM', end: '3:30 PM' },
          location: 'Room 205',
        },
      },
    ];
    
    setCourses(mockCourses);
    setLoading(false);
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEnrollmentStatus = (course: Course) => {
    if (course.currentEnrollment < course.capacity) {
      return { status: 'open', color: 'success' as const };
    } else {
      return { status: 'full', color: 'error' as const };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading courses...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Courses
        </Typography>
        {user?.role === 'instructor' && (
          <Fab color="primary" aria-label="add" onClick={() => navigate('/courses/new')}>
            <Add />
          </Fab>
        )}
      </Box>

      <TextField
        fullWidth
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredCourses.map((course) => {
          const enrollmentStatus = getEnrollmentStatus(course);
          return (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <School />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {course.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {course.instructor}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {course.schedule.days.join(', ')} {course.schedule.time.start} - {course.schedule.time.end}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {course.schedule.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={enrollmentStatus.status}
                      color={enrollmentStatus.color}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {course.currentEnrollment}/{course.capacity} students
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/courses/${course.id}`)}>
                    View Details
                  </Button>
                  <Button size="small" onClick={() => navigate(`/courses/${course.id}/assignments`)}>
                    Assignments
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredCourses.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Courses;
