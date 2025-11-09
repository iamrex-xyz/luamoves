-- Create custom_tasks table for user-created tasks
CREATE TABLE public.custom_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  deadline DATE NOT NULL,
  phase TEXT NOT NULL DEFAULT 'Eigen taken',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for custom_tasks
CREATE POLICY "Users can view their own custom tasks"
ON public.custom_tasks FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT collaborator_user_id 
    FROM public.moving_collaborators
    WHERE owner_user_id = custom_tasks.user_id
    AND collaborator_user_id IS NOT NULL
  )
);

CREATE POLICY "Users can create their own custom tasks"
ON public.custom_tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom tasks"
ON public.custom_tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom tasks"
ON public.custom_tasks FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_tasks_updated_at
BEFORE UPDATE ON public.custom_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();