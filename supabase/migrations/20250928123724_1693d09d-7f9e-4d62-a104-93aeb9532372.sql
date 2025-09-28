-- Fix the RLS policy to match the frontend expectations
DROP POLICY IF EXISTS "Active projects are viewable by everyone" ON public.projects;

CREATE POLICY "Everyone can view published and beta projects" 
ON public.projects 
FOR SELECT 
USING (publish_status IN ('published', 'beta-testing'));