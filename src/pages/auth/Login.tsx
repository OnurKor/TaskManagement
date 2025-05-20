import React from 'react';
import { TextField, Button, Typography, Box, Link, Container } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir email adresi giriniz')
    .required('Email zorunludur'),
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
});

const Login: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Login form values:', values);
      // Burada login işlemleri yapılacak
    },
  });

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: { xs: 'auto', sm: '80vh' },
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
        }}
      >
        {/* Sol taraf - Görsel kısmı */}
        <Box
          sx={{
            width: { xs: 0, sm: '40%', md: '55%' },
            backgroundImage: 'url(https://source.unsplash.com/random?productivity,workspace)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', sm: 'block' }
          }}
        />
        
        {/* Sağ taraf - Form kısmı */}
        <Box
          sx={{
            width: { xs: '100%', sm: '60%', md: '45%' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              py: 8,
              px: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Hoş Geldiniz
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Hesabınıza giriş yapın
            </Typography>
            
            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Adresi"
                name="email"
                autoComplete="email"
                autoFocus
                variant="outlined"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Şifre"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Giriş Yap
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/register" variant="body2" underline="hover">
                  Hesabınız yok mu? Kayıt olun
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
