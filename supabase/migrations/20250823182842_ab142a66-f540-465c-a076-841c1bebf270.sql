-- Add INSERT policy for failed_login_attempts table
-- This policy ensures only the system (via security definer functions) can insert failed login attempts
-- Regular users cannot directly insert into this table, preventing data pollution

CREATE POLICY "System can log failed login attempts" 
ON public.failed_login_attempts 
FOR INSERT 
WITH CHECK (false); -- Prevents direct inserts, only allows via security definer functions

-- Update the existing log_failed_login function to ensure it can still insert
-- The function already has SECURITY DEFINER which allows it to bypass RLS
-- This confirms the function will continue to work for legitimate logging