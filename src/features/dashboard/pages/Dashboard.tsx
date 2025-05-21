// filepath: /Users/onurkordogan/Desktop/TaskManagement/src/features/dashboard/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  useMediaQuery,
  Fade
} from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import AddIcon from '@mui/icons-material/Add';
import AddSprintModal from '../../sprints/components/AddSprintModal';
import Header from '../../../shared/components/Header';
import TaskTreeView from '../../tasks/components/TaskTreeView';

function Dashboard() {
  const { name } = useAppSelector(state => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Animation control state for UI elements
  const [contentVisible, setContentVisible] = useState(false);
  
  // Sprint ekleme modal'ı için state'ler
  const [openSprintModal, setOpenSprintModal] = useState(false);
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  
  // Animate content on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Modal açma/kapama işlevleri
  const handleOpenSprintModal = () => setOpenSprintModal(true);
  const handleCloseSprintModal = () => setOpenSprintModal(false);
  
  // Yeni sprint ekleme fonksiyonu
  const handleAddSprint = async (sprintName: string) => {
    if (!sprintName.trim()) return;
    
    setIsAddingSprint(true);
    
    try {
      // Sprint ekleme işlemi başarılı
      setIsAddingSprint(false);
      // Modal'ı kapat
      handleCloseSprintModal();
    } catch (error) {
      console.error('Sprint ekleme hatası:', error);
      setIsAddingSprint(false);
    }
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
          {/* Sprint Ekle Butonu - En üstte sağda, modernize edildi */}
          <Fade in={contentVisible} timeout={800}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              mb: 4,
              mt: 1
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  opacity: 0.9
                }}
              >
                Hoş Geldiniz, {name}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenSprintModal}
                size={isMobile ? "medium" : "large"}
                sx={{ 
                  borderRadius: 3, 
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                  '&:hover': {
                    boxShadow: '0 8px 20px rgba(33,150,243,0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Sprint Ekle
              </Button>
            </Box>
          </Fade>

          {/* Görev Listesi - Kullanıcıya özel görevleri gösterir */}
          <Fade in={contentVisible} timeout={1200}>
            <Box sx={{ 
              mt: 4,
              width: '100%'
            }}>
              <TaskTreeView />
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Sprint Ekleme Modal'ı */}
      <AddSprintModal 
        open={openSprintModal} 
        onClose={handleCloseSprintModal} 
        onAdd={handleAddSprint}
        isAdding={isAddingSprint}
      />
    </>
  );
}

export default Dashboard;
