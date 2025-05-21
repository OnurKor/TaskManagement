// filepath: /Users/onurkordogan/Desktop/TaskManagement/src/features/sprints/components/AddSprintModal.tsx
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Fade,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface AddSprintModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (sprintName: string) => Promise<void>;
  isAdding: boolean;
}

const AddSprintModal = ({ open, onClose, onAdd, isAdding }: AddSprintModalProps) => {
  const [sprintName, setSprintName] = useState('');
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      timer = setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
    }
    return () => clearTimeout(timer);
  }, [open]);

  // Reset error when name changes
  useEffect(() => {
    if (error && sprintName.trim()) {
      setError('');
    }
  }, [sprintName, error]);

  const handleAdd = async () => {
    if (!sprintName.trim()) {
      setError('Sprint adı boş olamaz');
      return;
    }
    
    await onAdd(sprintName);
    setSprintName('');
  };

  const handleClose = () => {
    setSprintName('');
    setError('');
    onClose();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sprintName.trim() && !isAdding) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isAdding ? undefined : handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: isMobile ? 1 : 2,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
      TransitionProps={{
        onExited: () => {
          setAnimate(false);
          setError('');
        }
      }}
    >
      {/* Header area with close button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1 
      }}>
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          fontWeight: 600,
          color: 'primary.main',
          p: { xs: 1.5, sm: 2 }
        }}>
          Yeni Sprint
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={isAdding ? undefined : handleClose}
          disabled={isAdding}
          sx={{ 
            mr: 1,
            color: 'text.secondary',
            transition: 'color 0.2s',
            '&:hover': {
              color: 'text.primary',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Fade in={animate} timeout={300}>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Yeni bir sprint oluşturmak için aşağıya sprint adını girin
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Sprint Adı"
            type="text"
            fullWidth
            variant="outlined"
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAdding}
            error={!!error}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 2
              },
              mb: error ? 0 : 1
            }}
            InputProps={{
              sx: {
                fontSize: { xs: '0.95rem', sm: '1rem' }
              }
            }}
          />
          
          {error && (
            <FormHelperText error sx={{ ml: 2, mt: 0.5, mb: 1 }}>
              {error}
            </FormHelperText>
          )}
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 2, 
              fontStyle: 'italic', 
              fontSize: '0.85rem', 
              opacity: 0.8 
            }}
          >
            Sprint oluşturulduktan sonra işlerinizi planlayabilirsiniz
          </Typography>
        </DialogContent>
      </Fade>

      <Fade in={animate} timeout={400}>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={isAdding}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              fontWeight: 500
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleAdd} 
            variant="contained" 
            color="primary"
            disabled={!sprintName.trim() || isAdding}
            startIcon={isAdding ? 
              <CircularProgress size={16} color="inherit" /> : 
              <AddCircleOutlineIcon />
            }
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              minWidth: 100,
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: !isAdding ? 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)' : undefined,
            }}
          >
            {isAdding ? 'Ekleniyor...' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Fade>
    </Dialog>
  );
};

export default AddSprintModal;
