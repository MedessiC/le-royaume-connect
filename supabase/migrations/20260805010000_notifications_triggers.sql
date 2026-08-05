-- ============================================================
-- Fix: Notifications RLS policies and automatic triggers
-- ============================================================

-- 1. Fix RLS policy to allow authenticated users to insert notifications if they are the actor (actor_id = auth.uid()) OR if SECURITY DEFINER is used.
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications for actors"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id OR auth.uid() = user_id);

-- 2. Create Security Definer helper function to safely create notifications from any source/trigger
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_href TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Do not notify self
  IF p_user_id IS NOT NULL AND (p_actor_id IS NULL OR p_user_id <> p_actor_id) THEN
    INSERT INTO public.notifications (user_id, actor_id, type, title, message, href)
    VALUES (p_user_id, p_actor_id, p_type, p_title, p_message, p_href);
  END IF;
END;
$$;

-- 3. Automatic Trigger: Comment on Teaching -> Notify teaching author
CREATE OR REPLACE FUNCTION public.trg_notify_on_teaching_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teaching_title TEXT;
  v_author_id UUID;
  v_actor_name TEXT;
BEGIN
  -- Get teaching details
  SELECT title, author_id INTO v_teaching_title, v_author_id
  FROM public.teachings
  WHERE id = NEW.teaching_id;

  -- Get actor name
  SELECT COALESCE(full_name, 'Un membre') INTO v_actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- If it's a reply to a comment, notify parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    DECLARE
      v_parent_user_id UUID;
    BEGIN
      SELECT user_id INTO v_parent_user_id
      FROM public.teaching_comments
      WHERE id = NEW.parent_id;

      IF v_parent_user_id IS NOT NULL AND v_parent_user_id <> NEW.user_id THEN
        PERFORM public.create_notification(
          v_parent_user_id,
          NEW.user_id,
          'reply',
          v_actor_name || ' a répondu à votre commentaire',
          left(NEW.content, 120),
          '/teachings/' || NEW.teaching_id
        );
      END IF;
    END;
  END IF;

  -- Notify teaching author (if different from commenter and not already notified as parent)
  IF v_author_id IS NOT NULL AND v_author_id <> NEW.user_id THEN
    PERFORM public.create_notification(
      v_author_id,
      NEW.user_id,
      'comment',
      v_actor_name || ' a commenté votre enseignement "' || left(v_teaching_title, 30) || '"',
      left(NEW.content, 120),
      '/teachings/' || NEW.teaching_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_teaching_comment_created ON public.teaching_comments;
CREATE TRIGGER on_teaching_comment_created
  AFTER INSERT ON public.teaching_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_teaching_comment();

-- 4. Automatic Trigger: New Teaching Published -> Notify all members
CREATE OR REPLACE FUNCTION public.trg_notify_on_teaching_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger only when published changes from false to true OR newly inserted as published = true
  IF (TG_OP = 'INSERT' AND NEW.published = true) OR (TG_OP = 'UPDATE' AND OLD.published = false AND NEW.published = true) THEN
    INSERT INTO public.notifications (user_id, actor_id, type, title, message, href)
    SELECT
      p.id AS user_id,
      NEW.author_id AS actor_id,
      'teaching' AS type,
      'Nouvel enseignement : ' || NEW.title AS title,
      COALESCE(NEW.excerpt, 'Un nouvel enseignement est disponible.'),
      '/teachings/' || NEW.id AS href
    FROM public.profiles p
    WHERE p.id <> COALESCE(NEW.author_id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_teaching_published ON public.teachings;
CREATE TRIGGER on_teaching_published
  AFTER INSERT OR UPDATE ON public.teachings
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_teaching_published();

-- 5. Automatic Trigger: Like on Teaching -> Notify author
CREATE OR REPLACE FUNCTION public.trg_notify_on_teaching_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
  v_title TEXT;
  v_actor_name TEXT;
BEGIN
  SELECT author_id, title INTO v_author_id, v_title
  FROM public.teachings
  WHERE id = NEW.teaching_id;

  SELECT COALESCE(full_name, 'Un membre') INTO v_actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF v_author_id IS NOT NULL AND v_author_id <> NEW.user_id THEN
    PERFORM public.create_notification(
      v_author_id,
      NEW.user_id,
      'like',
      v_actor_name || ' aime votre enseignement',
      v_title,
      '/teachings/' || NEW.teaching_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_teaching_like_created ON public.teaching_likes;
CREATE TRIGGER on_teaching_like_created
  AFTER INSERT ON public.teaching_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_teaching_like();
