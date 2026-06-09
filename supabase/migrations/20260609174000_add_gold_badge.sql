-- Add gold badge support to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_gold_badge BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_has_gold_badge ON public.profiles(has_gold_badge);

-- Create security definer function for admins to update gold badge
CREATE OR REPLACE FUNCTION public.update_user_gold_badge(target_user_id UUID, should_have_badge BOOLEAN)
RETURNS VOID AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update gold badges';
  END IF;

  -- Update the target user's gold badge status
  UPDATE public.profiles
  SET has_gold_badge = should_have_badge
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_gold_badge(UUID, BOOLEAN) TO authenticated;
