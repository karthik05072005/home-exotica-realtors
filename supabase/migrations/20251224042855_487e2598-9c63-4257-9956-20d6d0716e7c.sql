-- Rename alternate_phone to whatsapp_number in customers table
ALTER TABLE public.customers RENAME COLUMN alternate_phone TO whatsapp_number;

-- Add new fields to leads table for tenant requirements
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS visit_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS visit_time TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS property_category TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS possession_from TEXT DEFAULT NULL;