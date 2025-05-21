import { useState } from 'react';
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
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { signOut } from '../../features/auth/services/authService';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = () => {
  const { name, surname } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Kullanıcı menüsü için state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
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
      position="static" 
      color="default" 
      elevation={1}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Daxap Task Manager
        </Typography>
        
        <Box>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ 
              ml: 2,
              border: open ? `2px solid ${theme.palette.primary.main}` : 'none' 
            }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar 
              sx={{ 
                width: 35, 
                height: 35,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 'bold'
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
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              borderRadius: 2,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {name} {surname}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
            Çıkış Yap
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
