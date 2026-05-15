import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios.js";

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/api/users")).data,
    enabled
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/api/users", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });
}
