/*
 * Backfill user_limits rows for existing users created before trigger deployment.
 * Safe to run multiple times (idempotent by anti-join + ON CONFLICT DO NOTHING).
 */

WITH inserted AS (
  INSERT INTO public.user_limits (user_id, max_brands, max_products, max_projects, tier)
  SELECT
    u.id,
    3,
    10,
    4,
    'free'::public.user_tier
  FROM auth.users AS u
  LEFT JOIN public.user_limits AS ul
    ON ul.user_id = u.id
  WHERE ul.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id
)
SELECT COUNT(*) AS inserted_user_limits_rows
FROM inserted;

-- Optional visibility check:
SELECT
  (SELECT COUNT(*) FROM auth.users) AS total_auth_users,
  (SELECT COUNT(*) FROM public.user_limits) AS total_user_limits_rows;
