-- Add "Loud noise" warning flag for tool and material variants
INSERT INTO public.warning_flags (
  name,
  description,
  icon_class,
  color_class,
  is_predefined,
  created_by
) VALUES (
  'Loud noise',
  'This tool/material produces loud noise that may require hearing protection',
  'volume-x',
  'text-orange-500',
  true,
  auth.uid()
);