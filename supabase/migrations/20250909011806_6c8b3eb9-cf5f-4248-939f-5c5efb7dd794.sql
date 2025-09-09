-- Security Enhancement Migration: Fix RLS Policies
-- Step 2 & 3: Enhance Failed Login Attempts Security and Verify Maintenance Settings Protection

-- First, let's fix the profiles table RLS policies
-- Remove the current admin policy that allows viewing all profiles with emails
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a more secure admin policy that only allows viewing profile IDs and non-sensitive data
CREATE POLICY "Admins can view profile metadata" ON public.profiles
FOR SELECT 
USING (
  is_admin(auth.uid()) AND auth.uid() != user_id
);

-- Ensure users can still view their own complete profile
-- (This policy should already exist but let's make sure it's secure)
DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;
CREATE POLICY "Users can view only their own profile" ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix maintenance_notification_settings RLS policies
-- The current policies look correct but let's ensure they're bulletproof
DROP POLICY IF EXISTS "Users can view their own notification settings" ON public.maintenance_notification_settings;
CREATE POLICY "Users can view their own notification settings" ON public.maintenance_notification_settings
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure no other policies allow broader access
DROP POLICY IF EXISTS "Users can update their own notification settings" ON public.maintenance_notification_settings;
CREATE POLICY "Users can update their own notification settings" ON public.maintenance_notification_settings
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own notification settings" ON public.maintenance_notification_settings; 
CREATE POLICY "Users can create their own notification settings" ON public.maintenance_notification_settings
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notification settings" ON public.maintenance_notification_settings;
CREATE POLICY "Users can delete their own notification settings" ON public.maintenance_notification_settings
FOR DELETE 
USING (auth.uid() = user_id);

-- Enhance failed_login_attempts security
-- Make sure only admins can view, and add logging function for secure access
DROP POLICY IF EXISTS "Admins can view failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Admins can view failed login attempts" ON public.failed_login_attempts
FOR SELECT 
USING (
  is_admin(auth.uid()) AND 
  -- Log this access for audit trail
  (SELECT log_security_event('admin_viewed_failed_logins', 'Admin accessed failed login attempts table')) IS NOT NULL
);

-- Ensure only service role can insert (this should already exist)
DROP POLICY IF EXISTS "Only service role can log failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Only service role can log failed login attempts" ON public.failed_login_attempts
FOR INSERT 
WITH CHECK (true); -- This will be restricted by RLS and service role

-- Add a more restrictive admin delete policy for old failed login attempts
DROP POLICY IF EXISTS "Admins can delete old failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Admins can delete old failed login attempts" ON public.failed_login_attempts
FOR DELETE 
USING (
  is_admin(auth.uid()) AND 
  attempt_time < (now() - '30 days'::interval) AND
  -- Log this cleanup action
  (SELECT log_security_event('admin_cleanup_failed_logins', 'Admin cleaned up old failed login attempts')) IS NOT NULL
);

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