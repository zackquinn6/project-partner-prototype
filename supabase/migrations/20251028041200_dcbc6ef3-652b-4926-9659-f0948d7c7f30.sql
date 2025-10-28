-- Drop the old role check constraint that only allows 'admin' and 'user'
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Add new role check constraint that includes 'project_owner'
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'user', 'project_owner'));