-- Migration: add video_thumbnail_url to teachings
-- Adds an optional text column to store an explicit video thumbnail URL

BEGIN;

ALTER TABLE public.teachings
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text;

COMMIT;
