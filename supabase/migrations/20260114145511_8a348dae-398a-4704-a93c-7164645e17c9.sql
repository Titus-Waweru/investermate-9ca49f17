-- Create personal_managers table for manager assignment system
CREATE TABLE public.personal_managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  welcome_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_managers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (users need to see their assigned manager)
CREATE POLICY "Anyone can view active managers"
ON public.personal_managers
FOR SELECT
USING (is_active = true);

-- Create policy for admin management
CREATE POLICY "Admins can manage managers"
ON public.personal_managers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add assigned_manager_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN assigned_manager_id UUID REFERENCES public.personal_managers(id);

-- Add theme_preference to profiles table
ALTER TABLE public.profiles
ADD COLUMN theme_preference TEXT DEFAULT 'light';

-- Create trigger for updated_at on personal_managers
CREATE TRIGGER update_personal_managers_updated_at
BEFORE UPDATE ON public.personal_managers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();