-- Add live button settings to home_settings
ALTER TABLE public.home_settings
  ADD COLUMN IF NOT EXISTS live_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS live_url TEXT NULL;
