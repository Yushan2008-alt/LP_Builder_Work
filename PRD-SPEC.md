# PRD-SPEC: LP Block Builder Engine
**AI-Powered Landing Page Generator with Visual Section Planning & Product Knowledge Database**

| Field | Detail |
|---|---|
| Document Version | 2.1 (Developer Specification) |
| Date | 6 April 2026 |
| Target Launch | Q3 2026 (MVP) |
| Status | Ready for Implementation |

---

## Project Setup Instructions

### Initial Setup

```bash
npm create vite@latest lp-block-builder -- --template react-ts
cd lp-block-builder
npm install
```

### Dependencies

```bash
npm install \
  @supabase/supabase-js \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities \
  tailwindcss \
  dompurify \
  react-router-dom
```

### Dev Dependencies

```bash
npm install --save-dev \
  @types/dompurify \
  @types/node \
  typescript
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Initial Tailwind Setup

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js` with output paths and extend theme for brand presets.

---

## 1. Executive Summary

### Problem
- Users cannot visualize LP structure before generation
- No per-section control (only on/off checkboxes)
- Cannot iterate without full page regeneration
- Product info must be re-entered for each LP
- No project persistence

### Solution
LP Block Builder Engine is a 3-in-1 platform:

1. **Product Knowledge Database** - Central product & brand management, reusable across projects
2. **LP Generator** - Visual block-based section planner with 20 copywriting formulas + custom builder
3. **Live HTML Editor** - Edit output HTML directly in platform

### Key Differentiators
- Product Knowledge Database with persistent reusable data
- Multi-brand support (max 3 brands, 10 products)
- Brand Guidelines system (font, color, button, design vibe) auto-applied to all LPs
- Visual block gallery with drag-to-reorder + skeleton preview
- Per-section modular prompt templates
- Layout DECOUPLED from section type (any format on any section)
- 4-layer section-aware prompt architecture
- Manual save + unsaved warning on close
- Integrated HTML editor (not separate page)
- Deep platform-specific optimization (3 single-col + 5 responsive platforms)

---

## 3. Platform Architecture

### Application Structure

After login, user enters sidebar-based layout with 3 main modules:

```
Sidebar
├── Product Knowledge Database
│   └── Brand Management
│       ├── Brand Guidelines (font, color, button, vibe)
│       └── CRUD Products (descriptions, pricing)
├── LP Generator
│   ├── Create New LP → Formula Gallery (20 formulas + Custom)
│   └── Open Saved Project (max 4)
└── Live HTML Editor
```

### Module Relationships

- **Product Knowledge Database** standalone. Define product data here first.
- **LP Generator** reads from Product Knowledge Database. User selects which product(s) to use.
- **Live HTML Editor** receives output from LP Generator for inline editing.

---

## 4. Core Features

### 4.1 Product Knowledge Database

Central location for managing all product and brand data. Referenced by LP Generator, persisted across projects.

#### CRUD Operations

| Operation | Detail |
|---|---|
| Create | Add new product with description and pricing |
| Read | View all products, filter by brand |
| Update | Edit description, pricing, brand assignment |
| Delete | Delete product (with confirmation) |

#### Product Fields

| Field | Type | Required | Description |
|---|---|---|---|
| product_name | VARCHAR(255) | Yes | Product name |
| brand_name | VARCHAR(100) | Yes | Brand name (for grouping) |
| brand_id | UUID (FK) | Yes | Reference to brands table |
| description | TEXT | Yes | Full product description |
| price_normal | VARCHAR(50) | Yes | Normal price |
| price_promo | VARCHAR(50) | No | Promo price (optional) |
| target_audience | TEXT | No | Target market description |
| pain_points | TEXT | No | Key audience pain points |
| objections | TEXT | No | Common buyer objections |
| usp | TEXT | No | Unique selling proposition |
| created_at | TIMESTAMP | Auto | Created timestamp |
| updated_at | TIMESTAMP | Auto | Last modified timestamp |

#### Brand Guidelines Popup

When user creates or edits a brand, a modal appears for setting visual style. This is minimal but impactful—results are saved at brand level and auto-inherited by every LP using that brand.

##### Style Preset Options

| Setting | Preset Options | Custom Option |
|---|---|---|
| **Font Style** | Modern Sans / Bold Impact / Elegant Serif / Playful Rounded / Monospace Tech | User enters custom font name (Google Fonts) |
| **Primary Color** | 8 curated palettes (each with primary + accent + neutral) | Hex code input |
| **Button Style** | Rounded / Sharp Corner / Pill / Outline (Ghost) | - (preset only) |
| **Design Vibe** | Minimalist / Corporate / Energetic / Premium / Playful / Dark Mode | User enters custom vibe description |

##### Font Style Preset Detail

| Preset | Font Family | Best For |
|---|---|---|
| Modern Sans | Inter, Plus Jakarta Sans, DM Sans | SaaS, tech, startup, clean professional |
| Bold Impact | Montserrat Bold, Poppins Black, Bebas Neue | Fitness, coaching, high-energy offers |
| Elegant Serif | Playfair Display, Lora, Cormorant | Premium, fashion, luxury, beauty |
| Playful Rounded | Nunito, Quicksand, Comfortaa | Kids, casual brands, friendly products |
| Monospace Tech | JetBrains Mono, Fira Code, Space Mono | Developer tools, tech, hacker vibe |

##### Color Palette Presets

| Palette | Primary | Accent | Neutral | Best For |
|---|---|---|---|---|
| Ocean Blue | #2563EB | #60A5FA | #F1F5F9 | SaaS, corporate, trust |
| Sunset Orange | #EA580C | #FB923C | #FFF7ED | Energy, food, urgency |
| Forest Green | #16A34A | #4ADE80 | #F0FDF4 | Health, eco, organic |
| Royal Purple | #7C3AED | #A78BFA | #F5F3FF | Premium, creative, luxury |
| Rose Pink | #E11D48 | #FB7185 | #FFF1F2 | Beauty, fashion, feminine |
| Midnight Dark | #1E293B | #475569 | #F8FAFC | Tech, dark mode, modern |
| Warm Gold | #B45309 | #FCD34D | #FFFBEB | Finance, premium, coaching |
| Coral Bright | #DC2626 | #F87171 | #FEF2F2 | Bold, sales, attention-grab |

##### Behavior

- **First-time creation**: Popup appears after user enters brand name. User can "Use Defaults" (skip) or set style.
- **Edit existing**: User can reopen popup from brand settings.
- **Defaults**: Modern Sans + Ocean Blue + Rounded + Minimalist if skipped.
- **Prompt impact**: Brand guidelines enter Global Context layer as AI instructions: "Use Inter/DM Sans. Primary: #2563EB, accent: #60A5FA. Button: rounded. Vibe: minimalist and clean."
- **Override per section**: If user sets Style LP = Custom in section editor, custom style overrides brand guidelines for that section only.

#### Limits & Upgrade Path

| Resource | Free Tier | Upgrade |
|---|---|---|
| Brands | Max 3 | TBD |
| Products | Max 10 | TBD |
| Custom fields | Not available | TBD |

---

### 4.2 LP Generator - Unified Formula Gallery

Main module. When user clicks "Create New LP", they enter **Formula Gallery**—one view with 20 formula cards + 1 Custom card.

#### Gallery Card Anatomy

- **Formula name** (bold, prominent)
- **1-liner description** (what this formula does)
- **Best case tag** (when to use, max 8 words)
- **Section count badge** (e.g., "5 sections")
- **Tier badge** (Foundational / Comprehensive / Modern / Specialized)

Custom card has distinct visual: blank canvas icon, "Start from scratch" label, no section count.

#### Complete Formula Gallery (20 Formulas + Custom)

##### Tier 1: Foundational (5 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 1 | **AIDA** | 4 | Hero (Attention) > Interest > Desire > CTA (Action) | Grab attention > Engage with fresh info > Show life improvement > Clear next step | Product launches, awareness campaigns, considered purchases |
| 2 | **PAS** | 4 | Hero > Pain Deep-Dive > Agitation > Solution + CTA | Identify specific problem > Amplify pain > Present product as relief > Close | Pain-driven products, ads, short LP |
| 3 | **BAB** | 4 | Hero (Before) > After > Bridge > CTA | Describe current struggle > Paint ideal future > Introduce product as link > Drive action | Cold emails, transformation products, coaching, health/fitness |
| 4 | **FAB** | 3 | Features > Advantages > Benefits | State what product IS/HAS > Explain what features DO > Tell what's in it for THEM | Product pages, SaaS breakdown, ecommerce, B2B comparison |
| 5 | **1-2-3-4 Formula** | 4 | What I've Got > What It Does For You > Who Am I > What To Do Next | State offering clearly > Explain benefits in "you" language > Build trust > Clear CTA with urgency | Lead-gen pages, email campaigns, beginners |

##### Tier 2: Comprehensive Sales Frameworks (5 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 6 | **PASTOR** | 6 | Hero (Problem) > Amplify > Story > Transformation > Offer > Response | Call out pain > Amplify consequences > Tell relatable story > Show before/after > Present deliverables > Clear CTA | High-ticket ($500+), info products, coaching, courses, personality brands |
| 7 | **AIDCA** | 5 | Hero (Attention) > Interest > Desire > Conviction > CTA (Action) | Hook with compelling headline > Engage with counter-intuitive info > Appeal to emotions > Prove claims are TRUE and SAFE > Compelling CTA | Skeptical audiences, new brands, paid traffic, high-ticket |
| 8 | **QUEST** | 5 | Qualify > Understand > Educate > Stimulate > Transition | Filter ideal readers > Show deep empathy > Introduce solution + credibility > Create intense desire > Convert with offer + guarantee | Long-form sales, courses, coaching, membership |
| 9 | **4Ps (PPPP)** | 4 | Promise > Picture > Proof > Push | Bold compelling claim > Vivid mental image of life after > Testimonials + case studies + stats > CTA tying everything together | Emotionally-driven B2C, product-aware prospects, conversion-focused |
| 10 | **ACCA** | 4 | Awareness > Comprehension > Conviction > Action | Bring problem to attention > Explain HOW it affects them > Build certainty through evidence > Clear CTA | Complex/innovative products, nonprofits, B2B, unaware audiences |

##### Tier 3: Modern Guru Frameworks (4 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 11 | **StoryBrand (SB7)** | 7 | Hero (Character) > Problem > Guide > Plan > CTA > Failure > Success | Customer wants something > 3-layer problem > Show empathy + authority > Simple 3-step plan > Direct + transitional CTA > Consequences > Promised land | Service businesses, coaches, consultants, B2B, unclear messaging |
| 12 | **Hook-Story-Offer** | 4 | Hero (Hook) > Story > Offer Stack > CTA | Interrupt + intrigue + target > Emotional story guiding to product > Compelling price/value stack + bonuses + guarantee > Final push | Digital products, courses, SaaS, ecommerce, funnel optimization |
| 13 | **Star-Story-Solution** | 3 | Star (Character Intro) > Story (Challenge) > Solution | Introduce relatable main character > Their challenges, pain, aspirations > Product is what helped them succeed | Lead-gen pages, personality brands, info products, coaching |
| 14 | **Epiphany Bridge** | 8 | Backstory > Desires > The Wall > The Epiphany > The Plan > The Conflict > The Achievement > The Transformation | Where you were before > What you wanted > What stopped you > The insight that shifted everything > What you did next > Path wasn't easy > Results achieved > Who you became | Personal brands, course creators, selling transformation |

##### Tier 4: Specialized Formulas (6 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 15 | **AICPBSAWN** | 9 | Attention > Interest > Credibility > Proof > Benefits > Scarcity > Action > Warn > Now | Compelling hook > Sustain curiosity > Establish expertise > Third-party validation > Clear benefits > Limited time/quantity > Explicit CTA > Consequences of inaction > Final urgency | Long-form cold traffic, high-ticket, comprehensive pages |
| 16 | **IDCA** | 4 | Interest > Desire > Conviction > Action | Engage immediately (attention captured by ad) > Appeal to emotions > Provide proof + risk reversal > Clear CTA | Post-ad landing pages, retargeting, email click-throughs, paid traffic |
| 17 | **SLAP** | 4 | Stop > Look > Act > Purchase | Interrupt the scroll > Sustain attention for crucial seconds > Prompt immediate action > Complete the sale | Low-cost impulse buys, flash sales, daily deals |
| 18 | **6+1 Formula** | 6 | Context > Attention > Desire > The Gap > Solution > CTA (+1: Credibility throughout) | Why are they seeing this? > Hook them > Build want > Consequences of inaction > Present solution > Drive action | Cold traffic, new brands, trust-first selling |
| 19 | **Crossroads** | 4 | The Old Way > The New Way > Contrast Outcomes > CTA | Paint painful status quo > Introduce solution as new path > Show diverging outcomes side by side > Make choice obvious | SaaS pages, B2B, comparison/upgrade offers, competitor positioning |
| 20 | **String of Pearls** | 5 | Hook > Pearl 1 (Story/Proof) > Pearl 2 (Story/Proof) > Pearl 3 (Story/Proof) > CTA | Set the stage > First compelling evidence/story > Second compelling evidence/story > Third compelling evidence/story > Overwhelming evidence drives action | Testimonial-heavy pages, bullet-heavy sales pages, social proof stacking |

##### Custom (Blank Canvas)

| Card | Sections | Description | Best Case |
|---|---|---|---|
| **Custom** | 0 (start empty) | Blank canvas. User manually adds sections one by one. No pre-populated sections or default goals. | Experienced copywriters, unique/hybrid structures, niche use cases |

#### Gallery Flow

**Step 1:** User clicks "Create New LP" in sidebar.

**Step 2:** Formula Gallery appears (grid view). 21 cards displayed with tier grouping. Search bar above for filtering. Custom card at end with distinct visual.

**Step 3a (Formula):** User clicks formula card. System auto-generates section plan. All sections get default title & goals.

**Step 3b (Custom):** User clicks "Custom" card. Blank canvas. User manually adds sections.

**Step 4:** User can edit, reorder, add, delete sections before generate.

#### Open Saved Project

User can click "Open Saved Project" in sidebar to open one of max 4 saved projects and continue editing.

---

### 4.3 Section Editor

After sections are created (via Formula or Custom), user can edit each section. Per-section fields:

| Field | Type | Required | Description |
|---|---|---|---|
| Section Title | Text input | Yes | Custom label (e.g., "Why Act Now?") |
| Section Goals | Text input | Yes | Section objective (e.g., "Make audience aware of problem") |
| Format/Layout | Select from gallery | Yes | Choose layout visual (decoupled from section type) |
| Product | Select from DB | Yes | Which product is referenced |
| Style LP | Toggle | Yes | Default (AI decides) OR Custom (user writes style description) |
| Additional Context | Textarea | No | Brief instructions for AI |

#### Important: Product & Brand Referenced, Not Re-entered

When user selects product in section editor, data (description, pricing, pain points, etc.) is auto-pulled from Product Knowledge Database. No re-entry required.

#### Important: Style LP Has 2 Sub-modes

- **Default**: AI determines style based on format/layout + global design style. User provides no input.
- **Custom**: User writes custom style description (e.g., "Dark colors, large typography, minimalist"). Overrides default style in prompt.

---

### 4.4 Format/Layout Gallery (Decoupled)

Layout formats are **NOT tied to section type**. User can apply any layout to any section.

#### Available Layout Formats (22 Total)

| Format | Skeleton Preview Description |
|---|---|
| Standard Image | Split layout - image on one side, text on other |
| VSL (Video) | Large video embed center, headline above, CTA below |
| Typographic | Text-only, large typography as main visual |
| Split Screen | 50/50 split with different content on each side |
| Story-Based | Narrative flow, long paragraphs with visual support |
| Stat Counter | Large numbers in grid layout |
| Before-After | Side-by-side or stacked comparison |
| Feature Grid | Grid cards with icon + title + description |
| Icon List | Vertical list with icons on left, text on right |
| Bento Layout | Asymmetric grid cards (bento box style) |
| Quote Cards | Card-based layout with quotation marks, name, photo |
| Video Testimonial | Video embed(s) with caption |
| Screenshot Chat | Chat bubble/screenshot style testimonials |
| Single Offer | One large box with pricing, benefits list, CTA |
| Comparison Table | Multi-column comparison table |
| Tier Cards | Side-by-side pricing cards (Basic/Pro/Premium) |
| Moving Marquee | Horizontal scrolling content strip |
| Promo Coret | Strikethrough price with new price |
| Accordion | Expandable Q&A sections |
| Timeline | Chronological steps/milestones |
| Logo Bar | Horizontal row of logos/badges |
| Card Grid | Equal-size cards in responsive grid |

#### Gallery UI: Skeleton Preview Popup

When user selects a format, popup appears showing:
- Skeleton wireframe (gray boxes representing layout)
- User can immediately visualize "oh, my section will look like this"
- Skeletons built with pure CSS/SVG (no image assets needed)

---

### 4.5 Section-Aware Prompt Engine

#### Prompt Architecture

Prompt built from 4 layers:

| Layer | Content | Scope |
|---|---|---|
| Global Context | AI persona, general rules (anti-overclaim, skimming-friendly, ad compliance), platform constraints, brand color, design style | Written 1x at start |
| Product Brief | Auto-pulled from Product Knowledge Database: name, description, pricing, target, pain points, objections, USP | Written 1x after global context |
| Section Blocks | Per section: title + goals + format/layout instruction + style instruction + additional context | Repeated per section |
| Output Instruction | Output format (HTML/Copy), responsive rules, Tailwind CSS instruction | Written 1x at end |

#### Example Section Block in Prompt

```
--- SECTION 2: "Masalah yang Kamu Rasakan" ---
Goals: Make audience aware and relate to their problem
Format: Before-After (side-by-side comparison layout)
Style: Default (follow global design style)
Framework Position: This is the "Problem" part of AIDCA framework
Product Reference: [auto-pulled from Product Knowledge DB]
Additional Context: Focus on pain point "fear of wasted ad spend"
--- END SECTION 2 ---
```

#### Template Count Estimate

- 1x Global Context template
- 1x Product Brief template (auto-populated from DB)
- 1x Brand Guidelines sub-template
- ~22x Format/Layout templates
- 2x Output Instruction templates (HTML + Copy)
- 20x Formula Mapping configs
- **Total: ~47 template files**

---

### 4.6 Project Management

#### Save Behavior: Manual Save

- No auto-save. User clicks "Save" button manually.
- If user tries to close with unsaved changes, show warning: "Kamu punya perubahan yang belum disimpan. Yakin mau keluar?"
- Rationale: Full user control, no accidental saves, lighter database load.

#### Project Limits

| Resource | Limit | Upgrade |
|---|---|---|
| Saved Projects | Max 4 per account | TBD |
| Sections per Project | No limit (recommended max 15 for prompt performance) | - |

#### Project Operations

| Operation | Detail |
|---|---|
| Create New | Select from Formula Gallery or Custom |
| Open Saved | List max 4 projects, click to open |
| Save | Manual save, overwrites existing |
| Delete | Delete project (with confirmation) |
| Duplicate | Copy project for variations (counts toward 4 limit) |

---

### 4.7 Live HTML Editor

Standalone module in sidebar. Accessible independently or as continuation from LP Generator.

#### Main Functions

- Code editor for HTML (Monaco Editor or CodeMirror)
- Live preview in iframe (split panel: code left, preview right)
- User can paste output from LP Generator and edit directly
- Syntax highlighting + basic auto-complete

---

### 4.8 Copy-First Mode

Toggle switch in LP Generator between 2 output modes:

- **HTML Mode** (default) - Generate full HTML with Tailwind CSS, ready to deploy
- **Copy Mode** - Generate copy text only (no markup), ready for Canva, Figma, Google Docs, or other platforms

Implementation: Global Context and Section templates stay same. Only Output Instruction template changes.

---

## 5. User Flows

### 5.1 First-Time User (Onboarding)

1. User registers/logs in (Supabase Auth)
2. Directed to **Product Knowledge Database** for brand setup
3. **Brand Guidelines popup** appears: user selects font, color, button style, design vibe (or "Use Defaults")
4. User adds first product: name, description, pricing
5. User enters **LP Generator**
6. Continue to flow 5.2

### 5.2 Flow A: Create New LP (Unified Gallery)

1. User clicks "Create New LP" in sidebar
2. **Formula Gallery** appears: 20 formula cards + 1 Custom, grouped by tier
3. User browses gallery (can search/filter). Each card shows name, description, best case, section count
4. **If user selects formula card** (e.g., AIDCA):
   - System auto-generates section plan (5 sections for AIDCA)
   - Each section gets default title & goals
5. **If user selects Custom card:**
   - Blank canvas. User manually adds sections via "+ Add Section"
6. User selects product from Product Knowledge Database (brand guidelines auto-applied)
7. Per section, user can:
   - Edit section title
   - Edit section goals
   - Choose format/layout from gallery (skeleton preview popup)
   - Set style (Default = follow brand guidelines, or Custom = write description)
   - Add optional additional context
8. User can: reorder (drag), add section, delete section, duplicate section
9. User chooses output mode (HTML / Copy)
10. User clicks "Generate"
11. Prompt displayed in output panel
12. User can: Copy to clipboard, or Save project

### 5.3 Flow B: Open Saved Project

1. User clicks "Open Saved Project" in sidebar
2. List of max 4 projects shown (name, formula, last edited)
3. User selects project
4. Project opens with all sections and settings intact
5. User can continue editing or generate immediately

---

## 6. Technical Specification

### 6.1 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | React 18 (SPA) | Proven for this use case |
| Bundler | Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS | Utility-first, consistent with output LP |
| State Management | React Context + useReducer | Sufficient for block/section state |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Lightweight, accessible |
| Auth | Supabase Auth | Email + social login |
| Database | Supabase PostgreSQL | Products, projects, sections |
| Storage | Supabase Storage | Skeleton preview assets (if needed) |
| Hosting | Cloudflare Pages | Edge deployment, fast globally |
| Sanitization | DOMPurify | Required for Live HTML Editor preview |
| Code Editor | Monaco Editor or CodeMirror | For Live HTML Editor module |

### 6.2 Database Schema

#### Table: brands

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Reference to auth.users |
| name | VARCHAR(100) | Brand name |
| font_style | VARCHAR(50) | Preset key or "custom" (default: "modern_sans") |
| font_custom | VARCHAR(255) | Custom font name, nullable |
| color_palette | VARCHAR(50) | Preset key or "custom" (default: "ocean_blue") |
| color_primary | VARCHAR(7) | Hex primary color |
| color_accent | VARCHAR(7) | Hex accent color |
| color_neutral | VARCHAR(7) | Hex neutral/background color |
| button_style | VARCHAR(20) | rounded / sharp / pill / outline (default: "rounded") |
| design_vibe | VARCHAR(50) | Preset key or "custom" (default: "minimalist") |
| vibe_custom | TEXT | Custom vibe description, nullable |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

Constraint: Max 3 brands per user_id (enforced via application logic + DB trigger).

#### Table: products

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Reference to auth.users |
| brand_id | UUID (FK) | Reference to brands |
| name | VARCHAR(255) | Product name |
| description | TEXT | Full description |
| price_normal | VARCHAR(50) | Normal price |
| price_promo | VARCHAR(50) | Promo price (nullable) |
| target_audience | TEXT | Target market (nullable) |
| pain_points | TEXT | Audience pain points (nullable) |
| objections | TEXT | Common objections (nullable) |
| usp | TEXT | Unique selling proposition (nullable) |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

Constraint: Max 10 products per user_id.

#### Table: projects

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Reference to auth.users |
| product_id | UUID (FK) | Reference to products |
| name | VARCHAR(255) | Project name |
| framework | VARCHAR(100) | Formula selected from gallery (nullable if custom) |
| mode | ENUM | formula \| custom |
| tone | VARCHAR(100) | Tone/style |
| platform | VARCHAR(50) | Target deployment platform |
| output_mode | ENUM | html \| copy |
| global_settings | JSONB | Additional settings |
| is_dirty | BOOLEAN | Unsaved changes flag (default false) |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

Constraint: Max 4 projects per user_id.

#### Table: sections

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| project_id | UUID (FK) | Reference to projects |
| order_index | INTEGER | Position in LP (0, 1, 2, ...) |
| section_title | VARCHAR(255) | User-defined title |
| section_goals | TEXT | Section objective |
| layout_format | VARCHAR(50) | Format chosen (standard_image, vsl, bento, etc.) |
| style_mode | ENUM | default \| custom |
| style_custom | TEXT | Custom style description (nullable) |
| additional_context | TEXT | Extra brief for AI (nullable) |
| framework_position | VARCHAR(100) | Position in framework (nullable, auto-filled for formulas) |
| created_at | TIMESTAMP | Auto |

#### Table: user_limits

| Column | Type | Description |
|---|---|---|
| user_id | UUID (PK, FK) | Reference to auth.users |
| max_brands | INTEGER | Default 3 |
| max_products | INTEGER | Default 10 |
| max_projects | INTEGER | Default 4 |
| tier | ENUM | free \| pro \| enterprise |
| created_at | TIMESTAMP | Auto |

### 6.3 Prompt Engine Architecture

```
┌─────────────────────────────────────────────┐
│       PROMPT OUTPUT (final string)          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ Layer 1: GLOBAL CONTEXT ──────────────┐ │
│  │ AI persona                             │ │
│  │ Rules (anti-overclaim, compliance)     │ │
│  │ Platform constraints                   │ │
│  │ Brand Guidelines:                      │ │
│  │  ├─ Font style (preset/custom)         │ │
│  │  ├─ Color palette (primary/accent)     │ │
│  │  ├─ Button style (rounded/pill/etc)    │ │
│  │  └─ Design vibe (minimalist/etc)       │ │
│  │ Tone                                   │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 2: PRODUCT BRIEF ───────────────┐ │
│  │ Auto-pulled from Product Knowledge DB  │ │
│  │ Name, description, pricing, audience   │ │
│  │ Pain points, objections, USP           │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 3: SECTION BLOCKS ──────────────┐ │
│  │ For each section in order:             │ │
│  │  ├─ Section title                      │ │
│  │  ├─ Section goals                      │ │
│  │  ├─ Layout format instruction          │ │
│  │  ├─ Style instruction (default/custom) │ │
│  │  ├─ Framework position (if formula)    │ │
│  │  └─ Additional context (if any)        │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 4: OUTPUT INSTRUCTION ──────────┐ │
│  │ HTML: Tailwind CSS, single file        │ │
│  │ Copy: Text only, no markup             │ │
│  │ Platform-specific rules                │ │
│  └────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### 6.4 Platform Layout Rules

| Platform | Layout Rule | Additional Constraints |
|---|---|---|
| Scalev | Single Column | CSS !important to override defaults |
| Berdu | Single Column | CSS !important to override defaults |
| Lynk.id | Single Column | Strict width constraints |
| WordPress | Responsive/Adaptive | Elementor/Divi compatible markup |
| Shopify | Responsive/Adaptive | Liquid-aware class naming |
| Buat.id | Responsive/Adaptive | Standard HTML embed |
| Order Hero | Responsive/Adaptive | Standard HTML embed |
| Mayar | Responsive/Adaptive | Payment integration hooks |

### 6.5 Save Logic

```
User edits something
  → is_dirty = true (React state only, NOT saved to DB)
  → UI shows "unsaved" indicator

User clicks "Save"
  → Write project + all sections to Supabase
  → is_dirty = false
  → UI shows "saved" confirmation

User tries to close/navigate away while is_dirty = true
  → Browser beforeunload warning: "Kamu punya perubahan yang belum disimpan."

User refreshes without saving
  → Changes lost (by design - user chose not to save)
```

---

## 7. UI/UX Specification

### 7.1 Overall Layout

```
┌──────────────────────────────────────────────────────────┐
│ Sidebar (260px)          │  Main Content Area            │
│                          │                               │
│ [Logo]                   │  ┌───────────────────────┐    │
│                          │  │  LP Generator          │    │
│ ▶ Product Knowledge DB   │  │                       │    │
│ ▶ LP Generator           │  │  Section Planner      │    │
│   ├ Create New           │  │  + Output Panel       │    │
│   └ Saved Projects (4)   │  │                       │    │
│ ▶ Live HTML Editor       │  └───────────────────────┘    │
│                          │                               │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Formula Gallery View (Create New LP)

Grid view with 21 cards grouped by tier. Search bar for filtering. Custom card at end with distinct blank canvas visual.

### 7.3 LP Generator Layout (After Formula/Custom Selection)

Split layout:
- **Left**: Section Planner (draggable section cards, add section button, save/generate buttons)
- **Right**: Output Panel (generated prompt display, copy button, HTML/Copy toggle)

### 7.4 Section Card Anatomy

- **Drag handle** (left, ≡ icon)
- **Section title** (editable inline, bold)
- **Goals field** (editable)
- **Format badge** + mini skeleton thumbnail
- **Style indicator** ("Default" or "Custom" badge)
- **Expand/collapse** for additional context field
- **Delete button** (right top, trash icon)
- **Duplicate button** (right top, + icon)

### 7.5 Format Gallery Popup

Grid view with 22 format cards. Each card shows skeleton wireframe (not just title). Search bar for filtering.

---

## 8. MVP Scope & Phasing

### 8.1 Phase 1: MVP (6-8 weeks)

**Product Knowledge Database:**
- CRUD products (name, description, pricing)
- Brand management (name + guidelines)
- Brand Guidelines popup: font style, color palette, button style, design vibe
- Limits: 3 brands, 10 products

**LP Generator:**
- Unified Formula Gallery with 10 core formulas (AIDA, PAS, BAB, FAB, 1-2-3-4, PASTOR, AIDCA, StoryBrand, Hook-Story-Offer, SLAP) + Custom
- Section editor: title, goals, format, style (default only), additional context
- Format gallery with 10 core layouts + skeleton preview
- Drag to reorder sections
- Prompt generation (per-section modular, brand guidelines in Global Context)
- Copy to clipboard
- Manual save + unsaved warning
- Max 4 projects

**Platform:**
- Supabase Auth (email login)
- 3 platform support (Scalev, Berdu, Lynk.id)

**Not in MVP:**
- Live HTML Editor (Phase 2)
- Copy-First Mode (Phase 2)
- Custom style per section (Phase 2)
- Social login (Phase 2)
- Remaining 10 formulas (Phase 2)

### 8.2 Phase 2: Enhancement (4-6 weeks after MVP)

- Live HTML Editor (Monaco/CodeMirror + iframe preview)
- Copy-First Mode (HTML vs Copy toggle)
- Custom style per section
- Expand to 22 layout formats (from 10)
- Expand to 20 formulas + Custom (from 10 + Custom)
- Remaining 5 platforms
- Social login (Google, GitHub)
- Duplicate project
- Export project as JSON

### 8.3 Phase 3: Growth (ongoing)

- Upgrade tier system (higher limits)
- Live preview in LP Generator
- Community format submissions
- A/B variant generation
- Analytics integration
- Team/agency collaboration
- Custom fields in Product Knowledge Database

---

## Validation Rules & Error States

### Brand Limits

- **Reached max 3**: Show toast "Kamu sudah mencapai batas 3 brand. Upgrade untuk menambah."

### Product Limits

- **Reached max 10**: Show toast "Kamu sudah mencapai batas 10 produk."

### Project Limits

- **Reached max 4**: Show toast "Kamu sudah mencapai batas 4 project."

### Required Fields Empty on Save

- Inline red border on field
- Inline error message: "Field ini wajib diisi"

### Generate Without Product Selected

- Disable Generate button
- Tooltip: "Pilih produk terlebih dahulu"

### Generate With 0 Sections

- Disable Generate button
- Tooltip: "Tambah minimal 1 section"

### Unsaved Changes on Navigate Away

- Browser beforeunload warning: "Kamu punya perubahan yang belum disimpan. Yakin mau keluar?"

### Product Delete With Active LP References

- Confirmation modal: "Produk ini digunakan di X project. Yakin hapus?"

### Brand Delete With Products

- Confirmation modal: "Brand ini punya X produk. Hapus brand akan menghapus semua produk."

### Section Drag Reorder

- Optimistic update (visual reorder immediately)
- Revert on error (restore order if save fails)

### Max Section Recommendation

- Soft warning at 15 sections: "Lebih dari 15 section bisa menghasilkan prompt yang terlalu panjang"

---

## File/Folder Structure

```
src/
├── main.tsx
├── App.tsx
├── router.tsx
├── lib/
│   ├── supabase.ts                  # Supabase client init
│   └── utils.ts                     # Shared utilities
├── config/
│   ├── formulas.ts                  # Formula gallery data (20 formulas + Custom)
│   ├── layouts.ts                   # Layout format definitions (22 layouts)
│   ├── brand-presets.ts             # Font, color palette, button, vibe presets
│   └── platform-rules.ts            # Platform-specific layout constraints
├── contexts/
│   ├── AuthContext.tsx              # Supabase auth state
│   ├── BrandContext.tsx             # Active brand + products state
│   └── ProjectContext.tsx           # Active project + sections state
├── hooks/
│   ├── useAuth.ts
│   ├── useBrands.ts
│   ├── useProducts.ts
│   ├── useProjects.ts
│   ├── useSections.ts
│   └── usePromptEngine.ts           # Prompt assembly from 4 layers
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MainContent.tsx
│   │   └── GlobalBar.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── products/
│   │   ├── ProductDashboard.tsx
│   │   ├── BrandCard.tsx
│   │   ├── BrandGuidelinesModal.tsx  # Brand guidelines popup
│   │   ├── ProductForm.tsx
│   │   └── ProductList.tsx
│   ├── generator/
│   │   ├── FormulaGallery.tsx        # Grid of 20 formula + Custom cards
│   │   ├── FormulaCard.tsx
│   │   ├── SectionPlanner.tsx        # Main section planning view
│   │   ├── SectionCard.tsx           # Individual draggable section
│   │   ├── SectionEditor.tsx         # Edit section details (expanded)
│   │   ├── FormatGalleryModal.tsx    # Layout format picker with skeleton preview
│   │   ├── FormatCard.tsx            # Individual layout format card
│   │   ├── SkeletonPreview.tsx       # CSS/SVG skeleton wireframe
│   │   ├── OutputPanel.tsx           # Generated prompt display
│   │   └── SavedProjectsList.tsx
│   ├── editor/
│   │   ├── HtmlEditor.tsx            # Monaco/CodeMirror wrapper
│   │   └── PreviewPane.tsx           # iframe preview
│   └── ui/
│       ├── Toast.tsx
│       ├── ConfirmModal.tsx
│       ├── ColorPicker.tsx
│       └── Badge.tsx
├── prompts/
│   ├── globalContext.ts              # Layer 1 template builder
│   ├── productBrief.ts              # Layer 2 template builder
│   ├── sectionBlock.ts              # Layer 3 template builder
│   ├── outputInstruction.ts         # Layer 4 template builder
│   └── assembler.ts                 # Combines all 4 layers into final prompt
└── types/
    ├── brand.ts
    ├── product.ts
    ├── project.ts
    ├── section.ts
    ├── formula.ts
    └── prompt.ts
```

---

## Appendix B: Layout Format Reference

Complete list of 22 layout formats:

| # | Format | Description | Best For |
|---|---|---|---|
| 1 | Standard Image | Split layout, image + text side by side | Hero, Solution, About |
| 2 | VSL | Video embed center, headline above, CTA below | Hero (video-focused) |
| 3 | Typographic | Large typography as visual, minimal imagery | Hero, Statement sections |
| 4 | Split Screen | 50/50 content split | Before-After, Comparison |
| 5 | Story-Based | Narrative paragraphs with visual support | Problem, Founder Story |
| 6 | Stat Counter | Big numbers in grid | Social Proof, Results |
| 7 | Before-After | Side-by-side or stacked comparison | Transformation, Problem-Solution |
| 8 | Feature Grid | Cards with icon + title + description | Features, Benefits |
| 9 | Icon List | Vertical list with icons | Features, Steps, Checklist |
| 10 | Bento Layout | Asymmetric grid cards | Features, Mixed content |
| 11 | Quote Cards | Quote marks + name + photo cards | Testimonials |
| 12 | Video Testimonial | Video embed(s) with captions | Testimonials |
| 13 | Screenshot Chat | Chat bubble / screenshot style | Social proof, Testimonials |
| 14 | Single Offer | One big box with price + benefits + CTA | Pricing (single product) |
| 15 | Comparison Table | Multi-column comparison | Pricing, vs Competitor |
| 16 | Tier Cards | Side-by-side plan cards | Pricing (tiered) |
| 17 | Moving Marquee | Horizontal scrolling content strip | Logos, Trust badges, Highlights |
| 18 | Promo Coret | Strikethrough price with new price | Pricing, Urgency |
| 19 | Accordion | Expandable Q&A sections | FAQ |
| 20 | Timeline | Chronological steps/milestones | Process, History, Roadmap |
| 21 | Logo Bar | Horizontal row of logos/badges | Social proof, Trust |
| 22 | Card Grid | Equal-size cards in responsive grid | Generic multi-item |
