-- LiveKit-backed community calls and live streams.

CREATE TABLE IF NOT EXISTS public.community_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group_call', 'live')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'ended')),
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  room_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_community_rooms_updated_at ON public.community_rooms;
CREATE TRIGGER touch_community_rooms_updated_at
BEFORE UPDATE ON public.community_rooms
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_lives_updated_at ON public.lives;
CREATE TRIGGER touch_lives_updated_at
BEFORE UPDATE ON public.lives
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.community_rooms (name, title, type, status)
VALUES ('community-general', 'Discussion générale', 'group_call', 'idle')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.community_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community rooms are public" ON public.community_rooms;
CREATE POLICY "Community rooms are public"
ON public.community_rooms
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated members can update group call rooms" ON public.community_rooms;
CREATE POLICY "Authenticated members can update group call rooms"
ON public.community_rooms
FOR UPDATE
TO authenticated
USING (type = 'group_call')
WITH CHECK (type = 'group_call');

DROP POLICY IF EXISTS "Admins can manage all community rooms" ON public.community_rooms;
CREATE POLICY "Admins can manage all community rooms"
ON public.community_rooms
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated members can read lives" ON public.lives;
CREATE POLICY "Authenticated members can read lives"
ON public.lives
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage lives" ON public.lives;
CREATE POLICY "Admins can manage lives"
ON public.lives
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
