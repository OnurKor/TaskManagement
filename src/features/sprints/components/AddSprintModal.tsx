import { useState } from 'react';
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
  useTheme
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAdd = async () => {
    if (!sprintName.trim()) return;
    await onAdd(sprintName);
    setSprintName('');
  };

  const handleClose = () => {
    setSprintName('');
    onClose();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sprintName.trim() && !isAdding) {
      handleAdd();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: isMobile ? 1 : 2
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          fontWeight: 500,
          p: 1
        }}>
          Yeni Sprint
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ mr: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Lütfen oluşturmak istediğiniz sprintin adını girin.
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
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: 1.5
            }
          }}
          InputProps={{
            sx: {
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={isAdding}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 1.5,
            px: { xs: 2, sm: 3 }
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleAdd} 
          variant="contained" 
          color="primary"
          disabled={!sprintName.trim() || isAdding}
          startIcon={<AddCircleOutlineIcon />}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 1.5,
            px: { xs: 2, sm: 3 } 
          }}
        >
          {isAdding ? 'Ekleniyor...' : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSprintModal;
