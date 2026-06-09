-- Teaching comments and likes
CREATE TABLE IF NOT EXISTS public.teaching_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teaching_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.teaching_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read teaching comments" ON public.teaching_comments;
CREATE POLICY "Anyone can read teaching comments"
  ON public.teaching_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can post teaching comments" ON public.teaching_comments;
CREATE POLICY "Authenticated users can post teaching comments"
  ON public.teaching_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own teaching comments" ON public.teaching_comments;
CREATE POLICY "Users can delete own teaching comments"
  ON public.teaching_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete any teaching comment" ON public.teaching_comments;
CREATE POLICY "Admins can delete any teaching comment"
  ON public.teaching_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_teaching_comments_teaching_id ON public.teaching_comments(teaching_id);
CREATE INDEX IF NOT EXISTS idx_teaching_comments_created_at ON public.teaching_comments(created_at DESC);

CREATE TABLE IF NOT EXISTS public.teaching_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teaching_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (teaching_id, user_id)
);

ALTER TABLE public.teaching_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read teaching likes" ON public.teaching_likes;
CREATE POLICY "Anyone can read teaching likes"
  ON public.teaching_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like teaching posts" ON public.teaching_likes;
CREATE POLICY "Authenticated users can like teaching posts"
  ON public.teaching_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own teaching like" ON public.teaching_likes;
CREATE POLICY "Users can remove own teaching like"
  ON public.teaching_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can remove any teaching like" ON public.teaching_likes;
CREATE POLICY "Admins can remove any teaching like"
  ON public.teaching_likes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_teaching_likes_teaching_id ON public.teaching_likes(teaching_id);
CREATE INDEX IF NOT EXISTS idx_teaching_likes_user_id ON public.teaching_likes(user_id);
