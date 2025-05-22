import { useSupabaseApi } from '../../../shared/hooks/useSupaBaseApi';

// Enhanced Task interface with hierarchy support
export interface Task {
  id?: number;
  created_at?: string;
  TaskName: string;
  Subject: string;
  Status: 'Open' | 'Working' | 'Completed';
  Description?: string; // Rich text description
  EstimatedHour: number;
  SprintID: number;
  UserID: number; // Single user ID as a number
  ParentID?: number | null;
  hasChildren?: boolean;
}

// Interface for Task with children
export interface TaskWithChildren extends Task {
  children?: TaskWithChildren[];
  totalEstimatedHours?: number;
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
      Description: task.Description || null, // Include rich text description
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

  const deleteTask = async (taskId: number) => {
    return await request(`Tasks?id=eq.${taskId}`, {
      useAuth: true,
      method: 'DELETE',
      headers: {
        'Prefer': 'return=representation'
      }
    });
  };

  const updateTask = async (taskId: number, task: Task) => {
    // Ensure numeric values are properly formatted
    const formattedTask = {
      TaskName: task.TaskName.trim(),
      Subject: task.Subject.trim(),
      Status: task.Status,
      Description: task.Description || null,
      EstimatedHour: Number(task.EstimatedHour),
      SprintID: Number(task.SprintID),
      UserID: Number(task.UserID),
      ParentID: task.ParentID ? Number(task.ParentID) : null
    };
    
    return await request(`Tasks?id=eq.${taskId}`, {
      useAuth: true,
      method: 'PATCH',
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

  /**
   * Validate if a task can be a parent (doesn't have a parent itself)
   * This enforces the requirement that only 2 levels of hierarchy are allowed
   * @param task - The task to check if it can be a parent
   * @param allTasks - All tasks in the system for checking hierarchy rules
   * @returns boolean indicating if the task can be a parent
   */
  const canBeParent = (task: Task, _allTasks: Task[]): boolean => {
    // A task can be a parent only if it doesn't have a parent itself
    // This ensures we maintain the maximum 2-level hierarchy
    return task.ParentID === null || task.ParentID === undefined;
  };

  /**
   * Check if a task already has a specified number of child tasks
   */
  const hasMaxChildren = (taskId: number, allTasks: Task[], maxChildren = 10): boolean => {
    const childCount = allTasks.filter(t => t.ParentID === taskId).length;
    return childCount >= maxChildren;
  };

  /**
   * Organize flat tasks array into hierarchical structure
   */
  const organizeTasks = (taskList: Task[]): TaskWithChildren[] => {
    if (!taskList || taskList.length === 0) {
      return [];
    }

    const taskMap = new Map<number, TaskWithChildren>();
    
    // First pass: Create task objects with empty children arrays
    taskList.forEach(task => {
      const taskId = task.id as number;
      taskMap.set(taskId, { ...task, children: [], hasChildren: false });
    });
    
    const rootTasks: TaskWithChildren[] = [];
    
    // Second pass: Organize tasks into parent-child relationships
    taskMap.forEach(task => {
      // Check if task has a parent
      if (task.ParentID === null || task.ParentID === undefined) {
        // This is a root task
        rootTasks.push(task);
      } else {
        // This is a child task
        const parentTask = taskMap.get(task.ParentID);
        if (parentTask && parentTask.children) {
          // Only add to parent if parent exists and is a 1st level task
          if (canBeParent(parentTask, taskList)) {
            parentTask.children.push(task);
            parentTask.hasChildren = true;
          } else {
            // If parent has its own parent (3+ level hierarchy), treat as root
            rootTasks.push(task);
          }
        } else {
          // If parent doesn't exist, treat as root task
          rootTasks.push(task);
        }
      }
    });
    
    // Calculate estimated hours for parent tasks
    calculateHours(rootTasks);
    
    // Sort tasks by name (alphabetical order)
    return rootTasks.sort((a, b) => {
      return a.TaskName.localeCompare(b.TaskName);
    });
  };
  
  /**
   * Calculate estimated hours for parent tasks
   */
  const calculateHours = (tasks: TaskWithChildren[]): number => {
    let totalHours = 0;
    
    tasks.forEach(task => {
      if (!task.children || task.children.length === 0) {
        totalHours += task.EstimatedHour;
      } else {
        const childrenHours = calculateHours(task.children);
        task.totalEstimatedHours = childrenHours;
        totalHours += childrenHours;
      }
    });
    
    return totalHours;
  };

  /**
   * Get available parent tasks for selection (only tasks that can be parents)
   */
  const getAvailableParentTasks = (allTasks: Task[], currentTaskId?: number): Task[] => {
    return allTasks.filter(task => {
      // A task can be a parent if:
      // 1. It is not the current task
      // 2. It doesn't have a parent (no 3+ level hierarchy)
      // 3. It doesn't have max children
      return (
        (!currentTaskId || task.id !== currentTaskId) &&
        canBeParent(task, allTasks) &&
        !hasMaxChildren(task.id as number, allTasks)
      );
    });
  };

  return {
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    fetchUsers,
    fetchSprints,
    organizeTasks,
    canBeParent,
    hasMaxChildren,
    getAvailableParentTasks,
    tasks,
    loading,
    error
  };
};
