import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Investment } from "@/lib/api";
import { useAuth } from "./useAuth";

export type { Investment };

export const useInvestments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { investments } = await api.investments.list();
      return investments;
    },
    enabled: !!user,
  });
};

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      amount,
      expectedReturn,
      durationDays,
    }: {
      productId: string;
      amount: number;
      expectedReturn: number;
      durationDays: number;
    }) => {
      const maturesAt = new Date();
      maturesAt.setDate(maturesAt.getDate() + durationDays);

      const { investment } = await api.investments.create({
        productId,
        amount,
        expectedReturn,
        maturesAt: maturesAt.toISOString(),
      });
      return investment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
    },
  });
};
