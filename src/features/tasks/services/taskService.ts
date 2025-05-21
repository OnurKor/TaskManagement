import { useSupabaseApi } from '../../../shared/hooks/useSupaBaseApi';

export interface Task {
  id?: number;
  created_at?: string;
  TaskName: string;
  Subject: string;
  Status: 'Open' | 'Working' | 'Completed';
  EstimatedHour: number;
  SprintID: number;
  UserID: number; // Single user ID as a number
  ParentID?: number | null;
}

export const useTaskService = () => {
  const { request, data: tasks, loading, error } = useSupabaseApi();

  const fetchTasks = async () => {
    return await request('Tasks', { 
      useAuth: true, 
      headers: {
        'Prefer': 'count=exact'
      }
    });
  };

  const addTask = async (task: Task) => {
    // Ensure numeric values are properly formatted
    const formattedTask = {
      TaskName: task.TaskName.trim(),
      Subject: task.Subject.trim(),
      Status: task.Status,
      EstimatedHour: Number(task.EstimatedHour),
      SprintID: Number(task.SprintID),
      UserID: Number(task.UserID),
      ParentID: task.ParentID ? Number(task.ParentID) : null
    };
    
    return await request('Tasks', {
      useAuth: true,
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: formattedTask
    });
  };

  const fetchUsers = async () => {
    return await request('Users', { 
      useAuth: true
    });
  };

  const fetchSprints = async () => {
    return await request('Sprints', { 
      useAuth: true
    });
  };

  return {
    fetchTasks,
    addTask,
    fetchUsers,
    fetchSprints,
    tasks,
    loading,
    error
  };
};
