-- Add carousel images to home_settings
ALTER TABLE public.home_settings
  ADD COLUMN IF NOT EXISTS carousel_images TEXT[] NOT NULL DEFAULT '{}'::text[];
