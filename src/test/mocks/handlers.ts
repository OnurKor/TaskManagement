import { http, HttpResponse } from 'msw';

// Mock data
export const mockTasks = [
  { id: '1', title: 'Task 1', description: 'Description 1', status: 'TODO' },
  { id: '2', title: 'Task 2', description: 'Description 2', status: 'IN_PROGRESS' },
  { id: '3', title: 'Task 3', description: 'Description 3', status: 'DONE' },
];

export const mockSprints = [
  { id: '1', name: 'Sprint 1', startDate: '2023-01-01', endDate: '2023-01-14' },
  { id: '2', name: 'Sprint 2', startDate: '2023-01-15', endDate: '2023-01-28' },
];

// Define handlers for mock API endpoints
export const handlers = [
  // Task handlers
  http.get('/api/tasks', () => {
    return HttpResponse.json(mockTasks, { status: 200 });
  }),
  
  http.post('/api/tasks', async ({ request }) => {
    const newTask = await request.json();
    const taskObj = typeof newTask === 'object' && newTask !== null ? newTask : {};
    return HttpResponse.json({ id: 'new-task-id', ...taskObj }, { status: 201 });
  }),
  
  http.get('/api/tasks/:id', ({ params }) => {
    const id = params.id;
    const task = mockTasks.find(task => task.id === id);
    
    if (task) {
      return HttpResponse.json(task, { status: 200 });
    }
    
    return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
  }),
  
  http.put('/api/tasks/:id', async ({ params, request }) => {
    const id = params.id;
    const updatedTask = await request.json();
    const updatedTaskObj = typeof updatedTask === 'object' && updatedTask !== null ? updatedTask : {};
    
    return HttpResponse.json({ id, ...updatedTaskObj }, { status: 200 });
  }),
  
  http.delete('/api/tasks/:id', () => {
    return HttpResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  }),

  // Sprint handlers
  http.get('/api/sprints', () => {
    return HttpResponse.json(mockSprints, { status: 200 });
  }),
  
  http.post('/api/sprints', async ({ request }) => {
    const newSprint = await request.json();
    const sprintObj = typeof newSprint === 'object' && newSprint !== null ? newSprint : {};
    return HttpResponse.json({ id: 'new-sprint-id', ...sprintObj }, { status: 201 });
  }),
  
  // Auth handlers
  http.post('/api/auth/login', async () => {
    return HttpResponse.json({
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      token: 'fake-jwt-token'
    }, { status: 200 });
  }),
  
  http.post('/api/auth/register', async () => {
    return HttpResponse.json({
      user: { id: 'new-user-id', name: 'New User', email: 'new@example.com' },
      token: 'fake-jwt-token'
    }, { status: 201 });
  }),
];
