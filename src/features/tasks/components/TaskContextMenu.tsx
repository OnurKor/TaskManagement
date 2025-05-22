import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface TaskContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  open,
  anchorPosition,
  onClose,
  onDelete,
  onUpdate
}) => {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
    >
      <MenuItem onClick={() => {
        onUpdate();
        onClose();
      }}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Update</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => {
        onDelete();
        onClose();
      }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default TaskContextMenu;
