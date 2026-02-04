-- Add task_id column to moving_documents table for linking documents to tasks
ALTER TABLE public.moving_documents 
ADD COLUMN task_id text DEFAULT NULL;

-- Create index for efficient lookup by task_id
CREATE INDEX idx_moving_documents_task_id ON public.moving_documents(task_id);

-- Create composite index for user + task lookups
CREATE INDEX idx_moving_documents_user_task ON public.moving_documents(user_id, task_id);