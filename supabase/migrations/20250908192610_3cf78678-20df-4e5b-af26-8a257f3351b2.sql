-- Add indexes to improve performance for security queries
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email_time ON public.failed_login_attempts (email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_user_created ON public.role_audit_log (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON public.user_sessions (user_id, is_active);

-- Create a function to get security metrics for dashboard
CREATE OR REPLACE FUNCTION public.get_security_metrics(timeframe_hours integer DEFAULT 24)
RETURNS TABLE(
  failed_logins_count bigint,
  active_sessions_count bigint,
  role_changes_count bigint,
  unique_ips_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH timeframe_start AS (
    SELECT now() - (timeframe_hours || ' hours')::interval as start_time
  )
  SELECT
    (SELECT count(*) FROM public.failed_login_attempts 
     WHERE attempt_time >= (SELECT start_time FROM timeframe_start)) as failed_logins_count,
    
    (SELECT count(*) FROM public.user_sessions 
     WHERE is_active = true) as active_sessions_count,
    
    (SELECT count(*) FROM public.role_audit_log 
     WHERE created_at >= (SELECT start_time FROM timeframe_start)) as role_changes_count,
    
    (SELECT count(DISTINCT ip_address) FROM public.failed_login_attempts 
     WHERE attempt_time >= (SELECT start_time FROM timeframe_start)
     AND ip_address IS NOT NULL) as unique_ips_count;
$$;