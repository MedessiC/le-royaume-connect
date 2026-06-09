-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  country TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT testimonials_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 500)
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT DEFAULT 'En savoir plus',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT stories_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 100),
  CONSTRAINT stories_description_length CHECK (char_length(description) <= 500)
);

-- Create indexes
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_order ON testimonials(order_index);
CREATE INDEX idx_stories_active ON stories(is_active);
CREATE INDEX idx_stories_order ON stories(order_index);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Allow anyone to view featured testimonials" ON testimonials
  FOR SELECT USING (is_featured = true);

CREATE POLICY "Allow admins to view all testimonials" ON testimonials
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admins to insert testimonials" ON testimonials
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admins to update testimonials" ON testimonials
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admins to delete testimonials" ON testimonials
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create policies for stories
CREATE POLICY "Allow anyone to view active stories" ON stories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admins to view all stories" ON stories
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admins to insert stories" ON stories
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admins to update stories" ON stories
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow admins to delete stories" ON stories
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
