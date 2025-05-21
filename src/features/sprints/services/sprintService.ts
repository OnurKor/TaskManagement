import { useSupabaseApi } from '../../../shared/hooks/useSupaBaseApi';

export const useSprintService = () => {
  const { request, data: sprints, loading, error } = useSupabaseApi();

  const fetchSprints = async () => {
    return await request('Sprints', { 
      useAuth: true, 
      headers: {
        'Prefer': 'count=exact'
      }
    });
  };

  const addSprint = async (sprintName: string) => {
    return await request('Sprints', {
      useAuth: true,
      method: 'POST',
      headers: {
        'Prefer': 'return=representation'
      },
      body: {
        SprintName: sprintName.trim()
      }
    });
  };

  return {
    fetchSprints,
    addSprint,
    sprints,
    loading,
    error
  };
};
