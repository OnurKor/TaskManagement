import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Container, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabaseClient';
import { useAppDispatch } from '../../../store/hooks';
import { setUser } from '../../../store/slices/userSlice';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('First name is required'),
  surname: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Password confirmation is required'),
});

const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const formik = useFormik({
    initialValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setLoading(true);
        
        // Tam adı oluştur
        const fullName = `${values.name} ${values.surname}`;
        
        // Supabase ile kayıt olma
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              display_name: fullName
            }
          }
        });

        if (error) {
          throw error;
        }
        
        if (data && data.user && data.session) {
          // Kullanıcı bilgilerini Redux store'a kaydet
          dispatch(setUser({
            id: data.user.id,
            email: data.user.email || null,
            name: values.name,
            surname: values.surname,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          }));
          
          // Başarılı kayıt sonrası home sayfasına yönlendir
          navigate('/home');
        } else {
          // Supabase sometimes requires email verification, in which case session would be null
          setError('Email verification required. Please check your email inbox.');
        }
      } catch (error: any) {
        setError(error.message || 'An error occurred during registration.');
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80)',
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            bottom: 40, 
            left: 40, 
            color: 'white',
            zIndex: 2,
            maxWidth: '80%'
          }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Start Managing Your Tasks
            </Typography>
            <Typography variant="body1">
              Join our platform and take control of your workflow with our powerful task management system
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
              py: 5,
              px: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Register now and start managing your tasks efficiently
            </Typography>
            
            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  autoComplete="given-name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="First Name"
                  autoFocus
                  variant="outlined"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
                <TextField
                  required
                  fullWidth
                  id="surname"
                  label="Last Name"
                  name="surname"
                  autoComplete="family-name"
                  variant="outlined"
                  value={formik.values.surname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.surname && Boolean(formik.errors.surname)}
                  helperText={formik.touched.surname && formik.errors.surname}
                />
              </Box>
              
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                variant="outlined"
                sx={{ mb: 2 }}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                sx={{ mb: 2 }}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                variant="outlined"
                sx={{ mb: 3 }}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                  mb: 2, 
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
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2" underline="hover">
                  Already have an account? Sign in
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
