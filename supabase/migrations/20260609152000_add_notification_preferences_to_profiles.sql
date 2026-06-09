-- Add notification preference flags to user profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notif_news BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_reply BOOLEAN NOT NULL DEFAULT true;

-- Keep profile insert trigger defaults working for new users
-- Existing rows will receive default true for both smart notification flags.
