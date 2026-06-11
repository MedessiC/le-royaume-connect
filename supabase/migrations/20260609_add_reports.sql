-- Create reports table for content moderation
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'teaching', 'comment', 'user', 'profile'
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'misinformation', 'other'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content_type ON public.reports(content_type);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own reports
CREATE POLICY "Allow users view own reports"
ON public.reports FOR SELECT
USING (auth.uid() = reporter_id OR auth.jwt() ->> 'user_role' = 'admin');

-- Allow authenticated users to insert reports
CREATE POLICY "Allow authenticated insert reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Allow admins to update reports status
CREATE POLICY "Allow admins update reports"
ON public.reports FOR UPDATE
USING (auth.jwt() ->> 'user_role' = 'admin')
WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

-- Add reported_count to teachings
ALTER TABLE public.teachings
ADD COLUMN IF NOT EXISTS reported_count INT DEFAULT 0;

-- Add reported_count to comments
ALTER TABLE public.teaching_comments
ADD COLUMN IF NOT EXISTS reported_count INT DEFAULT 0;

-- Add is_reported to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS reported_count INT DEFAULT 0;
