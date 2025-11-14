-- Add quantity field to task_shopping_list table
ALTER TABLE public.task_shopping_list
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

-- Update existing rows to have quantity of 1
UPDATE public.task_shopping_list
SET quantity = 1
WHERE quantity IS NULL;

