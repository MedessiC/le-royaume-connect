-- Ensure leroizovizo@gmail.com is an admin and update the signup trigger to use a default admin list

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_emails text[] := ARRAY['leroizovizo@gmail.com'];
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  IF NEW.email = ANY(admin_emails) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  END IF;

  RETURN NEW;
END; $$;

ALTER FUNCTION public.handle_new_user() SET row_security = off;

-- Grant admin role to any existing user with that email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'leroizovizo@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id AND role = 'admin'
  );
