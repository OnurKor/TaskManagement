import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const defaultProps = {
    open: true,
    taskName: 'Test Task',
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
    loading: false,
    hasChildren: false
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly with basic props', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);

    // Check that the modal displays when open is true
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('shows warning about children when hasChildren is true', () => {
    render(<DeleteConfirmationModal {...defaultProps} hasChildren={true} />);

    // Check for the warning message about child tasks
    expect(screen.getByText(/This task has child tasks/i)).toBeInTheDocument();
  });

  it('does not show warning about children when hasChildren is false', () => {
    render(<DeleteConfirmationModal {...defaultProps} hasChildren={false} />);

    // Check that the warning message is not present
    expect(screen.queryByText(/This task has child tasks/i)).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmationModal {...defaultProps} />);

    // Click the cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Verify onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmationModal {...defaultProps} />);

    // Click the delete button
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    // Verify onConfirm was called
    expect(defaultProps.onConfirm).toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('disables buttons and shows loading indicator when loading is true', () => {
    render(<DeleteConfirmationModal {...defaultProps} loading={true} />);

    // Check that buttons are disabled
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
    
    // Check for loading indicator (CircularProgress)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('closes the modal after confirmation is complete', async () => {
    const onConfirmMock = vi.fn().mockResolvedValue(undefined);
    const onCloseMock = vi.fn();
    
    render(
      <DeleteConfirmationModal
        open={true}
        taskName="Test Task"
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        loading={false}
      />
    );

    // Click the delete button
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    // Wait for the confirmation function to complete
    await waitFor(() => {
      expect(onConfirmMock).toHaveBeenCalled();
    });
    
    // Since onConfirm is expected to handle closing, onClose should not be called directly
    // as it would be the component using DeleteConfirmationModal that would call onClose
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
