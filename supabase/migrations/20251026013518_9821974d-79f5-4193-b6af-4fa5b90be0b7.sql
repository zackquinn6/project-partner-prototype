-- Create home_details table to store Zillow synced data
CREATE TABLE public.home_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  home_age INTEGER,
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  zillow_url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(home_id)
);

-- Enable RLS on home_details
ALTER TABLE public.home_details ENABLE ROW LEVEL SECURITY;

-- Create policies for home_details
CREATE POLICY "Users can view their own home details"
  ON public.home_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_details.home_id
      AND homes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own home details"
  ON public.home_details
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_details.home_id
      AND homes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own home details"
  ON public.home_details
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_details.home_id
      AND homes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own home details"
  ON public.home_details
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_details.home_id
      AND homes.user_id = auth.uid()
    )
  );

-- Create home_spaces table to store room/space segments
CREATE TABLE public.home_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  space_name TEXT NOT NULL,
  space_type TEXT NOT NULL DEFAULT 'custom',
  floor_plan_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on home_spaces
ALTER TABLE public.home_spaces ENABLE ROW LEVEL SECURITY;

-- Create policies for home_spaces
CREATE POLICY "Users can view their own home spaces"
  ON public.home_spaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_spaces.home_id
      AND homes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own home spaces"
  ON public.home_spaces
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_spaces.home_id
      AND homes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own home spaces"
  ON public.home_spaces
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_spaces.home_id
      AND homes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own home spaces"
  ON public.home_spaces
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.homes
      WHERE homes.id = home_spaces.home_id
      AND homes.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at on home_details
CREATE TRIGGER update_home_details_updated_at
  BEFORE UPDATE ON public.home_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on home_spaces
CREATE TRIGGER update_home_spaces_updated_at
  BEFORE UPDATE ON public.home_spaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();