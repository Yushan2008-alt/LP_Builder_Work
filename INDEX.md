# LP Block Builder Engine - Vibecode Documentation Index

> Kumpulan dokumen teknis untuk AI code builder. Baca file ini PERTAMA sebelum mulai ngoding.

## File Map

```
vibecode/
│
│  ── CORE (untuk coding agent, baca sesuai urutan) ──
├── INDEX.md          ← KAMU DI SINI. Baca ini dulu.
├── PRD-SPEC.md       ← Apa yang harus dibangun (fitur, flow, UI, phasing)
├── SCHEMA.sql        ← Database structure (copy-paste ke Supabase SQL Editor)
├── FORMULAS.ts       ← Copy langsung ke src/config/formulas.ts
├── ROUTES.md         ← Semua route + auth logic + navigation guards
├── COMPONENTS.md     ← Component tree + state management + setiap props interface
├── PROMPTS.md        ← Prompt template strings untuk 4-layer engine
│
│  ── HOWTO (panduan praktis) ──
├── HOWTO-ADD-FORMULA.md  ← Step-by-step guide untuk menambah formula baru ke formulas.ts
│
│  ── REFERENCE (konteks tambahan, gak wajib baca) ──
├── PRD-FULL.md                        ← PRD lengkap v2.1 (incl. business context, personas, competitive intel)
├── REFERENCE-sesuaiformat-engine.md   ← Hasil reverse-engineering kompetitor (SesuaiFormat)
└── REFERENCE-prompt-logic-visual.html ← Visual diagram alur prompt template kompetitor
```

## Urutan Baca

Baca file sesuai urutan ini. Setiap file bergantung pada pemahaman dari file sebelumnya.

```
1. PRD-SPEC.md       "Apa yang kita bangun?"
       │
       ▼
2. SCHEMA.sql         "Data model-nya gimana?"
       │
       ▼
3. FORMULAS.ts        "Config data apa yang langsung copy-paste?"
       │
       ▼
4. ROUTES.md          "Page apa aja, route-nya gimana?"
       │
       ▼
5. COMPONENTS.md      "Component tree, state, props -- semua detail implementasi"
       │
       ▼
6. PROMPTS.md         "Template prompt yang jadi core value product ini"
```

## Urutan Build (Implementation Order)

```
Phase 1: Foundation
  1. npm create vite@latest → setup project (lihat PRD-SPEC.md > Project Setup)
  2. Run SCHEMA.sql di Supabase SQL Editor
  3. Copy FORMULAS.ts ke src/config/formulas.ts
  4. Setup Supabase client (src/lib/supabase.ts)
  5. Setup auth (AuthContext + LoginPage + ProtectedRoute)

Phase 2: Product Knowledge Database
  6. BrandContext + useBrands hook
  7. ProductDashboard + BrandCard + ProductList + ProductForm
  8. BrandGuidelinesModal (font, color, button, vibe presets)

Phase 3: LP Generator Core
  9. ProjectContext + useProjects + useSections hooks
  10. FormulaGallery + FormulaCard (uses FORMULAS.ts data)
  11. SectionPlanner + SectionCard + SectionEditor
  12. FormatGalleryModal + SkeletonPreview (22 layouts)
  13. Drag-and-drop reorder (@dnd-kit)

Phase 4: Prompt Engine
  14. Implement 4-layer prompt templates (lihat PROMPTS.md)
  15. Variable resolution (font/vibe preset maps)
  16. OutputPanel + copy to clipboard
  17. Save/load project (manual save + beforeunload warning)

Phase 5: HTML Editor (Phase 2 MVP)
  18. HtmlEditor + PreviewPane (Monaco + iframe + DOMPurify)
```

## Connection Map: File Mana Nyambung Ke Mana

```
PRD-SPEC.md ──────────────────────────────────────────────────
  │  Defines: fitur, user flow, UI mockup, MVP scope, validation rules
  │  File structure: src/ folder layout → implementasi di COMPONENTS.md
  │  DB fields: tabel & kolom → detail SQL di SCHEMA.sql
  │  Formula gallery (20+Custom) → data config di FORMULAS.ts
  │  Prompt engine (4 layers) → template strings di PROMPTS.md
  │  Route list → detail di ROUTES.md
  │
SCHEMA.sql ───────────────────────────────────────────────────
  │  Defines: 5 tables, enums, RLS, triggers, indexes
  │  ← PRD-SPEC.md (sumber definisi kolom)
  │  → COMPONENTS.md (context state shapes mirror DB tables)
  │  → PROMPTS.md (${variables} map ke kolom DB)
  │  → FORMULAS.ts (projects.framework stores formula ID)
  │
  │  Table connections:
  │  auth.users ──1:N──→ brands ──1:N──→ products
  │  auth.users ──1:N──→ projects ──1:N──→ sections
  │  products ──1:N──→ projects (product_id FK)
  │  auth.users ──1:1──→ user_limits
  │
FORMULAS.ts ──────────────────────────────────────────────────
  │  Defines: 21 formula objects with section arrays + formula context
  │  ← PRD-SPEC.md (formula gallery spec)
  │  → COMPONENTS.md (FormulaGallery + FormulaCard consume this data)
  │  → SCHEMA.sql (formula.id stored in projects.framework)
  │  → PROMPTS.md (formula.context → Layer 2.5, formula.sections → Layer 3)
  │
  │  Data flow:
  │  User picks FormulaCard → formula.sections auto-populate SectionPlanner
  │  → each section.frameworkPosition goes into prompt Layer 3
  │  → formula.context injected as Layer 2.5 (framework philosophy for AI)
  │
ROUTES.md ────────────────────────────────────────────────────
  │  Defines: 8 routes, auth flow, redirects, navigation guards
  │  ← PRD-SPEC.md (user flows)
  │  → COMPONENTS.md (each route = 1 page component)
  │
  │  Route → Component mapping:
  │  /login             → LoginPage
  │  /                  → RootRedirect (→ /products)
  │  /products          → ProductDashboard
  │  /generator         → GeneratorRedirect (→ /generator/new)
  │  /generator/new     → FormulaGallery
  │  /generator/:id     → SectionPlanner
  │  /saved             → SavedProjectsList
  │  /editor            → HtmlEditor
  │
COMPONENTS.md ────────────────────────────────────────────────
  │  Defines: full component tree, 3 contexts, props, hooks
  │  ← PRD-SPEC.md (UI spec, feature requirements)
  │  ← SCHEMA.sql (context state shapes = DB table structures)
  │  ← ROUTES.md (page components match routes 1:1)
  │  ← FORMULAS.ts (FormulaCard props consume Formula type)
  │  → PROMPTS.md (usePromptEngine hook assembles prompt from templates)
  │
  │  Context → DB table mapping:
  │  AuthContext    → auth.users
  │  BrandContext   → brands + products tables
  │  ProjectContext → projects + sections tables
  │
  │  Context → Route wrapping:
  │  AuthContext     wraps: ALL routes
  │  BrandContext    wraps: all authenticated routes
  │  ProjectContext  wraps: /generator/* routes only
  │
PROMPTS.md ───────────────────────────────────────────────────
     Defines: 4-layer prompt templates + Layer 2.5 formula context, 22 layout instructions, assembler
     ← SCHEMA.sql (every ${variable} maps to a DB column)
     ← FORMULAS.ts (formula.context → Layer 2.5, formula.sections → section blocks)
     ← COMPONENTS.md (usePromptEngine hook implements this)
     ← PRD-SPEC.md (prompt engine architecture)

     Variable → DB column mapping:
     Layer 1 (Global Context):
       ${platform}      → projects.platform
       ${fontStyle}     → brands.font_style (resolved via FONT_PRESET_MAP)
       ${colorPrimary}  → brands.color_primary
       ${colorAccent}   → brands.color_accent
       ${colorNeutral}  → brands.color_neutral
       ${buttonStyle}   → brands.button_style
       ${designVibe}    → brands.design_vibe (resolved via VIBE_PRESET_MAP)
       ${tone}          → projects.tone

     Layer 2 (Product Brief):
       ${productName}     → products.name
       ${brandName}       → brands.name
       ${description}     → products.description
       ${priceNormal}     → products.price_normal
       ${pricePromo}      → products.price_promo (conditional)
       ${targetAudience}  → products.target_audience (conditional)
       ${painPoints}      → products.pain_points (conditional)
       ${objections}      → products.objections (conditional)
       ${usp}             → products.usp (conditional)

     Layer 3 (Section Blocks, repeated per section):
       ${index}              → sections.order_index + 1
       ${sectionTitle}       → sections.section_title
       ${sectionGoals}       → sections.section_goals
       ${layoutFormat}       → sections.layout_format (→ layout instruction lookup)
       ${styleInstruction}   → sections.style_mode/style_custom OR brand defaults
       ${frameworkPosition}  → sections.framework_position (conditional)
       ${additionalContext}  → sections.additional_context (conditional)

     Layer 4 (Output Instruction):
       ${outputMode}  → projects.output_mode (html | copy)
       ${platform}    → projects.platform (reused from Layer 1)
       Brand colors/fonts reused from Layer 1 resolved values
```

## Quick Reference: Yang Bisa Di-Copy-Paste Langsung

| File | Copy ke | Notes |
|---|---|---|
| SCHEMA.sql | Supabase SQL Editor | Run sekali, bikin semua tables + triggers |
| supabase/setup/01-verify-core-schema.sql | Supabase SQL Editor | Verifikasi tabel inti + enum sudah terbentuk |
| supabase/setup/02-backfill-user-limits.sql | Supabase SQL Editor | Backfill `user_limits` untuk user lama (aman dijalankan ulang) |
| supabase/setup/03-healthcheck-rls-and-triggers.sql | Supabase SQL Editor | Cek RLS, policy, dan trigger schema |
| FORMULAS.ts | src/config/formulas.ts | Langsung jadi TypeScript module, no edits needed |
| PROMPTS.md > Layout Instructions | src/config/layouts.ts | Perlu convert dari markdown ke TS object |
| PROMPTS.md > Preset Maps | src/config/brand-presets.ts | FONT_PRESET_MAP + VIBE_PRESET_MAP |
| PROMPTS.md > Templates | src/prompts/*.ts | Perlu convert template strings ke template literal functions |

## Glossary

| Term | Meaning | Where Defined |
|---|---|---|
| Formula | Copywriting framework yang auto-generate section plan (20 total + Custom) | FORMULAS.ts |
| Section | Satu block/bagian dari landing page (punya judul, goals, format, style) | SCHEMA.sql > sections table |
| Layout Format | Visual layout template, decoupled dari section type (22 total) | PROMPTS.md > Layout Instructions |
| Brand Guidelines | Font, color, button, vibe presets yang tersimpan per brand | SCHEMA.sql > brands table |
| Global Context | Layer 1 prompt: persona AI + rules + platform + brand style | PROMPTS.md |
| Product Brief | Layer 2 prompt: auto-pulled dari products table | PROMPTS.md |
| Section Block | Layer 3 prompt: repeated per section dengan layout instruction | PROMPTS.md |
| Output Instruction | Layer 4 prompt: HTML mode atau Copy mode | PROMPTS.md |

## Decisions Already Made (Jangan Ubah)

Ini keputusan arsitektur yang sudah final. Coding agent harus ikuti, bukan improvisasi:

1. **Router**: createBrowserRouter (react-router-dom v6). Bukan BrowserRouter.
2. **State**: React Context + useReducer. Bukan Redux/Zustand/Jotai.
3. **Styling**: Tailwind CSS. Bukan CSS modules/styled-components.
4. **DnD**: @dnd-kit. Bukan react-beautiful-dnd/react-dnd.
5. **Auth**: Supabase Auth. Email login di MVP, social login di Phase 2.
6. **Save**: Manual save. Bukan auto-save. beforeunload warning kalau unsaved.
7. **Formula Gallery**: Unified gallery (20 formulas + Custom card). Bukan dual mode.
8. **Brand Guidelines**: Popup modal saat create/edit brand. Presets + custom option.
9. **Layout**: Decoupled dari section type. Any format bisa dipasang ke section apapun.
10. **Prompt**: 100% frontend assembly. Zero backend API calls untuk generate.
11. **Limits**: 3 brands, 10 products, 4 projects. Enforced via DB triggers + UI validation.
12. **Code Editor**: Monaco Editor atau CodeMirror (choose one during implementation).
13. **Sanitization**: DOMPurify wajib untuk HTML preview di Live Editor.
