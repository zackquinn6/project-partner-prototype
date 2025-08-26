-- Database Performance Improvements - Quick Wins
-- Add critical indexes for better query performance

-- Project runs indexes (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_project_runs_user_id ON public.project_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_runs_template_id ON public.project_runs(template_id);
CREATE INDEX IF NOT EXISTS idx_project_runs_status ON public.project_runs(status);
CREATE INDEX IF NOT EXISTS idx_project_runs_created_at ON public.project_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_runs_updated_at ON public.project_runs(updated_at DESC);

-- Projects indexes (for catalog and admin views)
CREATE INDEX IF NOT EXISTS idx_projects_publish_status ON public.projects(publish_status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON public.projects(difficulty);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_skill_level ON public.profiles(skill_level);

-- User roles indexes (for admin checks)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);

-- Security-related indexes
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON public.failed_login_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON public.failed_login_attempts(ip_address);

-- Feature requests indexes
CREATE INDEX IF NOT EXISTS idx_feature_requests_submitted_by ON public.feature_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON public.feature_requests(category);

-- User sessions indexes (for security monitoring)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON public.user_sessions(session_start DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_project_runs_user_status ON public.project_runs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_publish_category ON public.projects(publish_status, category);

-- Optimize existing functions for better performance
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin'
    LIMIT 1  -- Add LIMIT for faster execution
  );
$function$;

-- Add function to get user role efficiently (cached)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_roles.user_id = get_user_role.user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
$function$;

-- Optimize cleanup function with better batching
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete in smaller batches for better performance
  WITH old_sessions AS (
    SELECT id FROM public.user_sessions 
    WHERE session_start < (now() - INTERVAL '90 days')
    LIMIT 1000
  )
  DELETE FROM public.user_sessions 
  WHERE id IN (SELECT id FROM old_sessions);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;