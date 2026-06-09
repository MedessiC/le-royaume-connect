-- Create avatars bucket for user profile pictures
-- This migration creates the storage bucket and configures all RLS policies

-- Insert the avatars bucket
INSERT INTO storage.buckets (id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'avatars',
  'avatars',
  NULL,
  true,
  false,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[],
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow public read access to all avatar images
CREATE POLICY "Allow public read on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their own avatars
CREATE POLICY "Allow authenticated update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their own avatars
CREATE POLICY "Allow authenticated delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
