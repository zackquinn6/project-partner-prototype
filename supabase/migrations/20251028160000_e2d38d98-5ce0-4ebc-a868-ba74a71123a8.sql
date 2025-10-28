-- Update achievements table to support XP system
ALTER TABLE public.achievements
ADD COLUMN IF NOT EXISTS base_xp INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS scales_with_project_size BOOLEAN DEFAULT false;

-- Update user_achievements to track XP earned
ALTER TABLE public.user_achievements
ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Create user_xp_history table for tracking XP gains
CREATE TABLE IF NOT EXISTS public.user_xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_run_id UUID REFERENCES public.project_runs(id) ON DELETE CASCADE,
  phase_name TEXT,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create achievement_notifications table
CREATE TABLE IF NOT EXISTS public.achievement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  project_run_id UUID REFERENCES public.project_runs(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, achievement_id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.project_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_run_id UUID NOT NULL REFERENCES public.project_runs(id) ON DELETE CASCADE,
  certificate_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  shared_via_email BOOLEAN DEFAULT false,
  
  UNIQUE(user_id, project_run_id)
);

-- Enable RLS
ALTER TABLE public.user_xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_xp_history
CREATE POLICY "Users can view their own XP history"
  ON public.user_xp_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP history"
  ON public.user_xp_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievement_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.achievement_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.achievement_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.achievement_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.achievement_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for project_certificates
CREATE POLICY "Users can view their own certificates"
  ON public.project_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates"
  ON public.project_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates"
  ON public.project_certificates FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_xp_history_user_id ON public.user_xp_history(user_id);
CREATE INDEX idx_achievement_notifications_user_id ON public.achievement_notifications(user_id);
CREATE INDEX idx_achievement_notifications_unread ON public.achievement_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_project_certificates_user_id ON public.project_certificates(user_id);

-- Update existing achievements with XP values and scaling flags
UPDATE public.achievements SET 
  base_xp = 100, 
  scales_with_project_size = false 
WHERE category = 'foundational';

UPDATE public.achievements SET 
  base_xp = 200, 
  scales_with_project_size = false 
WHERE category = 'frequency';

UPDATE public.achievements SET 
  base_xp = 150, 
  scales_with_project_size = true 
WHERE category = 'scale';

UPDATE public.achievements SET 
  base_xp = 400, 
  scales_with_project_size = true 
WHERE category = 'overlapping';

UPDATE public.achievements SET 
  base_xp = 250, 
  scales_with_project_size = false 
WHERE category = 'skill';

UPDATE public.achievements SET 
  base_xp = 1000, 
  scales_with_project_size = false 
WHERE category = 'legacy';