import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Wallet } from "@/lib/api";
import { useAuth } from "./useAuth";

export type { Wallet };

export const useWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { wallet } = await api.wallet.get();
      return wallet;
    },
    enabled: !!user,
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: { balance?: number; total_invested?: number; pending_returns?: number }) => {
      const { wallet } = await api.wallet.update(updates);
      return wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
    },
  });
};
