-- Security Enhancement Migration: Fix RLS Policies (Careful Update)
-- Step 2 & 3: Enhance Failed Login Attempts Security and Verify Maintenance Settings Protection

-- Create a secure function for admins to view masked failed login data
CREATE OR REPLACE FUNCTION public.get_failed_login_summary(days_back integer = 7)
RETURNS TABLE(
  date date,
  attempt_count bigint,
  unique_emails bigint,
  unique_ips bigint,
  top_attempted_domains text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Log this access
  PERFORM log_security_event('admin_security_summary', 'Admin accessed failed login summary');

  RETURN QUERY
  SELECT 
    f.attempt_time::date as date,
    COUNT(*) as attempt_count,
    COUNT(DISTINCT f.email) as unique_emails,
    COUNT(DISTINCT f.ip_address) as unique_ips,
    ARRAY_AGG(DISTINCT split_part(f.email, '@', 2)) FILTER (WHERE split_part(f.email, '@', 2) != '') as top_attempted_domains
  FROM public.failed_login_attempts f
  WHERE f.attempt_time >= (now() - (days_back || ' days')::interval)
  GROUP BY f.attempt_time::date
  ORDER BY f.attempt_time::date DESC;
END;
$$;

-- Add enhanced security validation function
CREATE OR REPLACE FUNCTION public.validate_admin_security_access(action_description text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin status
  IF NOT is_admin(auth.uid()) THEN
    PERFORM log_security_event('unauthorized_admin_attempt', action_description);
    RETURN false;
  END IF;
  
  -- Log successful admin security action
  PERFORM log_security_event('admin_security_action', action_description);
  RETURN true;
END;
$$;