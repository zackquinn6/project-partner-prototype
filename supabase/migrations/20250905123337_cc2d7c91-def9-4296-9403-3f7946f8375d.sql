-- Create maintenance templates table for admin-created maintenance items
CREATE TABLE public.maintenance_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  frequency_days INTEGER NOT NULL, -- How often this should be done in days
  instructions TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on maintenance templates
ALTER TABLE public.maintenance_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance templates
CREATE POLICY "Everyone can view maintenance templates" 
ON public.maintenance_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage maintenance templates" 
ON public.maintenance_templates 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create user maintenance tasks table
CREATE TABLE public.user_maintenance_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  home_id UUID NOT NULL,
  template_id UUID REFERENCES public.maintenance_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  frequency_days INTEGER NOT NULL,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false, -- true if user created, false if from template
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user maintenance tasks
ALTER TABLE public.user_maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for user maintenance tasks
CREATE POLICY "Users can view their own maintenance tasks" 
ON public.user_maintenance_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own maintenance tasks" 
ON public.user_maintenance_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance tasks" 
ON public.user_maintenance_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance tasks" 
ON public.user_maintenance_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create maintenance completions table for history tracking
CREATE TABLE public.maintenance_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.user_maintenance_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on maintenance completions
ALTER TABLE public.maintenance_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance completions
CREATE POLICY "Users can view their own maintenance completions" 
ON public.maintenance_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own maintenance completions" 
ON public.maintenance_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance completions" 
ON public.maintenance_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance completions" 
ON public.maintenance_completions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamps
CREATE TRIGGER update_maintenance_templates_updated_at
BEFORE UPDATE ON public.maintenance_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_maintenance_tasks_updated_at
BEFORE UPDATE ON public.user_maintenance_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update next due date when task is completed
CREATE OR REPLACE FUNCTION public.update_task_next_due_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the task's last completed and next due date
  UPDATE public.user_maintenance_tasks 
  SET 
    last_completed_at = NEW.completed_at,
    next_due_date = NEW.completed_at + INTERVAL '1 day' * frequency_days,
    updated_at = now()
  WHERE id = NEW.task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update task when completion is added
CREATE TRIGGER update_task_on_completion
AFTER INSERT ON public.maintenance_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_task_next_due_date();

-- Insert some sample maintenance templates
INSERT INTO public.maintenance_templates (title, description, category, frequency_days, instructions) VALUES
('Change Refrigerator Water Filter', 'Replace the water filter in your refrigerator to ensure clean, fresh-tasting water', 'appliances', 180, 'Locate the filter (usually inside the fridge or in the grille at the bottom). Turn counterclockwise to remove old filter. Insert new filter and turn clockwise until snug.'),
('Flush Hot Water Heater', 'Drain and flush your hot water heater to remove sediment buildup', 'plumbing', 365, 'Turn off power/gas to heater. Connect hose to drain valve. Open drain valve and hot water tap to flush tank. Close valve when water runs clear.'),
('Check Door and Window Seals', 'Inspect weather stripping around doors and windows for gaps or damage', 'hvac', 180, 'Run your hand around door and window frames to feel for air leaks. Check for cracked, torn, or compressed weather stripping. Replace as needed.'),
('Clean HVAC Air Filter', 'Replace or clean your HVAC system air filter', 'hvac', 90, 'Locate filter in return air duct or HVAC unit. Remove old filter. Insert new filter with airflow arrow pointing toward unit.'),
('Test Smoke Detector Batteries', 'Test smoke detectors and replace batteries if needed', 'safety', 365, 'Press and hold test button on each detector. If beep is weak or absent, replace 9V battery. Test monthly, replace batteries annually.'),
('Clean Dryer Vent', 'Remove lint buildup from dryer vent to prevent fire hazard', 'appliances', 365, 'Disconnect dryer from power. Remove vent hose from back of dryer. Use vacuum or brush to remove lint from hose and exterior vent.'),
('Inspect Roof and Gutters', 'Check for damaged shingles, clogged gutters, and proper drainage', 'exterior', 180, 'Visually inspect roof for missing/damaged shingles. Clean debris from gutters. Check that water flows properly through downspouts.'),
('Service Garage Door', 'Lubricate moving parts and test safety features of garage door', 'exterior', 180, 'Apply lubricant to hinges, rollers, and tracks. Test auto-reverse feature by placing object under door. Check remote batteries.');