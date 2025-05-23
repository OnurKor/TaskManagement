import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import AddTaskModal from '../AddTaskModal';
import { useTaskService } from '../../services/taskService';

// Mock the task service
vi.mock('../../services/taskService', () => ({
  useTaskService: vi.fn()
}));

// Mock RichTextEditor component since it's complex and not the focus of these tests
vi.mock('../RichTextEditor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <div data-testid="rich-text-editor">
      <textarea 
        data-testid="mock-rich-text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  )
}));

describe('AddTaskModal', () => {
  const mockUsers = [
    { id: 1, UserName: 'User 1' },
    { id: 2, UserName: 'User 2' }
  ];

  const mockSprints = [
    { id: 1, SprintName: 'Sprint 1' },
    { id: 2, SprintName: 'Sprint 2' }
  ];

  const mockFetchUsers = vi.fn().mockResolvedValue(mockUsers);
  const mockFetchSprints = vi.fn().mockResolvedValue(mockSprints);

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onAdd: vi.fn().mockResolvedValue(undefined),
    mode: "create" as const
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useTaskService as any).mockReturnValue({
      fetchUsers: mockFetchUsers,
      fetchSprints: mockFetchSprints,
      loading: false,
      error: null
    });
  });

  it('renders correctly in create mode', async () => {
    render(<AddTaskModal {...defaultProps} />);

    // Check modal title
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    
    // Check form fields
    expect(screen.getByLabelText(/Task Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estimated Hours/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-rich-text')).toBeInTheDocument();
    
    // Wait for users and sprints to load
    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
      expect(mockFetchSprints).toHaveBeenCalled();
    });
  });

  it('renders correctly in update mode with taskToUpdate', async () => {
    const taskToUpdate = {
      id: 1,
      TaskName: 'Existing Task',
      Subject: 'Bug Fix',
      Status: 'Working' as const,
      Description: '<p>Fix this bug</p>',
      EstimatedHour: 5,
      SprintID: 1,
      UserID: 2,
      ParentID: null
    };

    render(
      <AddTaskModal
        {...defaultProps}
        mode="update"
        taskToUpdate={taskToUpdate}
        onUpdate={vi.fn().mockResolvedValue(undefined)}
      />
    );

    // Check modal title
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    
    // Check form fields have been populated
    await waitFor(() => {
      expect(screen.getByLabelText(/Task Name/i)).toHaveValue('Existing Task');
      expect(screen.getByLabelText(/Subject/i)).toHaveValue('Bug Fix');
      expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue('5');
    });
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(<AddTaskModal {...defaultProps} />);

    // Try to submit with empty form
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Task name is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
    });
    
    // Make sure onAdd was not called
    expect(defaultProps.onAdd).not.toHaveBeenCalled();
  });

  it('submits the form with valid data in create mode', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    
    render(<AddTaskModal {...defaultProps} onAdd={onAdd} />);

    // Fill out form
    await user.type(screen.getByLabelText(/Task Name/i), 'New Test Task');
    await user.type(screen.getByLabelText(/Subject/i), 'Unit Testing');
    await user.type(screen.getByLabelText(/Estimated Hours/i), '3');
    
    // Using the mock RichTextEditor
    await user.type(screen.getByTestId('mock-rich-text'), '<p>Task description</p>');
    
    // Wait for users and sprints to load and select them
    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
      expect(mockFetchSprints).toHaveBeenCalled();
    });

    // Status is already selected by default
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Verify form submission
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
        TaskName: 'New Test Task',
        Subject: 'Unit Testing',
        Status: 'Open', // Default value
        EstimatedHour: 3,
        Description: '<p>Task description</p>'
      }));
    });
  });

  it('submits the form with valid data in update mode', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    
    const taskToUpdate = {
      id: 1,
      TaskName: 'Existing Task',
      Subject: 'Bug Fix',
      Status: 'Working' as const,
      Description: '<p>Fix this bug</p>',
      EstimatedHour: 5,
      SprintID: 1,
      UserID: 2,
      ParentID: null
    };

    render(
      <AddTaskModal
        {...defaultProps}
        mode="update"
        taskToUpdate={taskToUpdate}
        onUpdate={onUpdate}
      />
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Task Name/i)).toHaveValue('Existing Task');
    });

    // Modify task name
    await user.clear(screen.getByLabelText(/Task Name/i));
    await user.type(screen.getByLabelText(/Task Name/i), 'Updated Task Name');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update/i }));
    
    // Verify form submission
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        1, // taskId
        expect.objectContaining({
          TaskName: 'Updated Task Name',
          Subject: 'Bug Fix',
          Status: 'Working',
        })
      );
    });
  });

  it('closes the modal when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddTaskModal {...defaultProps} />);

    // Click the cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Verify onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles form submission errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to add task';
    const onAddError = vi.fn().mockRejectedValue(new Error(errorMessage));
    
    render(<AddTaskModal {...defaultProps} onAdd={onAddError} />);

    // Fill out form with valid data
    await user.type(screen.getByLabelText(/Task Name/i), 'New Test Task');
    await user.type(screen.getByLabelText(/Subject/i), 'Unit Testing');
    await user.type(screen.getByLabelText(/Estimated Hours/i), '3');
    
    // Submit form that will fail
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(onAddError).toHaveBeenCalled();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
