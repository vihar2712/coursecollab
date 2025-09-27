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
  TextField,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Assignment,
  Search,
  Add,
  Schedule,
  Upload,
  RateReview,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface AssignmentData {
  id: string;
  title: string;
  description: string;
  course: string;
  courseCode: string;
  dueDate: string;
  maxPoints: number;
  type: 'individual' | 'team';
  status: 'draft' | 'submitted' | 'late' | 'graded' | 'pending';
  peerReviewEnabled: boolean;
  submissionsCount: number;
  reviewsCount: number;
}

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAssignments: AssignmentData[] = [
      {
        id: '1',
        title: 'Project Proposal',
        description: 'Submit a detailed project proposal for your software engineering project.',
        course: 'Software Engineering',
        courseCode: 'CSC 591',
        dueDate: '2024-02-15T23:59:59Z',
        maxPoints: 100,
        type: 'team',
        status: 'submitted',
        peerReviewEnabled: true,
        submissionsCount: 8,
        reviewsCount: 24,
      },
      {
        id: '2',
        title: 'System Design Document',
        description: 'Create a comprehensive system design document for your project.',
        course: 'Software Engineering',
        courseCode: 'CSC 591',
        dueDate: '2024-03-01T23:59:59Z',
        maxPoints: 150,
        type: 'team',
        status: 'draft',
        peerReviewEnabled: true,
        submissionsCount: 0,
        reviewsCount: 0,
      },
      {
        id: '3',
        title: 'Database Schema Design',
        description: 'Design and implement a database schema for your application.',
        course: 'Database Systems',
        courseCode: 'CSC 540',
        dueDate: '2024-02-28T23:59:59Z',
        maxPoints: 120,
        type: 'individual',
        status: 'pending',
        peerReviewEnabled: false,
        submissionsCount: 0,
        reviewsCount: 0,
      },
    ];
    
    setAssignments(mockAssignments);
    setLoading(false);
  }, []);

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'late': return 'error';
      case 'graded': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'late': return 'Late';
      case 'graded': return 'Graded';
      default: return 'Pending';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading assignments...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Assignments
        </Typography>
        {user?.role === 'instructor' && (
          <Fab color="primary" aria-label="add" onClick={() => navigate('/assignments/new')}>
            <Add />
          </Fab>
        )}
      </Box>

      <TextField
        fullWidth
        placeholder="Search assignments..."
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
        {filteredAssignments.map((assignment) => (
          <Grid item xs={12} md={6} lg={4} key={assignment.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(`/assignments/${assignment.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" component="div">
                      {assignment.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.courseCode} - {assignment.course}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {assignment.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                  </Typography>
                  {isOverdue(assignment.dueDate) && (
                    <Chip label="Overdue" color="error" size="small" sx={{ ml: 1 }} />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {assignment.maxPoints} points • {assignment.type}
                  </Typography>
                </Box>

                {assignment.peerReviewEnabled && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RateReview sx={{ mr: 1, fontSize: 16, color: 'secondary.main' }} />
                    <Typography variant="body2" color="secondary.main">
                      Peer Review Enabled
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={getStatusText(assignment.status)}
                    color={getStatusColor(assignment.status) as any}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {assignment.submissionsCount} submissions
                  </Typography>
                </Box>

                {assignment.peerReviewEnabled && (
                  <Typography variant="body2" color="text.secondary">
                    {assignment.reviewsCount} reviews completed
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/assignments/${assignment.id}`)}>
                  View Details
                </Button>
                {assignment.status === 'draft' && (
                  <Button size="small" startIcon={<Upload />}>
                    Submit
                  </Button>
                )}
                {assignment.peerReviewEnabled && assignment.status === 'submitted' && (
                  <Button size="small" startIcon={<RateReview />}>
                    Review
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAssignments.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No assignments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Assignments;
