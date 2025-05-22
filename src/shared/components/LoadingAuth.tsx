import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const LoadingAuth: React.FC = () => {
  const [waitTime, setWaitTime] = useState(0);
  
  useEffect(() => {
    // Start a timer to track how long we've been waiting
    const timer = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // After 10 seconds of waiting, show a troubleshooting option
  const showTroubleshooting = waitTime > 10;
  
  const handleClearAndReload = () => {
    // Clear localStorage and reload the page
    localStorage.removeItem('userState');
    window.location.reload();
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Kimlik doğrulama kontrol ediliyor...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Lütfen bekleyin ({waitTime}s)
      </Typography>
      
      {showTroubleshooting && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            Kimlik doğrulama beklenenden uzun sürdü.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleClearAndReload}
          >
            Oturumu Temizle ve Yeniden Dene
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LoadingAuth;
