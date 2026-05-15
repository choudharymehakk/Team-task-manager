import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios.js";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/api/projects")).data
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => (await api.get(`/api/projects/${id}`)).data,
    enabled: Boolean(id)
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/api/projects", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] })
  });
}

export function useAddMember(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email) => (await api.post(`/api/projects/${projectId}/members`, { email })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId] })
  });
}

export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: ["projects", projectId, "members"],
    queryFn: async () => (await api.get(`/api/projects/${projectId}/members`)).data,
    enabled: Boolean(projectId)
  });
}

export function useRemoveMember(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => (await api.delete(`/api/projects/${projectId}/members/${userId}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    }
  });
}
