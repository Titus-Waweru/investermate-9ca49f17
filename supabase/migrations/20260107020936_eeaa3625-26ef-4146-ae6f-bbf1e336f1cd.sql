-- Fix the overly permissive referrals insert policy
DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;

CREATE POLICY "Users can insert referrals"
ON public.referrals
FOR INSERT
WITH CHECK (
  referrer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);