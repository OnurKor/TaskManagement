import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Divider,
  Avatar,
  IconButton,
  Collapse,
  Badge,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SprintIcon from '@mui/icons-material/DirectionsRun';
import { useTaskService } from '../services/taskService';
import type { Task, TaskWithChildren } from '../services/taskService';
import AddTaskModal from './AddTaskModal';

// Custom styling for parent task cards
const ParentTaskCard = styled(Card)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(1),
  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
  borderRadius: theme.shape.borderRadius * 2,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: alpha(theme.palette.primary.light, 0.04),
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    borderLeft: `4px solid ${theme.palette.primary.dark}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.03)}, transparent)`,
    borderRadius: 'inherit',
    pointerEvents: 'none'
  }
}));

// Custom styling for child task cards
const ChildTaskCard = styled(Card)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(1),
  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
  }
}));

// Custom styling for the connector line
const ConnectorLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 16,
  top: 0,
  bottom: 0,
  width: 1,
  backgroundColor: theme.palette.divider,
  opacity: 0.6,
  zIndex: 0
}));

// Custom Expand IconButton with rotation
interface ExpandIconProps {
  expanded: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const ExpandIcon = ({ expanded, onClick }: ExpandIconProps) => (
  <IconButton
    onClick={onClick}
    data-testid="expand-button"
    sx={{
      transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
      transition: 'transform 0.2s',
      padding: 0.5,
    }}
  >
    <ExpandMoreIcon />
  </IconButton>
);

// Task Tree Node Component
interface TaskNodeProps {
  task: TaskWithChildren;
  level: number;
  getSprintName: (sprintId: number) => string;
  getUserName: (userId: number) => string;
  getUserInitial: (userId: number) => string;
  getStatusColor: (status: string) => string;
  getAvatarColor: (userId: number) => string;
  isFirstChild?: boolean;
  isLastChild?: boolean;
}

const TaskNode = ({
  task,
  level,
  getSprintName,
  getUserName,
  getUserInitial,
  getStatusColor,
  getAvatarColor,
  isFirstChild = false,
  isLastChild = false
}: TaskNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = task.children && task.children.length > 0;
  const TaskCardComponent = hasChildren ? ParentTaskCard : ChildTaskCard;
  const theme = useTheme();
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  return (
    <Box sx={{ 
      mb: 2, 
      position: 'relative',
      // Apply connector lines for children
      ...(level > 0 && {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: level * 24 - 8,
          height: 20,
          width: 16,
          borderLeft: `1px dashed ${theme.palette.divider}`,
          borderBottom: `1px dashed ${theme.palette.divider}`,
          borderBottomLeftRadius: 8,
        }
      })
    }}>
      {/* Task Card */}
      <TaskCardComponent sx={{ ml: level * 3 }}>
        <CardContent sx={{ pb: 1 }}>
          {/* Task Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {hasChildren ? (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <Badge 
                    badgeContent={task.children?.length || 0} 
                    color="primary"
                    sx={{ 
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        height: 16,
                        minWidth: 16,
                      }
                    }}
                  >
                    <ExpandIcon expanded={expanded} onClick={toggleExpand} />
                  </Badge>
                </Box>
              ) : (
                <Box sx={{ ml: 4.5 }} /> // Spacing for alignment with parent tasks
              )}
              {hasChildren ? (
                <FolderIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              ) : (
                <AssignmentIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {task.TaskName}
              </Typography>
            </Box>
            <Chip 
              label={task.Status} 
              size="small" 
              color={getStatusColor(task.Status) as any}
              sx={{ fontWeight: 500 }}
            />
          </Box>
          
          {/* Task Subject */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom 
            sx={{ 
              mb: 2,
              fontSize: '0.85rem',
              maxWidth: '90%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              pl: hasChildren ? 0 : 4.5 // Alignment
            }}
          >
            {task.Subject}
          </Typography>
          
          <Divider sx={{ my: 1.5 }} />
          
          {/* Task Details */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 1.5,
            pl: hasChildren ? 0 : 4.5 // Alignment
          }}>
            {/* Sprint */}
            <Tooltip title="Sprint">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SprintIcon color="action" sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getSprintName(task.SprintID)}
                </Typography>
              </Box>
            </Tooltip>
            
            {/* Hours */}
            <Tooltip title="Estimated Hours">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="action" sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {hasChildren ? task.totalEstimatedHours : task.EstimatedHour} saat
                </Typography>
              </Box>
            </Tooltip>
            
            {/* Assignee */}
            <Tooltip title={`Assigned to: ${getUserName(task.UserID)}`}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: getAvatarColor(task.UserID),
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {getUserInitial(task.UserID)}
              </Avatar>
            </Tooltip>
          </Box>
        </CardContent>
      </TaskCardComponent>
      
      {/* Children */}
      {hasChildren && (
        <Collapse 
          in={expanded} 
          timeout={300} 
          unmountOnExit
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: level * 24 + 16,
              bottom: 12,
              width: 1,
              backgroundColor: theme.palette.divider,
              opacity: 0.6
            }
          }}
        >
          <Box sx={{ mt: 1 }}>
            {task.children?.map((childTask, index) => (
              <TaskNode
                key={childTask.id}
                task={childTask}
                level={level + 1}
                getSprintName={getSprintName}
                getUserName={getUserName}
                getUserInitial={getUserInitial}
                getStatusColor={getStatusColor}
                getAvatarColor={getAvatarColor}
                isFirstChild={index === 0}
                isLastChild={index === (task.children?.length || 0) - 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const TaskTreeView = () => {
  const [tasks, setTasks] = useState<TaskWithChildren[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  
  const taskService = useTaskService();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tasks
      const tasksResponse = await taskService.fetchTasks();
      if (tasksResponse && tasksResponse.data) {
        // Use the enhanced organizeTasks method from taskService
        const organizedTasks = taskService.organizeTasks(tasksResponse.data);
        setTasks(organizedTasks);
      }
      
      // Fetch users for displaying names
      const usersResponse = await taskService.fetchUsers();
      if (usersResponse && usersResponse.data) {
        setUsers(usersResponse.data);
      }
      
      // Fetch sprints for displaying sprint names
      const sprintsResponse = await taskService.fetchSprints();
      if (sprintsResponse && sprintsResponse.data) {
        setSprints(sprintsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenTaskModal = () => setOpenTaskModal(true);
  const handleCloseTaskModal = () => setOpenTaskModal(false);
  
  const handleAddTask = async (_task: Task) => {
    await fetchData(); // Refresh tasks after adding
  };
  
  // Helper function to get sprint name by id
  const getSprintName = (sprintId: number) => {
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint ? sprint.SprintName : 'Unknown';
  };
  
  // Helper function to get user name by id
  const getUserName = (userId: number) => {
    if (!userId) {
      return 'Not Assigned';
    }
    
    const user = users.find(u => u.id === userId);
    return user ? user.UserName : `User ${userId}`;
  };

  // Helper function to get user initial for avatar
  const getUserInitial = (userId: number) => {
    if (!userId) return 'N/A';
    
    const user = users.find(u => u.id === userId);
    if (!user) return 'U';
    
    return user.UserName.charAt(0).toUpperCase();
  };
  
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'info';
      case 'Working':
        return 'warning';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Helper function to get avatar background color based on username
  const getAvatarColor = (userId: number) => {
    if (!userId) return '#bdbdbd';
    
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
      '#009688', '#4caf50', '#8bc34a', '#cddc39'
    ];
    
    const user = users.find(u => u.id === userId);
    if (!user) return colors[0];
    
    const hash = user.UserName.split('').reduce(
      (acc: number, char: string) => acc + char.charCodeAt(0), 0
    );
    
    return colors[hash % colors.length];
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Görevler
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenTaskModal}
          sx={{ 
            borderRadius: 2, 
            px: 3,
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            '&:hover': {
              boxShadow: '0 6px 10px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Task Ekle
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <Typography color="text.secondary">
            Henüz bir görev bulunmamaktadır. Yeni bir görev ekleyin.
          </Typography>
        </Paper>
      ) : (
        <Paper
          sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            maxHeight: 'calc(100vh - 200px)'
          }}>
            {tasks.map((task) => (
              <TaskNode
                key={task.id}
                task={task}
                level={0}
                getSprintName={getSprintName}
                getUserName={getUserName}
                getUserInitial={getUserInitial}
                getStatusColor={getStatusColor}
                getAvatarColor={getAvatarColor}
              />
            ))}
          </Box>
        </Paper>
      )}
      
      <AddTaskModal 
        open={openTaskModal} 
        onClose={handleCloseTaskModal} 
        onAdd={handleAddTask} 
      />
    </Box>
  );
};

export default TaskTreeView;
