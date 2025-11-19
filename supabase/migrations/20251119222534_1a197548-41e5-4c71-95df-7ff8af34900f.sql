-- Create storage buckets for documents and photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('moving_documents', 'moving_documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('moving_photos', 'moving_photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

-- RLS policies for moving_documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'moving_documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'moving_documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'moving_documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'moving_documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for moving_photos bucket
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'moving_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'moving_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'moving_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'moving_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Budget tracker table
CREATE TABLE public.moving_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.moving_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
ON public.moving_expenses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses"
ON public.moving_expenses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
ON public.moving_expenses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
ON public.moving_expenses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_moving_expenses_updated_at
BEFORE UPDATE ON public.moving_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tips and advice table
CREATE TABLE public.moving_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.moving_tips ENABLE ROW LEVEL SECURITY;

-- Tips are publicly readable
CREATE POLICY "Anyone can view tips"
ON public.moving_tips FOR SELECT
TO authenticated
USING (true);

-- Insert default tips
INSERT INTO public.moving_tips (phase, category, title, content, order_index) VALUES
('Voor de verhuizing', 'Planning', 'Maak een verhuisplanning', 'Begin 8-12 weken voor je verhuizing met plannen. Maak een checklist van alle taken die je moet doen.', 1),
('Voor de verhuizing', 'Administratie', 'Verzamel belangrijke documenten', 'Verzamel alle belangrijke documenten zoals huurcontracten, koopaktes, en energiecontracten op één plek.', 2),
('Voor de verhuizing', 'Budget', 'Maak een verhuisbudget', 'Houd rekening met kosten voor verhuisbedrijf, dozen, verpakkingsmateriaal, en onvoorziene uitgaven.', 3),
('Tijdens de verhuizing', 'Praktisch', 'Label alle dozen duidelijk', 'Schrijf op elke doos in welke kamer deze hoort en wat de inhoud is. Dit bespaart veel tijd bij het uitpakken.', 1),
('Tijdens de verhuizing', 'Meterstanden', 'Noteer meterstanden', 'Maak foto''s van alle meterstanden (gas, water, elektra) in je oude en nieuwe woning.', 2),
('Tijdens de verhuizing', 'Schoonmaak', 'Maak je oude huis schoon', 'Lever je oude woning netjes opgeleverd op. Dit voorkomt discussies over de borgsom.', 3),
('Na de verhuizing', 'Administratie', 'Update je adres overal', 'Vergeet niet je adres te wijzigen bij bank, zorgverzekeraar, werkgever en andere belangrijke instanties.', 1),
('Na de verhuizing', 'Inrichting', 'Pak systematisch uit', 'Begin met de belangrijkste kamers zoals slaapkamer, badkamer en keuken. De rest kan geleidelijk.', 2),
('Na de verhuizing', 'Buurt', 'Maak kennis met de buurt', 'Introduceer jezelf bij de buren en verken de buurt. Zo voel je je sneller thuis.', 3);

-- Document metadata table for better organization
CREATE TABLE public.moving_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.moving_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document metadata"
ON public.moving_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document metadata"
ON public.moving_documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document metadata"
ON public.moving_documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document metadata"
ON public.moving_documents FOR DELETE
TO authenticated
USING (auth.uid() = user_id);