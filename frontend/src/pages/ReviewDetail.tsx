import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Schedule,
  Person,
  Assignment,
  Feedback,
  Star,
  ExpandMore,
  Download,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    peerReview: {
      enabled: boolean;
      criteria: Array<{
        name: string;
        description: string;
        maxScore: number;
        weight: number;
      }>;
    };
  };
  submission: {
    _id: string;
    files: Array<{
      filename: string;
      url: string;
      size: number;
    }>;
    textSubmission: string;
    status: string;
    submittedAt: string;
  };
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewee: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  criteria: Array<{
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  feedback: string;
  status: 'draft' | 'submitted' | 'late';
  submittedAt: string;
  isLate: boolean;
  helpfulness: number;
  quality: number;
  timeliness: number;
  reviewerFeedback: string;
  createdAt: string;
  updatedAt: string;
}

const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState({
    helpfulness: 0,
    quality: 0,
    timeliness: 0,
    feedback: ''
  });

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review');
      }

      const data = await response.json();
      setReview(data);
    } catch (err) {
      setError('Failed to load review details');
      console.error('Fetch review error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setFeedbackDialog(false);
      fetchReview(); // Refresh review data
    } catch (err) {
      console.error('Submit feedback error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'late': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle />;
      case 'late': return <Schedule />;
      case 'draft': return <Assignment />;
      default: return <Assignment />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/reviews')} startIcon={<ArrowBack />}>
          Back to Reviews
        </Button>
      </Box>
    );
  }

  if (!review) {
    return (
      <Box p={3}>
        <Alert severity="info">Review not found</Alert>
        <Button onClick={() => navigate('/reviews')} startIcon={<ArrowBack />}>
          Back to Reviews
        </Button>
      </Box>
    );
  }

  const isReviewee = review.reviewee._id === user?.id;
  const isReviewer = review.reviewer._id === user?.id;
  const canEdit = isReviewer && review.status === 'draft';

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          onClick={() => navigate('/reviews')}
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Back to Reviews
        </Button>
        <Typography variant="h4" component="h1">
          Review Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Review Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                {review.assignment.title}
              </Typography>
              <Chip
                icon={getStatusIcon(review.status)}
                label={review.status.toUpperCase()}
                color={getStatusColor(review.status)}
                variant="outlined"
              />
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
              {review.assignment.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Review Criteria */}
            <Typography variant="h6" gutterBottom>
              Review Criteria
            </Typography>
            {review.criteria.map((criterion, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {criterion.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {criterion.score} / {criterion.maxScore}
                    </Typography>
                  </Box>
                  {criterion.feedback && (
                    <Typography variant="body2" color="text.secondary">
                      {criterion.feedback}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Overall Feedback */}
            {review.feedback && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Overall Feedback
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">
                    {review.feedback}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Submission Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submission Details
            </Typography>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted by: {review.reviewee.firstName} {review.reviewee.lastName}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted on: {new Date(review.submission.submittedAt).toLocaleString()}
              </Typography>
            </Box>

            {review.submission.textSubmission && (
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Text Submission:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">
                    {review.submission.textSubmission}
                  </Typography>
                </Paper>
              </Box>
            )}

            {review.submission.files && review.submission.files.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Attached Files:
                </Typography>
                <List>
                  {review.submission.files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Download />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.filename}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Review Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Information
            </Typography>
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Reviewed by:
              </Typography>
              <Typography variant="body1">
                {review.reviewer.firstName} {review.reviewer.lastName}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Status:
              </Typography>
              <Chip
                icon={getStatusIcon(review.status)}
                label={review.status.toUpperCase()}
                color={getStatusColor(review.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            {review.submittedAt && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Submitted:
                </Typography>
                <Typography variant="body2">
                  {new Date(review.submittedAt).toLocaleString()}
                </Typography>
              </Box>
            )}

            {review.isLate && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This review was submitted late
              </Alert>
            )}
          </Paper>

          {/* Reviewer Feedback */}
          {isReviewee && review.status === 'submitted' && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rate This Review
              </Typography>
              
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Helpfulness
                </Typography>
                <Rating
                  value={review.helpfulness || 0}
                  readOnly
                  size="small"
                />
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Quality
                </Typography>
                <Rating
                  value={review.quality || 0}
                  readOnly
                  size="small"
                />
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Timeliness
                </Typography>
                <Rating
                  value={review.timeliness || 0}
                  readOnly
                  size="small"
                />
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFeedbackDialog(true)}
                startIcon={<Feedback />}
              >
                Provide Feedback
              </Button>
            </Paper>
          )}

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            {canEdit && (
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => navigate(`/reviews/${id}/edit`)}
              >
                Edit Review
              </Button>
            )}

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/assignments/${review.assignment._id}`)}
              startIcon={<Assignment />}
            >
              View Assignment
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Provide Feedback on Review</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              How helpful was this review?
            </Typography>
            <Rating
              value={feedback.helpfulness}
              onChange={(event, newValue) => setFeedback({ ...feedback, helpfulness: newValue || 0 })}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              How would you rate the quality?
            </Typography>
            <Rating
              value={feedback.quality}
              onChange={(event, newValue) => setFeedback({ ...feedback, quality: newValue || 0 })}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              How timely was the review?
            </Typography>
            <Rating
              value={feedback.timeliness}
              onChange={(event, newValue) => setFeedback({ ...feedback, timeliness: newValue || 0 })}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Feedback"
            value={feedback.feedback}
            onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
            placeholder="Share your thoughts about this review..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewDetail;
