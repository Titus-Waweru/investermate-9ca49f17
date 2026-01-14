import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PersonalManager } from "@/lib/api";
import { useAuth } from "./useAuth";

export type { PersonalManager };

// Hook to get the user's assigned manager
export const useAssignedManager = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["assignedManager", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { manager } = await api.managers.getAssigned();
      return manager;
    },
    enabled: !!user,
  });
};

// Admin hooks for managing personal managers
export const useAllManagers = () => {
  return useQuery({
    queryKey: ["allManagers"],
    queryFn: async () => {
      const { managers } = await api.admin.getAllManagers();
      return managers;
    },
  });
};

export const useAddManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; whatsappNumber: string; welcomeMessage?: string }) => {
      return api.admin.addManager(data.name, data.whatsappNumber, data.welcomeMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allManagers"] });
    },
  });
};

export const useToggleManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return api.admin.toggleManager(id, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allManagers"] });
    },
  });
};

export const useDeleteManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.admin.deleteManager(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allManagers"] });
    },
  });
};

export const useReassignManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string }) => {
      return api.admin.reassignManager(userId, managerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allManagers"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};
