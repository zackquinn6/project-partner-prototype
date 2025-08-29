-- Create homes table for multiple home locations
CREATE TABLE public.homes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  home_type TEXT,
  build_year TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homes ENABLE ROW LEVEL SECURITY;

-- Create policies for homes access
CREATE POLICY "Users can view their own homes" 
ON public.homes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own homes" 
ON public.homes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own homes" 
ON public.homes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own homes" 
ON public.homes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add home_id to project_runs table
ALTER TABLE public.project_runs 
ADD COLUMN home_id UUID;

-- Create foreign key reference to homes table
ALTER TABLE public.project_runs 
ADD CONSTRAINT fk_project_runs_home_id 
FOREIGN KEY (home_id) REFERENCES public.homes(id) ON DELETE SET NULL;

-- Add home_id to profiles table for storing home-specific profile data
ALTER TABLE public.profiles 
ADD COLUMN home_id UUID;

-- Add foreign key reference to homes table for profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_home_id 
FOREIGN KEY (home_id) REFERENCES public.homes(id) ON DELETE SET NULL;

-- Create trigger for updating homes timestamps
CREATE TRIGGER update_homes_updated_at
BEFORE UPDATE ON public.homes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();