-- Create chat messages table for collaborators
CREATE TABLE public.collaborator_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaborator_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view messages if they are the owner or a collaborator
CREATE POLICY "Users can view messages if they are owner or collaborator"
ON public.collaborator_messages
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() IN (
    SELECT collaborator_user_id 
    FROM moving_collaborators 
    WHERE owner_user_id = collaborator_messages.user_id 
    AND collaborator_user_id IS NOT NULL
  )
  OR auth.uid() IN (
    SELECT owner_user_id 
    FROM moving_collaborators 
    WHERE collaborator_user_id = collaborator_messages.user_id
  )
);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
ON public.collaborator_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
ON public.collaborator_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.collaborator_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborator_messages;