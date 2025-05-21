import { useState } from 'react';
import { Box, Container, Typography, Paper, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { signOut } from '../../auth/services/authService';
import AddIcon from '@mui/icons-material/Add';
import AddSprintModal from '../../sprints/components/AddSprintModal';

function Dashboard() {
  const { name, surname, email, isLoggedIn, accessToken, expiresAt } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  
  // Sprint ekleme modal'ı için state'ler
  const [openSprintModal, setOpenSprintModal] = useState(false);
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  
  // Token süresini hesapla
  let tokenStatus = 'Bilinmiyor';
  if (expiresAt) {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = expiresAt - currentTime;
    
    if (remainingTime > 3600) {
      tokenStatus = `Geçerli (${Math.floor(remainingTime / 3600)} saat ${Math.floor((remainingTime % 3600) / 60)} dakika kaldı)`;
    } else if (remainingTime > 0) {
      tokenStatus = `Geçerli (${Math.floor(remainingTime / 60)} dakika kaldı)`;
    } else {
      tokenStatus = 'Süresi doldu, yenilenecek';
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ 
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: 400,
            mb: 2
          }}>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3rem' } }}>
              Görev Yönetimi
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenSprintModal}
              size="large"
              sx={{ borderRadius: 2, px: { xs: 2, md: 3 } }}
            >
              Sprint Ekle
            </Button>
          </Box>
          <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
            Yapım Aşamasında
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
            Uygulama geliştirme devam ediyor. Şu an sadece giriş ve kayıt sayfaları kullanılabilir.
          </Typography>

          {isLoggedIn && (
            <>
              <Paper elevation={3} sx={{ mt: 4, p: 3, width: '100%', maxWidth: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Kullanıcı Bilgileri
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography><strong>Ad:</strong> {name}</Typography>
                  <Typography><strong>Soyad:</strong> {surname}</Typography>
                  <Typography><strong>E-posta:</strong> {email}</Typography>
                  <Typography sx={{ mt: 1, fontSize: '0.8rem' }}>
                    <strong>Token durumu:</strong> {tokenStatus}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {accessToken ? accessToken.substring(0, 20) + '...' : 'Token bilgisi yok'}
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: '0.8rem', color: 'success.main' }}>
                    Oturum açık (token yenileme aktif)
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleLogout}
                      sx={{ flex: 1 }}
                    >
                      Çıkış Yap
                    </Button>
                  </Box>
                </Box>
              </Paper>
              
              {/* Sprint Paneli kaldırıldı */}
            </>
          )}
        </Box>
      </Container>

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
