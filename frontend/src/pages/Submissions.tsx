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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Upload,
  Search,
  Assignment,
  Schedule,
  RateReview,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Submission {
  id: string;
  assignment: string;
  assignmentId: string;
  course: string;
  courseCode: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'late' | 'graded';
  grade?: number;
  maxPoints: number;
  feedback?: string;
  files: Array<{
    name: string;
    size: string;
  }>;
  team?: string;
  peerReviewEnabled: boolean;
  reviewsCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Submissions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockSubmissions: Submission[] = [
      {
        id: '1',
        assignment: 'Project Proposal',
        assignmentId: '1',
        course: 'Software Engineering',
        courseCode: 'CSC 591',
        submittedAt: '2024-02-14T10:30:00Z',
        status: 'graded',
        grade: 85,
        maxPoints: 100,
        feedback: 'Great work on the proposal! The methodology section could be more detailed.',
        files: [
          { name: 'team_alpha_proposal.pdf', size: '3.2 MB' },
        ],
        team: 'Team Alpha',
        peerReviewEnabled: true,
        reviewsCount: 3,
      },
      {
        id: '2',
        assignment: 'System Design Document',
        assignmentId: '2',
        course: 'Software Engineering',
        courseCode: 'CSC 591',
        submittedAt: '2024-02-20T15:45:00Z',
        status: 'submitted',
        maxPoints: 150,
        files: [
          { name: 'system_design.pdf', size: '5.1 MB' },
          { name: 'architecture_diagram.png', size: '2.3 MB' },
        ],
        team: 'Team Alpha',
        peerReviewEnabled: true,
        reviewsCount: 1,
      },
      {
        id: '3',
        assignment: 'Database Schema Design',
        assignmentId: '3',
        course: 'Database Systems',
        courseCode: 'CSC 540',
        submittedAt: '2024-02-25T23:30:00Z',
        status: 'late',
        maxPoints: 120,
        files: [
          { name: 'schema_design.sql', size: '1.2 MB' },
        ],
        peerReviewEnabled: false,
        reviewsCount: 0,
      },
    ];
    
    setSubmissions(mockSubmissions);
    setLoading(false);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.assignment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (tabValue) {
      case 0: return matchesSearch; // All
      case 1: return matchesSearch && submission.status === 'submitted';
      case 2: return matchesSearch && submission.status === 'graded';
      case 3: return matchesSearch && submission.status === 'late';
      default: return matchesSearch;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'late': return 'error';
      case 'graded': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle />;
      case 'late': return <Warning />;
      case 'graded': return <CheckCircle />;
      default: return <Upload />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading submissions...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Submissions
      </Typography>

      <TextField
        fullWidth
        placeholder="Search submissions..."
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Submitted" />
          <Tab label="Graded" />
          <Tab label="Late" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredSubmissions.map((submission) => (
          <Grid item xs={12} md={6} lg={4} key={submission.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(`/assignments/${submission.assignmentId}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" component="div">
                      {submission.assignment}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {submission.courseCode} - {submission.course}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>

                {submission.team && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Team: {submission.team}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {submission.files.length} file(s) • {submission.maxPoints} points
                  </Typography>
                </Box>

                {submission.peerReviewEnabled && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RateReview sx={{ mr: 1, fontSize: 16, color: 'secondary.main' }} />
                    <Typography variant="body2" color="secondary.main">
                      {submission.reviewsCount} reviews
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={submission.status}
                    color={getStatusColor(submission.status) as any}
                    size="small"
                    icon={getStatusIcon(submission.status)}
                  />
                  {submission.grade && (
                    <Typography variant="body2" color="text.secondary">
                      {submission.grade}/{submission.maxPoints}
                    </Typography>
                  )}
                </Box>

                {submission.feedback && (
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    bgcolor: 'grey.50', 
                    p: 1, 
                    borderRadius: 1,
                    fontStyle: 'italic'
                  }}>
                    "{submission.feedback}"
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/assignments/${submission.assignmentId}`)}>
                  View Details
                </Button>
                {submission.peerReviewEnabled && (
                  <Button size="small" startIcon={<RateReview />}>
                    Reviews
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredSubmissions.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No submissions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Submissions;
