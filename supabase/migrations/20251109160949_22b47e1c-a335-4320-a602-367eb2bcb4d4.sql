-- Create moving_collaborators table to allow sharing moving with partners/housemates
CREATE TABLE public.moving_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborator_email TEXT NOT NULL,
  collaborator_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_user_id, collaborator_email)
);

-- Add assigned_to column to tasks to assign tasks to specific people
ALTER TABLE public.tasks ADD COLUMN assigned_to UUID REFERENCES auth.users(id);

-- Enable RLS on moving_collaborators
ALTER TABLE public.moving_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for moving_collaborators
CREATE POLICY "Users can view their own collaborations"
ON public.moving_collaborators FOR SELECT
USING (
  auth.uid() = owner_user_id 
  OR 
  auth.uid() = collaborator_user_id
);

CREATE POLICY "Users can manage their own collaborators"
ON public.moving_collaborators FOR ALL
USING (auth.uid() = owner_user_id);

-- Update tasks policies to allow collaborators access
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own and shared tasks"
ON public.tasks FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT collaborator_user_id 
    FROM public.moving_collaborators
    WHERE owner_user_id = tasks.user_id
    AND collaborator_user_id IS NOT NULL
  )
  OR
  auth.uid() = assigned_to
);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own and assigned tasks"
ON public.tasks FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT collaborator_user_id 
    FROM public.moving_collaborators
    WHERE owner_user_id = tasks.user_id
    AND collaborator_user_id IS NOT NULL
  )
  OR
  auth.uid() = assigned_to
);

DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
CREATE POLICY "Users can create their own and shared moving tasks"
ON public.tasks FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT collaborator_user_id 
    FROM public.moving_collaborators
    WHERE owner_user_id = user_id
    AND collaborator_user_id IS NOT NULL
  )
);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own and shared moving tasks"
ON public.tasks FOR DELETE
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT collaborator_user_id 
    FROM public.moving_collaborators
    WHERE owner_user_id = tasks.user_id
    AND collaborator_user_id IS NOT NULL
  )
);