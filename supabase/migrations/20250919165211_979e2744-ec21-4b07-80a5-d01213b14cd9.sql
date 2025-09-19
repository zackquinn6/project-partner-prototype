-- Fix unique constraint on variation_attribute_values to allow same values across different tools
-- Current constraint only checks (attribute_id, value) but should include core_item_id

-- Drop the existing incorrect unique constraint
ALTER TABLE public.variation_attribute_values 
DROP CONSTRAINT variation_attribute_values_attribute_id_value_key;

-- Add the correct unique constraint that includes core_item_id
-- This allows different tools to have the same attribute values (e.g., multiple tools can have "Battery" power source)
-- but prevents duplicate values within the same tool
ALTER TABLE public.variation_attribute_values 
ADD CONSTRAINT variation_attribute_values_attribute_id_value_core_item_unique 
UNIQUE (attribute_id, value, core_item_id);