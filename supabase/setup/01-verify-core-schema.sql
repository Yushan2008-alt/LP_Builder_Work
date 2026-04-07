/*
 * Verify that LP Builder core schema exists in Supabase target environment.
 * Run this after executing /SCHEMA.sql.
 */

-- 1) Core tables must exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('brands', 'products', 'projects', 'sections', 'user_limits')
ORDER BY table_name;

-- 2) Core enum types must exist
SELECT t.typname AS enum_name,
       string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname IN ('project_mode', 'output_mode', 'style_mode', 'user_tier')
GROUP BY t.typname
ORDER BY t.typname;

-- 3) Summary check (all counts should be 1)
SELECT
  COUNT(*) FILTER (WHERE table_name = 'brands')      AS brands_table,
  COUNT(*) FILTER (WHERE table_name = 'products')    AS products_table,
  COUNT(*) FILTER (WHERE table_name = 'projects')    AS projects_table,
  COUNT(*) FILTER (WHERE table_name = 'sections')    AS sections_table,
  COUNT(*) FILTER (WHERE table_name = 'user_limits') AS user_limits_table
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('brands', 'products', 'projects', 'sections', 'user_limits');
