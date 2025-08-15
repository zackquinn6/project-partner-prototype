-- Function to add admin role by email (safe if user doesn't exist yet)
CREATE OR REPLACE FUNCTION public.add_admin_by_email(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email in auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user not found, return message
    IF target_user_id IS NULL THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Insert admin role (ignore if already exists)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN 'Admin role added for: ' || user_email;
END;
$$;

-- Add ZackQuinn6@gmail.com as admin
SELECT public.add_admin_by_email('ZackQuinn6@gmail.com');