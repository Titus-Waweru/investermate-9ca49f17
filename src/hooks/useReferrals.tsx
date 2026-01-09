import { useQuery } from "@tanstack/react-query";
import { api, Referral } from "@/lib/api";
import { useAuth } from "./useAuth";

export type { Referral };

export const useReferrals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { referrals } = await api.referrals.list();
      return referrals;
    },
    enabled: !!user,
  });
};

export const useReferralStats = () => {
  const { data: referrals, isLoading } = useReferrals();

  const stats = {
    totalReferrals: referrals?.length || 0,
    completedReferrals: referrals?.filter((r) => r.status === "completed" || r.status === "rewarded").length || 0,
    totalRewards: referrals?.reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0,
    pendingReferrals: referrals?.filter((r) => r.status === "pending").length || 0,
  };

  return { stats, isLoading };
};
