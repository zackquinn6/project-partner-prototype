-- Fix profiles table RLS policies to prevent user email harvesting
-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create strict policies for profiles table
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Add stricter policies for homes table
DROP POLICY IF EXISTS "Users can view their own homes" ON public.homes;

CREATE POLICY "Users can view only their own homes" 
ON public.homes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all homes" 
ON public.homes 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Add data retention function for security logs
CREATE OR REPLACE FUNCTION public.cleanup_security_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Clean up old failed login attempts (90+ days)
  DELETE FROM public.failed_login_attempts 
  WHERE attempt_time < (now() - INTERVAL '90 days');
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Clean up old audit logs (1+ year)
  DELETE FROM public.role_audit_log 
  WHERE created_at < (now() - INTERVAL '1 year');
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Clean up old inactive sessions (30+ days)
  DELETE FROM public.user_sessions 
  WHERE session_start < (now() - INTERVAL '30 days') 
  AND (is_active = false OR session_end IS NOT NULL);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$;

-- Create server-side rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.failed_login_attempts
  WHERE email = identifier 
  AND attempt_time > (now() - (window_minutes || ' minutes')::INTERVAL);

  -- Return false if rate limit exceeded
  RETURN attempt_count < max_attempts;
END;
$$;

-- Add input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential XSS vectors
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '<[^>]*>', '', 'g'), -- Remove HTML tags
        '[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g'), -- Remove control characters
      'javascript:', '', 'gi'), -- Remove javascript: protocol
    'on\w+\s*=', '', 'gi'); -- Remove event handlers
END;
$$;