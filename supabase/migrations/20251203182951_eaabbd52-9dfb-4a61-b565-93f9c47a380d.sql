-- Create reminder preferences table
CREATE TABLE public.reminder_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own reminder preferences"
ON public.reminder_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder preferences"
ON public.reminder_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder preferences"
ON public.reminder_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Create scheduled reminders table
CREATE TABLE public.scheduled_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email_7_days', 'email_2_days', 'push_deadline', 'in_app')),
  scheduled_for DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own scheduled reminders"
ON public.scheduled_reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled reminders"
ON public.scheduled_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled reminders"
ON public.scheduled_reminders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled reminders"
ON public.scheduled_reminders FOR DELETE
USING (auth.uid() = user_id);

-- Create task reminder disabled table (per-task opt-out)
CREATE TABLE public.task_reminder_disabled (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE public.task_reminder_disabled ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own disabled reminders"
ON public.task_reminder_disabled FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disabled reminders"
ON public.task_reminder_disabled FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disabled reminders"
ON public.task_reminder_disabled FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_reminder_preferences_updated_at
BEFORE UPDATE ON public.reminder_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_reminders_updated_at
BEFORE UPDATE ON public.scheduled_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();