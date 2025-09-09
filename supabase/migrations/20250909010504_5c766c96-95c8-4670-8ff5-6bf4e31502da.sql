-- Security Fix: Add proper access controls to SECURITY DEFINER functions

-- 1. Fix the get_user_notification_settings function to include proper access controls
CREATE OR REPLACE FUNCTION public.get_user_notification_settings(user_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, email_enabled boolean, sms_enabled boolean, email_address text, phone_number text, notify_monthly boolean, notify_weekly boolean, notify_due_date boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Critical Security Fix: Only allow users to access their own data or admins to access any data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != user_uuid AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access notification settings for other users';
  END IF;

  RETURN QUERY
  SELECT ns.id, ns.user_id, ns.email_enabled, ns.sms_enabled, ns.email_address, ns.phone_number, 
         ns.notify_monthly, ns.notify_weekly, ns.notify_due_date, ns.created_at, ns.updated_at
  FROM maintenance_notification_settings ns
  WHERE ns.user_id = user_uuid;
END;
$function$;

-- 2. Fix the upsert_notification_settings function to include proper access controls  
CREATE OR REPLACE FUNCTION public.upsert_notification_settings(user_uuid uuid, email_enabled boolean, sms_enabled boolean, email_address text, phone_number text, notify_monthly boolean, notify_weekly boolean, notify_due_date boolean)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result_id UUID;
BEGIN
  -- Critical Security Fix: Only allow users to modify their own data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify notification settings for other users';
  END IF;

  INSERT INTO maintenance_notification_settings (
    user_id,
    email_enabled,
    sms_enabled,
    email_address,
    phone_number,
    notify_monthly,
    notify_weekly,
    notify_due_date
  ) VALUES (
    user_uuid,
    email_enabled,
    sms_enabled,
    email_address,
    phone_number,
    notify_monthly,
    notify_weekly,
    notify_due_date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email_enabled = EXCLUDED.email_enabled,
    sms_enabled = EXCLUDED.sms_enabled,
    email_address = EXCLUDED.email_address,
    phone_number = EXCLUDED.phone_number,
    notify_monthly = EXCLUDED.notify_monthly,
    notify_weekly = EXCLUDED.notify_weekly,
    notify_due_date = EXCLUDED.notify_due_date,
    updated_at = now()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$function$;

-- 3. Fix export_user_data function to add proper authentication
CREATE OR REPLACE FUNCTION public.export_user_data(user_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_data JSON;
BEGIN
  -- Critical Security Fix: Require authentication and proper authorization
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Only allow users to export their own data or admins to export any data
  IF auth.uid() != user_uuid AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot export data for other users';
  END IF;

  SELECT json_build_object(
    'profile', (SELECT row_to_json(profiles.*) FROM profiles WHERE user_id = user_uuid),
    'project_runs', (SELECT json_agg(row_to_json(project_runs.*)) FROM project_runs WHERE user_id = user_uuid),
    'user_roles', (SELECT json_agg(row_to_json(user_roles.*)) FROM user_roles WHERE user_id = user_uuid),
    'exported_at', now()
  ) INTO user_data;

  RETURN user_data;
END;
$function$;

-- 4. Fix delete_user_data function to add proper authentication
CREATE OR REPLACE FUNCTION public.delete_user_data(user_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Critical Security Fix: Require authentication and proper authorization
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Only allow users to delete their own data or admins to delete any data
  IF auth.uid() != user_uuid AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot delete data for other users';
  END IF;

  -- Delete user data in correct order (respecting foreign keys)
  DELETE FROM public.project_runs WHERE user_id = user_uuid;
  DELETE FROM public.user_roles WHERE user_id = user_uuid;
  DELETE FROM public.profiles WHERE user_id = user_uuid;

  RETURN 'User data deleted successfully';
END;
$function$;