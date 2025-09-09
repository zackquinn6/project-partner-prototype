-- Create table for AI repair analysis results
CREATE TABLE public.ai_repair_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  issue_category TEXT,
  severity_level TEXT,
  estimated_cost_range TEXT,
  action_plan TEXT,
  root_cause_analysis TEXT,
  recommended_materials JSONB DEFAULT '[]'::jsonb,
  recommended_tools JSONB DEFAULT '[]'::jsonb,
  difficulty_level TEXT,
  estimated_time TEXT
);

-- Enable RLS
ALTER TABLE public.ai_repair_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI repair analyses"
ON public.ai_repair_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI repair analyses"
ON public.ai_repair_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI repair analyses"
ON public.ai_repair_analyses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI repair analyses"
ON public.ai_repair_analyses
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_repair_analyses_updated_at
BEFORE UPDATE ON public.ai_repair_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();