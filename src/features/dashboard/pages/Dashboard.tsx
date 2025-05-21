// filepath: /Users/onurkordogan/Desktop/TaskManagement/src/features/dashboard/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Fade
} from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import Header from '../../../shared/components/Header';
import TaskTreeView from '../../tasks/components/TaskTreeView';
import TaskButton from '../../tasks/components/TaskButton';
import SprintButton from '../../sprints/components/SprintButton';

function Dashboard() {
  const { name } = useAppSelector(state => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Animation control state for UI elements
  const [contentVisible, setContentVisible] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(false);
  
  // Animate content on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to refresh tasks when a new task is added
  const handleTaskAdded = () => {
    setRefreshTasks(prev => !prev); // Toggle to trigger useEffect in TaskTreeView
  };
  
  // Function to refresh tasks when a new sprint is added
  const handleSprintAdded = () => {
    setRefreshTasks(prev => !prev); // Toggle to trigger useEffect in TaskTreeView
  };

  return (
    <>
      <Header />
      <Box 
        sx={{
          backgroundColor: '#f8f7f3', // Kum beji (soft) background rengi
          minHeight: '100vh',
          pt: '64px', // Header'ın yüksekliği kadar padding-top
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern elements for modern look */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
          opacity: 0.4,
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} />
        
        <Box 
          sx={{ 
            width: '100%',
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Welcome message at the top */}
          <Fade in={contentVisible} timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  opacity: 0.9,
                  textAlign: 'center'
                }}
              >
                Welcome, {name}
              </Typography>
            </Box>
          </Fade>
          
          {/* Action Buttons Row with Tasks title in center */}
          <Fade in={contentVisible} timeout={1000}>
            <Box sx={{ mb: 4 }}>              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                width: '100%',
                px: { sm: 2, md: 5, lg: 10 } // Ekran genişliği arttıkça kenarlardan daha fazla boşluk
              }}>
                {/* Sprint Button - Sol tarafta */}
                <Box sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  <SprintButton 
                    buttonText="Create Sprint" 
                    fullWidth={isMobile} 
                    onSprintCreated={handleSprintAdded} 
                  />
                </Box>
                
                {/* Task Button - Sağ tarafta */}
                <Box sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  mt: { xs: 2, sm: 0 },
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-end' }
                }}>
                  <TaskButton 
                    buttonText="Create Task" 
                    fullWidth={isMobile} 
                    onTaskAdded={handleTaskAdded} 
                  />
                </Box>
              </Box>

            </Box>
          </Fade>

          {/* Task Tree View - Daha geniş alan ve scroll olmadan, task sayısına göre uzayacak */}
          <Fade in={contentVisible} timeout={1200}>
            <Box sx={{ 
              width: '100%',
              mt: { xs: 2, sm: 3 },
              pb: 6, // Sayfa sonunda ekstra padding
              px: { xs: 0, sm: 1 }, // Yanlarda ekstra boşluk
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <TaskTreeView refreshTrigger={refreshTasks} />
            </Box>
          </Fade>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
