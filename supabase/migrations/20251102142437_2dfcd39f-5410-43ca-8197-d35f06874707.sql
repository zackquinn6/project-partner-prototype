-- Create task_shopping_list table for tracking materials needed for tasks
CREATE TABLE public.task_shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.home_tasks(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_task_shopping_list_user_id ON public.task_shopping_list(user_id);
CREATE INDEX idx_task_shopping_list_task_id ON public.task_shopping_list(task_id);

-- Enable RLS
ALTER TABLE public.task_shopping_list ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own shopping list items" 
  ON public.task_shopping_list 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping list items" 
  ON public.task_shopping_list 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items" 
  ON public.task_shopping_list 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items" 
  ON public.task_shopping_list 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_task_shopping_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_shopping_list_updated_at
BEFORE UPDATE ON public.task_shopping_list
FOR EACH ROW
EXECUTE FUNCTION public.update_task_shopping_list_updated_at();