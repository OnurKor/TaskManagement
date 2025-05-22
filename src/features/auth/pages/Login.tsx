import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Container, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabaseClient';
import { useAppDispatch } from '../../../store/hooks';
import { setUser } from '../../../store/slices/userSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setLoading(true);
        
        // Supabase ile giriş yapma
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          throw error;
        }
        console.log("data", data);
        if (data && data.user && data.session) {
          // Kullanıcı adını display_name'den alıyoruz
          const displayName = data.user.user_metadata?.display_name || '';
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Kullanıcı bilgilerini Redux store'a kaydet
          dispatch(setUser({
            id: data.user.id,
            email: data.user.email || null,
            name: firstName,
            surname: lastName,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          }));
          
          // Başarılı giriş sonrası home sayfasına yönlendir
          navigate('/home');
        }
      } catch (error: any) {
        setError(error.message || 'An error occurred during sign in. Please try again.');
      } finally {
        setLoading(false);
      }
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
        {/* Left side - Visual section with task management themed image */}
        <Box
          sx={{
            width: { xs: 0, sm: '40%', md: '55%' },
            backgroundImage: 'url(https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', sm: 'block' },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            bottom: 40, 
            left: 40, 
            color: 'white',
            zIndex: 2
          }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Task Management
            </Typography>
            <Typography variant="body1">
              Organize your tasks efficiently and boost your productivity
            </Typography>
          </Box>
        </Box>
        
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
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to your account to manage your tasks
            </Typography>
            
            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
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
                label="Password"
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 2, 
              mb: 3, 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              background: !loading ? 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)' : undefined,
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1e88e5 0%, #00b8d4 100%)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/register" variant="body2" underline="hover">
                  Don't have an account? Register now
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
