-- Create home_settings table for homepage configuration
CREATE TABLE IF NOT EXISTS public.home_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT,
  youtube_duration_days INTEGER,
  youtube_expires_at TIMESTAMPTZ,
  youtube_channel_url TEXT,
  tiktok_url TEXT,
  whatsapp_url TEXT,
  facebook_url TEXT,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.home_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Home settings viewable by everyone" ON public.home_settings;
CREATE POLICY "Home settings viewable by everyone"
  ON public.home_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage home settings" ON public.home_settings;
CREATE POLICY "Admins manage home settings"
  ON public.home_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Optional update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_home_settings_updated ON public.home_settings;
CREATE TRIGGER trg_home_settings_updated BEFORE UPDATE ON public.home_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
