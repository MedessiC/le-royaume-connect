-- Create popups table for admin-managed popup content
CREATE TABLE IF NOT EXISTS public.popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  
  -- Display settings
  is_active BOOLEAN DEFAULT true,
  
  -- Frequency & Pages
  frequency_days INTEGER DEFAULT 7, -- Show popup once every N days (0 = always)
  pages JSONB DEFAULT '["all"]'::jsonb, -- ["all"] or specific pages like ["community", "about"]
  
  -- Styling
  bg_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#FFD700',
  animation_type TEXT DEFAULT 'fade', -- fade, slideDown, zoom, bounce
  
  -- Positioning
  position TEXT DEFAULT 'center', -- center, topLeft, topRight, bottomLeft, bottomRight
  
  CONSTRAINT popups_frequency_check CHECK (frequency_days >= 0)
);

-- Enable RLS
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for select (public can view active popups)
CREATE POLICY "Anyone can view active popups"
  ON public.popups
  FOR SELECT
  USING (is_active = true);

-- Create RLS policy for insert/update/delete (admin only - email must contain 'admin')
CREATE POLICY "Only admin can manage popups"
  ON public.popups
  FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%admin%')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%admin%');

-- Create index for active popups
CREATE INDEX IF NOT EXISTS popups_active_idx ON public.popups(is_active);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS popups_created_at_idx ON public.popups(created_at DESC);
