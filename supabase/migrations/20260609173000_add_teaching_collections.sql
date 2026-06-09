-- Teaching collections and saved teachings
CREATE TABLE IF NOT EXISTS public.teaching_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (user_id, name)
);

ALTER TABLE public.teaching_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their teaching collections" ON public.teaching_collections;
CREATE POLICY "Users can read their teaching collections"
  ON public.teaching_collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create teaching collections" ON public.teaching_collections;
CREATE POLICY "Users can create teaching collections"
  ON public.teaching_collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their teaching collections" ON public.teaching_collections;
CREATE POLICY "Users can update their teaching collections"
  ON public.teaching_collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their teaching collections" ON public.teaching_collections;
CREATE POLICY "Users can delete their teaching collections"
  ON public.teaching_collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.teaching_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL,
  teaching_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (collection_id) REFERENCES public.teaching_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (teaching_id) REFERENCES public.teachings(id) ON DELETE CASCADE,
  UNIQUE (collection_id, teaching_id)
);

ALTER TABLE public.teaching_collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their teaching collection items" ON public.teaching_collection_items;
CREATE POLICY "Users can read their teaching collection items"
  ON public.teaching_collection_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teaching_collections c
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can add teaching collection items" ON public.teaching_collection_items;
CREATE POLICY "Users can add teaching collection items"
  ON public.teaching_collection_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.teaching_collections c
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their teaching collection items" ON public.teaching_collection_items;
CREATE POLICY "Users can delete their teaching collection items"
  ON public.teaching_collection_items FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teaching_collections c
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_teaching_collection_items_teaching_id ON public.teaching_collection_items(teaching_id);
CREATE INDEX IF NOT EXISTS idx_teaching_collection_items_collection_id ON public.teaching_collection_items(collection_id);
