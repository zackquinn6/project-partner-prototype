-- Create feature roadmap table for admin-managed roadmap items
CREATE TABLE public.feature_roadmap (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'improvement', 'bugfix', 'integration')),
  target_date DATE,
  completion_date DATE,
  votes INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Create feature requests table for user submissions  
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature' CHECK (category IN ('feature', 'improvement', 'bugfix', 'integration')),
  priority_request TEXT NOT NULL DEFAULT 'medium' CHECK (priority_request IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under-review', 'approved', 'rejected', 'implemented')),
  votes INTEGER NOT NULL DEFAULT 0,
  admin_notes TEXT,
  roadmap_item_id UUID REFERENCES public.feature_roadmap(id)
);

-- Add project photos to project_runs table
ALTER TABLE public.project_runs 
ADD COLUMN project_photos JSONB DEFAULT '{"before": [], "during": [], "after": []}'::jsonb;

-- Enable RLS
ALTER TABLE public.feature_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for feature_roadmap
CREATE POLICY "Everyone can view feature roadmap" 
ON public.feature_roadmap 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage feature roadmap" 
ON public.feature_roadmap 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS policies for feature_requests  
CREATE POLICY "Users can view all feature requests" 
ON public.feature_requests 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create feature requests" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own feature requests" 
ON public.feature_requests 
FOR UPDATE 
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all feature requests" 
ON public.feature_requests 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_feature_roadmap_updated_at
BEFORE UPDATE ON public.feature_roadmap
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at  
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();