import { useState } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddTaskModal from '../../tasks/components/AddTaskModal';
import type { Task } from '../../tasks/services/taskService';

interface TaskButtonProps {
  buttonText?: string;
  onTaskAdded?: () => void;
  fullWidth?: boolean;
}

const TaskButton = ({ buttonText = "Create Task", onTaskAdded, fullWidth = false }: TaskButtonProps) => {
  const [openTaskModal, setOpenTaskModal] = useState(false);
  
  const handleOpenTaskModal = () => setOpenTaskModal(true);
  const handleCloseTaskModal = () => setOpenTaskModal(false);
  
  const handleAddTask = async (_task: Task) => {
    handleCloseTaskModal();
    // Callback to refresh tasks if needed
    if (onTaskAdded) {
      onTaskAdded();
    }
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="secondary"
        startIcon={<AddIcon />}
        onClick={handleOpenTaskModal}
        fullWidth={fullWidth}
        sx={{ 
          borderRadius: 3, 
          px: { xs: 2, md: 4 },
          py: { xs: 1, md: 1.5 },
          boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)', // Yeşil/turkuaz tonlar
          minWidth: { xs: '180px', sm: '200px' },
          '&:hover': {
            boxShadow: '0 8px 20px rgba(0,150,136,0.25)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        {buttonText}
      </Button>
      
      <AddTaskModal 
        open={openTaskModal} 
        onClose={handleCloseTaskModal} 
        onAdd={handleAddTask} 
      />
    </>
  );
};

export default TaskButton;
