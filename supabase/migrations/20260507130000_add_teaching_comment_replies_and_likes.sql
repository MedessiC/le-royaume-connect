-- Add parent_id support to teaching comments and create teaching comment likes
ALTER TABLE public.teaching_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'teaching_comments_parent_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'teaching_comments'
  ) THEN
    ALTER TABLE public.teaching_comments
      ADD CONSTRAINT teaching_comments_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES public.teaching_comments(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_teaching_comments_parent_id ON public.teaching_comments(parent_id);

CREATE TABLE IF NOT EXISTS public.teaching_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (comment_id) REFERENCES public.teaching_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (comment_id, user_id)
);

ALTER TABLE public.teaching_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read teaching comment likes" ON public.teaching_comment_likes;
CREATE POLICY "Anyone can read teaching comment likes"
  ON public.teaching_comment_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like teaching comments" ON public.teaching_comment_likes;
CREATE POLICY "Authenticated users can like teaching comments"
  ON public.teaching_comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own teaching comment like" ON public.teaching_comment_likes;
CREATE POLICY "Users can remove own teaching comment like"
  ON public.teaching_comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can remove any teaching comment like" ON public.teaching_comment_likes;
CREATE POLICY "Admins can remove any teaching comment like"
  ON public.teaching_comment_likes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_teaching_comment_likes_comment_id ON public.teaching_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_teaching_comment_likes_user_id ON public.teaching_comment_likes(user_id);
