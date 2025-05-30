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
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface AddSprintModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (sprintName: string) => Promise<void>;
  isAdding: boolean;
}

// Validation schema for sprint form
const validationSchema = yup.object({
  sprintName: yup
    .string()
    .required('Sprint name is required')
    .min(3, 'Sprint name must be at least 3 characters')
    .max(50, 'Sprint name cannot exceed 50 characters')
    .trim()
});

const AddSprintModal = ({ open, onClose, onAdd, isAdding }: AddSprintModalProps) => {
  const [animate, setAnimate] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Setup formik
  const formik = useFormik({
    initialValues: {
      sprintName: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await onAdd(values.sprintName);
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formik.values.sprintName.trim() && !isAdding && !formik.errors.sprintName) {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isAdding ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-sprint-title"
      aria-describedby="add-sprint-description"
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
          formik.resetForm();
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
        <DialogTitle 
          id="add-sprint-title"
          sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, 
          fontWeight: 600,
          color: 'primary.main',
          p: { xs: 1.5, sm: 2 }
        }}>
          New Sprint
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
          <Typography 
            id="add-sprint-description" 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 3 }}
          >
            Enter a sprint name below to create a new sprint
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Sprint Name"
            type="text"
            fullWidth
            variant="outlined"
            name="sprintName"
            value={formik.values.sprintName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            onKeyPress={handleKeyPress}
            disabled={isAdding}
            error={formik.touched.sprintName && Boolean(formik.errors.sprintName)}
            helperText={formik.touched.sprintName && formik.errors.sprintName}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 2
              },
              mb: (formik.touched.sprintName && Boolean(formik.errors.sprintName)) ? 0 : 1
            }}
            InputProps={{
              sx: {
                fontSize: { xs: '0.95rem', sm: '1rem' }
              }
            }}
          />
          
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
            After creating the sprint, you can plan and manage your tasks
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
            Cancel
          </Button>
          <Button 
            onClick={() => formik.handleSubmit()}
            variant="contained" 
            color="primary"
            disabled={!formik.values.sprintName.trim() || isAdding || Boolean(formik.errors.sprintName)}
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
            {isAdding ? 'Adding...' : 'Create'}
          </Button>
        </DialogActions>
      </Fade>
    </Dialog>
  );
};

export default AddSprintModal;
