-- Create variation attributes table
CREATE TABLE public.variation_attributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., "blade_size", "power_source", "brand"
  display_name TEXT NOT NULL, -- e.g., "Blade Size", "Power Source", "Brand"  
  attribute_type TEXT NOT NULL DEFAULT 'text', -- text, number, boolean
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create variation attribute values table
CREATE TABLE public.variation_attribute_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attribute_id UUID NOT NULL REFERENCES public.variation_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  display_value TEXT NOT NULL, -- e.g., "10 inch", "Corded", "DeWalt"
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attribute_id, value)
);

-- Create variation instances table (specific tool/material variations)
CREATE TABLE public.variation_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  core_item_id UUID NOT NULL, -- References tools.id or materials.id
  item_type TEXT NOT NULL CHECK (item_type IN ('tools', 'materials')),
  name TEXT NOT NULL, -- Generated name like "10-inch Corded DeWalt Miter Saw"
  description TEXT,
  sku TEXT, -- Optional SKU/model number
  attributes JSONB NOT NULL DEFAULT '{}', -- {"blade_size": "10_inch", "power_source": "corded", "brand": "dewalt"}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(core_item_id, item_type, attributes)
);

-- Enable RLS on all new tables
ALTER TABLE public.variation_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_instances ENABLE ROW LEVEL SECURITY;

-- Create policies for variation_attributes
CREATE POLICY "Everyone can view variation attributes" 
ON public.variation_attributes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage variation attributes" 
ON public.variation_attributes 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create policies for variation_attribute_values
CREATE POLICY "Everyone can view variation attribute values" 
ON public.variation_attribute_values 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage variation attribute values" 
ON public.variation_attribute_values 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create policies for variation_instances
CREATE POLICY "Everyone can view variation instances" 
ON public.variation_instances 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage variation instances" 
ON public.variation_instances 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_variation_attributes_updated_at
  BEFORE UPDATE ON public.variation_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variation_attribute_values_updated_at
  BEFORE UPDATE ON public.variation_attribute_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variation_instances_updated_at
  BEFORE UPDATE ON public.variation_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_variation_attribute_values_attribute_id ON public.variation_attribute_values(attribute_id);
CREATE INDEX idx_variation_instances_core_item ON public.variation_instances(core_item_id, item_type);
CREATE INDEX idx_variation_instances_attributes ON public.variation_instances USING GIN(attributes);