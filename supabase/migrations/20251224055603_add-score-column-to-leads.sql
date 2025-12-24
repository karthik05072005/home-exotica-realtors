-- Add score column to leads table with a check constraint
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Add the check constraint that was causing the error
ALTER TABLE public.leads 
ADD CONSTRAINT leads_score_check 
CHECK (score >= 0 AND score <= 100);