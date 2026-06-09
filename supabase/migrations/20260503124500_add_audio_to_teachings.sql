ALTER TABLE public.teachings
  ADD COLUMN IF NOT EXISTS audio_url TEXT;
