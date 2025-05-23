import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskService } from '../taskService';

// Create a mock for the request function
const mockRequest = vi.fn();

// Mock the useSupabaseApi hook
vi.mock('../../../../shared/hooks/useSupaBaseApi', () => ({
  useSupabaseApi: () => ({
    request: mockRequest,
    data: [],
    loading: false,
    error: null
  })
}));

describe('taskService', () => {
  let taskService: ReturnType<typeof useTaskService>;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Clear all previous mock calls
    mockRequest.mockClear();
    
    // Setup the taskService
    taskService = useTaskService();
  });

  describe('fetchTasks', () => {
    it('should call request with the correct parameters', async () => {
      // Setup
      mockRequest.mockResolvedValueOnce([{ id: 1, TaskName: 'Test Task' }]);
      
      // Execute
      const result = await taskService.fetchTasks();
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Tasks', { 
        useAuth: true, 
        headers: {
          'Prefer': 'count=exact'
        }
      });
      expect(result).toEqual([{ id: 1, TaskName: 'Test Task' }]);
    });
  });

  describe('addTask', () => {
    it('should format and send the task data correctly', async () => {
      // Setup
      const newTask = {
        TaskName: '  New Task  ',
        Subject: '  Test Subject  ',
        Status: 'Open' as const,
        Description: '<p>Test description</p>',
        EstimatedHour: 5,
        SprintID: 3,
        UserID: 2,
        ParentID: 1
      };
      
      const formattedTask = {
        TaskName: 'New Task',
        Subject: 'Test Subject',
        Status: 'Open' as const,
        Description: '<p>Test description</p>',
        EstimatedHour: 5,
        SprintID: 3,
        UserID: 2,
        ParentID: 1
      };
      
      mockRequest.mockResolvedValueOnce({ id: 10, ...formattedTask });
      
      // Execute
      const result = await taskService.addTask(newTask);
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Tasks', {
        useAuth: true,
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: formattedTask
      });
      expect(result).toEqual({ id: 10, ...formattedTask });
    });

    it('should handle null values correctly', async () => {
      // Setup
      const newTask = {
        TaskName: 'New Task',
        Subject: 'Test Subject',
        Status: 'Open' as const,
        EstimatedHour: 5,
        SprintID: 3,
        UserID: 2,
        ParentID: null,
        Description: undefined
      };
      
      const formattedTask = {
        TaskName: 'New Task',
        Subject: 'Test Subject',
        Status: 'Open' as const,
        Description: null,
        EstimatedHour: 5,
        SprintID: 3,
        UserID: 2,
        ParentID: null
      };
      
      mockRequest.mockResolvedValueOnce({ id: 10, ...formattedTask });
      
      // Execute
      const result = await taskService.addTask(newTask);
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Tasks', {
        useAuth: true,
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: formattedTask
      });
      expect(result).toEqual({ id: 10, ...formattedTask });
    });
  });

  describe('updateTask', () => {
    it('should format and send the updated task data correctly', async () => {
      // Setup
      const taskId = 5;
      const taskToUpdate = {
        TaskName: '  Updated Task  ',
        Subject: '  Updated Subject  ',
        Status: 'Working' as const,
        Description: '<p>Updated description</p>',
        EstimatedHour: 8,
        SprintID: 4,
        UserID: 2,
        ParentID: 3
      };
      
      const formattedTask = {
        TaskName: 'Updated Task',
        Subject: 'Updated Subject',
        Status: 'Working' as const,
        Description: '<p>Updated description</p>',
        EstimatedHour: 8,
        SprintID: 4,
        UserID: 2,
        ParentID: 3
      };
      
      mockRequest.mockResolvedValueOnce({ id: taskId, ...formattedTask });
      
      // Execute
      const result = await taskService.updateTask(taskId, taskToUpdate);
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith(`Tasks?id=eq.${taskId}`, {
        useAuth: true,
        method: 'PATCH',
        headers: {
          'Prefer': 'return=representation'
        },
        body: formattedTask
      });
      expect(result).toEqual({ id: taskId, ...formattedTask });
    });
  });

  describe('deleteTask', () => {
    it('should call request with the correct parameters for deletion', async () => {
      // Setup
      const taskId = 5;
      mockRequest.mockResolvedValueOnce({ success: true });
      
      // Execute
      const result = await taskService.deleteTask(taskId);
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith(`Tasks?id=eq.${taskId}`, {
        useAuth: true,
        method: 'DELETE',
        headers: {
          'Prefer': 'return=representation'
        }
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('fetchUsers and fetchSprints', () => {
    it('should call request with correct parameters for fetchUsers', async () => {
      // Setup
      mockRequest.mockResolvedValueOnce([{ id: 1, name: 'User 1' }]);
      
      // Execute
      const result = await taskService.fetchUsers();
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Users', { useAuth: true });
      expect(result).toEqual([{ id: 1, name: 'User 1' }]);
    });

    it('should call request with correct parameters for fetchSprints', async () => {
      // Setup
      mockRequest.mockResolvedValueOnce([{ id: 1, name: 'Sprint 1' }]);
      
      // Execute
      const result = await taskService.fetchSprints();
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Sprints', { useAuth: true });
      expect(result).toEqual([{ id: 1, name: 'Sprint 1' }]);
    });
  });
});
