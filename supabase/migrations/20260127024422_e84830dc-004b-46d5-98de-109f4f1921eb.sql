-- Add last_login_at column to profiles for engagement tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index for efficient querying of last login
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON public.profiles(last_login_at DESC);