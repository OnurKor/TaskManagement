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
  FormHelperText,
  Alert,
  Tooltip
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
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
    .min(3, 'Task name must be at least 3 characters')
    .max(100, 'Task name cannot exceed 100 characters'),
  Subject: Yup.string()
    .required('Subject is required')
    .max(150, 'Subject cannot exceed 150 characters'),
  Status: Yup.string()
    .required('Status must be selected')
    .oneOf(['Open', 'Working', 'Completed'], 'Please select a valid status'),
  Description: Yup.string()
    .required('Description is required')
    .test('not-empty-html', 'Description cannot be empty', value => {
      // Check if the rich text editor content is not just empty HTML tags or whitespace
      return !(value === '' || value === '<p></p>' || value === '<p><br></p>' || !value);
    }),
  EstimatedHour: Yup.number()
    .required('Estimated hours is required')
    .min(0.5, 'Estimated hours must be at least 0.5')
    .max(100, 'Estimated hours cannot exceed 100')
    .test('is-decimal', 'Estimated hours can have up to 1 decimal place', value =>
      value === undefined || value === null || /^\d+(\.\d{0,1})?$/.test(value.toString())
    ),
  SprintID: Yup.number()
    .required('Sprint must be selected')
    .positive('Please select a valid sprint'),
  UserID: Yup.number()
    .required('User must be selected')
    .positive('Please select a valid user'),
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

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: Task, { setSubmitting, setErrors }: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate required fields (double-checking in case schema validation fails)
      const requiredFields = ['TaskName', 'Subject', 'Status', 'Description', 'EstimatedHour', 'SprintID', 'UserID'];
      const missingFields = requiredFields.filter(field => 
        !values[field as keyof Task] && values[field as keyof Task] !== 0
      );
      
      if (missingFields.length > 0) {
        const fieldErrors: Record<string, string> = {};
        missingFields.forEach(field => {
          fieldErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
        });
        setErrors(fieldErrors);
        setSubmitError('Please fill in all required fields marked with *');
        return;
      }
      
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
    } catch (error: any) {
      console.error(`Task ${mode === 'create' ? 'adding' : 'updating'} error:`, error);
      setSubmitError(error.message || `Failed to ${mode === 'create' ? 'add' : 'update'} task. Please try again.`);
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
    SprintID: null,
    UserID: null,
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
            validateOnBlur={true}
            validateOnChange={true}
            validateOnMount={false} // Don't validate on first render to avoid showing errors before user input
          >
            {({ 
              errors, 
              touched, 
              values, 
              handleChange, 
              setFieldValue, 
              isValid, 
              handleBlur,
              dirty 
            }) => (
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
                      label={
                        <span>
                          Task Name <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      value={values.TaskName}
                      onChange={handleChange}
                      error={touched.TaskName && Boolean(errors.TaskName)}
                      helperText={
                        (touched.TaskName && errors.TaskName) ? 
                        errors.TaskName : 
                        `${values.TaskName.length}/100 characters`
                      }
                      disabled={isSubmitting}
                      inputProps={{ maxLength: 100 }}
                      placeholder="Enter a concise task name"
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
                      label={
                        <span>
                          Subject <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      value={values.Subject}
                      onChange={handleChange}
                      error={touched.Subject && Boolean(errors.Subject)}
                      helperText={
                        (touched.Subject && errors.Subject) ? 
                        errors.Subject : 
                        `${values.Subject.length}/150 characters`
                      }
                      disabled={isSubmitting}
                      inputProps={{ maxLength: 150 }}
                      placeholder="Enter the subject category for this task"
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
                      <InputLabel id="status-label">Status <span style={{ color: 'red' }}>*</span></InputLabel>
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
                      label={
                        <span>
                          Estimated Hours <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      type="number"
                      value={values.EstimatedHour}
                      onChange={(e) => {
                        // Validate decimal places (only allow up to 1 decimal place)
                        const value = e.target.value;
                        if (!value || /^\d+(\.\d{0,1})?$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      error={touched.EstimatedHour && Boolean(errors.EstimatedHour)}
                      helperText={
                        (touched.EstimatedHour && errors.EstimatedHour) ? 
                        errors.EstimatedHour : 
                        "Enter time in hours (0.5-100)"
                      }
                      disabled={isSubmitting}
                      inputProps={{ 
                        min: 0.5, 
                        max: 100,
                        step: 0.5
                      }}
                      placeholder="Enter estimated hours (e.g., 2.5)"
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
                      <InputLabel id="sprint-label">Sprint <span style={{ color: 'red' }}>*</span></InputLabel>
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
                      <InputLabel id="users-label">User <span style={{ color: 'red' }}>*</span></InputLabel>
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
                  gridColumn: { xs: '1', md: '1 / span 2' }, // Span across both columns on desktop
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    color="text.primary"
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1, fontSize: 18 }} />
                      Description <span style={{ color: 'red', marginLeft: 2 }}>*</span>
                    </span>
                    <Typography 
                      variant="caption" 
                      color={touched.Description && errors.Description ? "error.main" : "text.secondary"}
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {touched.Description && errors.Description ? 'Required field' : 'Provide detailed task description'}
                    </Typography>
                  </Typography>
                  <Box 
                    sx={{ 
                      border: touched.Description && errors.Description 
                        ? '1px solid #d32f2f' 
                        : '1px solid rgba(0, 0, 0, 0.23)', 
                      borderRadius: 1,
                      '&:focus-within': {
                        borderColor: '#1976d2',
                        borderWidth: 2,
                      }
                    }}
                  >
                    <RichTextEditor 
                      content={values.Description || ''}
                      onChange={(content) => {
                        setFieldValue('Description', content);
                        // Force validation on change for Description field
                        setFieldValue('Description', content, true);
                      }}
                      disabled={isSubmitting}
                    />
                  </Box>
                  {touched.Description && errors.Description && (
                    <FormHelperText error sx={{ mt: 0.5 }}>
                      {errors.Description as string}
                    </FormHelperText>
                  )}
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    color={Object.keys(errors).length > 0 ? "error.main" : "text.secondary"} 
                    sx={{ 
                      fontStyle: 'italic', 
                      fontSize: '0.85rem',
                      opacity: 0.9,
                      display: 'flex',
                      alignItems: 'center',
                      '& .required-icon': {
                        color: 'red',
                        marginLeft: 0.5,
                        marginRight: 0.5
                      }
                    }}
                  >
                    <span role="img" aria-label="info" style={{ marginRight: '5px' }}>ℹ️</span>
                    Fields marked with <span className="required-icon">*</span> are required
                  </Typography>
                  
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
                
                {/* Error message */}
                {(submitError || Object.keys(errors).length > 0 && Object.keys(touched).length > 0) && (
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          width: '100%'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {submitError || 'Please correct the following errors:'}
                        </Typography>
                        
                        {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                            {Object.keys(errors).map(fieldName => 
                              touched[fieldName as keyof typeof touched] ? (
                                <li key={fieldName} style={{ fontSize: '0.85rem' }}>
                                  {fieldName.replace(/([A-Z])/g, ' $1').trim()}: {errors[fieldName as keyof typeof errors] as string}
                                </li>
                              ) : null
                            )}
                          </ul>
                        )}
                      </Box>
                    </Alert>
                  </Box>
                )}
              
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
                    disabled={isSubmitting || (!dirty && mode === 'update')}
                    startIcon={isSubmitting ? 
                      <CircularProgress size={16} color="inherit" /> : 
                      mode === 'create' ? <AddCircleOutlineIcon /> : <EditIcon />
                    }
                    sx={{ 
                      textTransform: 'none', 
                      borderRadius: 2,
                      px: { xs: 2, sm: 3 },
                      minWidth: 100,
                      fontWeight: 500,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      background: (!isSubmitting && (dirty || mode === 'create')) 
                        ? 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)' 
                        : undefined,
                      '&.Mui-disabled': {
                        opacity: 0.7,
                      },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(33, 150, 243, 0.3)',
                        transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                    title={
                      isSubmitting ? 'Processing...' : 
                      !dirty && mode === 'update' ? 'No changes have been made' : 
                      !isValid ? 'Please complete all required fields' : 
                      `${mode === 'create' ? 'Create' : 'Update'} the task`
                    }
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
