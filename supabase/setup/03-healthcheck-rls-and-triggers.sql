/*
 * Healthcheck for RLS policies and triggers expected by SCHEMA.sql.
 */

-- 1) RLS status per table (all should be true)
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('brands', 'products', 'projects', 'sections', 'user_limits')
ORDER BY c.relname;

-- 2) Policies created by SCHEMA.sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('brands', 'products', 'projects', 'sections', 'user_limits')
ORDER BY tablename, policyname;

-- 3) Trigger presence
SELECT
  event_object_table AS table_name,
  trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE 'trigger_check_%'
    OR trigger_name LIKE 'trigger_update_%'
    OR trigger_name = 'trigger_enforce_section_product_ownership'
  )
ORDER BY event_object_table, trigger_name;

-- 4) Auth trigger for auto user_limits on new signup
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  t.tgname  AS trigger_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal
  AND n.nspname = 'auth'
  AND c.relname = 'users'
  AND t.tgname = 'trigger_auto_create_user_limits';
