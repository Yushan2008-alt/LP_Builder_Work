// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  font_style: string;
  font_custom: string | null;
  color_palette: string;
  color_primary: string;
  color_accent: string;
  color_neutral: string;
  button_style: string;
  design_vibe: string;
  vibe_custom: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  brand_id: string;
  name: string;
  description: string;
  price_normal: string;
  price_promo: string | null;
  target_audience: string | null;
  pain_points: string | null;
  objections: string | null;
  usp: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  framework: string | null;
  mode: "formula" | "custom";
  tone: string | null;
  platform: string | null;
  output_mode: "html" | "copy";
  global_settings: Record<string, unknown>;
  is_dirty: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  project_id: string;
  product_id: string | null;
  order_index: number;
  section_title: string;
  section_goals: string;
  layout_format: string;
  style_mode: "default" | "custom";
  style_custom: string | null;
  framework_position: string | null;
  additional_context: string | null;
  created_at: string;
}

export interface UserLimits {
  user_id: string;
  max_brands: number;
  max_products: number;
  max_projects: number;
  tier: "free" | "pro" | "enterprise";
  created_at: string;
}

// ============================================================================
// FORM TYPES (partial/input types for create/update operations)
// ============================================================================

export type CreateBrandInput = {
  name: string;
  font_style?: string;
  font_custom?: string | null;
  color_palette?: string;
  color_primary?: string;
  color_accent?: string;
  color_neutral?: string;
  button_style?: string;
  design_vibe?: string;
  vibe_custom?: string | null;
};

export type UpdateBrandInput = Partial<CreateBrandInput>;

export type CreateProductInput = {
  brand_id: string;
  name: string;
  description: string;
  price_normal: string;
  price_promo?: string | null;
  target_audience?: string | null;
  pain_points?: string | null;
  objections?: string | null;
  usp?: string | null;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateProjectInput = {
  product_id: string;
  name: string;
  framework?: string | null;
  mode: "formula" | "custom";
  tone?: string | null;
  platform?: string | null;
  output_mode?: "html" | "copy";
};

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, "product_id">>;

export type CreateSectionInput = {
  project_id: string;
  product_id?: string | null;
  order_index: number;
  section_title: string;
  section_goals: string;
  layout_format: string;
  style_mode?: "default" | "custom";
  style_custom?: string | null;
  framework_position?: string | null;
  additional_context?: string | null;
};

export type UpdateSectionInput = Partial<Omit<CreateSectionInput, "project_id" | "order_index">>;

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface BrandContextValue {
  brands: Brand[];
  products: Product[];
  userLimits: UserLimits | null;
  isLoading: boolean;
  fetchBrands: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  createBrand: (input: CreateBrandInput) => Promise<Brand | null>;
  updateBrand: (id: string, input: UpdateBrandInput) => Promise<Brand | null>;
  deleteBrand: (id: string) => Promise<boolean>;
  createProduct: (input: CreateProductInput) => Promise<Product | null>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
}

export interface ProjectContextValue {
  project: Project | null;
  sections: Section[];
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  generatedOutput: string;
  setProject: (project: Project) => void;
  setSections: (sections: Section[]) => void;
  setIsDirty: (dirty: boolean) => void;
  setGeneratedOutput: (output: string) => void;
  addSection: (input: Omit<CreateSectionInput, "project_id">) => Promise<Section | null>;
  updateSection: (id: string, input: UpdateSectionInput) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  duplicateSection: (id: string) => Promise<void>;
  reorderSections: (newSections: Section[]) => Promise<void>;
  saveProject: () => Promise<boolean>;
  loadProject: (projectId: string) => Promise<void>;
}
