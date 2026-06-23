-- Add carousel slide metadata to home_settings
ALTER TABLE public.home_settings
  ADD COLUMN IF NOT EXISTS carousel_slides JSONB NOT NULL DEFAULT '[]'::jsonb;
