-- Create new "High Heights" warning flag and apply to all Ladder variants

-- Create the new warning flag
INSERT INTO public.warning_flags (name, description, icon_class, color_class, is_predefined)
VALUES (
  'High Heights',
  'Warning: This tool involves working at significant heights. Use proper fall protection equipment and follow safety protocols.',
  'triangle-alert',
  'text-red-500',
  true
);

-- Apply the warning flag to all Ladder tool variants
WITH ladder_tool AS (
  SELECT id FROM public.tools WHERE item = 'Ladder'
),
high_heights_flag AS (
  SELECT id FROM public.warning_flags WHERE name = 'High Heights'
),
ladder_variants AS (
  SELECT vi.id as variation_instance_id
  FROM public.variation_instances vi
  JOIN ladder_tool lt ON vi.core_item_id = lt.id
  WHERE vi.item_type = 'tools'
)
INSERT INTO public.variation_warning_flags (variation_instance_id, warning_flag_id)
SELECT lv.variation_instance_id, hhf.id
FROM ladder_variants lv
CROSS JOIN high_heights_flag hhf
ON CONFLICT (variation_instance_id, warning_flag_id) DO NOTHING;