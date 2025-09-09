-- Check and fix storage policies for project-photos bucket

-- First, ensure the project-photos bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for AI repair photo uploads
CREATE POLICY "Allow authenticated users to upload AI repair photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-photos' 
  AND auth.role() = 'authenticated'
  AND starts_with(name, 'ai-repair/')
);

CREATE POLICY "Allow authenticated users to view AI repair photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'project-photos' 
  AND starts_with(name, 'ai-repair/')
);

CREATE POLICY "Allow users to delete their own AI repair photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'project-photos' 
  AND auth.role() = 'authenticated'
  AND starts_with(name, 'ai-repair/')
);