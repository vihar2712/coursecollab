import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
} from '@mui/material';
import {
  School,
  Assignment,
  Group,
  People,
  Schedule,
  LocationOn,
  Description,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

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

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockCourse = {
      id: '1',
      title: 'Software Engineering',
      code: 'CSC 591',
      description: 'Advanced software engineering principles and practices including agile development, testing, and project management.',
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
      assignments: [
        { id: '1', title: 'Project Proposal', dueDate: '2024-02-15', status: 'submitted' },
        { id: '2', title: 'System Design', dueDate: '2024-03-01', status: 'pending' },
        { id: '3', title: 'Final Presentation', dueDate: '2024-04-15', status: 'pending' },
      ],
      students: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      ],
    };
    
    setCourse(mockCourse);
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading course details...</Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Course not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {course.code} - {course.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {course.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Assignments" />
                <Tab label="Students" />
                <Tab label="Teams" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <List>
                {course.assignments.map((assignment: any) => (
                  <ListItem key={assignment.id} divider>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary={assignment.title}
                      secondary={`Due: ${assignment.dueDate}`}
                    />
                    <Chip
                      label={assignment.status}
                      color={assignment.status === 'submitted' ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <List>
                {course.students.map((student: any) => (
                  <ListItem key={student.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {student.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={student.name}
                      secondary={student.email}
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="body1" color="text.secondary">
                Team management features will be available here.
              </Typography>
            </TabPanel>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Information
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  {course.schedule.location}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {course.currentEnrollment}/{course.capacity} students enrolled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.credits} credits • {course.semester} {course.year}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Assignment />}
                sx={{ mb: 1 }}
                onClick={() => navigate(`/courses/${id}/assignments`)}
              >
                View Assignments
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Group />}
                onClick={() => navigate(`/courses/${id}/teams`)}
              >
                Manage Teams
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;
