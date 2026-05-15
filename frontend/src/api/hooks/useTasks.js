import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios.js";

export function useProjectTasks(projectId) {
  return useQuery({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: async () => (await api.get(`/api/projects/${projectId}/tasks`)).data,
    enabled: Boolean(projectId)
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => (await api.get(`/api/tasks/${id}`)).data,
    enabled: Boolean(id)
  });
}

export function useCreateTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/api/projects/${projectId}/tasks`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] })
  });
}

export function useUpdateTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/api/tasks/${id}`, payload)).data,
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task.id] });
      if (projectId || task.project_id) {
        queryClient.invalidateQueries({ queryKey: ["projects", projectId || task.project_id, "tasks"] });
      }
    }
  });
}

export function useDeleteTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] })
  });
}

export function useAllProjectTasks(projects = []) {
  const queries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["projects", project.id, "tasks"],
      queryFn: async () => (await api.get(`/api/projects/${project.id}/tasks`)).data,
      enabled: Boolean(project.id)
    }))
  });
  const tasks = queries.flatMap((query, index) =>
    (query.data || []).map((task) => ({
      ...task,
      project_name: projects[index]?.name || "Project"
    }))
  );
  return {
    tasks,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError)
  };
}
