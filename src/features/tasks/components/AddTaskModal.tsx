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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTaskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import RichTextEditor from './RichTextEditor';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (task: Task) => Promise<void>;
  onUpdate?: (taskId: number, task: Task) => Promise<void>;
  taskToUpdate?: Task | null;
  mode?: 'create' | 'update';
}

// Validation schema
const TaskSchema = Yup.object().shape({
  TaskName: Yup.string()
    .required('Task name is required')
    .min(3, 'Task name must be at least 3 characters'),
  Subject: Yup.string()
    .required('Subject is required'),
  Status: Yup.string()
    .required('Status must be selected')
    .oneOf(['Open', 'Working', 'Completed'], 'Please select a valid status'),
  Description: Yup.string(), // Rich text description (optional)
  EstimatedHour: Yup.number()
    .required('Estimated hours is required')
    .positive('Estimated hours must be positive'),
  SprintID: Yup.number()
    .required('Sprint must be selected'),
  UserID: Yup.number()
    .required('User must be selected'),
  ParentID: Yup.number().nullable()
});

const AddTaskModal = ({ 
  open, 
  onClose, 
  onAdd, 
  onUpdate, 
  taskToUpdate = null, 
  mode = 'create' 
}: AddTaskModalProps) => {
  const [animate, setAnimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    fetchUsers, 
    fetchSprints, 
    fetchTasks, 
    addTask,
    updateTask, 
    canBeParent, 
    hasMaxChildren
  } = useTaskService();

  // Animation timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      timer = setTimeout(() => setAnimate(true), 100);
      loadData();
    } else {
      setAnimate(false);
    }
    return () => clearTimeout(timer);
  }, [open]);

  // Load all necessary data
  const loadData = async () => {
    try {
      // Fetch users
      const usersResponse = await fetchUsers();
      if (usersResponse && usersResponse.data) {
        setUsers(usersResponse.data);
      }
      
      // Fetch sprints
      const sprintsResponse = await fetchSprints();
      if (sprintsResponse && sprintsResponse.data) {
        setSprints(sprintsResponse.data);
      }
      
      // Fetch tasks for parent selection
      const tasksResponse = await fetchTasks();
      if (tasksResponse && tasksResponse.data) {
        // Filter tasks that can be parents for selection
        const allTasks = tasksResponse.data;
        const availableParents = allTasks.filter((task: Task) => 
          canBeParent(task, allTasks) && !hasMaxChildren(task.id as number, allTasks)
        );
        setTasks(availableParents);
      }
    } catch (error) {
      console.error('Data loading error:', error);
    }
  };

  const handleSubmit = async (values: Task) => {
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await addTask(values);
        
        // If parent component provided an onAdd callback, call it
        if (onAdd) {
          await onAdd(values);
        }
      } else if (mode === 'update' && taskToUpdate?.id) {
        await updateTask(taskToUpdate.id, values);
        
        // If parent component provided an onUpdate callback, call it
        if (onUpdate) {
          await onUpdate(taskToUpdate.id, values);
        }
      }
      
      handleClose();
    } catch (error) {
      console.error(`Task ${mode === 'create' ? 'adding' : 'updating'} error:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Use taskToUpdate values if in update mode, otherwise use default values
  const initialValues: Task = taskToUpdate ? {
    ...taskToUpdate,
    // Ensure proper typing of nullable fields
    ParentID: taskToUpdate.ParentID ?? null,
    Description: taskToUpdate.Description || ''
  } : {
    TaskName: '',
    Subject: '',
    Status: 'Open',
    Description: '',
    EstimatedHour: 0,
    SprintID: 0,
    UserID: 0,
    ParentID: null
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : handleClose}
      maxWidth="lg" /* Changed from md to lg for more space for the rich text editor */
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: isMobile ? 1 : 2,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          height: isMobile ? 'auto' : 'auto',
          maxHeight: isMobile ? '90vh' : '80vh'
        }
      }}
      TransitionProps={{
        onExited: () => {
          setAnimate(false);
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
          {mode === 'create' ? 'Add New Task' : 'Update Task'}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={isSubmitting ? undefined : handleClose}
          disabled={isSubmitting}
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
          <Formik
            initialValues={initialValues}
            validationSchema={TaskSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, handleChange, setFieldValue }) => (
              <Form>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  mb: 2
                }}>
                  {/* TaskName */}
                  <Box>
                    <TextField
                      autoFocus
                      fullWidth
                      id="TaskName"
                      name="TaskName"
                      label="Task Name"
                      value={values.TaskName}
                      onChange={handleChange}
                      error={touched.TaskName && Boolean(errors.TaskName)}
                      helperText={touched.TaskName && errors.TaskName}
                      disabled={isSubmitting}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2
                        }
                      }}
                      margin="normal"
                    />
                  </Box>
                  
                  {/* Subject */}
                  <Box>
                    <TextField
                      fullWidth
                      id="Subject"
                      name="Subject"
                      label="Subject"
                      value={values.Subject}
                      onChange={handleChange}
                      error={touched.Subject && Boolean(errors.Subject)}
                      helperText={touched.Subject && errors.Subject}
                      disabled={isSubmitting}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2
                        }
                      }}
                      margin="normal"
                    />
                  </Box>
                  
                  {/* Status */}
                  <Box>
                    <FormControl 
                      fullWidth 
                      error={touched.Status && Boolean(errors.Status)}
                      margin="normal"
                    >
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="Status"
                        name="Status"
                        value={values.Status}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        label="Status"
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="Working">Working</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                      {touched.Status && errors.Status && (
                        <FormHelperText>{errors.Status as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  
                  {/* EstimatedHour */}
                  <Box>
                    <TextField
                      fullWidth
                      id="EstimatedHour"
                      name="EstimatedHour"
                      label="Estimated Hours"
                      type="number"
                      value={values.EstimatedHour}
                      onChange={handleChange}
                      error={touched.EstimatedHour && Boolean(errors.EstimatedHour)}
                      helperText={touched.EstimatedHour && errors.EstimatedHour}
                      disabled={isSubmitting}
                      inputProps={{ min: 0, step: 0.5 }}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2
                        }
                      }}
                      margin="normal"
                    />
                  </Box>
                  
                  {/* SprintID */}
                  <Box>
                    <FormControl 
                      fullWidth 
                      error={touched.SprintID && Boolean(errors.SprintID)}
                      margin="normal"
                    >
                      <InputLabel id="sprint-label">Sprint</InputLabel>
                      <Select
                        labelId="sprint-label"
                        id="SprintID"
                        name="SprintID"
                        value={values.SprintID}
                        onChange={handleChange}
                        disabled={isSubmitting || sprints.length === 0}
                        label="Sprint"
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        {sprints.length === 0 ? (
                          <MenuItem disabled value="">
                            Loading or no sprints found
                          </MenuItem>
                        ) : (
                          sprints.map((sprint) => (
                            <MenuItem key={sprint.id} value={sprint.id}>
                              {sprint.SprintName}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {touched.SprintID && errors.SprintID && (
                        <FormHelperText>{errors.SprintID as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  
                  {/* ParentID - Optional */}
                  <Box>
                    <FormControl 
                      fullWidth 
                      error={touched.ParentID && Boolean(errors.ParentID)}
                      margin="normal"
                    >
                      <InputLabel id="parent-label">Parent Task (Optional)</InputLabel>
                      <Select
                        labelId="parent-label"
                        id="ParentID"
                        name="ParentID"
                        value={values.ParentID ?? ''}
                        onChange={(e) => {
                          // Type assertion to avoid type error
                          const selectedValue = e.target.value as string | number;
                          setFieldValue('ParentID', selectedValue === '' ? null : Number(selectedValue));
                        }}
                        disabled={isSubmitting || tasks.length === 0}
                        label="Parent Task (Optional)"
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="">
                          <em>No parent task</em>
                        </MenuItem>
                        {tasks.length === 0 ? (
                          <MenuItem disabled value="no-parent-available">
                            <em>No available parent tasks</em>
                          </MenuItem>
                        ) : (
                          tasks.map((task) => (
                            <MenuItem key={task.id} value={task.id}>
                              {task.TaskName}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      <FormHelperText>
                        {touched.ParentID && errors.ParentID 
                          ? errors.ParentID as string 
                          : 'Maximum of 2-level hierarchy is allowed'}
                      </FormHelperText>
                    </FormControl>
                  </Box>
                  
                  {/* UserID - Single Selection */}
                  <Box>
                    <FormControl 
                      fullWidth 
                      error={touched.UserID && Boolean(errors.UserID)}
                      margin="normal"
                    >
                      <InputLabel id="users-label">User</InputLabel>
                      <Select
                        labelId="users-label"
                        id="UserID"
                        name="UserID"
                        value={values.UserID}
                        onChange={(e) => {
                          const selectedUserId = e.target.value;
                          setFieldValue('UserID', selectedUserId);
                        }}
                        disabled={isSubmitting || users.length === 0}
                        label="User"
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        {users.length === 0 ? (
                          <MenuItem disabled value="">
                            Loading or no users found
                          </MenuItem>
                        ) : (
                          users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.UserName}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {touched.UserID && errors.UserID && (
                        <FormHelperText>{errors.UserID as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Description - Rich Text Editor */}
                <Box sx={{ 
                  mt: 3, 
                  mb: 2,
                  gridColumn: { xs: '1', md: '1 / span 2' } // Span across both columns on desktop
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center' }}
                    color="text.primary"
                  >
                    <DescriptionIcon sx={{ mr: 1, fontSize: 18 }} />
                    Description (Optional)
                  </Typography>
                  <RichTextEditor 
                    content={values.Description || ''}
                    onChange={(content) => setFieldValue('Description', content)}
                    disabled={isSubmitting}
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontStyle: 'italic', 
                      fontSize: '0.85rem', 
                      opacity: 0.8 
                    }}
                  >
                    After the task is created, assigned users will be able to track their tasks
                  </Typography>
                </Box>
              
                {/* Buttons */}
                <DialogActions sx={{ px: 0, pb: 0, pt: 3 }}>
                  <Button 
                    type="button"
                    onClick={handleClose} 
                    disabled={isSubmitting}
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
                    type="submit"
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? 
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
                      background: !isSubmitting ? 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)' : undefined,
                    }}
                  >
                    {isSubmitting 
                      ? (mode === 'create' ? 'Adding...' : 'Updating...') 
                      : (mode === 'create' ? 'Create' : 'Update')}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Fade>
    </Dialog>
  );
};

export default AddTaskModal;
