-- Add photos column to homes table for storing multiple photos
ALTER TABLE public.homes ADD COLUMN photos TEXT[] DEFAULT '{}';

-- Add index for better performance on photos queries
CREATE INDEX idx_homes_photos ON public.homes USING GIN(photos);