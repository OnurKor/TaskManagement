import { Box, Container, Typography, Paper, Divider, Button } from '@mui/material'
import './App.css'
import { useAppSelector } from './redux/hooks'
import { signOut } from './utils/authHelper'
import { useNavigate } from 'react-router-dom'

function App() {
  const { name, surname, email, isLoggedIn } = useAppSelector(state => state.user)
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    const success = await signOut()
    if (success) {
      navigate('/login')
    }
  }
  return (
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
          <Paper elevation={3} sx={{ mt: 4, p: 3, width: '100%', maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Kullanıcı Bilgileri
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography><strong>Ad:</strong> {name}</Typography>
              <Typography><strong>Soyad:</strong> {surname}</Typography>
              <Typography><strong>E-posta:</strong> {email}</Typography>
              <Typography sx={{ mt: 2, fontSize: '0.8rem', color: 'text.secondary' }}>
                Oturum açık (token yenileme aktif)
              </Typography>
              
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleLogout}
                sx={{ mt: 3, width: '100%' }}
              >
                Çıkış Yap
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  )
}

export default App
