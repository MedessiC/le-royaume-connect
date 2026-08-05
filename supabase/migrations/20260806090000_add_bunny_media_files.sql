CREATE TABLE IF NOT EXISTS public.bunny_media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL UNIQUE,
  file_name TEXT,
  mime_type TEXT,
  video_id TEXT NOT NULL,
  library_id TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bunny_media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to manage bunny media files"
ON public.bunny_media_files
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "Allow authenticated users to read bunny media files"
ON public.bunny_media_files
FOR SELECT
USING (auth.uid() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bunny_media_files TO authenticated, service_role;
