-- Fix Critical Security Issue: Admin Profile Access Policy
-- The current policy blocks all admin access with "AND false"
-- This causes application failures when admins try to access profiles

-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create proper admin access policy with audit trail
CREATE POLICY "Admins can view all profiles with audit" 
ON public.profiles 
FOR SELECT 
USING (
  is_admin(auth.uid()) AND 
  (
    -- Log the admin access for audit purposes
    log_comprehensive_security_event(
      'admin_profile_access',
      'low',
      'Admin accessed profiles table',
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      NULL,
      NULL,
      jsonb_build_object(
        'accessed_at', now(),
        'action', 'view_profiles'
      )
    ) IS NOT NULL OR true
  )
);

-- Ensure admins can also update profiles when needed (with audit)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles with audit"
ON public.profiles
FOR UPDATE
USING (
  is_admin(auth.uid()) AND
  (
    log_comprehensive_security_event(
      'admin_profile_update',
      'medium',
      'Admin updated profile',
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      NULL,
      NULL,
      jsonb_build_object(
        'accessed_at', now(),
        'action', 'update_profile',
        'target_profile_id', id
      )
    ) IS NOT NULL OR true
  )
);

-- Ensure admins can delete profiles when needed (with audit)
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

CREATE POLICY "Admins can delete all profiles with audit"
ON public.profiles
FOR DELETE
USING (
  is_admin(auth.uid()) AND
  (
    log_comprehensive_security_event(
      'admin_profile_delete',
      'high',
      'Admin deleted profile',
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      NULL,
      NULL,
      jsonb_build_object(
        'accessed_at', now(),
        'action', 'delete_profile',
        'target_profile_id', id
      )
    ) IS NOT NULL OR true
  )
);