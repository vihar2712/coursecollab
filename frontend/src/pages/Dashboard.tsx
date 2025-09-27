import React from 'react';
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
} from '@mui/material';
import {
  School,
  Assignment,
  Group,
  Upload,
  RateReview,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'My Courses',
      value: '3',
      icon: <School />,
      color: '#1976d2',
      path: '/courses',
    },
    {
      title: 'Assignments',
      value: '5',
      icon: <Assignment />,
      color: '#dc004e',
      path: '/assignments',
    },
    {
      title: 'Teams',
      value: '2',
      icon: <Group />,
      color: '#2e7d32',
      path: '/teams',
    },
    {
      title: 'Submissions',
      value: '8',
      icon: <Upload />,
      color: '#ed6c02',
      path: '/submissions',
    },
    {
      title: 'Reviews',
      value: '12',
      icon: <RateReview />,
      color: '#9c27b0',
      path: '/reviews',
    },
  ];

  const recentActivities = [
    {
      title: 'Submitted Assignment: Project Proposal',
      time: '2 hours ago',
      type: 'submission',
    },
    {
      title: 'Completed Peer Review for Team Alpha',
      time: '1 day ago',
      type: 'review',
    },
    {
      title: 'Joined Team: Web Development',
      time: '3 days ago',
      type: 'team',
    },
    {
      title: 'Enrolled in Course: CSC 591',
      time: '1 week ago',
      type: 'course',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's what's happening with your coursework and peer reviews.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={stat.title}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Box sx={{ mt: 2 }}>
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < recentActivities.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                      {activity.type === 'submission' && <Upload />}
                      {activity.type === 'review' && <RateReview />}
                      {activity.type === 'team' && <Group />}
                      {activity.type === 'course' && <School />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                    <Chip
                      label={activity.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/submissions')}>
                View All Activities
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Assignment />}
                  sx={{ mb: 1 }}
                  onClick={() => navigate('/assignments')}
                >
                  View Assignments
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Group />}
                  sx={{ mb: 1 }}
                  onClick={() => navigate('/teams')}
                >
                  Join Team
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RateReview />}
                  onClick={() => navigate('/reviews')}
                >
                  Submit Review
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
