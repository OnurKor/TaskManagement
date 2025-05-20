import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Container, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAppDispatch } from '../../redux/hooks';
import { setUser } from '../../redux/slices/userSlice';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('İsim zorunludur'),
  surname: Yup.string()
    .required('Soyisim zorunludur'),
  email: Yup.string()
    .email('Geçerli bir email adresi giriniz')
    .required('Email zorunludur'),
  password: Yup.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
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
          // Supabase bazen e-posta doğrulaması gerektirdiğinde session null olabilir
          setError('E-posta doğrulaması gerekiyor. Lütfen e-posta kutunuzu kontrol edin.');
        }
      } catch (error: any) {
        setError(error.message || 'Kayıt olurken bir hata oluştu.');
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
        {/* Sol taraf - Görsel kısmı */}
        <Box
          sx={{
            width: { xs: 0, sm: '40%', md: '55%' },
            backgroundImage: 'url(https://source.unsplash.com/random?collaboration,task)',
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
              py: 5,
              px: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              Hesap Oluştur
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Hemen kayıt olun ve uygulamayı kullanmaya başlayın
            </Typography>
            
            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  autoComplete="given-name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="İsim"
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
                  label="Soyisim"
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
                label="Email Adresi"
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
                label="Şifre"
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
                label="Şifre Tekrarı"
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
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2" underline="hover">
                  Zaten hesabınız var mı? Giriş yapın
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
