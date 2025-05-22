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
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SprintIcon from '@mui/icons-material/DirectionsRun';
import { useTaskService } from '../services/taskService';
import type { Task, TaskWithChildren } from '../services/taskService';
import AddTaskModal from './AddTaskModal';
import TaskContextMenu from './TaskContextMenu';
import DeleteConfirmationModal from './DeleteConfirmationModal';

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
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    borderLeft: `4px solid ${theme.palette.primary.dark}`,
    backgroundColor: alpha(theme.palette.primary.light, 0.08),
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
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
    backgroundColor: alpha(theme.palette.background.default, 0.7),
  }
}));

// TaskNode styling is handled inline

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
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: 0.5,
      color: expanded ? 'primary.main' : 'action.active',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        color: 'primary.main',
      },
    }}
  >
    <ExpandCircleDownIcon sx={{ 
      fontSize: '24px',
      filter: expanded ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none',
    }} />
  </IconButton>
);

// Task Tree Node Component
interface TaskNodeProps {
  task: TaskWithChildren;
  level: number;
  getSprintName: (sprintId: number | string) => string;
  getUserName: (userId: number | string) => string;
  getUserInitial: (userId: number | string) => string;
  getStatusColor: (status: string ) => string;
  getAvatarColor: (userId: number | string) => string;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  onDeleteTask: (taskId: number, taskName: string, hasChild: boolean | undefined) => void;
  onUpdateTask?: (task: TaskWithChildren) => void;
}  const TaskNode = ({
  task,
  level,
  getSprintName,
  getUserName,
  getUserInitial,
  getStatusColor,
  getAvatarColor,
  onDeleteTask,

  onUpdateTask
}: TaskNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  
  const hasChildren = task.children && task.children.length > 0;
  const isParent = level === 0; // Parent task is defined by being at top level
  const TaskCardComponent = isParent ? ParentTaskCard : ChildTaskCard;
  const theme = useTheme();
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  const handleDelete = () => {
    onDeleteTask(task.id as number, task.TaskName, hasChildren);
  };
  
  const handleUpdate = () => {
    // Proceed with update
    if (onUpdateTask) {
      onUpdateTask(task);
    }
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
          borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderBottomLeftRadius: 8,
        }
      })
    }}>
      {/* Task Card */}
      <TaskCardComponent 
        sx={{ ml: level * 3, cursor: 'pointer' }}
        onClick={handleUpdate}
        onContextMenu={handleContextMenu}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Task Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {hasChildren ? (
                <Box sx={{ 
                  mr: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  <Badge 
                    badgeContent={task.children?.length || 0} 
                    color="primary"
                    sx={{ 
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        height: 18,
                        minWidth: 18,
                        fontWeight: 'bold',
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                      }
                    }}
                    overlap="circular"
                  >
                    <Box sx={{ 
                      bgcolor: expanded ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      borderRadius: '50%',
                      transition: 'background-color 0.3s ease'
                    }}>
                      <ExpandIcon expanded={expanded} onClick={toggleExpand} />
                    </Box>
                  </Badge>
                </Box>
              ) : (
                <Box sx={{ ml: 4.5 }} /> // Spacing for alignment with parent tasks
              )}
              {isParent ? (
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
              pl: isParent ? 0 : 4.5 // Alignment
            }}
          >
            {task.Subject}
          </Typography>

          {/* Description - Directly show formatted description in the card */}
          {task.Description && (
            <Box 
              sx={{ 
                pl: isParent ? 0 : 4.5, 
                mb: 2,
                mt: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.5,
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              <Box 
                dangerouslySetInnerHTML={{ __html: task.Description }} 
                sx={{
                  fontSize: '0.85rem',
                  '& p': { margin: '0.5em 0' },
                  '& ul, & ol': { paddingLeft: 2 },
                  '& li': { fontSize: '0.85rem' },
                  '& h1': { fontSize: '1.1rem', marginTop: 0 },
                  '& h2': { fontSize: '1rem' },
                  '& h3': { fontSize: '0.95rem' }
                }}
              />
            </Box>
          )}
          
          <Divider sx={{ my: 1.5 }} />
          
          {/* Task Details */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 1.5,
            pl: isParent ? 0 : 4.5 // Alignment
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
              width: 2,
              backgroundColor: theme.palette.primary.light,
              opacity: 0.5,
              borderRadius: '1px'
            }
          }}
        >
          {/* Animasyon efekti için ek konteyner */}
          <Box
            sx={{
              mt: 1,
              pl: 1,
              position: 'relative',
              '&::after': expanded ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: level * 24 + 12,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.light,
                opacity: 0.5,
                transition: 'all 0.3s ease'
              } : {}
            }}
          >
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
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
              />
            ))}
          </Box>
        </Collapse>
      )}
      
      {/* Context Menu */}
      <TaskContextMenu
        open={contextMenu !== null}
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : null}
        onClose={handleCloseContextMenu}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </Box>
  );
};

interface TaskTreeViewProps {
  refreshTrigger?: boolean;
}

const TaskTreeView: React.FC<TaskTreeViewProps> = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState<TaskWithChildren[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  
  // Pagination state
  const [visibleTaskCount, setVisibleTaskCount] = useState(5); // Başlangıçta sadece 5 task göster
  const [hasMoreTasks, setHasMoreTasks] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<{ id: number; name: string; hasChild:boolean | undefined } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const taskService = useTaskService();
  
  useEffect(() => {
    fetchData();
    // refreshTrigger değiştiğinde mevcut görünür task sayısını ve görünürlük durumunu koru
  }, [refreshTrigger]); // Refresh when refreshTrigger changes
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tasks
      const tasksResponse = await taskService.fetchTasks();
      if (tasksResponse && tasksResponse.data) {
        // Use the enhanced organizeTasks method from taskService
        const organizedTasks = taskService.organizeTasks(tasksResponse.data);
        setTasks(organizedTasks);
        // Check if we have more tasks than the visible count
        setHasMoreTasks(organizedTasks.length > visibleTaskCount);
        console.log(`Loaded ${organizedTasks.length} tasks, showing ${visibleTaskCount}, has more: ${organizedTasks.length > visibleTaskCount}`);
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

  // Handle loading more tasks
  const handleLoadMore = () => {
    // Add 5 more tasks to visible count
    const newCount = visibleTaskCount + 5;
    setVisibleTaskCount(newCount);
    // Check if we still have more tasks after loading
    setHasMoreTasks(tasks.length > newCount);
  };
  
  const handleCloseTaskModal = () => setOpenTaskModal(false);
  
  const handleAddTask = async (_task: Task) => {
    // Task eklendiğinde, halihazırda görünen task sayısını hatırla
    const currentVisibleCount = visibleTaskCount;
    await fetchData(); // Refresh tasks after adding
    // Eğer tüm tasklar görünüyorsa (Add More yoksa), yeni eklenen task'ı da göster
    if (!hasMoreTasks) {
      setVisibleTaskCount(currentVisibleCount + 1);
    }
  };
  
  // Handler for initiating task deletion
  const handleDeleteTask = (taskId: number, taskName: string, hasChild: boolean | undefined) => {
    setDeletingTask({ id: taskId, name: taskName, hasChild });
    setDeleteConfirmOpen(true);
  };

  // Handler for confirming and executing task deletion
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    
    setDeleteLoading(true);
    try {
      await taskService.deleteTask(deletingTask.id);
      // Refresh the task list after successful deletion
      await fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      // TODO: Show error notification if needed
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setDeletingTask(null);
    }
  };

  // Handler for canceling task deletion
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingTask(null);
  };

  // State for update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState<TaskWithChildren | null>(null);
  
  // Handler for initiating task update
  const handleUpdateTask = (task: TaskWithChildren) => {
    setTaskToUpdate(task);
    setUpdateModalOpen(true);
  };
  
  // Handler for completing task update
  const handleConfirmUpdate = async (_taskId: number, _updatedTask: Task) => {
    try {
      // Refresh the task list after successful update
      await fetchData();
    } catch (error) {
      console.error('Error updating task:', error);
      // TODO: Show error notification if needed
    } finally {
      setUpdateModalOpen(false);
      setTaskToUpdate(null);
    }
  };
  
  // Handler for canceling task update
  const handleCancelUpdate = () => {
    setUpdateModalOpen(false);
    setTaskToUpdate(null);
  };
  
  // Helper function to get sprint name by id
  const getSprintName = (sprintId: number | string) => {
    const sprint = sprints.find(s => String(s.id) === String(sprintId));
    return sprint ? sprint.SprintName : 'Unknown';
  };
  
  // Helper function to get user name by id
  const getUserName = (userId: number | string) => {
    if (!userId) {
      return 'Not Assigned';
    }
    
    const user = users.find(u => u.id === userId);
    return user ? user.UserName : `User ${userId}`;
  };

  // Helper function to get user initial for avatar
  const getUserInitial = (userId: number | string) => {
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
  const getAvatarColor = (userId: number | string) => {
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
    <Box sx={{ mt: 0, width: '100%' }}>
      {/* Task header removed and moved to Dashboard */}
      
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
            flexGrow: 1
          }}>
            {tasks.slice(0, visibleTaskCount).map((task) => (
              <TaskNode
                key={task.id}
                task={task}
                level={0}
                getSprintName={getSprintName}
                getUserName={getUserName}
                getUserInitial={getUserInitial}
                getStatusColor={getStatusColor}
                getAvatarColor={getAvatarColor}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
              />
            ))}
            
            {hasMoreTasks && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={handleLoadMore}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 4,
                    py: 1,
                    minWidth: '150px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Add More
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Add Task Modal */}
      <AddTaskModal 
        open={openTaskModal} 
        onClose={handleCloseTaskModal} 
        onAdd={handleAddTask} 
        mode="create"
      />
      
      {/* Update Task Modal */}
      <AddTaskModal
        open={updateModalOpen}
        onClose={handleCancelUpdate}
        onUpdate={handleConfirmUpdate}
        taskToUpdate={taskToUpdate}
        mode="update"
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        taskName={deletingTask ? deletingTask.name : ''}
        hasChildren={deletingTask ? deletingTask.hasChild : false}
      />
    </Box>
  );
};

export default TaskTreeView;
