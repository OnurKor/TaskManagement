import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Alert,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface DeleteConfirmationProps {
  open: boolean;
  taskName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  hasChildren?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({
  open,
  taskName,
  onClose,
  onConfirm,
  loading,
  hasChildren = false
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="delete-confirmation-title"
      aria-describedby="delete-confirmation-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: '400px'
        }
      }}
    >
      <DialogTitle id="delete-confirmation-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        {hasChildren ? (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 1,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Box sx={{ fontWeight: 'medium' }}>Cannot Delete Parent Task</Box>
            <Box sx={{ mt: 0.5, fontSize: '0.9rem' }}>
              This task has child tasks associated with it. Please delete all child tasks first before deleting this parent task.
            </Box>
          </Alert>
        ) : (
          <DialogContentText id="delete-confirmation-description">
            Are you sure you want to delete the task: <span style={{ fontWeight: 'bold' }}>{taskName}</span>?
          </DialogContentText>
        )}
        
        <DialogContentText sx={{ mt: 1 }}>
          This action cannot be undone. All related data will be permanently deleted.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          {hasChildren ? 'Close' : 'Cancel'}
        </Button>
        {!hasChildren && (
          <Button 
            onClick={handleConfirm} 
            color="error" 
            variant="contained" 
            disabled={loading}
            sx={{ minWidth: '100px' }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
