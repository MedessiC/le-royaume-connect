-- Community discussion messages
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by everyone"
  ON public.community_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post messages"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON public.community_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any message"
  ON public.community_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at DESC);

-- Storage bucket for teaching media (images + video)
INSERT INTO storage.buckets (id, name, public)
VALUES ('teaching-media', 'teaching-media', true);

CREATE POLICY "Teaching media publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'teaching-media');

CREATE POLICY "Admins can upload teaching media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'teaching-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update teaching media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'teaching-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete teaching media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'teaching-media' AND public.has_role(auth.uid(), 'admin'));

-- Add media columns to teachings (video + slug for pretty URLs)
ALTER TABLE public.teachings
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teachings_slug ON public.teachings(slug) WHERE slug IS NOT NULL;