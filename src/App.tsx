import { Box, Container, Typography } from '@mui/material'
import './App.css'

function App() {
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
      </Box>
    </Container>
  )
}

export default App
