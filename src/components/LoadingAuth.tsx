import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingAuth: React.FC = () => {
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
        Lütfen bekleyin
      </Typography>
    </Box>
  );
};

export default LoadingAuth;
