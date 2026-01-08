-- Create emergency_messages table
CREATE TABLE public.emergency_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  expires_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.emergency_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active emergency messages
CREATE POLICY "Anyone can view active emergency messages"
ON public.emergency_messages
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Only admins can manage emergency messages
CREATE POLICY "Admins can manage emergency messages"
ON public.emergency_messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));