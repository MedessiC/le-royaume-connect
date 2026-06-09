-- Add reply support to community discussion messages
ALTER TABLE public.community_messages
  ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE public.community_messages
  DROP CONSTRAINT IF EXISTS fk_community_messages_parent;

ALTER TABLE public.community_messages
  ADD CONSTRAINT fk_community_messages_parent
  FOREIGN KEY (parent_id) REFERENCES public.community_messages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_community_messages_parent_id ON public.community_messages(parent_id);
