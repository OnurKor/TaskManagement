// filepath: /Users/onurkordogan/Desktop/TaskManagement/src/features/dashboard/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  useTheme, 
  useMediaQuery,
  Fade,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { signOut } from '../../auth/services/authService';
import AddIcon from '@mui/icons-material/Add';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SecurityIcon from '@mui/icons-material/Security';
import AddSprintModal from '../../sprints/components/AddSprintModal';
import Header from '../../../shared/components/Header';
import TaskList from '../../tasks/components/TaskList';

function Dashboard() {
  const { name, surname, email, isLoggedIn, accessToken, expiresAt } = useAppSelector(state => state.user);
  const navigate = useNavigate();
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
  
  // Token süresini hesapla
  let tokenStatus = 'Bilinmiyor';
  let tokenStatusColor = 'default';
  
  if (expiresAt) {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = expiresAt - currentTime;
    
    if (remainingTime > 3600) {
      tokenStatus = `${Math.floor(remainingTime / 3600)} saat ${Math.floor((remainingTime % 3600) / 60)} dk.`;
      tokenStatusColor = 'success';
    } else if (remainingTime > 600) {  // 10 dakikadan fazla
      tokenStatus = `${Math.floor(remainingTime / 60)} dakika`;
      tokenStatusColor = 'success';
    } else if (remainingTime > 0) {
      tokenStatus = `${Math.floor(remainingTime / 60)} dakika`;
      tokenStatusColor = 'warning';
    } else {
      tokenStatus = 'Yenileniyor';
      tokenStatusColor = 'error';
    }
  }
  
  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      navigate('/login');
    }
  };
  
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
        
        <Container 
          maxWidth="lg" 
          sx={{ 
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

          {isLoggedIn && (
            <Fade in={contentVisible} timeout={1000}>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3
              }}>
                {/* Kullanıcı Bilgileri Kartı */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2.5, sm: 3 }, 
                    borderRadius: 3,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    mb: { xs: 3, md: 0 },
                    background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
                    height: 'fit-content',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2.5
                  }}>
                    <AccountBoxIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Kullanıcı Bilgileri
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box 
                    sx={{ 
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                      mb: 3
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Ad</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{name || '–'}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Soyad</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{surname || '–'}</Typography>
                    </Box>
                    
                    <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' }}}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>E-posta</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{email || '–'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      onClick={handleLogout}
                      sx={{ 
                        borderRadius: 2.5,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Çıkış Yap
                    </Button>
                  </Box>
                </Paper>
                
                {/* Token Bilgileri Kartı */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2.5, sm: 3 }, 
                    borderRadius: 3,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
                    height: 'fit-content'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2.5
                  }}>
                    <SecurityIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Oturum Bilgileri
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                        Token Durumu
                      </Typography>
                      <Chip 
                        label={tokenStatus} 
                        color={tokenStatusColor as any} 
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)', 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}>
                      <Typography variant="body2" color="text.secondary" 
                        sx={{ 
                          mb: 1,  
                          fontSize: '0.85rem', 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all' 
                        }}
                      >
                        {accessToken ? accessToken.substring(0, 25) + '...' : 'Token bilgisi yok'}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 1.5
                      }}>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: 'success.main',
                            mr: 1
                          }} 
                        />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          Oturum açık (otomatik yenileme aktif)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          )}

          {/* Görev Listesi - Kullanıcıya özel görevleri gösterir */}
          <Fade in={contentVisible} timeout={1200}>
            <Box sx={{ 
              mt: 4,
              width: '100%'
            }}>
              <TaskList />
            </Box>
          </Fade>
        </Container>
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
