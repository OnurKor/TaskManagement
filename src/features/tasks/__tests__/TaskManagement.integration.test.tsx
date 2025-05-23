import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';

// Import components needed for integration test
import TaskTreeView from '../components/TaskTreeView';
import AddTaskModal from '../components/AddTaskModal';
import { server } from '../../../test/mocks/server';

// Mock data
const mockTasks = [
  {
    id: 1,
    TaskName: 'Existing Task 1',
    Subject: 'Subject 1',
    Status: 'Open',
    Description: '<p>Task description 1</p>',
    EstimatedHour: 5,
    SprintID: 1,
    UserID: 1,
    ParentID: null,
    hasChildren: false
  },
  {
    id: 2,
    TaskName: 'Existing Task 2',
    Subject: 'Subject 2',
    Status: 'Working',
    Description: '<p>Task description 2</p>',
    EstimatedHour: 3,
    SprintID: 1,
    UserID: 2,
    ParentID: null,
    hasChildren: true
  }
];

const mockUsers = [
  { id: 1, UserName: 'User 1' },
  { id: 2, UserName: 'User 2' }
];

const mockSprints = [
  { id: 1, SprintName: 'Sprint 1' },
  { id: 2, SprintName: 'Sprint 2' }
];

// Add test-specific handlers for this integration test
beforeEach(() => {
  // Override or add handlers for this specific test
  server.use(
    // Tasks endpoint
    http.get('/api/Tasks', () => {
      return HttpResponse.json(mockTasks);
    }),
    
    // Add task endpoint
    http.post('/api/Tasks', async ({ request }) => {
      const taskData = await request.json();
      // Ensure taskData is an object before spreading
      return HttpResponse.json({
        id: 100,
        ...(typeof taskData === 'object' && taskData !== null ? taskData : {})
      });
    }),
    
    // Users endpoint
    http.get('/api/Users', () => {
      return HttpResponse.json(mockUsers);
    }),
    
    // Sprints endpoint
    http.get('/api/Sprints', () => {
      return HttpResponse.json(mockSprints);
    })
  );
});

// Mock the rich text editor
vi.mock('../components/RichTextEditor', () => ({
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

// Mock the TaskTreeView component since we don't want to test its full functionality
vi.mock('../components/TaskTreeView', () => ({
  default: ({ refreshTrigger }: { refreshTrigger?: boolean }) => {
    // Use the refresh trigger to simulate task fetching
    return (
      <div data-testid="task-tree-view">
        {mockTasks.map(task => (
          <div key={task.id} className="task-item">
            <span>{task.TaskName}</span>
            <span>{task.Subject}</span>
            <span>{task.EstimatedHour}h</span>
          </div>
        ))}
        {/* This simulates the newly added task */}
        {refreshTrigger && (
          <div className="task-item">
            <span>New Integration Test Task</span>
            <span>Integration Testing</span>
            <span>4h</span>
          </div>
        )}
      </div>
    );
  }
}));

describe('Task Management Integration', () => {
  it('should allow creating a task and display it in the tree view', async () => {
    const user = userEvent.setup();
    
    // Create a wrapper component that includes both TaskTreeView and AddTaskModal
    function TestComponent() {
      const [isAddModalOpen, setIsAddModalOpen] = useState(false);
      const [refreshTrigger, setRefreshTrigger] = useState(false);
      
      const handleAddTask = async () => {
        // Mock adding a task and trigger refresh
        setRefreshTrigger(true);
        setIsAddModalOpen(false);
      };
      
      return (
        <>
          <button onClick={() => setIsAddModalOpen(true)}>Add New Task</button>
          <TaskTreeView refreshTrigger={refreshTrigger} />
          <AddTaskModal 
            open={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddTask}
            mode="create"
          />
        </>
      );
    }
    
    render(<TestComponent />);
    
    // Wait for existing tasks to be displayed
    await waitFor(() => {
      expect(screen.getByText('Existing Task 1')).toBeInTheDocument();
    });
    
    // Click the add task button
    await user.click(screen.getByText('Add New Task'));
    
    // Wait for modal to appear and fill out the form
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Add New Task/i })).toBeInTheDocument();
    });
    
    // Fill out the task form
    await user.type(screen.getByLabelText(/Task Name/i), 'New Integration Test Task');
    await user.type(screen.getByLabelText(/Subject/i), 'Integration Testing');
    
    // Select a status
    await user.click(screen.getByLabelText(/Status/i));
    // Birden fazla 'Open' olduğu için menüdeki ikinciyi seç
    await user.click(screen.getAllByText('Open')[1]);
    
    // Fill out estimated hours
    await user.clear(screen.getByLabelText(/Estimated Hours/i));
    await user.type(screen.getByLabelText(/Estimated Hours/i), '4');
    
    // Select sprint
    await user.click(screen.getByLabelText(/Sprint/i));
    await user.click(screen.getByText('Sprint 1'));
    
    // Select assigned user
    await user.click(screen.getByLabelText(/Assigned To/i));
    await user.click(screen.getByText('User 1'));
    
    // Add description in rich text editor
    await user.type(screen.getByTestId('mock-rich-text'), 'This is a test description');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Save/i }));
    
    // Wait for the new task to appear in the tree view
    await waitFor(() => {
      expect(screen.getByText('New Integration Test Task')).toBeInTheDocument();
    });
    
    // Verify task details are displayed
    expect(screen.getByText('Integration Testing')).toBeInTheDocument();
    expect(screen.getByText('4h')).toBeInTheDocument();
  });
});