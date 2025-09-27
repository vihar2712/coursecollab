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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Group,
  Add,
  Person,
  Email,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Team {
  id: string;
  name: string;
  course: string;
  courseCode: string;
  assignment: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: 'leader' | 'member';
  }>;
  maxMembers: number;
  isLocked: boolean;
  description: string;
  skills: string[];
}

const Teams: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    maxMembers: 4,
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTeams: Team[] = [
      {
        id: '1',
        name: 'Team Alpha',
        course: 'Software Engineering',
        courseCode: 'CSC 591',
        assignment: 'Project Proposal',
        members: [
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'leader' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
          { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member' },
        ],
        maxMembers: 4,
        isLocked: false,
        description: 'Full-stack web development team',
        skills: ['React', 'Node.js', 'MongoDB'],
      },
      {
        id: '2',
        name: 'Team Beta',
        course: 'Database Systems',
        courseCode: 'CSC 540',
        assignment: 'Database Design',
        members: [
          { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'leader' },
          { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'member' },
        ],
        maxMembers: 3,
        isLocked: true,
        description: 'Database optimization specialists',
        skills: ['SQL', 'PostgreSQL', 'Redis'],
      },
    ];
    
    setTeams(mockTeams);
  }, []);

  const handleCreateTeam = () => {
    // Mock team creation - replace with actual API call
    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      course: 'Software Engineering',
      courseCode: 'CSC 591',
      assignment: 'Project Proposal',
      members: [
        { id: user?.id || '1', name: `${user?.firstName} ${user?.lastName}`, email: user?.email || '', role: 'leader' },
      ],
      maxMembers: newTeam.maxMembers,
      isLocked: false,
      description: newTeam.description,
      skills: [],
    };
    
    setTeams([...teams, team]);
    setOpenDialog(false);
    setNewTeam({ name: '', description: '', maxMembers: 4 });
  };

  const handleJoinTeam = (teamId: string) => {
    // Mock join team - replace with actual API call
    console.log('Joining team:', teamId);
  };

  const isUserInTeam = (team: Team) => {
    return team.members.some(member => member.id === user?.id);
  };

  const canJoinTeam = (team: Team) => {
    return !team.isLocked && team.members.length < team.maxMembers && !isUserInTeam(team);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Teams
        </Typography>
        <Fab color="primary" aria-label="add" onClick={() => setOpenDialog(true)}>
          <Add />
        </Fab>
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Group />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.courseCode} - {team.course}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {team.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Members ({team.members.length}/{team.maxMembers})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {team.members.map((member) => (
                      <Chip
                        key={member.id}
                        label={member.name}
                        size="small"
                        color={member.role === 'leader' ? 'primary' : 'default'}
                        icon={member.role === 'leader' ? <CheckCircle /> : <Person />}
                      />
                    ))}
                  </Box>
                </Box>

                {team.skills.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {team.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={team.isLocked ? 'Locked' : 'Open'}
                    color={team.isLocked ? 'error' : 'success'}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {team.assignment}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                {isUserInTeam(team) ? (
                  <Button size="small" onClick={() => navigate(`/teams/${team.id}`)}>
                    View Team
                  </Button>
                ) : canJoinTeam(team) ? (
                  <Button size="small" onClick={() => handleJoinTeam(team.id)}>
                    Join Team
                  </Button>
                ) : (
                  <Button size="small" disabled>
                    {team.isLocked ? 'Team Locked' : 'Team Full'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTeam.description}
            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Max Members"
            type="number"
            fullWidth
            variant="outlined"
            value={newTeam.maxMembers}
            onChange={(e) => setNewTeam({ ...newTeam, maxMembers: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create Team
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Teams;
