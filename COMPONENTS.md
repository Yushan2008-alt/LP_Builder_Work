# COMPONENTS.md - Component and State Management Specification
**LP Block Builder Engine - Complete Component & State Architecture**

| Field | Detail |
|---|---|
| Document Version | 1.0 |
| Date | 6 April 2026 |
| Purpose | Developer-focused component tree, context specs, props interfaces, and hook signatures |
| Status | Ready for Implementation |

---

## 1. Component Tree (Visual Hierarchy)

```
App
├── AuthProvider (context)
│   ├── LoginPage (route: /login)
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── SignInButton
│   │   └── SignUpToggle
│   │
│   └── ProtectedRoute
│       ├── BrandProvider (context)
│       │   └── AppLayout
│       │       ├── Sidebar
│       │       │   ├── Logo
│       │       │   ├── NavSection (Product Knowledge DB)
│       │       │   │   └── NavItem: "Product Knowledge DB"
│       │       │   │       └── onClick: navigate('/products')
│       │       │   │
│       │       │   ├── NavSection (LP Generator)
│       │       │   │   ├── NavItem: "Create New LP"
│       │       │   │   │   └── onClick: navigate('/generator/new')
│       │       │   │   │
│       │       │   │   ├── NavItem: "Saved Projects"
│       │       │   │   │   ├── badge: projectCount
│       │       │   │   │   └── onClick: navigate('/saved')
│       │       │   │   │
│       │       │   │   └── NavItem: "All Products"
│       │       │   │       └── onClick: navigate('/products')
│       │       │   │
│       │       │   └── NavSection (Live HTML Editor)
│       │       │       └── NavItem: "HTML Editor"
│       │       │           └── onClick: navigate('/editor')
│       │       │
│       │       └── MainContent
│       │           ├── ProductDashboard (route: /products)
│       │           │   ├── Header: "Product Knowledge Database"
│       │           │   ├── BrandCard[] (max 3)
│       │           │   │   ├── BrandHeader
│       │           │   │   │   ├── BrandName
│       │           │   │   │   ├── EditBrandButton
│       │           │   │   │   ├── BrandGuidelinesModal
│       │           │   │   │   │   ├── FontStyleSelector
│       │           │   │   │   │   ├── ColorPaletteSelector
│       │           │   │   │   │   ├── ButtonStyleSelector
│       │           │   │   │   │   ├── DesignVibeSelector
│       │           │   │   │   │   └── SaveButton
│       │           │   │   │   └── DeleteBrandButton (with confirmation)
│       │           │   │   │
│       │           │   │   └── ProductList
│       │           │   │       └── ProductRow[] (within brand)
│       │           │   │           ├── ProductName
│       │           │   │           ├── ProductPricing
│       │           │   │           ├── EditProductButton
│       │           │   │           │   └── ProductForm (modal)
│       │           │   │           │       ├── NameInput
│       │           │   │           │       ├── DescriptionInput
│       │           │   │           │       ├── PriceNormalInput
│       │           │   │           │       ├── PricePromoInput
│       │           │   │           │       ├── TargetAudienceInput
│       │           │   │           │       ├── PainPointsInput
│       │           │   │           │       ├── ObjectionsInput
│       │           │   │           │       ├── USPInput
│       │           │   │           │       ├── SaveButton
│       │           │   │           │       └── CancelButton
│       │           │   │           │
│       │           │   │           └── DeleteProductButton (with confirmation)
│       │           │   │
│       │           │   └── AddBrandButton
│       │           │       └── onClick: opens BrandForm (disabled if >= 3)
│       │           │
│       │           ├── ProjectProvider (context)
│       │           │   ├── FormulaGallery (route: /generator/new)
│       │           │   │   ├── Header: "Create New LP"
│       │           │   │   ├── SearchBar
│       │           │   │   ├── TierFilter (toggles)
│       │           │   │   │
│       │           │   │   └── FormulaCardGrid
│       │           │   │       ├── FormulaCard[] (20 formulas)
│       │           │   │       │   ├── FormulaName
│       │           │   │       │   ├── FormulaDescription
│       │           │   │       │   ├── BestCaseTag
│       │           │   │       │   ├── SectionCountBadge
│       │           │   │       │   ├── TierBadge
│       │           │   │       │   └── onClick: ProjectContext.createProject(formulaId)
│       │           │   │       │       └── navigate('/generator/:projectId')
│       │           │   │       │
│       │           │   │       └── CustomCard
│       │           │   │           ├── BlankCanvasIcon
│       │           │   │           ├── Label: "Start from Scratch"
│       │           │   │           ├── FeatureTags
│       │           │   │           └── onClick: ProjectContext.createProject('custom')
│       │           │   │               └── navigate('/generator/:projectId')
│       │           │   │
│       │           │   ├── SectionPlanner (route: /generator/:projectId)
│       │           │   │   ├── GlobalBar
│       │           │   │   │   ├── ProductSelector
│       │           │   │   │   │   └── Select: onSelect triggers ProjectContext.setActiveProduct()
│       │           │   │   │   │
│       │           │   │   │   ├── FormulaDisplay
│       │           │   │   │   │   ├── Badge: formula name (if formula-based)
│       │           │   │   │   │   └── Icon: formula tier
│       │           │   │   │   │
│       │           │   │   │   ├── PlatformSelector
│       │           │   │   │   │   └── Select: onSelect triggers project.platform update
│       │           │   │   │   │
│       │           │   │   │   └── OutputModeToggle
│       │           │   │   │       ├── HTML option (default)
│       │           │   │   │       └── Copy option
│       │           │   │   │
│       │           │   │   ├── SectionList (DndKit SortableContext)
│       │           │   │   │   └── SectionCard[] (draggable, sortable)
│       │           │   │   │       ├── DragHandle
│       │           │   │   │       ├── SectionHeader
│       │           │   │   │       │   ├── SectionNumber
│       │           │   │   │       │   ├── SectionTitle
│       │           │   │   │       │   ├── SectionGoalsPreview
│       │           │   │   │       │   ├── FormatBadge + MiniSkeletonPreview
│       │           │   │   │       │   ├── StyleBadge (Default/Custom)
│       │           │   │   │       │   │
│       │           │   │   │       │   ├── ActionButtons
│       │           │   │   │       │   │   ├── ExpandButton
│       │           │   │   │       │   │   │   └── onClick: SectionCard.onToggleExpand()
│       │           │   │   │       │   │   │
│       │           │   │   │       │   │   ├── DuplicateButton
│       │           │   │   │       │   │   │   └── onClick: ProjectContext.duplicateSection(sectionId)
│       │           │   │   │       │   │   │
│       │           │   │   │       │   │   └── DeleteButton
│       │           │   │   │       │   │       └── onClick: ProjectContext.deleteSection(sectionId)
│       │           │   │   │       │   │           (with confirmation)
│       │           │   │   │       │   │
│       │           │   │   │       │   └── FrameworkPositionLabel
│       │           │   │   │       │       (only if formula-based project)
│       │           │   │   │       │
│       │           │   │   │       └── SectionEditor (expandable, initially collapsed)
│       │           │   │   │           ├── SectionTitleInput
│       │           │   │   │           │   └── onBlur: ProjectContext.updateSection(sectionId, { title })
│       │           │   │   │           │
│       │           │   │   │           ├── SectionGoalsInput
│       │           │   │   │           │   └── onBlur: ProjectContext.updateSection(sectionId, { goals })
│       │           │   │   │           │
│       │           │   │   │           ├── FormatSelector
│       │           │   │   │           │   ├── Button: "Choose Layout"
│       │           │   │   │           │   └── onClick: opens FormatGalleryModal
│       │           │   │   │           │       └── FormatGalleryModal
│       │           │   │   │           │           ├── FormatCard[] (22 layouts)
│       │           │   │   │           │           │   ├── FormatName
│       │           │   │   │           │           │   ├── SkeletonPreview
│       │           │   │   │           │           │   └── onClick: ProjectContext.updateSection(sectionId, { layout_format })
│       │           │   │   │           │           │       (closes modal, updates card)
│       │           │   │   │           │           │
│       │           │   │   │           │           └── CloseButton
│       │           │   │   │           │
│       │           │   │   │           ├── StyleModeToggle
│       │           │   │   │           │   ├── RadioOption: "Default (Follow Brand Guidelines)"
│       │           │   │   │           │   └── RadioOption: "Custom"
│       │           │   │   │           │       └── if selected, show StyleCustomInput
│       │           │   │   │           │           └── onBlur: ProjectContext.updateSection(sectionId, { style_custom })
│       │           │   │   │           │
│       │           │   │   │           └── AdditionalContextInput
│       │           │   │   │               └── onBlur: ProjectContext.updateSection(sectionId, { additional_context })
│       │           │   │   │
│       │           │   │   ├── AddSectionButton
│       │           │   │   │   └── onClick: opens AddSectionForm
│       │           │   │   │       └── AddSectionForm
│       │           │   │   │           ├── SectionTitleInput
│       │           │   │   │           ├── SectionGoalsInput
│       │           │   │   │           ├── SaveButton: triggers ProjectContext.addSection()
│       │           │   │   │           └── CancelButton
│       │           │   │   │
│       │           │   │   ├── OutputPanel
│       │           │   │   │   ├── Header: "Generated Output"
│       │           │   │   │   ├── CopyToClipboardButton
│       │           │   │   │   ├── DownloadButton
│       │           │   │   │   └── OutputDisplayArea
│       │           │   │   │       └── (shows generated prompt or HTML)
│       │           │   │   │
│       │           │   │   └── ActionBar (sticky bottom)
│       │           │   │       ├── SaveButton
│       │           │   │       │   └── onClick: ProjectContext.saveProject()
│       │           │   │       │       (enabled if isDirty)
│       │           │   │       │
│       │           │   │       ├── GenerateButton
│       │           │   │       │   └── onClick: usePromptEngine.generatePrompt()
│       │           │   │       │       (enabled if canGenerate)
│       │           │   │       │
│       │           │   │       ├── PreviewButton
│       │           │   │       │   └── onClick: opens preview modal with generated output
│       │           │   │       │
│       │           │   │       └── BackButton
│       │           │   │           └── onClick: (if isDirty, show warning) navigate('/saved')
│       │           │   │
│       │           │   ├── SavedProjectsList (route: /saved)
│       │           │   │   ├── Header: "Saved Projects"
│       │           │   │   ├── ProjectCard[] (max 4)
│       │           │   │   │   ├── ProjectName
│       │           │   │   │   ├── FormulaLabel
│       │           │   │   │   ├── LastEditedDate
│       │           │   │   │   ├── OpenButton
│       │           │   │   │   │   └── onClick: ProjectContext.loadProject(projectId)
│       │           │   │   │   │       navigate('/generator/:projectId')
│       │           │   │   │   │
│       │           │   │   │   ├── DuplicateButton
│       │           │   │   │   │   └── onClick: ProjectContext.duplicateProject(projectId)
│       │           │   │   │   │
│       │           │   │   │   └── DeleteButton
│       │           │   │   │       └── onClick: ProjectContext.deleteProject(projectId)
│       │           │   │   │           (with confirmation)
│       │           │   │   │
│       │           │   │   └── EmptyState
│       │           │   │       └── (if no projects) "No projects yet. Create one to get started."
│       │           │   │
│       │           │   └── HtmlEditor (route: /editor)
│       │           │       ├── Header: "Live HTML Editor"
│       │           │       │
│       │           │       ├── CodePane
│       │           │       │   ├── Monaco Editor or CodeMirror instance
│       │           │       │   ├── Language: HTML
│       │           │       │   ├── Theme: Dark (Dracula) or Light
│       │           │       │   └── Features: syntax highlighting, auto-complete, line numbers
│       │           │       │
│       │           │       ├── PreviewPane
│       │           │       │   ├── iframe element
│       │           │       │   ├── DOMPurify sanitization applied
│       │           │       │   └── Live update on code change (debounced)
│       │           │       │
│       │           │       └── ActionBar
│       │           │           ├── CopyCodeButton
│       │           │           ├── DownloadHTMLButton
│       │           │           ├── ResetButton (restore from localStorage or default)
│       │           │           └── ClearButton
```

---

## 2. Context Specifications

### AuthContext

**File:** `src/contexts/AuthContext.tsx`

**State Shape:**
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
```

**Actions:**
```typescript
interface AuthContextActions {
  signIn(email: string, password: string): Promise<{ user: User; session: Session }>;
  signUp(email: string, password: string): Promise<{ user: User; session: Session }>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  clearError(): void;
}
```

**Provider Props:**
```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

**Provider Wraps:** Entire App. All routes accessed through `ProtectedRoute` component which checks auth state.

**Hook to Access:**
```typescript
const { user, session, loading, signIn, signOut } = useAuth();
```

---

### BrandContext

**File:** `src/contexts/BrandContext.tsx`

**State Shape:**
```typescript
interface BrandContextType {
  brands: Brand[];
  products: Product[];
  activeBrandId: string | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

interface Brand {
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

interface Product {
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
```

**Computed Derived Values:**
```typescript
interface DerivedValues {
  activeBrand: Brand | null; // computed: brands.find(b => b.id === activeBrandId)
  activeProducts: Product[]; // computed: products.filter(p => p.brand_id === activeBrandId)
  brandCount: number;
  productCount: number;
  canAddBrand: boolean; // max 3 brands per free user
}
```

**Actions:**
```typescript
interface BrandContextActions {
  createBrand(data: {
    name: string;
    font_style?: string;
    color_palette?: string;
    button_style?: string;
    design_vibe?: string;
  }): Promise<Brand>;

  updateBrand(id: string, data: Partial<Brand>): Promise<Brand>;

  deleteBrand(id: string): Promise<void>;

  createProduct(data: {
    brand_id: string;
    name: string;
    description: string;
    price_normal: string;
    price_promo?: string;
    target_audience?: string;
    pain_points?: string;
    objections?: string;
    usp?: string;
  }): Promise<Product>;

  updateProduct(id: string, data: Partial<Product>): Promise<Product>;

  deleteProduct(id: string): Promise<void>;

  setActiveBrand(id: string | null): void;

  loadBrandsAndProducts(): Promise<void>;

  clearError(): void;
}
```

**Provider Props:**
```typescript
interface BrandProviderProps {
  children: React.ReactNode;
}
```

**Provider Wraps:** All authenticated routes (inside ProtectedRoute).

**Hook to Access:**
```typescript
const {
  brands,
  products,
  activeBrand,
  activeProducts,
  createBrand,
  updateBrand,
  deleteBrand,
  createProduct,
  updateProduct,
  deleteProduct,
  setActiveBrand,
  canAddBrand
} = useBrands();
```

---

### ProjectContext

**File:** `src/contexts/ProjectContext.tsx`

**State Shape:**
```typescript
interface ProjectContextType {
  project: Project | null;
  sections: Section[];
  isDirty: boolean;
  loading: boolean;
  error: string | null;
  generatedPrompt: string | null;
  generatedHTML: string | null;
}

interface Project {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  framework: string | null;
  mode: 'formula' | 'custom';
  tone: string | null;
  platform: string;
  output_mode: 'html' | 'copy';
  global_settings: Record<string, any>;
  is_dirty: boolean;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: string;
  project_id: string;
  order_index: number;
  section_title: string;
  section_goals: string;
  layout_format: string;
  style_mode: 'default' | 'custom';
  style_custom: string | null;
  framework_position: string | null;
  additional_context: string | null;
  created_at: string;
}
```

**Computed Derived Values:**
```typescript
interface DerivedValues {
  sectionCount: number; // sections.length
  canGenerate: boolean; // has activeProduct && has sections
  canSave: boolean; // isDirty
  sortedSections: Section[]; // sorted by order_index
  formulaObject: Formula | null; // from FORMULAS.ts if formula-based
}
```

**Actions:**
```typescript
interface ProjectContextActions {
  loadProject(projectId: string): Promise<void>;

  createProject(formulaId: string, productId: string): Promise<Project>;

  saveProject(): Promise<void>;

  deleteProject(projectId: string): Promise<void>;

  duplicateProject(projectId: string): Promise<Project>;

  addSection(data: {
    section_title: string;
    section_goals: string;
    layout_format?: string;
    framework_position?: string;
  }): Promise<Section>;

  updateSection(sectionId: string, data: Partial<Section>): Promise<Section>;

  deleteSection(sectionId: string): Promise<void>;

  duplicateSection(sectionId: string): Promise<Section>;

  reorderSections(sections: Section[]): Promise<void>;

  setOutputMode(mode: 'html' | 'copy'): void;

  clearError(): void;
}
```

**Provider Props:**
```typescript
interface ProjectProviderProps {
  children: React.ReactNode;
}
```

**Smart Layout Defaults (explicit `defaultLayout` + `inferDefaultLayout` fallback):**

Each `FormulaSection` in `formulas.ts` now has an explicit `defaultLayout` field that specifies the layout for that section:

```typescript
interface FormulaSection {
  title: string;
  goals: string;
  frameworkPosition: string;
  defaultLayout?: string;  // explicit layout ID, e.g. 'typographic', 'split_screen'
}

interface Formula {
  id: string;
  name: string;
  tier: FormulaTier;
  description: string;
  bestCase: string;
  context?: string;     // framework philosophy — injected into prompt as Layer 2.5
  sectionCount: number;
  sections: FormulaSection[];
}
```

**Formula Context (injected into prompt):**

Each formula has an optional `context` field that explains the framework's philosophy and how sections connect. This is injected into the generated prompt as "Layer 2.5" (between Product Brief and Section Blocks) so the AI understands the copywriting framework it's following.

- Only injected when `project.mode === 'formula'` (skipped for custom mode)
- Written in Bahasa Indonesia
- Explains the psychological flow and how sections build on each other
- Lives in `formulas.ts`, consumed by `assembler.ts` via `getFormulaById()`

When `createProject(formulaId)` creates sections from a formula blueprint, each section's `layout_format` is resolved with the following priority:

```
1. Explicit defaultLayout  →  s.defaultLayout (defined per section in formulas.ts)
2. Keyword inference       →  inferDefaultLayout(frameworkPosition, sectionTitle)
3. Fallback                →  'standard_image'
```

In `ProjectContext.tsx`, the resolution looks like:

```typescript
const layoutFormat = s.defaultLayout ?? inferDefaultLayout(s.frameworkPosition, s.title);
```

The `inferDefaultLayout()` function (keyword-based) is kept as fallback only for:
- **Manually added sections** via `addSection()` (no formula data, no `defaultLayout`)
- **Custom formula** (user-defined sections without `defaultLayout`)

```typescript
// Keyword → Layout mapping (POSITION_LAYOUT_MAP) — fallback only
const POSITION_LAYOUT_MAP = [
  { keywords: ['hero', 'attention', 'hook', 'stop', 'look'],                                            layout: 'standard_image' },
  { keywords: ['problem', 'agitation', 'pain', 'before', 'wall', 'gap', 'qualify', 'context', 'backstory', 'desires'], layout: 'typographic' },
  { keywords: ['solution', 'after', 'bridge', 'offer', 'achievement', 'transformation', 'epiphany', 'new way'], layout: 'split_screen' },
  { keywords: ['features', 'benefits', 'advantages', 'educate', 'interest', 'comprehension', 'plan', 'what i'], layout: 'feature_grid' },
  { keywords: ['story', 'backstory', 'journey', 'character', 'star', 'conflict', 'stimulate', 'old way', 'crossroads'], layout: 'story_based' },
  { keywords: ['proof', 'conviction', 'testimonial', 'pearl', 'quote', 'understand', 'empathy', 'guide'], layout: 'quote_testimonial' },
  { keywords: ['stat', 'number', 'counter', 'data', 'result'],                                          layout: 'stat_counter' },
  { keywords: ['cta', 'action', 'response', 'purchase', 'now', 'push', 'transition', 'act', 'what to do'], layout: 'single_offer' },
  { keywords: ['comparison', 'contrast', 'versus', 'old way', 'new way'],                               layout: 'comparison_table' },
  { keywords: ['timeline', 'steps', 'process', 'onboarding'],                                           layout: 'timeline' },
  { keywords: ['faq', 'accordion', 'questions', 'objection'],                                           layout: 'accordion' },
  { keywords: ['logo', 'social proof', 'credibility', 'trust', 'featured', 'partner'],                  layout: 'logo_bar' },
  { keywords: ['pricing', 'tier', 'plan', 'package'],                                                   layout: 'tier_cards' },
  { keywords: ['warn', 'failure', 'scarcity', 'urgency', 'amplify'],                                    layout: 'typographic' },
  { keywords: ['desire', 'picture', 'promise', 'aspiration', 'success'],                                layout: 'story_based' },
];

function inferDefaultLayout(frameworkPosition?: string, sectionTitle?: string): string {
  const haystack = [frameworkPosition, sectionTitle].filter(Boolean).join(' ').toLowerCase();
  for (const { keywords, layout } of POSITION_LAYOUT_MAP) {
    if (keywords.some((kw) => haystack.includes(kw))) return layout;
  }
  return 'standard_image'; // ultimate fallback
}
```

This logic lives in `ProjectContext.tsx`. For formula-based projects, the explicit `defaultLayout` from `formulas.ts` takes priority. For manually added sections (`addSection()`) and Custom formula, `inferDefaultLayout()` is called as fallback.

**Provider Wraps:** `/generator/*` routes only.

**Hook to Access:**
```typescript
const {
  project,
  sections,
  isDirty,
  generatedPrompt,
  canGenerate,
  canSave,
  loadProject,
  createProject,
  saveProject,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setOutputMode
} = useProjects();
```

---

## 3. Component Props Specifications

### Page Components

#### LoginPage

**File:** `src/pages/LoginPage.tsx`

```typescript
interface LoginPageProps {
  // No props - used as route component
}
```

**Behavior:**
- Displays email + password form
- "Sign In" button calls `useAuth().signIn(email, password)`
- On success: navigate to `/products`
- On error: display error message
- "Don't have an account?" toggle shows SignUp form
- SignUp calls `useAuth().signUp(email, password)` then navigates to onboarding

---

#### ProductDashboard

**File:** `src/pages/ProductDashboard.tsx`

```typescript
interface ProductDashboardProps {
  // No props - used as route component
}
```

**State Reads:**
- `BrandContext`: brands, products, activeBrand
- `AuthContext`: user

**Behavior:**
- On mount: `useBrands().loadBrandsAndProducts()`
- Displays max 3 brand cards in grid
- For each brand:
  - Show brand name + edit icon
  - Show brand guidelines (fonts, colors, button style)
  - List all products under that brand
  - Edit / Delete brand buttons
- "Add Brand" button:
  - Disabled if >= 3 brands
  - Opens BrandForm modal when enabled
- Each product row has Edit + Delete buttons
- Edit opens ProductForm modal
- Delete shows confirmation: "Hapus produk ini?" with warning about projects using it

---

#### FormulaGallery

**File:** `src/pages/FormulaGallery.tsx`

```typescript
interface FormulaGalleryProps {
  // No props - used as route component
}
```

**State Reads:**
- `BrandContext`: brands, activeBrand
- `FORMULAS.ts`: FORMULAS constant

**Behavior:**
- On mount: if no active brand, show "Select a brand first" prompt with link to `/products`
- Search bar filters formulas by name + description
- Tier filter buttons toggle visibility of formula categories
- 21 formula cards in grid (20 formulas + 1 custom)
- Each formula card displays: name, description, bestCase tag, sectionCount badge, tier badge
- On click: calls `ProjectContext.createProject(formulaId, activeBrandId)`
  - System auto-generates sections from formula blueprint
  - Navigates to `/generator/:projectId`
- Custom card has distinct blank canvas visual
- On custom click: `ProjectContext.createProject('custom', activeBrandId)`

---

#### SectionPlanner

**File:** `src/pages/SectionPlanner.tsx`

```typescript
interface SectionPlannerProps {
  projectId: string; // from route param
}
```

**State Reads:**
- `ProjectContext`: project, sections, isDirty, generatedPrompt
- `BrandContext`: products, activeBrand

**Behavior:**
- On mount: `ProjectContext.loadProject(projectId)`
- GlobalBar:
  - Product selector shows active brand's products
  - On change: `ProjectContext.updateProject({ product_id })`
  - Formula badge shows if formula-based
  - Platform selector (default: "Desktop")
  - Output mode toggle (HTML / Copy)
- Section list with drag-drop sorting via DndKit
- Each section card shows: title, goals preview, format badge, style mode
- On expand: shows SectionEditor inline
- SectionEditor fields:
  - Title input: on blur, `updateSection({ section_title })`
  - Goals input: on blur, `updateSection({ section_goals })`
  - Format selector button: opens FormatGalleryModal
    - On format select: `updateSection({ layout_format })`
  - Style mode toggle: Default / Custom
    - If Custom selected: show textarea for style description
    - On blur: `updateSection({ style_custom })`
  - Additional context textarea: on blur, `updateSection({ additional_context })`
- Add Section button: opens form to add new section
  - Calls `addSection(data)` on save
  - Clears form on success
- Generate button:
  - Enabled if canGenerate (has product + sections)
  - Calls `usePromptEngine().generatePrompt()`
  - Displays prompt in OutputPanel
- Save button:
  - Enabled if isDirty
  - Calls `ProjectContext.saveProject()`
  - Shows success toast
- Back button:
  - If isDirty: show modal "Kamu punya perubahan yang belum disimpan. Yakin mau keluar?"
    - Options: Simpan (save), Keluar (discard), Batal (cancel)
  - Navigate to `/saved`

---

#### SavedProjectsList

**File:** `src/pages/SavedProjectsList.tsx`

```typescript
interface SavedProjectsListProps {
  // No props - used as route component
}
```

**State Reads:**
- `ProjectContext`: (need new action `loadAllProjects()`)
- `BrandContext`: brands

**Behavior:**
- On mount: load all user projects (max 4)
- Displays max 4 project cards
- Each card shows: project name, formula (or "Custom"), last edited date
- Open button: `ProjectContext.loadProject(projectId)` -> navigate to `/generator/:projectId`
- Duplicate button: `ProjectContext.duplicateProject(projectId)` -> increments project count
  - Shows error if at limit (4 projects)
- Delete button: shows confirmation
  - "Hapus project ini secara permanen?"
  - Calls `ProjectContext.deleteProject(projectId)`
- Empty state if no projects:
  - "Belum ada project. Buat yang pertama untuk memulai."
  - Button: "Create New LP" -> navigate to `/generator/new`

---

#### RootRedirect

**File:** `src/components/RootRedirect.tsx`

```typescript
interface RootRedirectProps {
  // No props - simple redirect component
}
```

**Behavior:**
- Simple redirect from `/` to `/products`
- Used as root route fallback
- No rendered output, just navigation

---

#### GeneratorRedirect

**File:** `src/components/GeneratorRedirect.tsx`

```typescript
interface GeneratorRedirectProps {
  // No props - simple redirect component
}
```

**Behavior:**
- Simple redirect from `/generator` to `/generator/new`
- Ensures users land on FormulaGallery when navigating to generator root
- No rendered output, just navigation

---

#### HtmlEditor

**File:** `src/pages/HtmlEditor.tsx`

```typescript
interface HtmlEditorProps {
  // No props - used as route component
}
```

**State:**
- Local state: code (HTML string), preview enabled
- Persist to localStorage under key: `htmlEditor:lastCode`

**Behavior:**
- On mount: load last code from localStorage (if exists) or show blank editor
- CodePane: Monaco Editor or CodeMirror with HTML syntax highlighting
- On code change: debounce 500ms, update state
- PreviewPane: iframe with DOMPurify sanitization
  - Renders preview of HTML in real-time
  - On error: display error message
- Copy Code button: copies code to clipboard
- Download HTML button: downloads as .html file
- Reset button: restores from localStorage or blank
- Clear button: clears editor + localStorage

---

### Sidebar Components

#### Sidebar

**File:** `src/components/Sidebar.tsx`

```typescript
interface SidebarProps {
  // No props
}
```

**State Reads:**
- `AuthContext`: user
- `ProjectContext`: (if in generator) project count

**Behavior:**
- Displays logo at top
- Nav section for Product Knowledge DB:
  - "Product Knowledge DB" link -> `/products`
- Nav section for LP Generator:
  - "Create New LP" button -> `/generator/new`
  - "Saved Projects" link with badge showing project count -> `/saved`
- Nav section for Live HTML Editor:
  - "HTML Editor" link -> `/editor`
- Bottom: User email + logout button
  - On logout: `useAuth().signOut()` -> navigate to `/login`

---

### Modal / Form Components

#### BrandGuidelinesModal

**File:** `src/components/BrandGuidelinesModal.tsx`

```typescript
interface BrandGuidelinesModalProps {
  isOpen: boolean;
  brand: Brand | null;
  onSave: (data: Partial<Brand>) => Promise<void>;
  onClose: () => void;
}
```

**State:**
- Local state for font_style, color_palette, color_primary, button_style, design_vibe
- On mount: populate with brand values (if editing) or defaults

**Behavior:**
- FontStyleSelector: 5 preset options + custom input
  - On preset select: set font_style
  - If 'custom': show text input for font_custom
- ColorPaletteSelector: 8 preset palettes
  - Preset card click: applies primary, accent, neutral hex values
  - "Custom" option: show 3 hex inputs for primary, accent, neutral
- ButtonStyleSelector: 4 options (rounded, sharp, pill, outline)
  - Radio buttons
- DesignVibeSelector: 6 preset options + custom
  - On preset: set design_vibe
  - If 'custom': show textarea for vibe_custom
- "Use Defaults" button: skips modal, uses defaults (Modern Sans + Ocean Blue + Rounded + Minimalist)
- "Save" button: on click, validate and call onSave()
- "Cancel" button: calls onClose() without saving

---

#### ProductForm

**File:** `src/components/ProductForm.tsx`

```typescript
interface ProductFormProps {
  brandId: string;
  product?: Product | null;
  onSave: (data: Partial<Product>) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}
```

**State:**
- Local state for all product fields
- On mount: populate with product values (if editing) or blank

**Behavior:**
- NameInput: required text input
- DescriptionInput: required textarea
- PriceNormalInput: required text input (e.g., "$99.99" or "Rp 1,000,000")
- PricePromoInput: optional text input
- TargetAudienceInput: optional textarea
- PainPointsInput: optional textarea (multiline)
- ObjectionsInput: optional textarea
- USPInput: optional textarea
- Validation:
  - Name + description + price_normal required
  - On save attempt: validate all required fields
  - Show inline errors if any fail
- Save button: calls onSave() with populated data
- Cancel button: calls onClose()

---

#### BrandForm

**File:** `src/components/BrandForm.tsx`

```typescript
interface BrandFormProps {
  onSave: (data: { name: string }) => Promise<Brand>;
  onClose: () => void;
  isLoading?: boolean;
}
```

**Behavior:**
- NameInput: required text input
- Validation: name required, max 100 chars
- On save:
  - Call onSave({ name })
  - This returns Brand object
  - Show BrandGuidelinesModal after creation
    - User can set guidelines or use defaults
    - On close: navigate to `/products`

---

#### FormatGalleryModal

**File:** `src/components/FormatGalleryModal.tsx`

```typescript
interface FormatGalleryModalProps {
  isOpen: boolean;
  currentFormat?: string;
  onSelectFormat: (formatId: string) => void;
  onClose: () => void;
}
```

**State:**
- formatsData: array of 22 format objects (from separate FORMATS.ts)

**Behavior:**
- Grid of FormatCard components (22 total)
- Each FormatCard:
  - Format name (e.g., "Standard Image")
  - SkeletonPreview component (pure CSS/SVG wireframe)
  - Border highlight if matches currentFormat
  - On click: calls onSelectFormat(formatId) -> closes modal
- Close button: calls onClose()

---

### Card Components

#### FormulaCard

**File:** `src/components/FormulaCard.tsx`

```typescript
interface FormulaCardProps {
  formula: Formula;
  onClick: (formulaId: string) => void;
}
```

**Displays:**
- Formula.name (bold heading)
- Formula.description (1-liner)
- Formula.bestCase tag (styled badge)
- Formula.sectionCount badge (e.g., "5 sections")
- Tier badge (color-coded: foundational=blue, comprehensive=green, etc.)

**Behavior:**
- On click: calls onClick(formula.id)
- Hover: slight scale + shadow elevation
- If custom card: distinct visual (blank canvas icon, no section count)

---

#### SectionCard

**File:** `src/components/SectionCard.tsx`

```typescript
interface SectionCardProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (sectionId: string) => void;
  onDuplicate: (sectionId: string) => void;
  isDragging?: boolean;
}
```

**Displays:**
- Drag handle (6 dots icon, left side)
- Section number (e.g., "1.")
- section_title
- section_goals (1-2 line preview)
- Format badge + MiniSkeletonPreview
- Style mode badge ("Default" or "Custom")
- Framework position label (if formula-based, e.g., "Attention")

**Behavior:**
- Wrapped in DndKit useSortable hook
- Drag handle: activates drag
- On expand toggle: calls onToggleExpand()
  - If expanded: shows SectionEditor inline
  - If collapsed: hides editor
- Duplicate button: calls onDuplicate(section.id)
  - Creates new section with same data, inserts after current
- Delete button: shows confirmation modal
  - "Hapus section ini?"
  - On confirm: calls onDelete(section.id)
- isDragging state: apply visual feedback (opacity, border highlight)

---

#### ProjectCard

**File:** `src/components/ProjectCard.tsx`

```typescript
interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: (projectId: string) => void;
  onDuplicate: () => void;
}
```

**Displays:**
- Project.name (bold heading)
- Project.framework or "Custom" label
- Last edited date (human-readable, e.g., "2 hours ago")

**Behavior:**
- Open button: calls onOpen() which navigates to `/generator/:projectId`
- Duplicate button: calls onDuplicate()
- Delete button: shows confirmation
  - "Hapus project ini secara permanen?"
  - On confirm: calls onDelete(project.id)

---

#### BrandCard

**File:** `src/components/BrandCard.tsx`

```typescript
interface BrandCardProps {
  brand: Brand;
  products: Product[];
  onEdit: (brand: Brand) => void;
  onDelete: (brandId: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}
```

**Displays:**
- Brand.name (heading)
- Brand guidelines summary (font, colors, button style, vibe as badges)
- List of products (one row per product)
- Edit + Delete buttons for brand
- Edit + Delete buttons per product

**Behavior:**
- Edit brand button: calls onEdit(brand)
  - Opens BrandGuidelinesModal
- Delete brand button: shows confirmation
  - "Hapus brand ini dan semua produk di dalamnya?"
  - On confirm: calls onDelete(brand.id)
  - Cascade deletes all products in brand
- Product rows:
  - Edit button: calls onEditProduct(product)
    - Opens ProductForm modal
  - Delete button: shows confirmation
    - "Hapus produk ini?"
    - On confirm: calls onDeleteProduct(product.id)

---

#### FormatCard

**File:** `src/components/FormatCard.tsx`

```typescript
interface FormatCardProps {
  format: Format;
  isSelected?: boolean;
  onClick: () => void;
}

interface Format {
  id: string;
  name: string;
  description: string;
  skeletonSvg: string; // pure CSS or inline SVG
}
```

**Displays:**
- Format.name
- SkeletonPreview component (renders skeletonSvg)
- Highlight border if isSelected

**Behavior:**
- On click: calls onClick()
- Hover: subtle shadow

---

### Input & Control Components

#### ProductSelector

**File:** `src/components/ProductSelector.tsx`

```typescript
interface ProductSelectorProps {
  products: Product[];
  activeProductId?: string;
  onChange: (productId: string) => void;
  disabled?: boolean;
}
```

**Behavior:**
- Dropdown select (or custom Select component)
- Options: product names from products array
- On change: calls onChange(productId)
- Disabled state if no products available

---

#### PlatformSelector

**File:** `src/components/PlatformSelector.tsx`

```typescript
interface PlatformSelectorProps {
  platforms: string[];
  value?: string;
  onChange: (platform: string) => void;
}
```

**Behavior:**
- Dropdown with predefined platforms:
  - "Desktop (Full Width)"
  - "Mobile (Single Column)"
  - "Tablet (Responsive)"
  - (+ others if needed)
- On change: calls onChange(platform)

---

#### OutputModeToggle

**File:** `src/components/OutputModeToggle.tsx`

```typescript
interface OutputModeSelectorProps {
  mode: 'html' | 'copy';
  onChange: (mode: 'html' | 'copy') => void;
}
```

**Behavior:**
- Two radio button options: "HTML Output" (default) and "Copy Only"
- On change: calls onChange(mode)
- Updates ProjectContext.output_mode

---

### Display & Preview Components

#### SkeletonPreview

**File:** `src/components/SkeletonPreview.tsx`

```typescript
interface SkeletonPreviewProps {
  format: string;
  height?: number;
}
```

**Behavior:**
- Renders a pure CSS/SVG wireframe skeleton of the format layout
- Used in FormatCard and SectionCard (mini version)
- No images needed, just gray boxes and lines
- Responsive, scales to container

---

#### OutputPanel

**File:** `src/components/OutputPanel.tsx`

**EMBEDDED COMPONENT:** OutputPanel is part of the split-view layout within SectionPlanner, not a standalone route.

```typescript
interface OutputPanelProps {
  content: string; // generated prompt or HTML
  mode: 'html' | 'copy';
  onCopy: () => void;
  onDownload: () => void;
}
```

**Behavior:**
- Displays generated prompt or HTML in right-side panel of SectionPlanner
- If mode='html': display raw HTML with scroll
- If mode='copy': display text copy with scroll
- Copy to clipboard button:
  - On click: calls onCopy()
  - Shows success toast "Copied!"
- Download button:
  - If mode='html': downloads as .html file
  - If mode='copy': downloads as .txt file
- Part of SectionPlanner's split-view layout alongside SectionEditor

---

#### NavItem

**File:** `src/components/NavItem.tsx`

```typescript
interface NavItemProps {
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  onClick: () => void;
  active?: boolean;
}
```

**Behavior:**
- Clickable nav item with label + optional icon + optional badge
- Highlight if active
- On click: calls onClick()

---

## 4. Hook Specifications

### useAuth()

**File:** `src/hooks/useAuth.ts`

```typescript
function useAuth(): {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
}
```

**Usage:**
```typescript
const { user, signIn, signOut, loading } = useAuth();
```

**Logic:**
- Returns AuthContext state + actions
- Calls Supabase Auth methods internally
- Handles token refresh

---

### useBrands()

**File:** `src/hooks/useBrands.ts`

```typescript
function useBrands(): {
  brands: Brand[];
  products: Product[];
  activeBrand: Brand | null;
  activeProducts: Product[];
  loading: boolean;
  error: string | null;
  canAddBrand: boolean;
  createBrand: (data: CreateBrandInput) => Promise<Brand>;
  updateBrand: (id: string, data: UpdateBrandInput) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  createProduct: (data: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  setActiveBrand: (id: string | null) => void;
  loadBrandsAndProducts: () => Promise<void>;
  clearError: () => void;
}
```

**Usage:**
```typescript
const { brands, activeBrand, createBrand, deleteProduct } = useBrands();
```

**Logic:**
- Returns BrandContext state + actions
- canAddBrand: checks brands.length < 3
- loadBrandsAndProducts: fetches from Supabase
- Handles error states gracefully

---

### useProjects()

**File:** `src/hooks/useProjects.ts`

```typescript
function useProjects(): {
  project: Project | null;
  sections: Section[];
  isDirty: boolean;
  loading: boolean;
  error: string | null;
  generatedPrompt: string | null;
  generatedHTML: string | null;
  sectionCount: number;
  canGenerate: boolean;
  canSave: boolean;
  sortedSections: Section[];
  loadProject: (projectId: string) => Promise<void>;
  createProject: (formulaId: string, productId: string) => Promise<Project>;
  saveProject: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<Project>;
  addSection: (data: AddSectionInput) => Promise<Section>;
  updateSection: (sectionId: string, data: UpdateSectionInput) => Promise<Section>;
  deleteSection: (sectionId: string) => Promise<void>;
  duplicateSection: (sectionId: string) => Promise<Section>;
  reorderSections: (sections: Section[]) => Promise<void>;
  setOutputMode: (mode: 'html' | 'copy') => void;
  clearError: () => void;
}
```

**Usage:**
```typescript
const { project, sections, canGenerate, saveProject } = useProjects();
```

**Logic:**
- Returns ProjectContext state + actions
- sectionCount: sections.length
- canGenerate: project && product && sections.length > 0
- canSave: isDirty
- sortedSections: sections sorted by order_index
- Handles optimistic UI updates

---

### useSections()

**File:** `src/hooks/useSections.ts`

```typescript
function useSections(): {
  sections: Section[];
  loading: boolean;
  addSection: (projectId: string, data: AddSectionInput) => Promise<Section>;
  updateSection: (sectionId: string, data: UpdateSectionInput) => Promise<Section>;
  deleteSection: (sectionId: string) => Promise<void>;
  reorderSections: (projectId: string, newOrder: Section[]) => Promise<void>;
  duplicateSection: (sectionId: string) => Promise<Section>;
}
```

**Usage:**
```typescript
const { sections, addSection, deleteSection } = useSections();
```

**Logic:**
- Encapsulates section CRUD operations
- reorderSections: updates order_index for all sections
- Optimistically updates UI

---

### usePromptEngine()

**File:** `src/hooks/usePromptEngine.ts`

```typescript
interface PromptEngineOptions {
  project: Project;
  sections: Section[];
  product: Product;
  brand: Brand;
  mode: 'html' | 'copy';
}

function usePromptEngine(options: PromptEngineOptions): {
  generatedPrompt: string | null;
  generatedHTML: string | null;
  loading: boolean;
  error: string | null;
  generatePrompt: () => Promise<string>;
  generateHTML: () => Promise<string>;
}
```

**Usage:**
```typescript
const { generatePrompt, generatedPrompt, loading } = usePromptEngine({
  project,
  sections,
  product,
  brand,
  mode: project.output_mode
});
```

**Prompt Assembly Logic (4 Layers):**

1. **Global Context Layer**
   - AI persona: "You are an expert copywriter..."
   - General rules: avoid overclaiming, skim-friendly, ad-compliant
   - Platform constraints: responsive rules based on project.platform
   - Brand guidelines: font, color, button style, design vibe pulled from Brand object
   - Example:
     ```
     # GLOBAL CONTEXT
     You are an expert copywriter specializing in landing pages.
     Use modern, skim-friendly language. Avoid overclaiming or medical/legal claims.
     Design Style: Use Font: Inter. Colors: Primary: #2563EB, Accent: #60A5FA, Button: rounded, Vibe: minimalist and clean.
     Output format: [HTML / Copy]
     Platform: [Desktop / Mobile / Tablet]
     ```

2. **Product Brief Layer**
   - Auto-pulled from Product object
   - Fields: name, description, pricing, target_audience, pain_points, objections, usp
   - Example:
     ```
     # PRODUCT BRIEF
     Product: [name]
     Description: [description]
     Pricing: [price_normal] / Promo: [price_promo]
     Target Audience: [target_audience]
     Pain Points: [pain_points]
     Objections: [objections]
     USP: [usp]
     ```

3. **Section Blocks Layer** (repeated per section)
   - Per section: title, goals, layout format, style mode, framework position, additional context
   - Example:
     ```
     --- SECTION 1: "Grab Attention" ---
     Goals: [section.section_goals]
     Framework Position: [section.framework_position] (if formula-based)
     Layout Format: [section.layout_format]
     Style: [Default (follow brand) / Custom: section.style_custom]
     Additional Context: [section.additional_context]

     Write the HTML/copy for this section following the goals and style.
     --- END SECTION 1 ---
     ```

4. **Output Instruction Layer**
   - Format: HTML with Tailwind CSS / Copy text only
   - Responsive rules: breakpoints, mobile-first approach
   - Validation: proper HTML structure, valid CSS
   - Example:
     ```
     # OUTPUT INSTRUCTION
     Format: [HTML with Tailwind CSS / Copy Text]
     Requirements:
     - Use Tailwind utility classes (no custom CSS)
     - Responsive design: mobile-first approach
     - HTML valid, semantic markup
     - No external images (use Tailwind patterns/gradients)
     - Return ONLY the HTML/copy, no explanations
     ```

**Return:**
- Full assembled prompt (string)
- Sent to Claude API for generation
- Returns generated HTML or copy

---

### useLocalStorage()

**File:** `src/hooks/useLocalStorage.ts`

```typescript
function useLocalStorage<T>(key: string, initialValue?: T): [
  value: T,
  setValue: (value: T | ((val: T) => T)) => void
]
```

**Usage:**
```typescript
const [code, setCode] = useLocalStorage('htmlEditor:lastCode', '');
```

**Logic:**
- Syncs component state with localStorage
- JSON serialization / deserialization
- Used for HTML Editor persistence

---

### useDndKit()

**File:** `src/hooks/useDndKit.ts`

```typescript
interface DndContextOptions {
  items: Section[];
  onReorder: (newOrder: Section[]) => void;
}

function useDndKit(options: DndContextOptions): {
  sensors: Sensor[];
  collisionDetection: (args: any) => any;
  announcements: Announcements;
}
```

**Usage:**
```typescript
const dndProps = useDndKit({
  items: sections,
  onReorder: (newSections) => reorderSections(newSections)
});
```

**Logic:**
- Wraps @dnd-kit/core setup
- Mouse + touch sensors
- Handles section reordering

---

## 5. Data Flow Examples

### Flow: User Creates New LP from Formula

```
1. User at FormulaGallery clicks "AIDCA" card
2. FormulaCard onClick -> ProjectContext.createProject('aidca', activeBrandId)
3. ProjectContext:
   - Fetches AIDCA formula from FORMULAS.ts
   - Creates Project record in DB (mode='formula', framework='aidca')
   - Creates 5 Section records (auto-populated from formula.sections)
     - Each section's layout_format uses explicit `s.defaultLayout` from formulas.ts
     - Falls back to `inferDefaultLayout(frameworkPosition, sectionTitle)` if defaultLayout is omitted
   - Returns Project object
4. Navigate to /generator/:projectId
5. SectionPlanner mounts:
   - ProjectContext.loadProject(projectId)
   - Displays all 5 sections with smart layout defaults already set
   - User can edit each section
6. User clicks Generate:
   - usePromptEngine.generatePrompt()
   - Assembles 4-layer prompt
   - Sends to Claude API
   - Returns HTML/copy in OutputPanel
7. User clicks Save:
   - ProjectContext.saveProject()
   - Sets isDirty = false
   - Confirms save toast
```

---

### Flow: User Edits Section Layout

```
1. User in SectionPlanner clicks expand on section card
2. SectionEditor appears
3. User clicks "Choose Layout" button
4. FormatGalleryModal opens with 22 format cards
5. User clicks "Before-After" card
6. FormatCard onClick -> ProjectContext.updateSection(sectionId, { layout_format: 'before-after' })
7. ProjectContext:
   - Sends UPDATE query to sections table
   - Updates local sections state
   - Sets isDirty = true
8. SectionCard updates:
   - Format badge changes to "Before-After"
   - SkeletonPreview updates to show before-after wireframe
9. Modal closes automatically
10. User can now generate with new layout
```

---

### Flow: User Saves Project and Navigates Away with Unsaved Changes

```
1. User in SectionPlanner edits section title
2. SectionEditor input blur -> ProjectContext.updateSection()
3. isDirty = true
4. User clicks Back button
5. Since isDirty = true:
   - Modal appears: "Kamu punya perubahan yang belum disimpan. Yakin mau keluar?"
   - Options: "Simpan", "Keluar", "Batal"
6. If Simpan:
   - ProjectContext.saveProject() -> isDirty = false
   - navigate('/saved')
7. If Keluar:
   - navigate('/saved') without saving (changes discarded)
8. If Batal:
   - Modal closes, user stays in SectionPlanner
```

---

## 6. Error Handling & Edge Cases

### Brand Limit
- Free tier: max 3 brands
- On create: check useBrands().canAddBrand
- If false: AddBrandButton disabled, show tooltip "Max 3 brands. Upgrade to add more."

### Product Limit
- Free tier: max 10 products per user
- On create: check product count vs limit
- If limit exceeded: show error toast "Max 10 products. Upgrade to add more."

### Project Limit
- Free tier: max 4 projects
- On create: check project count vs limit
- If limit exceeded: show error toast "Max 4 projects. Delete one to create new."

### No Product Selected
- In SectionPlanner: if no product selected, canGenerate = false
- Generate button disabled
- Show tooltip "Select a product to generate."

### No Sections
- In SectionPlanner: if sections.length === 0, canGenerate = false
- Generate button disabled
- Show message "Add at least one section to generate."

### API Errors
- Supabase errors caught in try/catch
- Show error toast: "Oops! Something went wrong. [error message]"
- Provide retry button for failed operations
- Log errors to console for debugging

### Offline Mode
- Browser detects offline
- Show banner: "You're offline. Changes won't sync until connection restored."
- Allow editing, save to localStorage
- On reconnect: auto-sync to server

---

## 7. TypeScript Interfaces (Complete Reference)

All TypeScript types used throughout the app (beyond those already defined above):

```typescript
// Input Types for Create/Update
interface CreateBrandInput {
  name: string;
  font_style?: string;
  font_custom?: string;
  color_palette?: string;
  color_primary?: string;
  color_accent?: string;
  color_neutral?: string;
  button_style?: string;
  design_vibe?: string;
  vibe_custom?: string;
}

interface UpdateBrandInput extends Partial<CreateBrandInput> {}

interface CreateProductInput {
  brand_id: string;
  name: string;
  description: string;
  price_normal: string;
  price_promo?: string;
  target_audience?: string;
  pain_points?: string;
  objections?: string;
  usp?: string;
}

interface UpdateProductInput extends Partial<CreateProductInput> {}

interface AddSectionInput {
  section_title: string;
  section_goals: string;
  layout_format?: string;
  framework_position?: string;
  style_mode?: 'default' | 'custom';
  style_custom?: string;
  additional_context?: string;
}

interface UpdateSectionInput extends Partial<AddSectionInput> {}

// Format Type (for layout gallery)
interface Format {
  id: string;
  name: string;
  description: string;
  skeletonSvg: string;
}

// Toast Notification Type
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
```

---

## 8. File Structure

```
src/
├── components/
│   ├── Sidebar.tsx
│   ├── AppLayout.tsx
│   ├── LoginForm.tsx
│   ├── BrandGuidelinesModal.tsx
│   ├── BrandForm.tsx
│   ├── ProductForm.tsx
│   ├── FormulaCard.tsx
│   ├── SectionCard.tsx
│   ├── SectionEditor.tsx
│   ├── ProjectCard.tsx
│   ├── BrandCard.tsx
│   ├── FormatCard.tsx
│   ├── FormatGalleryModal.tsx
│   ├── ProductSelector.tsx
│   ├── PlatformSelector.tsx
│   ├── OutputModeToggle.tsx
│   ├── OutputPanel.tsx
│   ├── SkeletonPreview.tsx
│   ├── NavItem.tsx
│   ├── AddSectionForm.tsx
│   ├── GlobalBar.tsx
│   ├── ActionBar.tsx
│   └── Toast.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── ProductDashboard.tsx
│   ├── FormulaGallery.tsx
│   ├── SectionPlanner.tsx
│   ├── SavedProjectsList.tsx
│   └── HtmlEditor.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── BrandContext.tsx
│   └── ProjectContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useBrands.ts
│   ├── useProjects.ts
│   ├── useSections.ts
│   ├── usePromptEngine.ts
│   ├── useLocalStorage.ts
│   └── useDndKit.ts
├── services/
│   ├── supabaseClient.ts
│   ├── authService.ts
│   ├── brandService.ts
│   ├── projectService.ts
│   └── promptService.ts
├── types/
│   └── index.ts
├── constants/
│   ├── formulas.ts (re-export from FORMULAS.ts)
│   ├── formats.ts (22 layout formats)
│   ├── brandPresets.ts
│   └── platformOptions.ts
├── styles/
│   ├── globals.css
│   ├── tailwind.css
│   └── skeletons.css
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   ├── prompt-builder.ts
│   └── api-helpers.ts
├── App.tsx
└── main.tsx
```

---

## 9. Routing Configuration

```typescript
// App.tsx
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BrandProvider } from './contexts/BrandContext';
import { ProjectProvider } from './contexts/ProjectContext';

const router = createBrowserRouter([
  // Public route
  { path: '/login', element: <LoginPage /> },

  // Root redirect
  { path: '/', element: <RootRedirect /> },

  // Protected routes wrapped with BrandProvider and AppLayout
  {
    element: (
      <ProtectedRoute>
        <BrandProvider>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </BrandProvider>
      </ProtectedRoute>
    ),
    children: [
      // Product Dashboard
      { path: '/products', element: <ProductDashboard /> },

      // Saved Projects (loads own project list, outside ProjectProvider)
      { path: '/saved', element: <SavedProjectsList /> },

      // HTML Editor
      { path: '/editor', element: <HtmlEditor /> },

      // Generator routes with ProjectProvider
      {
        element: <ProjectProvider><Outlet /></ProjectProvider>,
        children: [
          { path: '/generator/new', element: <FormulaGallery /> },
          { path: '/generator/:projectId', element: <SectionPlanner /> },
        ]
      },

      // Generator root redirect
      { path: '/generator', element: <GeneratorRedirect /> },
    ]
  },

  // 404 fallback
  { path: '*', element: <NotFound /> }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

---

## 10. State Update Patterns

### Optimistic Updates
- For fast feedback, update local state before server confirmation
- Example:
  ```typescript
  // Local update
  setProject({ ...project, is_dirty: true });
  // Server update
  updateProject(projectId, data).catch(error => {
    setProject(previousProject); // Rollback on error
  });
  ```

### Derived State
- Avoid storing derived values in state
- Compute on-the-fly in hooks
- Example:
  ```typescript
  const sectionCount = sections.length;
  const canGenerate = project && product && sections.length > 0;
  ```

### Dirty Tracking
- isDirty flag indicates unsaved changes
- Set to true on any mutation
- Set to false after saveProject()
- Use for save button enable state + unsaved warning

---

## 11. Accessibility Considerations

- All buttons: proper ARIA labels
- Form inputs: labels associated via htmlFor
- Modals: ARIA role="dialog", focus trap
- Drag-drop: keyboard support via DndKit
- Color: not sole indicator (use icons, text)
- Typography: sufficient contrast ratio (WCAG AA)
- Navigation: semantic HTML structure

---

## 12. Performance Optimizations

- Code-split page routes with React.lazy()
- Memoize expensive components (React.memo)
- Debounce input handlers (500ms for section editor)
- Virtual list for projects if > 10 (rare)
- Lazy-load skeleton preview SVGs
- Compress generated HTML output

---

## 13. Testing Checklist

- Unit tests for hooks (useAuth, useBrands, useProjects)
- Integration tests for context providers
- E2E tests for critical flows (create LP, save project, generate)
- Component tests for modals and forms
- Accessibility audit (Axe, Lighthouse)
- Performance profiling (React DevTools Profiler)

---

**Document End**

This COMPONENTS.md is exhaustive and developer-ready. Every component, context, hook, and flow is specified with TypeScript interfaces, behavior descriptions, and usage examples. A developer can build the entire application from this spec alone.
