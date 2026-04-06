# How to Add a New Formula

> Developer guide for adding a new copywriting formula to LP Builder.

## Step 1: Define the Formula in `src/config/formulas.ts`

Add a new entry to the `FORMULAS` array:

```typescript
{
  id: "your-formula-id",        // kebab-case, unique
  name: "Your Formula Name",
  tier: "foundational",          // foundational | comprehensive | modern | specialized
  description: "One-line description",
  bestCase: "When to use this formula",
  context: "Penjelasan filosofi framework ini dalam Bahasa Indonesia. Jelaskan alur psikologis, bagaimana setiap section saling terhubung, dan tips agar AI menulis sesuai framework. Teks ini akan di-inject ke prompt sebagai Layer 2.5.",
  sectionCount: 4,               // must match sections.length
  sections: [
    {
      title: "Section Title",
      goals: "What this section should achieve — 2-3 detailed sentences in Bahasa Indonesia",
      frameworkPosition: "Position Name",  // used in prompt as framework stage
      defaultLayout: "layout_id",          // explicit layout for this section
    },
    // ... more sections
  ],
}
```

## Step 2: Choose `defaultLayout` for Each Section

Available layout IDs (22 total):
- `standard_image` — Hero sections, attention grabbers
- `typographic` — Problem/pain statements, text-heavy narrative
- `split_screen` — Solution reveals, product introductions
- `feature_grid` — Benefits, features, advantages (grid cards)
- `icon_list` — Vertical list with icons
- `story_based` — Narrative/story sections, desire/aspiration
- `quote_testimonial` — Social proof, conviction, credibility
- `stat_counter` — Numbers, stats, achievements
- `before_after` — Transformation comparisons
- `single_offer` — CTA, pricing, offer sections
- `comparison_table` — Side-by-side comparisons
- `tier_cards` — Pricing tiers
- `timeline` — Step-by-step plans, processes
- `accordion` — FAQ, objection handling
- `logo_bar` — Trust badges, partner logos
- `promo_coretan` — Strikethrough pricing, scarcity/urgency
- `vsl` — Video sales letter
- `video_testimonial` — Video testimonial
- `screenshot_chat` — Chat/app interface mockup
- `bento_layout` — Asymmetric grid
- `moving_marquee` — Scrolling social proof
- `card_grid` — Multiple option cards

### Common Patterns

| Section Type | Recommended Layout |
|---|---|
| Hero / Hook / Attention | `standard_image` |
| Problem / Pain / Agitation | `typographic` |
| Solution / Bridge / New Way | `split_screen` |
| Features / Benefits / Interest | `feature_grid` |
| Story / Narrative / Journey | `story_based` |
| Proof / Testimonial / Conviction | `quote_testimonial` |
| CTA / Action / Purchase | `single_offer` |
| Comparison / Contrast | `comparison_table` |
| Plan / Steps / Process | `timeline` |
| FAQ / Objections | `accordion` |
| Trust / Credibility | `logo_bar` |
| Scarcity / Urgency | `promo_coretan` |
| Stats / Results / Achievement | `stat_counter` |
| Transformation / Before-After | `before_after` |

## Step 3: Choose the Tier

| Tier | When to Use |
|---|---|
| `foundational` | Simple, universal, good for beginners (3-5 sections) |
| `comprehensive` | Advanced sales, more sections, complex flows (4-6 sections) |
| `modern` | Story-driven, from modern marketing gurus (3-8 sections) |
| `specialized` | Niche use cases, specific scenarios (4-9 sections) |

## Step 4: Validate

1. `sectionCount` must equal `sections.length`
2. Each section must have: `title`, `goals`, `frameworkPosition`, `defaultLayout`
3. `context` must be written in Bahasa Indonesia (framework philosophy for AI)
4. Section `goals` should be 2-3 detailed sentences in Bahasa Indonesia
5. `id` must be unique across all formulas (kebab-case)
6. Run TypeScript check: `npx tsc --noEmit`

## Step 5: Test in Browser

1. Navigate to `/generator/new`
2. Find your formula card in the gallery
3. Click it — sections should appear with correct layout defaults
4. Click "Generate Prompt" — verify:
   - Formula context (### FRAMEWORK CONTEXT) appears between Product Brief and Section Blocks
   - Each section shows correct frameworkPosition
   - Goals are detailed and actionable

## Example: Adding a "SPIN Selling" Formula

```typescript
{
  id: "spin-selling",
  name: "SPIN Selling",
  tier: "comprehensive",
  description: "Situation-Problem-Implication-Need framework for B2B",
  bestCase: "B2B sales, consultative selling, enterprise products",
  context: "SPIN Selling (Situation → Problem → Implication → Need-Payoff) adalah framework dari Neil Rackham untuk penjualan B2B. Alurnya dimulai dengan memahami SITUASI prospek, lalu menggali MASALAH yang mereka hadapi, kemudian memperdalam IMPLIKASI dari masalah tersebut (apa dampaknya kalau tidak diselesaikan), dan akhirnya menunjukkan NEED-PAYOFF — bagaimana solusi kita memberikan value yang jelas. Framework ini cocok untuk produk enterprise di mana pembeli butuh justifikasi logis sebelum membeli.",
  sectionCount: 5,
  sections: [
    {
      title: "Situation",
      goals: "Gambarkan situasi dan konteks target buyer secara spesifik. Tunjukkan bahwa kamu paham industri dan tantangan sehari-hari mereka.",
      frameworkPosition: "Situation",
      defaultLayout: "typographic",
    },
    {
      title: "Problem",
      goals: "Angkat masalah spesifik yang dialami buyer dengan bahasa yang mereka pakai sehari-hari. Buat mereka merasa 'ini persis yang aku rasakan'.",
      frameworkPosition: "Problem",
      defaultLayout: "typographic",
    },
    {
      title: "Implication",
      goals: "Tunjukkan dampak nyata kalau masalah ini tidak diselesaikan — kehilangan revenue, waktu terbuang, tim frustrasi. Gunakan data atau skenario konkret.",
      frameworkPosition: "Implication",
      defaultLayout: "stat_counter",
    },
    {
      title: "Need-Payoff",
      goals: "Presentasikan bagaimana solusi memberikan ROI yang jelas. Biarkan buyer melihat sendiri value-nya melalui benefit dan hasil yang terukur.",
      frameworkPosition: "Need-Payoff",
      defaultLayout: "feature_grid",
    },
    {
      title: "CTA",
      goals: "Berikan langkah selanjutnya yang jelas dengan value proposition yang kuat. Buat transisi dari 'tertarik' ke 'ambil action' terasa natural.",
      frameworkPosition: "Action",
      defaultLayout: "single_offer",
    },
  ],
}
```

## Notes

- The `defaultLayout` is used by `ProjectContext.createProject()` when auto-generating sections from a formula
- If `defaultLayout` is omitted, the system falls back to keyword-based inference via `inferDefaultLayout(frameworkPosition, sectionTitle)` in `ProjectContext.tsx`
- The `context` field is injected into the prompt as "Layer 2.5" between Product Brief and Section Blocks — it helps the AI understand the framework's psychological flow
- Section `goals` should be detailed (2-3 sentences) and written in Bahasa Indonesia — they become the AI's instructions for each section
- Users can always change the layout manually via the Format Gallery Modal after sections are created
- The formula appears automatically in FormulaGallery — no routing changes needed
- Formula tier badge and section tags are rendered automatically from the data
- After adding, sync `vibecode/FORMULAS.ts` with `src/config/formulas.ts`
