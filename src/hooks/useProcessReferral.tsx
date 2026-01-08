import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const REFERRAL_REWARD = 100; // KES 100 per successful referral

export const useProcessReferral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referralCode, newUserId }: { referralCode: string; newUserId: string }) => {
      if (!referralCode || !newUserId) return null;

      // Find the referrer by their referral code
      const { data: referrerProfile, error: referrerError } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("referral_code", referralCode)
        .single();

      if (referrerError || !referrerProfile) {
        console.log("Invalid referral code");
        return null;
      }

      // Get the new user's profile id
      const { data: newUserProfile, error: newUserError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", newUserId)
        .single();

      if (newUserError || !newUserProfile) {
        console.log("New user profile not found");
        return null;
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_id", newUserProfile.id)
        .single();

      if (existingReferral) {
        console.log("Referral already exists");
        return null;
      }

      // Create the referral record
      const { data: referral, error: referralError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: referrerProfile.id,
          referred_id: newUserProfile.id,
          reward_amount: REFERRAL_REWARD,
          status: "completed",
        })
        .select()
        .single();

      if (referralError) {
        console.error("Failed to create referral:", referralError);
        return null;
      }

      // Add KES 100 to referrer's wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", referrerProfile.user_id)
        .single();

      if (!walletError && wallet) {
        await supabase
          .from("wallets")
          .update({ balance: Number(wallet.balance) + REFERRAL_REWARD })
          .eq("user_id", referrerProfile.user_id);

        // Create transaction record for the reward
        await supabase.from("transactions").insert({
          user_id: referrerProfile.user_id,
          type: "reward",
          amount: REFERRAL_REWARD,
          description: "Referral reward - New user signup",
          status: "completed",
        });
      }

      // Update the referral status to rewarded
      await supabase
        .from("referrals")
        .update({ status: "rewarded" })
        .eq("id", referral.id);

      // Update new user's referred_by
      await supabase
        .from("profiles")
        .update({ referred_by: referrerProfile.id })
        .eq("id", newUserProfile.id);

      return referral;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};
