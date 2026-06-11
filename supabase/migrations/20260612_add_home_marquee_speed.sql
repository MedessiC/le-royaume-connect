-- Add marquee_speed column to home_settings for homepage announcement banner speed control
ALTER TABLE public.home_settings
ADD COLUMN IF NOT EXISTS marquee_speed INTEGER DEFAULT 22;
