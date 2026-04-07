/*
 * ============================================================================
 * LP Block Builder Engine - Production PostgreSQL Schema
 * ============================================================================
 *
 * This schema defines the database structure for the LP Block Builder Engine,
 * a multi-tenant landing page generation platform with visual section planning
 * and integrated product knowledge management.
 *
 * Key Features:
 * - Multi-brand support with visual brand guidelines (fonts, colors, vibes)
 * - Product knowledge database for reusable product data across projects
 * - Project-based LP generation with formula-guided and custom modes
 * - Section-level customization with layout decoupling and style overrides
 * - User tier-based resource limits (brands, products, projects)
 * - Row-level security for multi-tenant isolation
 * - Automatic constraint enforcement via triggers
 *
 * Tables:
 *   - brands: Brand identity, guidelines, and design presets
 *   - products: Product data with pricing and positioning
 *   - projects: LP projects with framework and output settings
 *   - sections: Individual LP sections with layout and customization
 *   - user_limits: User tier limits and resource quotas
 *
 * ============================================================================
 */

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE project_mode AS ENUM ('formula', 'custom');
CREATE TYPE output_mode AS ENUM ('html', 'copy');
CREATE TYPE style_mode AS ENUM ('default', 'custom');
CREATE TYPE user_tier AS ENUM ('free', 'pro', 'enterprise');

-- ============================================================================
-- TABLE: brands
-- ============================================================================
-- Stores brand identity and visual guidelines for design consistency.
-- Each brand can have custom fonts, color palettes, button styles, and design vibes.
-- Used as the foundation for brand-level style inheritance in projects.

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Brand Identity
  name VARCHAR(100) NOT NULL,

  -- Font Configuration
  font_style VARCHAR(50) NOT NULL DEFAULT 'modern_sans',
  -- Preset options: modern_sans, bold_impact, elegant_serif, playful_rounded, monospace_tech
  -- Or 'custom' if using font_custom
  font_custom VARCHAR(255),

  -- Color Palette Configuration
  color_palette VARCHAR(50) NOT NULL DEFAULT 'ocean_blue',
  -- Preset options: ocean_blue, sunset_orange, forest_green, royal_purple,
  --                 rose_pink, midnight_dark, warm_gold, coral_bright
  -- Or 'custom' if manually set colors
  color_primary VARCHAR(7) NOT NULL DEFAULT '#2563EB',
  color_accent VARCHAR(7) NOT NULL DEFAULT '#60A5FA',
  color_neutral VARCHAR(7) NOT NULL DEFAULT '#F1F5F9',

  -- Button and Design Style
  button_style VARCHAR(20) NOT NULL DEFAULT 'rounded',
  -- Options: rounded, sharp, pill, outline
  design_vibe VARCHAR(50) NOT NULL DEFAULT 'minimalist',
  -- Preset options: minimalist, corporate, energetic, premium, playful, dark_mode
  -- Or 'custom' if using vibe_custom
  vibe_custom TEXT,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT color_primary_valid CHECK (color_primary ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT color_accent_valid CHECK (color_accent ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT color_neutral_valid CHECK (color_neutral ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_brands_user_id ON brands(user_id);

-- ============================================================================
-- TABLE: products
-- ============================================================================
-- Stores product information referenced by projects and linked to brands.
-- Serves as the central product knowledge database for reusability across
-- multiple LP projects and version iterations.

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

  -- Product Identity
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Pricing
  price_normal VARCHAR(50) NOT NULL,
  price_promo VARCHAR(50),

  -- Market Positioning
  target_audience TEXT,
  pain_points TEXT,
  objections TEXT,
  usp TEXT,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);

-- ============================================================================
-- TABLE: projects
-- ============================================================================
-- Represents a single LP project with chosen framework, product reference,
-- and global settings. Serves as the container for sections and generation state.

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Project Metadata
  name VARCHAR(255) NOT NULL,

  -- Framework and Mode
  framework VARCHAR(100),
  -- Formula name if mode='formula' (e.g., AIDCA, AIDA, PAS, custom names)
  -- Nullable if mode='custom'
  mode project_mode NOT NULL,

  -- Generation Configuration
  tone VARCHAR(100),
  platform VARCHAR(50),
  output_mode output_mode NOT NULL DEFAULT 'html',

  -- Global Settings (extensible JSON for future features)
  global_settings JSONB DEFAULT '{}',

  -- Change Tracking
  is_dirty BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_product_id ON projects(product_id);

-- ============================================================================
-- TABLE: sections
-- ============================================================================
-- Represents individual sections within a project with customizable layout,
-- styling, and framework positioning. Supports drag-reordering and per-section
-- style overrides.

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Positioning
  order_index INTEGER NOT NULL,

  -- Section Content
  section_title VARCHAR(255) NOT NULL,
  section_goals TEXT NOT NULL,

  -- Layout and Style
  layout_format VARCHAR(50) NOT NULL,
  -- Options: standard_image, vsl, bento, hero, cta, testimonial, faq, comparison, etc.
  style_mode style_mode NOT NULL DEFAULT 'default',
  -- default: inherit from brand guidelines
  -- custom: use style_custom instead
  style_custom TEXT,
  -- Custom style description when style_mode='custom'

  -- Framework Integration
  framework_position VARCHAR(100),
  -- Auto-filled if parent project.mode='formula'
  -- Examples: 'attention', 'interest', 'desire', 'conviction', 'action'

  -- Additional Context
  additional_context TEXT,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT section_order_index_non_negative CHECK (order_index >= 0)
);

CREATE INDEX idx_sections_project_id ON sections(project_id);
CREATE INDEX idx_sections_project_id_order_index ON sections(project_id, order_index);
CREATE INDEX idx_sections_product_id ON sections(product_id);

-- ============================================================================
-- TABLE: user_limits
-- ============================================================================
-- Tracks resource limits and tier information for each user.
-- Enforced via triggers to prevent exceeding quota.

CREATE TABLE user_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Resource Quotas
  max_brands INTEGER NOT NULL DEFAULT 3,
  max_products INTEGER NOT NULL DEFAULT 10,
  max_projects INTEGER NOT NULL DEFAULT 4,

  -- Tier Information
  tier user_tier NOT NULL DEFAULT 'free',

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_max_brands CHECK (max_brands > 0),
  CONSTRAINT positive_max_products CHECK (max_products > 0),
  CONSTRAINT positive_max_projects CHECK (max_projects > 0)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for brands
-- ============================================================================
CREATE POLICY brands_select_own ON brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY brands_insert_own ON brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY brands_update_own ON brands FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY brands_delete_own ON brands FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for products
-- ============================================================================
CREATE POLICY products_select_own ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY products_insert_own ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY products_update_own ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY products_delete_own ON products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for projects
-- ============================================================================
CREATE POLICY projects_select_own ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY projects_insert_own ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_update_own ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_delete_own ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for sections
-- ============================================================================
-- Sections are accessed through project ownership (project_id -> projects.user_id)
CREATE POLICY sections_select_own ON sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = sections.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY sections_insert_own ON sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = sections.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY sections_update_own ON sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = sections.project_id
    AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = sections.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY sections_delete_own ON sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = sections.project_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================================================
-- RLS Policies for user_limits
-- ============================================================================
CREATE POLICY user_limits_select_own ON user_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_limits_insert_own ON user_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_limits_update_own ON user_limits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- ============================================================================
-- Trigger: Auto-create user_limits on new user
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_create_user_limits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_limits (user_id, max_brands, max_products, max_projects, tier)
  VALUES (NEW.id, 3, 10, 4, 'free'::user_tier)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_create_user_limits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_create_user_limits();

-- ============================================================================
-- Trigger: Check brand count limit before INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION check_brand_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  user_max INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM brands WHERE user_id = NEW.user_id;
  SELECT max_brands INTO user_max FROM user_limits WHERE user_id = NEW.user_id;

  IF user_max IS NULL THEN
    user_max := 3;
  END IF;

  IF current_count >= user_max THEN
    RAISE EXCEPTION 'Brand limit exceeded for user %', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_brand_limit
BEFORE INSERT ON brands
FOR EACH ROW
EXECUTE FUNCTION check_brand_limit();

-- ============================================================================
-- Trigger: Check product count limit before INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  user_max INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM products WHERE user_id = NEW.user_id;
  SELECT max_products INTO user_max FROM user_limits WHERE user_id = NEW.user_id;

  IF user_max IS NULL THEN
    user_max := 10;
  END IF;

  IF current_count >= user_max THEN
    RAISE EXCEPTION 'Product limit exceeded for user %', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_product_limit
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_limit();

-- ============================================================================
-- Trigger: Check project count limit before INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION check_project_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  user_max INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM projects WHERE user_id = NEW.user_id;
  SELECT max_projects INTO user_max FROM user_limits WHERE user_id = NEW.user_id;

  IF user_max IS NULL THEN
    user_max := 4;
  END IF;

  IF current_count >= user_max THEN
    RAISE EXCEPTION 'Project limit exceeded for user %', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_project_limit
BEFORE INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION check_project_limit();

-- ============================================================================
-- Trigger: Ensure section.product_id belongs to same user as parent project
-- ============================================================================
CREATE OR REPLACE FUNCTION enforce_section_product_ownership()
RETURNS TRIGGER AS $$
DECLARE
  project_owner UUID;
  product_owner UUID;
BEGIN
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO project_owner FROM projects WHERE id = NEW.project_id;
  SELECT user_id INTO product_owner FROM products WHERE id = NEW.product_id;

  IF project_owner IS NULL OR product_owner IS NULL OR project_owner <> product_owner THEN
    RAISE EXCEPTION 'Section product must belong to the same user as the project';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_section_product_ownership
BEFORE INSERT OR UPDATE ON sections
FOR EACH ROW
EXECUTE FUNCTION enforce_section_product_ownership();

-- ============================================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================================

-- ============================================================================
-- Trigger: Update brands.updated_at on modification
-- ============================================================================
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION update_brands_updated_at();

-- ============================================================================
-- Trigger: Update products.updated_at on modification
-- ============================================================================
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- ============================================================================
-- Trigger: Update projects.updated_at on modification
-- ============================================================================
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
