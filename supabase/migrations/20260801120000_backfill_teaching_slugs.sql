-- Give every published teaching a stable, readable URL slug.
CREATE OR REPLACE FUNCTION public.make_teaching_slug(input_title TEXT, teaching_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  suffix INTEGER := 2;
BEGIN
  base_slug := lower(input_title);
  base_slug := translate(base_slug, 'àáâäãåæçèéêëìíîïñòóôöõœùúûüýÿ', 'aaaaaaeceeeeiiiinooooouuuuyy');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '(^-|-$)', '', 'g');

  IF base_slug = '' THEN
    base_slug := 'enseignement';
  END IF;

  candidate := left(base_slug, 80);

  WHILE EXISTS (
    SELECT 1
    FROM public.teachings
    WHERE slug = candidate AND id <> teaching_id
  ) LOOP
    candidate := left(base_slug, 76) || '-' || suffix::TEXT;
    suffix := suffix + 1;
  END LOOP;

  RETURN candidate;
END;
$$;

DO $$
DECLARE
  teaching_record RECORD;
BEGIN
  FOR teaching_record IN
    SELECT id, title
    FROM public.teachings
    WHERE slug IS NULL OR slug = ''
    ORDER BY created_at, id
  LOOP
    UPDATE public.teachings
    SET slug = public.make_teaching_slug(teaching_record.title, teaching_record.id)
    WHERE id = teaching_record.id;
  END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS teachings_set_slug ON public.teachings;
CREATE OR REPLACE FUNCTION public.set_teaching_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.make_teaching_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER teachings_set_slug
BEFORE INSERT OR UPDATE OF title, slug ON public.teachings
FOR EACH ROW
EXECUTE FUNCTION public.set_teaching_slug();
