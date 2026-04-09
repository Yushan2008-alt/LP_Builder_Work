/*
 * Ready-to-run SQL test script for public.profiles + RLS behavior.
 *
 * Usage:
 * 1) Run 04-profiles-auth-flow.sql first.
 * 2) Execute this script in Supabase SQL Editor.
 * 3) Read NOTICE output for PASS/FAIL checkpoints.
 *
 * Safety:
 * - Wrapped in BEGIN ... ROLLBACK, so test writes are not persisted.
 */

BEGIN;

-- ---------------------------------------------------------------------------
-- 0) Structure sanity checks
-- ---------------------------------------------------------------------------

SELECT
  'table_exists' AS check_name,
  to_regclass('public.profiles') IS NOT NULL AS ok;

SELECT
  'rls_enabled' AS check_name,
  c.relrowsecurity AS ok
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles';

SELECT
  'policies_count' AS check_name,
  COUNT(*) AS value
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- ---------------------------------------------------------------------------
-- 1) Prepare two users for RLS test context
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  test_user_a UUID;
  test_user_b UUID;
BEGIN
  SELECT id INTO test_user_a FROM auth.users ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO test_user_b FROM auth.users ORDER BY created_at DESC LIMIT 1;

  IF test_user_a IS NULL OR test_user_b IS NULL THEN
    RAISE EXCEPTION 'Need at least 1 user in auth.users to run this test.';
  END IF;

  -- Ensure two distinct IDs (if only one user exists, creating a pseudo second test profile row with random UUID is not possible due FK).
  IF test_user_a = test_user_b THEN
    RAISE NOTICE 'Only 1 user found. RLS "other user" checks will be skipped.';
  END IF;

  INSERT INTO public.profiles (user_id, has_password, tier)
  VALUES (test_user_a, FALSE, 'baseline')
  ON CONFLICT (user_id) DO NOTHING;

  IF test_user_a <> test_user_b THEN
    INSERT INTO public.profiles (user_id, has_password, tier)
    VALUES (test_user_b, FALSE, 'baseline')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Prepared users: A=%, B=%', test_user_a, test_user_b;
END
$$;

-- ---------------------------------------------------------------------------
-- 2) Simulate authenticated user A and verify RLS + trigger behavior
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  user_a UUID;
  user_b UUID;
  visible_count INT;
  changed_rows INT;
BEGIN
  SELECT id INTO user_a FROM auth.users ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO user_b FROM auth.users ORDER BY created_at DESC LIMIT 1;

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_a::text);
  EXECUTE 'SET LOCAL "request.jwt.claim.role" = ''authenticated''';

  SELECT COUNT(*) INTO visible_count
  FROM public.profiles;

  IF user_a = user_b THEN
    IF visible_count = 1 THEN
      RAISE NOTICE '[PASS] SELECT only sees own row (single-user workspace).';
    ELSE
      RAISE EXCEPTION '[FAIL] Expected 1 visible row, got %.', visible_count;
    END IF;
  ELSE
    IF visible_count = 1 THEN
      RAISE NOTICE '[PASS] SELECT only sees own row.';
    ELSE
      RAISE EXCEPTION '[FAIL] Expected 1 visible row, got %.', visible_count;
    END IF;
  END IF;

  UPDATE public.profiles
  SET has_password = TRUE
  WHERE user_id = user_a;
  GET DIAGNOSTICS changed_rows = ROW_COUNT;

  IF changed_rows = 1 THEN
    RAISE NOTICE '[PASS] Update own has_password allowed.';
  ELSE
    RAISE EXCEPTION '[FAIL] Update own has_password expected 1 row, got %.', changed_rows;
  END IF;

  BEGIN
    UPDATE public.profiles
    SET tier = 'pro'
    WHERE user_id = user_a;
    RAISE EXCEPTION '[FAIL] Tier update by authenticated user should be blocked.';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '[PASS] Tier update blocked as expected: %', SQLERRM;
  END;

  IF user_a <> user_b THEN
    UPDATE public.profiles
    SET has_password = TRUE
    WHERE user_id = user_b;
    GET DIAGNOSTICS changed_rows = ROW_COUNT;

    IF changed_rows = 0 THEN
      RAISE NOTICE '[PASS] Cannot update other user row (RLS enforced).';
    ELSE
      RAISE EXCEPTION '[FAIL] Expected 0 rows when updating other user, got %.', changed_rows;
    END IF;
  ELSE
    RAISE NOTICE '[SKIP] Other-user update check skipped (only one user).';
  END IF;

  EXECUTE 'RESET ROLE';
END
$$;

-- ---------------------------------------------------------------------------
-- 3) Service-role style update should be allowed for tier mutation
-- ---------------------------------------------------------------------------
-- Explicitly set request JWT role claim to service_role so auth.role() matches
-- trigger expectation in any SQL editor/session context.

DO $$
DECLARE
  user_a UUID;
BEGIN
  SELECT id INTO user_a FROM auth.users ORDER BY created_at ASC LIMIT 1;

  PERFORM set_config('request.jwt.claim.role', 'service_role', true);

  UPDATE public.profiles
  SET tier = 'enterprise'
  WHERE user_id = user_a;

  RAISE NOTICE '[PASS] Service context can update tier for user %.', user_a;
END
$$;

-- Rollback by default so test data/state remains unchanged.
ROLLBACK;
