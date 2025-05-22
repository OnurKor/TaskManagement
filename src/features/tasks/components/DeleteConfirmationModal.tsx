import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface DeleteConfirmationProps {
  open: boolean;
  taskName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({
  open,
  taskName,
  onClose,
  onConfirm,
  loading
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
        <DialogContentText id="delete-confirmation-description">
          Are you sure you want to delete the task: <span style={{ fontWeight: 'bold' }}>{taskName}</span>?
        </DialogContentText>
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
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained" 
          disabled={loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
