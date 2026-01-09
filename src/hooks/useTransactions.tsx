import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

export interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal" | "investment" | "return" | "referral_bonus";
  amount: number;
  description: string | null;
  reference_id: string | null;
  status: string;
  created_at: string;
}

export const useTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { transactions } = await api.transactions.list();
      return transactions as Transaction[];
    },
    enabled: !!user,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transaction: { type: string; amount: number; description?: string; reference_id?: string; status?: string }) => {
      const { transaction: created } = await api.transactions.create(transaction);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
    },
  });
};
