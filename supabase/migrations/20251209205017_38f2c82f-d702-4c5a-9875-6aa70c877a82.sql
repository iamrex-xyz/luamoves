-- Update RLS policy for moving_documents to allow collaborators to view documents
DROP POLICY IF EXISTS "Users can view their own document metadata" ON public.moving_documents;

CREATE POLICY "Users can view own and shared documents" 
ON public.moving_documents 
FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR (auth.uid() IN (
    SELECT mc.collaborator_user_id
    FROM moving_collaborators mc
    WHERE mc.owner_user_id = moving_documents.user_id 
    AND mc.collaborator_user_id IS NOT NULL
  ))
  OR (auth.uid() IN (
    SELECT mc.owner_user_id
    FROM moving_collaborators mc
    WHERE mc.collaborator_user_id = moving_documents.user_id
  ))
);

-- Also update storage policies to allow collaborators to download files
DROP POLICY IF EXISTS "Users can download their own documents" ON storage.objects;

CREATE POLICY "Users can download own and shared documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'moving_documents' 
  AND (
    (auth.uid()::text = (storage.foldername(name))[1])
    OR (auth.uid() IN (
      SELECT mc.collaborator_user_id
      FROM moving_collaborators mc
      WHERE mc.owner_user_id::text = (storage.foldername(name))[1]
      AND mc.collaborator_user_id IS NOT NULL
    ))
    OR (auth.uid() IN (
      SELECT mc.owner_user_id
      FROM moving_collaborators mc
      WHERE mc.collaborator_user_id::text = (storage.foldername(name))[1]
    ))
  )
);

-- Ensure users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;

CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'moving_documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure users can delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'moving_documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);