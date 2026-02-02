-- Add page_route column to store the raw URL path
ALTER TABLE public.soft_launch_feedback 
ADD COLUMN page_route text;

-- Update existing records: if page_or_flow looks like a route, copy it to page_route
UPDATE public.soft_launch_feedback 
SET page_route = page_or_flow 
WHERE page_or_flow IS NOT NULL AND page_or_flow LIKE '/%';

-- For records where page_or_flow is "/" set the label to "Homepage"
UPDATE public.soft_launch_feedback 
SET page_or_flow = 'Homepage' 
WHERE page_or_flow = '/';

-- Add comment for clarity
COMMENT ON COLUMN public.soft_launch_feedback.page_route IS 'Raw URL path where feedback was submitted (e.g., /tasks/meter-standen)';
COMMENT ON COLUMN public.soft_launch_feedback.page_or_flow IS 'Human-readable page label (e.g., Meterstanden noteren)';