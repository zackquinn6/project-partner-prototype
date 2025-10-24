-- Create table for home task schedules
CREATE TABLE IF NOT EXISTS public.home_task_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  home_id UUID,
  start_date DATE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  schedule_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  assignments_count INTEGER NOT NULL DEFAULT 0,
  warnings JSONB DEFAULT '[]'::jsonb,
  unassigned JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_task_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own schedules"
  ON public.home_task_schedules
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_home_task_schedules_user_id ON public.home_task_schedules(user_id);
CREATE INDEX idx_home_task_schedules_home_id ON public.home_task_schedules(home_id);

-- Add trigger for updated_at
CREATE TRIGGER update_home_task_schedules_updated_at
  BEFORE UPDATE ON public.home_task_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();