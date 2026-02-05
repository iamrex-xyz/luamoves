-- Add anonymous_user_id to tables that need to support anonymous users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS anonymous_user_id TEXT;

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS anonymous_user_id TEXT;

ALTER TABLE public.collaborator_messages 
ADD COLUMN IF NOT EXISTS anonymous_user_id TEXT;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous_user_id ON public.profiles(anonymous_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_anonymous_user_id ON public.tasks(anonymous_user_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_messages_anonymous_user_id ON public.collaborator_messages(anonymous_user_id);

-- Update RLS policies to allow anonymous users to access their own data
-- Profiles: Allow anonymous users to read/write their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (anonymous_user_id IS NOT NULL AND anonymous_user_id = current_setting('request.headers', true)::json->>'x-anonymous-user-id')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (anonymous_user_id IS NOT NULL AND anonymous_user_id = current_setting('request.headers', true)::json->>'x-anonymous-user-id')
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR anonymous_user_id IS NOT NULL
  );

-- Tasks: Allow anonymous users to manage their own tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (anonymous_user_id IS NOT NULL AND anonymous_user_id = current_setting('request.headers', true)::json->>'x-anonymous-user-id')
  );

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR anonymous_user_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (anonymous_user_id IS NOT NULL AND anonymous_user_id = current_setting('request.headers', true)::json->>'x-anonymous-user-id')
  );

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (anonymous_user_id IS NOT NULL AND anonymous_user_id = current_setting('request.headers', true)::json->>'x-anonymous-user-id')
  );

-- Create function to merge anonymous user data to authenticated user
CREATE OR REPLACE FUNCTION public.merge_anonymous_to_user(
  p_anonymous_user_id TEXT,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update profiles: merge anonymous profile data into authenticated user's profile
  UPDATE public.profiles AS target
  SET 
    phone = COALESCE(target.phone, source.phone),
    moving_date = COALESCE(target.moving_date, source.moving_date),
    old_address = COALESCE(target.old_address, source.old_address),
    new_address = COALESCE(target.new_address, source.new_address),
    adults = COALESCE(target.adults, source.adults),
    children = COALESCE(target.children, source.children),
    pets = COALESCE(target.pets, source.pets),
    home_size_m2 = COALESCE(target.home_size_m2, source.home_size_m2),
    housing_property_type = COALESCE(target.housing_property_type, source.housing_property_type),
    current_housing_situation = COALESCE(target.current_housing_situation, source.current_housing_situation),
    has_garden = COALESCE(target.has_garden, source.has_garden),
    has_parking = COALESCE(target.has_parking, source.has_parking),
    municipality = COALESCE(target.municipality, source.municipality),
    updated_at = now()
  FROM public.profiles AS source
  WHERE target.user_id = p_user_id
    AND source.anonymous_user_id = p_anonymous_user_id;
  
  -- Delete the anonymous profile after merge
  DELETE FROM public.profiles WHERE anonymous_user_id = p_anonymous_user_id;
  
  -- Transfer tasks from anonymous to authenticated user
  UPDATE public.tasks 
  SET user_id = p_user_id, anonymous_user_id = NULL
  WHERE anonymous_user_id = p_anonymous_user_id;
  
  -- Transfer chat messages from anonymous to authenticated user
  UPDATE public.collaborator_messages 
  SET user_id = p_user_id, anonymous_user_id = NULL
  WHERE anonymous_user_id = p_anonymous_user_id;
END;
$$;