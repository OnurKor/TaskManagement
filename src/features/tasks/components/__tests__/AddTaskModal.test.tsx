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
    mockFetchUsers.mockResolvedValue(mockUsers);
    mockFetchSprints.mockResolvedValue(mockSprints);
    (useTaskService as any).mockReturnValue({
      fetchUsers: mockFetchUsers,
      fetchSprints: mockFetchSprints,
      fetchTasks: vi.fn().mockResolvedValue([]),
      addTask: vi.fn().mockResolvedValue(undefined),
      updateTask: vi.fn().mockResolvedValue(undefined),
      loading: false,
      error: null
    });
  });

  it('renders correctly in create mode', async () => {
    render(<AddTaskModal {...defaultProps} />);

    // Check modal title
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    
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

    // Wait for users and sprints to load and select options to be rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/Sprint/i).querySelectorAll('option').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Assigned To/i).querySelectorAll('option').length).toBeGreaterThan(0);
    });

    // Check modal title
    expect(screen.getByText('Update Task')).toBeInTheDocument();
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

    // Butonun render olmasını bekle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    // Sprint ve User select options'larının DOM'da olduğundan emin ol
    await waitFor(() => {
      expect(screen.getByLabelText(/Sprint/i).querySelectorAll('option').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Assigned To/i).querySelectorAll('option').length).toBeGreaterThan(0);
    });

    // Try to submit with empty form
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    // Check for validation errors (hem helperText hem de alert için)
    await waitFor(() => {
      expect(screen.queryByText('Task name is required') || screen.queryByText(/Task name is required/i)).toBeTruthy();
      expect(screen.queryByText('Subject is required') || screen.queryByText(/Subject is required/i)).toBeTruthy();
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

    // Wait for users and sprints to load and select options to be rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/Sprint/i).querySelectorAll('option').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Assigned To/i).querySelectorAll('option').length).toBeGreaterThan(0);
    });
    // Select sprint
    await user.click(screen.getByLabelText(/Sprint/i));
    await user.click(screen.getByText('Sprint 1'));
    // Select assigned user
    await user.click(screen.getByLabelText(/Assigned To/i));
    await user.click(screen.getByText('User 1'));

    // Butonun render olmasını bekle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create' }));
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
    await user.click(screen.getByRole('button', { name: 'Update' }));
    
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

    // Cancel butonunun label'ını DOM'dan kontrol et ve birebir kullan
    const cancelButton = screen.getByRole('button', { name: /cancel/i }) || screen.getByText(/cancel/i);
    await user.click(cancelButton);
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
    // Wait for users and sprints to load and select options to be rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/Sprint/i).querySelectorAll('option').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/Assigned To/i).querySelectorAll('option').length).toBeGreaterThan(0);
    });
    // Select sprint
    await user.click(screen.getByLabelText(/Sprint/i));
    await user.click(screen.getByText('Sprint 1'));
    // Select assigned user
    await user.click(screen.getByLabelText(/Assigned To/i));
    await user.click(screen.getByText('User 1'));
    // Submit form that will fail
    await user.click(screen.getByRole('button', { name: 'Create' }));
    // Verify error is displayed
    await waitFor(() => {
      expect(onAddError).toHaveBeenCalled();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
