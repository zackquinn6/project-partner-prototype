-- Fix RLS policies to allow authenticated users to read tools and materials
-- These are reference tables that users need to read but only admins can modify

-- Add SELECT policies for authenticated users on tools table
CREATE POLICY "Authenticated users can view tools" 
ON public.tools 
FOR SELECT 
TO authenticated
USING (true);

-- Add SELECT policies for authenticated users on materials table  
CREATE POLICY "Authenticated users can view materials" 
ON public.materials 
FOR SELECT 
TO authenticated
USING (true);