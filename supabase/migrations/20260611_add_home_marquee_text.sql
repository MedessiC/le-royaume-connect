-- Add marquee_text column to home_settings for homepage announcement banner
ALTER TABLE public.home_settings
ADD COLUMN IF NOT EXISTS marquee_text TEXT;
