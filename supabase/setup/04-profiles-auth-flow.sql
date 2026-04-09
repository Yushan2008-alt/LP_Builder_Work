/*
 * Profiles setup for magic-link onboarding flow.
 * - Stores has_password and tier baseline
 * - Secures tier from manual user changes
 * - Auto creates profile on auth.users insert
 */

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_password BOOLEAN NOT NULL DEFAULT FALSE,
  tier TEXT NOT NULL DEFAULT 'baseline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_tier_allowed CHECK (tier IN ('baseline', 'pro', 'enterprise'))
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.profiles_enforce_rules()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  IF OLD.tier IS DISTINCT FROM NEW.tier AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'tier cannot be changed by non-service role';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_enforce_rules ON public.profiles;
CREATE TRIGGER trigger_profiles_enforce_rules
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_enforce_rules();

CREATE OR REPLACE FUNCTION public.auto_create_profile_baseline()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, has_password, tier)
  VALUES (NEW.id, FALSE, 'baseline')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_profile_baseline ON auth.users;
CREATE TRIGGER trigger_auto_create_profile_baseline
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_profile_baseline();

INSERT INTO public.profiles (user_id, has_password, tier)
SELECT id, FALSE, 'baseline'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
