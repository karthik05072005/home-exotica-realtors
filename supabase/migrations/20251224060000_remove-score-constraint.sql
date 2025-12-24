-- Remove the score check constraint from leads table
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_score_check;

-- Also drop the score column if it exists
ALTER TABLE public.leads DROP COLUMN IF EXISTS score;
