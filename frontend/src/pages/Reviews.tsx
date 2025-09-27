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
  LinearProgress,
} from '@mui/material';
import {
  RateReview,
  Search,
  Assignment,
  Person,
  Schedule,
  CheckCircle,
  Pending,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Review {
  id: string;
  assignment: string;
  assignmentId: string;
  course: string;
  courseCode: string;
  reviewee: string;
  revieweeId: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  submittedAt?: string;
  overallScore?: number;
  criteria: Array<{
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  helpfulness?: number;
  quality?: number;
  timeliness?: number;
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

const Reviews: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      // Transform the data to match the expected interface
      const transformedReviews: Review[] = data.reviews.map((review: any) => ({
        id: review._id,
        assignment: review.assignment.title,
        assignmentId: review.assignment._id,
        course: review.assignment.course || 'Software Engineering',
        courseCode: review.assignment.courseCode || 'CSC 591',
        reviewee: `${review.reviewee.firstName} ${review.reviewee.lastName}`,
        revieweeId: review.reviewee._id,
        status: review.status === 'submitted' ? 'completed' : review.status === 'draft' ? 'in-progress' : 'pending',
        dueDate: review.assignment.peerReview?.reviewDueDate || review.assignment.dueDate,
        submittedAt: review.submittedAt,
        overallScore: review.criteria ? Math.round(review.criteria.reduce((sum: number, crit: any) => sum + crit.score, 0) / review.criteria.length * 10) : 0,
        criteria: review.criteria || [],
        helpfulness: review.helpfulness,
        quality: review.quality,
        timeliness: review.timeliness,
      }));
      
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to empty array on error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.assignment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewee.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (tabValue) {
      case 0: return matchesSearch; // All
      case 1: return matchesSearch && review.status === 'pending';
      case 2: return matchesSearch && review.status === 'in-progress';
      case 3: return matchesSearch && review.status === 'completed';
      default: return matchesSearch;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in-progress': return <Pending />;
      case 'pending': return <Schedule />;
      default: return <RateReview />;
    }
  };

  const getProgressPercentage = (review: Review) => {
    if (review.status === 'completed') return 100;
    if (review.status === 'in-progress') {
      const completedCriteria = review.criteria.filter(c => c.score > 0).length;
      return (completedCriteria / review.criteria.length) * 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading reviews...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Peer Reviews
      </Typography>

      <TextField
        fullWidth
        placeholder="Search reviews..."
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
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredReviews.map((review) => (
          <Grid item xs={12} md={6} lg={4} key={review.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(`/reviews/${review.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RateReview sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" component="div">
                      {review.assignment}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {review.courseCode} - {review.course}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    Reviewing: {review.reviewee}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">
                    Due: {format(new Date(review.dueDate), 'MMM dd, yyyy')}
                  </Typography>
                </Box>

                {review.status === 'in-progress' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Progress: {Math.round(getProgressPercentage(review))}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressPercentage(review)} 
                      sx={{ mb: 1 }}
                    />
                  </Box>
                )}

                {review.overallScore && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Star sx={{ mr: 1, fontSize: 16, color: 'gold' }} />
                    <Typography variant="body2">
                      Overall Score: {review.overallScore}/100
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={review.status}
                    color={getStatusColor(review.status) as any}
                    size="small"
                    icon={getStatusIcon(review.status)}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {review.criteria.length} criteria
                  </Typography>
                </Box>

                {review.helpfulness && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Helpfulness: {review.helpfulness}/5
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/reviews/${review.id}`)}>
                  {review.status === 'completed' ? 'View Review' : 'Start Review'}
                </Button>
                {review.status === 'completed' && (
                  <Button size="small" startIcon={<Star />}>
                    Rate Quality
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredReviews.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No reviews found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Reviews;
