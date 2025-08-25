-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

-- Create policies for project photos
CREATE POLICY "Users can upload their own project photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view project photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-photos');

CREATE POLICY "Users can update their own project photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own project photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-photos' AND auth.uid()::text = (storage.foldername(name))[1]);