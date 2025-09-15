-- Security Fix 1: Add additional security logging table for comprehensive monitoring
CREATE TABLE IF NOT EXISTS public.security_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  user_id UUID,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security events log
ALTER TABLE public.security_events_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON public.security_events_log
FOR SELECT USING (is_admin(auth.uid()));

-- Security Fix 2: Add function to log comprehensive security events
CREATE OR REPLACE FUNCTION public.log_comprehensive_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_additional_data JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate severity level
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    p_severity := 'medium';
  END IF;

  -- Insert security event
  INSERT INTO public.security_events_log (
    event_type,
    severity,
    description,
    user_id,
    user_email,
    ip_address,
    user_agent,
    additional_data
  ) VALUES (
    p_event_type,
    p_severity,
    p_description,
    COALESCE(p_user_id, auth.uid()),
    p_user_email,
    CASE WHEN p_ip_address IS NOT NULL THEN p_ip_address::INET ELSE NULL END,
    p_user_agent,
    p_additional_data
  );
END;
$$;

-- Security Fix 3: Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier TEXT,
  operation_type TEXT,
  max_attempts INTEGER DEFAULT 10,
  window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Count recent attempts for this operation type
  SELECT COUNT(*) INTO attempt_count
  FROM public.security_events_log
  WHERE additional_data->>'identifier' = identifier
    AND additional_data->>'operation_type' = operation_type
    AND created_at > window_start;

  -- Log the rate limit check
  IF attempt_count >= max_attempts THEN
    PERFORM log_comprehensive_security_event(
      'rate_limit_exceeded',
      'high',
      'Rate limit exceeded for operation: ' || operation_type,
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      NULL,
      NULL,
      jsonb_build_object(
        'identifier', identifier,
        'operation_type', operation_type,
        'attempt_count', attempt_count,
        'max_attempts', max_attempts
      )
    );
    RETURN FALSE;
  END IF;

  -- Log successful rate limit check
  PERFORM log_comprehensive_security_event(
    'rate_limit_check',
    'low',
    'Rate limit check passed for operation: ' || operation_type,
    auth.uid(),
    NULL,
    NULL,
    NULL,
    jsonb_build_object(
      'identifier', identifier,
      'operation_type', operation_type,
      'attempt_count', attempt_count
    )
  );

  RETURN TRUE;
END;
$$;

-- Security Fix 4: Function to detect suspicious activity patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  risk_score INTEGER,
  suspicious_events JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can run this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  WITH user_activity AS (
    SELECT 
      sel.user_id,
      sel.user_email,
      COUNT(*) FILTER (WHERE sel.severity = 'high') as high_severity_events,
      COUNT(*) FILTER (WHERE sel.severity = 'critical') as critical_events,
      COUNT(*) FILTER (WHERE sel.event_type = 'rate_limit_exceeded') as rate_limit_violations,
      COUNT(*) FILTER (WHERE sel.event_type LIKE '%_failed') as failed_operations,
      COUNT(DISTINCT sel.ip_address) as unique_ips,
      array_agg(DISTINCT sel.event_type) as event_types
    FROM public.security_events_log sel
    WHERE sel.created_at > (now() - INTERVAL '24 hours')
      AND sel.user_id IS NOT NULL
    GROUP BY sel.user_id, sel.user_email
  )
  SELECT 
    ua.user_id,
    ua.user_email,
    -- Calculate risk score based on suspicious activity
    (
      ua.critical_events * 50 +
      ua.high_severity_events * 20 +
      ua.rate_limit_violations * 15 +
      ua.failed_operations * 10 +
      CASE WHEN ua.unique_ips > 5 THEN 25 ELSE 0 END
    )::INTEGER as risk_score,
    jsonb_build_object(
      'critical_events', ua.critical_events,
      'high_severity_events', ua.high_severity_events,
      'rate_limit_violations', ua.rate_limit_violations,
      'failed_operations', ua.failed_operations,
      'unique_ips', ua.unique_ips,
      'event_types', ua.event_types
    ) as suspicious_events
  FROM user_activity ua
  WHERE (
    ua.critical_events > 0 OR
    ua.high_severity_events > 5 OR
    ua.rate_limit_violations > 3 OR
    ua.failed_operations > 10 OR
    ua.unique_ips > 5
  )
  ORDER BY risk_score DESC;
END;
$$;