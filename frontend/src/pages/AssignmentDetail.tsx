import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  Upload,
  RateReview,
  Description,
  AttachFile,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AssignmentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAssignment = {
      id: '1',
      title: 'Project Proposal',
      description: 'Submit a detailed project proposal for your software engineering project. The proposal should include project overview, objectives, methodology, timeline, and expected outcomes.',
      course: 'Software Engineering',
      courseCode: 'CSC 591',
      dueDate: '2024-02-15T23:59:59Z',
      maxPoints: 100,
      type: 'team',
      status: 'submitted',
      peerReviewEnabled: true,
      instructions: `
        ## Project Proposal Requirements
        
        1. **Project Overview**: Provide a clear description of your project
        2. **Objectives**: Define specific, measurable goals
        3. **Methodology**: Describe your approach and tools
        4. **Timeline**: Create a detailed project schedule
        5. **Expected Outcomes**: What will you deliver?
        
        ### Submission Guidelines
        - Submit as a PDF document
        - Maximum 10 pages
        - Include team member names and roles
        - Use proper academic formatting
      `,
      attachments: [
        { name: 'proposal_template.docx', size: '2.1 MB' },
        { name: 'rubric.pdf', size: '156 KB' },
      ],
      submission: {
        id: 'sub1',
        status: 'submitted',
        submittedAt: '2024-02-14T10:30:00Z',
        files: [
          { name: 'team_alpha_proposal.pdf', size: '3.2 MB' },
        ],
        feedback: 'Great work on the proposal! The methodology section could be more detailed.',
        grade: 85,
      },
    };
    
    setAssignment(mockAssignment);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading assignment details...</Typography>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Assignment not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {assignment.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {assignment.courseCode} - {assignment.course}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assignment Description
              </Typography>
              <Typography variant="body1" paragraph>
                {assignment.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Box sx={{ 
                bgcolor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-line'
              }}>
                {assignment.instructions}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <List>
                {assignment.attachments.map((file: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AttachFile />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={file.size}
                    />
                    <Button size="small" variant="outlined">
                      Download
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {assignment.submission && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Submission
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={assignment.submission.status}
                    color="success"
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Submitted on {format(new Date(assignment.submission.submittedAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                
                <List>
                  {assignment.submission.files.map((file: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={file.size}
                      />
                    </ListItem>
                  ))}
                </List>

                {assignment.submission.feedback && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Feedback:
                    </Typography>
                    <Typography variant="body2">
                      {assignment.submission.feedback}
                    </Typography>
                  </Box>
                )}

                {assignment.submission.grade && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Grade: {assignment.submission.grade}/{assignment.maxPoints}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assignment Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {assignment.maxPoints} points • {assignment.type}
              </Typography>
              {assignment.peerReviewEnabled && (
                <Chip
                  label="Peer Review Enabled"
                  color="secondary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              {assignment.submission ? (
                <Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Upload />}
                    sx={{ mb: 1 }}
                    onClick={() => navigate(`/assignments/${id}/submit`)}
                  >
                    Update Submission
                  </Button>
                  {assignment.peerReviewEnabled && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RateReview />}
                      onClick={() => navigate(`/assignments/${id}/reviews`)}
                    >
                      View Reviews
                    </Button>
                  )}
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => navigate(`/assignments/${id}/submit`)}
                >
                  Submit Assignment
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AssignmentDetail;
