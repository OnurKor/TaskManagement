import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { signOut } from '../../features/auth/services/authService';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import daxapLogo from '../../assets/daxap.343ff2f281752f056e66.webp';

const Header = () => {
  const { name, surname } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Scroll durumu için state
  const [scrolled, setScrolled] = useState(false);
  
  // Kullanıcı menüsü için state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Scroll durumunu takip et
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Kullanıcının baş harflerini alalım
  const userInitials = `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`;
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      handleMenuClose();
      navigate('/login');
    }
  };

  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={scrolled ? 3 : 0}
      sx={{ 
        backgroundColor: scrolled 
          ? 'rgba(255, 255, 255, 0.97)' 
          : 'rgba(173, 216, 230, 0.8)', // Renk değişimi
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        borderBottom: scrolled 
          ? '1px solid rgba(0, 0, 0, 0.08)' 
          : '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <Container 
        maxWidth="xl" 
        disableGutters 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            py: { xs: 0.8, sm: 1 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={daxapLogo}
              alt="Daxap Logo"
              style={{
                height: 60,
                marginRight: 10,
                display: 'block',
              }}
            />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 700, 
                color: scrolled ? 'primary.dark' : 'primary.dark',
                opacity: scrolled ? 1 : 0.9,
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                letterSpacing: '-0.01em',
              }}
            >
             Task Manager
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Fade in={true}>
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    mr: 2, 
                    fontWeight: 500,
                    opacity: 0.9
                  }}
                >
                  {name} {surname}
                </Typography>
              </Fade>
            )}
            
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ 
                ml: 1,
                border: open 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : '2px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar 
                sx={{ 
                  width: 35, 
                  height: 35,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  boxShadow: open ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 4px 15px rgba(0,0,0,0.15))',
                mt: 1.5,
                borderRadius: 2,
                minWidth: 220,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 16,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transitionDuration={200}
          >
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountCircleIcon 
                  fontSize="small" 
                  color="primary" 
                  sx={{ mr: 1, opacity: 0.9 }} 
                />
                <Typography variant="subtitle2" color="primary" sx={{ fontSize: '0.87rem' }}>
                  Hesap
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {name} {surname}
              </Typography>
            </Box>
            <Divider />
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                py: 1.5, 
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 2, opacity: 0.85 }} />
              <Typography variant="body2">Çıkış Yap</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
