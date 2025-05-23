import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSprintService } from '../sprintService';


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

describe('sprintService', () => {
  let sprintService: ReturnType<typeof useSprintService>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Clear all previous mock calls
    mockRequest.mockClear();
    
    // Setup the sprintService
    sprintService = useSprintService();
  });

  describe('fetchSprints', () => {
    it('should fetch sprints successfully', async () => {
      // Setup
      const mockSprints = [{ id: 1, SprintName: 'Sprint 1' }];
      mockRequest.mockResolvedValueOnce(mockSprints);
      
      // Execute
      const result = await sprintService.fetchSprints();
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Sprints', { 
        useAuth: true, 
        headers: {
          'Prefer': 'count=exact'
        }
      });
      expect(result).toEqual(mockSprints);
    });
    
    it('should handle fetch errors', async () => {
      // Setup
      const mockError = new Error('Network error');
      mockRequest.mockRejectedValueOnce(mockError);
      
      // Execute and verify
      await expect(sprintService.fetchSprints()).rejects.toThrow('Network error');
      expect(mockRequest).toHaveBeenCalledWith('Sprints', { 
        useAuth: true, 
        headers: {
          'Prefer': 'count=exact'
        }
      });
    });
  });

  describe('addSprint', () => {
    it('should add sprint successfully', async () => {
      // Setup
      const sprintName = 'New Sprint';
      const mockResponse = { id: 1, SprintName: sprintName };
      mockRequest.mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await sprintService.addSprint(sprintName);
      
      // Verify
      expect(mockRequest).toHaveBeenCalledWith('Sprints', {
        useAuth: true,
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: {
          SprintName: sprintName
        }
      });
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle add errors', async () => {
      // Setup
      const sprintName = 'New Sprint';
      const mockError = new Error('Create error');
      mockRequest.mockRejectedValueOnce(mockError);
      
      // Execute and verify
      await expect(sprintService.addSprint(sprintName)).rejects.toThrow('Create error');
      expect(mockRequest).toHaveBeenCalledWith('Sprints', {
        useAuth: true,
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: {
          SprintName: sprintName
        }
      });
    });
  });
});
