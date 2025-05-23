// Mock axiosConfig
import axios from 'axios';
import { vi } from 'vitest';

// Create a mock with the necessary methods and properties
const api = axios.create();

// Add interceptors mock
api.interceptors = {
  request: {
    use: vi.fn(),
    eject: vi.fn(),
    clear: vi.fn()
  },
  response: {
    use: vi.fn(),
    eject: vi.fn(),
    clear: vi.fn()
  }
};

export default api;
