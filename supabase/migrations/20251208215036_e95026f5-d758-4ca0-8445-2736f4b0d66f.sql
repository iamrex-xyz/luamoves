-- Fix: Restrict email visibility in moving_collaborators to only the owner
-- Collaborators should only see the collaboration record, not others' email addresses

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own collaborations" ON public.moving_collaborators;

-- Create a more restrictive SELECT policy
-- Owner can see all their collaborations (with emails)
-- Collaborators can only see collaborations where they are the accepted collaborator
CREATE POLICY "Users can view their own collaborations"
ON public.moving_collaborators
FOR SELECT
USING (
  auth.uid() = owner_user_id 
  OR (auth.uid() = collaborator_user_id AND collaborator_user_id IS NOT NULL)
);