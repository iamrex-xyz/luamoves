-- Create task_deadlines table to store custom deadlines for generated tasks
CREATE TABLE public.task_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE public.task_deadlines ENABLE ROW LEVEL SECURITY;

-- Policies for task_deadlines
CREATE POLICY "Users can view their own task deadlines"
ON public.task_deadlines FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT collaborator_user_id 
    FROM public.moving_collaborators mc
    WHERE mc.owner_user_id = task_deadlines.user_id
    AND mc.collaborator_user_id IS NOT NULL
  )
);

CREATE POLICY "Users can create their own task deadlines"
ON public.task_deadlines FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task deadlines"
ON public.task_deadlines FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task deadlines"
ON public.task_deadlines FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_task_deadlines_updated_at
BEFORE UPDATE ON public.task_deadlines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();