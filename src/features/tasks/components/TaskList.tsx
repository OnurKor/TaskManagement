import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTaskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import AddTaskModal from './AddTaskModal';

const TaskList = () => {
  const [tasks, setTasks] = useState<any[]>([]);
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
        setTasks(tasksResponse.data);
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
        <TableContainer 
          component={Paper}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
              <TableRow>
                <TableCell>Görev Adı</TableCell>
                <TableCell>Konu</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tahmini Süre</TableCell>
                <TableCell>Sprint</TableCell>
                <TableCell>Atanan Kişi</TableCell>
                <TableCell>Üst Görev</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.TaskName}</TableCell>
                  <TableCell>{task.Subject}</TableCell>
                  <TableCell>
                    <Chip 
                      label={task.Status} 
                      size="small" 
                      color={getStatusColor(task.Status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{task.EstimatedHour}</TableCell>
                  <TableCell>{getSprintName(task.SprintID)}</TableCell>
                  <TableCell>{getUserName(task.UserID)}</TableCell>
                  <TableCell>
                    {task.ParentID ? 
                      tasks.find(t => t.id === task.ParentID)?.TaskName || `Task ${task.ParentID}` 
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <AddTaskModal 
        open={openTaskModal} 
        onClose={handleCloseTaskModal} 
        onAdd={handleAddTask} 
      />
    </Box>
  );
};

export default TaskList;
