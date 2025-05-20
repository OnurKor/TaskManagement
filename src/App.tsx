import { Box, Container, Typography, Paper, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import './App.css'
import { useAppSelector } from './redux/hooks'
import { signOut } from './utils/authHelper'
import { useNavigate } from 'react-router-dom'
import { useSupabaseApi } from './hooks/useSupabaseApi'
import { useEffect, useState } from 'react'

function App() {
  const { name, surname, email, isLoggedIn, accessToken, expiresAt } = useAppSelector(state => state.user)
  const navigate = useNavigate()
  
  // Sprint ekleme modal'ı için state'ler
  const [openSprintModal, setOpenSprintModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
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
    const success = await signOut()
    if (success) {
      navigate('/login')
    }
  }

  const { request, data: sprints, loading } = useSupabaseApi();
  
  // Sprint verilerini yükle
  const fetchSprints = async () => {
    if (isLoggedIn) {
      await request('Sprints', { 
        useAuth: true, 
        headers: {
          'Prefer': 'count=exact'
        }
      });
    }
  };
  
  useEffect(() => {
    fetchSprints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]); // Sadece isLoggedIn değiştiğinde çalışacak
  
  // Modal açma/kapama işlevleri
  const handleOpenSprintModal = () => setOpenSprintModal(true);
  const handleCloseSprintModal = () => {
    setOpenSprintModal(false);
    setNewSprintName('');
  };
  
  // Yeni sprint ekleme fonksiyonu
  const handleAddSprint = async () => {
    if (!newSprintName.trim()) return;
    
    setIsAddingSprint(true);
    
    try {
      await request('Sprints', {
        useAuth: true,
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: {
          SprintName: newSprintName.trim()
        }
      });
      
      // Sprint başarıyla eklendi, listeyi yenile
      await fetchSprints();
      
      // Modal'ı kapat
      handleCloseSprintModal();
    } catch (error) {
      console.error('Sprint ekleme hatası:', error);
    } finally {
      setIsAddingSprint(false);
    }
  };
  
  console.log("Sprints data:", sprints)
  return (
    <>

    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ 
        textAlign: 'center', 
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh'
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Görev Yönetimi
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          Yapım Aşamasında
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
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
            
            <Paper elevation={3} sx={{ mt: 4, p: 3, width: '100%', maxWidth: 400 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Sprint Verileri
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="small"
                  onClick={handleOpenSprintModal}
                >
                  Sprint Ekle
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {loading && <Typography>Yükleniyor...</Typography>}
              
              {sprints && Array.isArray(sprints) ? (
                sprints.length > 0 ? (
                  <Box sx={{ textAlign: 'left' }}>
                    {sprints.map((sprint: any) => (
                      <Paper key={sprint.id} sx={{ p: 2, mb: 2 }}>
                        <Typography><strong>Sprint:</strong> {sprint.SprintName || 'İsimsiz'}</Typography>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography>Henüz sprint verisi bulunmuyor.</Typography>
                )
              ) : (
                <Typography>Veri formatı beklenen şekilde değil.</Typography>
              )}
              
              <Button 
                variant="outlined"
                onClick={fetchSprints}
                sx={{ mt: 2 }}
                disabled={loading}
              >
                Yenile
              </Button>
            </Paper>
          </>
        )}
      </Box>
    </Container>
    
    {/* Sprint Ekleme Modal'ı */}
    <Dialog 
      open={openSprintModal} 
      onClose={handleCloseSprintModal}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Yeni Sprint Ekle</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Sprint Adı"
          type="text"
          fullWidth
          variant="outlined"
          value={newSprintName}
          onChange={(e) => setNewSprintName(e.target.value)}
          disabled={isAddingSprint}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseSprintModal} disabled={isAddingSprint}>
          İptal
        </Button>
        <Button 
          onClick={handleAddSprint} 
          variant="contained" 
          color="primary"
          disabled={!newSprintName.trim() || isAddingSprint}
        >
          {isAddingSprint ? 'Ekleniyor...' : 'Sprint Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

export default App
