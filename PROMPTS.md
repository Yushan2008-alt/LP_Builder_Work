# LP Block Builder Engine - Prompt Template System

Complete prompt template system for the 4-layer Prompt Engine Architecture. All templates use `${variable}` syntax for dynamic substitution.

---

## LAYER 1: Global Context Template

```
You are an expert landing page copywriter and web developer specializing in high-converting sales pages and landing pages.

### CORE RULES

**Anti-Overclaim Policy:**
- Make claims only if supported by product description, pricing, or explicit context
- Avoid superlatives ("best", "only", "guaranteed") unless fully justified
- Never use phrases like "100% results", "works for everyone", or "never fails"
- Use evidence-based language ("proven to", "shown to", "helps with")

**Skimming-Friendly Writing:**
- Structure with clear hierarchy: headlines → subheadings → short paragraphs
- Use bullet points for benefits, features, or proof points
- Keep paragraphs to 3-4 lines max for readability
- Include whitespace generously
- Emphasize key phrases in bold where it aids scanning

**Ad Compliance & Regulatory:**
- Avoid false urgency ("Only 3 left!", "Expires today!") unless inventory/timing is verified
- No misleading claims about results or outcomes
- Include disclaimers if product makes health/financial claims
- Avoid language implying endorsement unless explicitly authorized
- Keep testimonials realistic and attribute them clearly

### PLATFORM CONSTRAINTS

**Platform:** ${platform}

${platformConstraints}

${mobileCopyRules}

### BRAND GUIDELINES

**Font Style:** ${fontStyle}
**Primary Color:** ${colorPrimary}
**Accent Color:** ${colorAccent}
**Neutral/Background Color:** ${colorNeutral}
**Button Style:** ${buttonStyle}
**Design Vibe:** ${designVibe}

Apply these consistently throughout all sections. Use primary color for main CTAs, accent for secondary elements, neutral for backgrounds and borders.

### TONE

Write in the following tone: ${tone}

### LANGUAGE

Write in Bahasa Indonesia. If output_mode is 'copy', write all copy in Bahasa Indonesia. If output_mode is 'html', write all HTML content and alt text in Bahasa Indonesia. Use clear, conversational language appropriate for Indonesian audiences.

---
```

---

## MOBILE-FIRST COPY RULES (Conditional Injection for Single-Column Platforms)

Platforms that render content in a **single column on mobile** (Scalev, Berdu, Lynk.id) require stricter copy constraints. These rules are injected into **Layer 1**, immediately after the Platform Constraints block, when `isMobilePlatform(platform)` is true.

### Platforms That Trigger Mobile Copy Rules

| Platform | Reason |
|---|---|
| `scalev` | Single-column, mobile-first checkout pages |
| `berdu` | Single-column product pages, mobile-dominant audience |
| `lynk.id` | Link-in-bio format, almost exclusively mobile traffic |

### Injected Copy Rules Template

```
### MOBILE-FIRST COPY RULES (${PLATFORM_NAME})

This platform is viewed **almost entirely on mobile screens (320px–430px wide)**. Apply these rules strictly on top of the general copy guidelines:

**Paragraph Length:**
- Maximum **2 sentences per paragraph** — no exceptions
- Each sentence max **15 words**
- Add a line break between every paragraph — never stack more than 2 paragraphs without a visual break

**Headlines:**
- Main headline (h1): max **8 words**, punchy and direct — no dependent clauses
- Section headline (h2): max **10 words**
- Subheadline (h3): max **12 words**
- Headlines must be readable at a glance while scrolling fast

**Bullet Points:**
- Max **5 items** per list
- Each item max **1 line** on mobile (roughly 40–50 characters)
- Start each bullet with a strong verb or key noun — no filler words

**CTA Copy:**
- Button text: max **4 words**, action-first (e.g., "Coba Gratis Sekarang", "Dapatkan Aksesnya")
- Never use passive or vague CTAs ("Klik di sini", "Submit")
- Surround every CTA with 1 short supporting line (benefit or urgency) — max 10 words

**Text Density:**
- No walls of text — if a block feels long, split it
- Prioritize white space over completeness
- Every section must be readable in under 10 seconds on a phone screen
```

### Mobile HTML Rules (appended to Layer 4 `platformSpecificRules` for mobile platforms)

```
**Mobile HTML Rules (single-column platform):**
- All CTA buttons must be full-width: use `w-full` class — never inline or auto-width buttons
- Minimum button height: `py-4` or `min-h-[52px]` for thumb-friendly tap targets
- All interactive elements (links, buttons) minimum 44×44px tap area
- Body font size: minimum `text-base` (16px) — never smaller on mobile
- Section headlines: minimum `text-2xl` (24px)
- Horizontal padding on all sections: minimum `px-5` to prevent text touching screen edges
- No side-by-side elements — everything stacks vertically (`flex-col`)
- Images: always `w-full` and `h-auto`, never fixed pixel dimensions
- Line height: use `leading-relaxed` on body text for comfortable reading
- Spacing between sections: minimum `py-12` — give breathing room on small screens
```

---

## LAYER 2: Product Brief Template

```
### PRODUCT BRIEF

**Product Name:** ${productName}

**Brand:** ${brandName}

**Description:**
${description}

**Pricing:**
- Normal Price: ${priceNormal}
${pricePromoSection}

${targetAudienceSection}

${painPointsSection}

${objectionsSection}

${uspSection}

---
```

### Conditional Sections (conditionally included)

**Price Promo Section** (if price_promo exists):
```
- Promo Price: ${pricePromo}
```

**Target Audience Section** (if target_audience exists):
```
**Target Audience:**
${targetAudience}
```

**Pain Points Section** (if pain_points exists):
```
**Key Pain Points Your Audience Faces:**
${painPoints}
```

**Objections Section** (if objections exists):
```
**Common Objections You May Encounter:**
${objections}
```

**USP Section** (if usp exists):
```
**Unique Selling Proposition:**
${usp}
```

---

## LAYER 2.5: Formula Context (Conditional)

Injected **only** when `project.mode === 'formula'` and the formula has a `context` field. Skipped entirely for custom mode projects. This block gives the AI understanding of the copywriting framework being used, so it can write sections that flow logically within the framework's psychological structure.

```
### FRAMEWORK CONTEXT

**Formula:** ${formulaName}

${formulaContext}

---
```

**Variables:**

| Variable | Type | Source |
|---|---|---|
| `${formulaName}` | string | `formula.name` (from `getFormulaById(project.formula_id)`) |
| `${formulaContext}` | string | `formula.context` (from `formulas.ts`, written in Bahasa Indonesia) |

**Conditional Logic:**
- Only rendered when `project.mode === 'formula'` AND `project.formula_id` is set AND `formula.context` is non-empty
- In `assembler.ts`, this is handled by `renderFormulaContext(project)` which returns an empty string when conditions aren't met
- The empty string is filtered out via `.filter(Boolean)` before joining layers

---

## LAYER 3: Section Block Template

Repeated once for each section, in order_index sequence:

```
--- SECTION ${index}: "${sectionTitle}" ---

**Goals:**
${sectionGoals}

**Layout Format:**
${layoutFormatInstruction}

**Style:**
${styleInstruction}

${frameworkPositionLine}

${additionalContextLine}

**Product Reference:**
This section should reference and build on the product brief above (${productName}). Weave in relevant product details, pricing, benefits, or positioning as appropriate to the section goals.

--- END SECTION ${index} ---

```

### Conditional Lines

**Framework Position Line** (if frameworkPosition exists and mode = 'formula'):
```
**Framework Position:** This section is the "${frameworkPosition}" stage of the ${framework} framework.
```

**Additional Context Line** (if additionalContext exists):
```
**Additional Context:**
${additionalContext}
```

---

## Layout Format Instructions (All 22 Formats)

Each format below replaces `${layoutFormatInstruction}` in the Section Block. Copy the exact instruction for the selected format.

### 1. Standard Image

```
Layout: Split layout with image on one side and text content on the other. Use a 2-column grid (grid-cols-2) on desktop, stack vertically on mobile. Image should be responsive with rounded corners (rounded-lg). Text side includes headline, body copy, and optional CTA button. Ensure image placeholder has descriptive alt text reflecting section content.
```

### 2. VSL (Video Sales Letter)

```
Layout: Video-centric section. Large video embed (16:9 aspect ratio) centered, using <iframe> with responsive width/height. Headline positioned above the video. Body copy below video emphasizing key messages. CTA button prominently placed below all content. Keep surrounding whitespace minimal to focus attention on the video. Use placehold.co for video thumbnail if needed.
```

### 3. Typographic / Text-Heavy

```
Layout: Full-width text section with typography as the main visual element. Large, bold headline (h2 with 2xl-3xl size). Subheading (h3) below. Multiple paragraphs of body copy organized by clear visual hierarchy. Use color accents (primary or accent color) on key phrases. Whitespace is critical—generous padding between text blocks. No images required. Suitable for storytelling, problem statement, or educational sections.
```

### 4. Split Screen

```
Layout: Two equal columns side by side on desktop, stacked on mobile. Left column contains text/headline/copy. Right column contains image, video, or visual content. Clear visual separation with border or subtle background color difference. Use grid-cols-2 on desktop, grid-cols-1 on mobile. Equal padding on both sides. Image or media in right column should be full-height relative to text.
```

### 5. Story-Based

```
Layout: Narrative-driven layout. Headline setting the scene. Body organized in short, compelling paragraphs (3-4 lines each) that guide reader through a story arc. Consider using a large supporting image or illustration midway through the narrative. Use color callouts (accent color background) for pivotal moments or realizations in the story. End with a subtle CTA or reflection that ties story to product.
```

### 6. Stat Counter / Numbers-Heavy

```
Layout: Grid of prominent statistics with large numerical displays. Use 2-3 columns on desktop, 1 column on mobile. Each stat should show: large number (4xl size, primary color), label below (small text, neutral color). Organize stats in a card-based format with subtle borders or background. Optional: Add context paragraph above or below the grid. Example: "47% improvement", "10,000+ users", "3x faster".
```

### 7. Before-After

```
Layout: Side-by-side comparison layout. Left side labeled "Before" with text describing the problem or current state. Right side labeled "After" showing the transformation or solution. Use visual divider (vertical line or contrasting background). Can include images on both sides if available. Typography and spacing should highlight the contrast. Use accent color to emphasize "After" state positively.
```

### 8. Feature Grid

```
Layout: Grid display of 3-4 features per row on desktop, 1-2 on tablet, 1 on mobile. Each feature as a card with icon/image, headline (h4), and brief description. Use grid-cols-3 on desktop, grid-cols-2 on tablet, grid-cols-1 on mobile. Add subtle shadows or borders to cards for depth. Consistent spacing between cards. Suitable for showcasing product capabilities or benefits.
```

### 9. Icon List

```
Layout: Vertical list of items, each with an icon on the left and text on the right. Use flex layout with icon (size: 24-32px, primary color) and wrapped text. Stack vertically with even spacing (gap-4). Each item can have headline and short description. Suitable for benefits, features, or bullet-point lists. Icons should be simple and consistent.
```

### 10. Bento Layout

```
Layout: Asymmetric grid inspired by Apple's Bento design. Mix of differently-sized cards arranged in a responsive grid. Some cards span 2 columns, others span 1. Use grid-cols-3 on desktop with varied row spans (row-span-1, row-span-2). On mobile, collapse to grid-cols-1. Each card contains an image, headline, or short copy. Create visual hierarchy through sizing and color.
```

### 11. Quote/Testimonial Card

```
Layout: Large, prominent quote display. Quotation mark icon or symbol at top. Large quote text (xl-2xl size) in primary or accent color. Attribution below (name, title, company) in smaller text, neutral color. Optional: Small avatar image or brand logo before attribution. Use generous padding and subtle background color to create card effect. Suitable for powerful customer testimonials or inspirational quotes.
```

### 12. Video Testimonial

```
Layout: Video embed (16:9 aspect ratio) of a customer or user testimonial. Headline above: "What [Customer Name] Says". Optional: Customer name, title, company displayed below video. Brief quote or key message highlighted in text below. Keep video and surrounding content minimal to maintain focus. Use placehold.co for video placeholder.
```

### 13. Screenshot / Chat Interface

```
Layout: Screenshot-like display, often mimicking a chat, message thread, or app interface. Use a bordered container (border-2, rounded-lg) styled like a mobile phone or message window. Dark or light background depending on theme. Messages or UI elements arranged vertically. Include visual indicators (timestamps, avatars, read receipts) if appropriate. Suitable for showing product in use or conversation-style copy.
```

### 14. Single Offer / Pricing Card

```
Layout: Prominent standalone offer card. Headline: offer or deal title. Price display (large, primary color). Key features listed as bullet points or small text blocks. CTA button at bottom (full width or large). Optional: Discount badge or scarcity indicator in top-right corner. Use substantial padding, card shadows, and accent color highlights. Suitable for promotion, special offer, or main product pitch.
```

### 15. Comparison Table

```
Layout: Horizontal table comparing product features, pricing, or options. Use <table> with thead and tbody. Columns: Feature name (left), then 2-4 comparison columns (product A, B, C, competitor). Use striped rows (alternate neutral background). Check marks (✓) in primary color for included features. X marks in accent/neutral for excluded. Header row highlighted in primary color with white text. Responsive: horizontal scroll on mobile if needed.
```

### 16. Tier / Pricing Card Stacks

```
Layout: Vertical stack of 2-3 pricing tier cards displayed as columns on desktop. Each card shows: tier name (headline), price (large, primary color), features list (bullet points), CTA button. Highlight recommended tier with accent color border or background. Use equal-width columns (flex or grid-cols-3). On mobile, stack vertically. Include a "Most Popular" badge on recommended tier.
```

### 17. Moving Marquee / Scrolling List

```
Layout: Horizontal scrolling marquee or ticker display. Use <div> with horizontal scrolling or CSS animation. Display: logos, testimonial snippets, feature list, or social proof items in a continuous loop. Items separated by dividers or spacing. Responsive: auto-scroll on desktop, allow manual scroll or tap on mobile. Consider using image placeholders for logos with smooth fade-in/out at edges.
```

### 18. Promo Coretan / Strikethrough Pricing

```
Layout: Emphasis on discounted pricing. Display normal price with strikethrough text (line-through, neutral color), then new/promo price below in large, bold, primary color. Add discount percentage badge (e.g., "-30%") in accent color. Optional: "Limited Time" or urgency text above. Use generous spacing and bold typography. Suitable for flash sales, promotions, or limited-time offers. Keep promo copy compliant with actual discount/timing.
```

### 19. Accordion / Collapsible Sections

```
Layout: Expandable FAQ or feature list. Use accordion component with headers that toggle content visibility. Each header includes question or topic (headline), optional icon (chevron or +/-). Expanded content shows answer or details below. Use primary color for headers, neutral for content background. Smooth transition animation (200-300ms) on expand/collapse. Stack vertically with clear spacing between items. Suitable for FAQs, terms, or multi-step processes.
```

### 20. Timeline

```
Layout: Vertical or horizontal timeline showing process steps, journey, or chronological events. Central line (vertical or horizontal) with events/steps branching off on alternating sides. Each event: headline, optional date/number, brief description. Use primary color for timeline line and event markers (circles). Responsive: vertical timeline on mobile, horizontal on desktop if space allows. Suitable for onboarding steps, case studies, or historical narratives.
```

### 21. Logo Bar / Social Proof Grid

```
Layout: Horizontal bar or grid of logos, client names, or trust badges. Use flex layout with centered, evenly-spaced logos (height: 40-60px). Add introductory text above: "Trusted by..." or "As featured in...". Use neutral color for logos and text. Optional: Add subtle dividers between logos. On mobile, wrap to 2 columns if needed. Suitable for credibility, partnership showcase, or media mentions.
```

### 22. Card Grid / Multiple Options

```
Layout: Grid of identical or similar cards, typically 2-3 per row on desktop, 1-2 on tablet, 1 on mobile. Each card: optional image/icon at top, headline, description/bullet points, and CTA button. Use grid-cols-3 on desktop, grid-cols-2 on tablet, grid-cols-1 on mobile. Consistent card height with equal padding. Add subtle borders, shadows, or background colors for visual separation. Suitable for showcasing multiple options, plans, or case studies.
```

---

## LAYER 4: Output Instruction Template

### HTML Mode

```
### OUTPUT FORMAT: HTML

Generate a complete, production-ready, single-file HTML document. Follow these requirements:

**Structural Requirements:**
- Use semantic HTML5 elements (<header>, <main>, <section>, <footer>, etc.)
- Include proper <!DOCTYPE html> declaration and <meta charset="utf-8">
- Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> for responsive design
- Wrap all content in a <main> element for accessibility

**Styling & CSS:**
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Apply Tailwind utility classes for all styling (no inline <style> tags)
- Mobile-first responsive design: use md:, lg:, xl: prefixes for breakpoints
- Use the exact hex colors provided in brand guidelines:
  - Primary: ${colorPrimary}
  - Accent: ${colorAccent}
  - Neutral: ${colorNeutral}
- Apply custom color variables in Tailwind config if needed for consistent branding

**Typography & Fonts:**
- Import fonts from Google Fonts in <head> based on font_style: ${fontStyle}
- Apply font families to appropriate elements:
  - Headings (h1-h4): Use brand font style
  - Body text: Use same brand font or system fallback
- Use semantic heading hierarchy: h1 for page title, h2 for section headlines, h3 for subsections

**Button Styling:**
- Button style: ${buttonStyle}
  - rounded: Use rounded-lg class
  - sharp: Use rounded-none
  - pill: Use rounded-full
  - outline: Use border-2 border-current with transparent background
- Primary buttons: Use ${colorPrimary} background, white text, ${buttonStyle}
- Secondary buttons: Use ${colorAccent} background or outline variant
- Add hover effects: hover:opacity-90 or hover:scale-105
- Ensure padding consistency: px-6 py-3 for standard buttons

**Platform-Specific Rules:**
${platformSpecificRules}

**Image Handling:**
- Use placeholder images via https://placehold.co/WIDTHxHEIGHT
- Replace WIDTH and HEIGHT with appropriate dimensions (e.g., 800x600)
- Add descriptive alt text to all images reflecting section content
- Make images responsive: img { width: 100%; height: auto; }

**Responsive Design:**
- Mobile-first approach: design for mobile, then add desktop enhancements with md:, lg: prefixes
- Use Tailwind's responsive spacing classes (px-4 on mobile, px-8 on desktop, etc.)
- Test layout at: 320px, 768px, 1024px, 1280px viewports
- Stack single-column on mobile, multi-column on desktop
- Ensure text readability on all screen sizes (min font size: 16px on mobile)

**Code Quality:**
- Clean, well-indented code (2-space indentation)
- Logical section organization with HTML comments separating major sections
- Remove unused classes or duplicated utilities
- Single-file output: all HTML, CSS (Tailwind), and no external JS dependencies
- No external API calls or dynamic dependencies

**Accessibility:**
- Use semantic HTML for proper screen reader interpretation
- Add alt text to all images
- Ensure color contrast meets WCAG AA standards
- Use <button> elements for clickable actions, not <a> or <div>
- Include form labels and aria-labels where appropriate

**Meta & SEO:**
- Include <title> in <head> reflecting page purpose
- Add basic <meta> tags: description, author (optional)

**File Output:**
- Return a single HTML file that can be saved as .html and opened directly in browser
- Test in Chrome, Firefox, Safari before delivery
- File should be ready for copy-paste into web platforms (Scalev, WordPress, Shopify, etc.)
```

### Copy Mode

```
### OUTPUT FORMAT: COPY (TEXT ONLY)

Generate copy text only, without HTML markup. Follow these requirements:

**Structure & Formatting:**
- Use markdown-style formatting for hierarchy:
  - # for main page headline (h1)
  - ## for section headlines (h2)
  - ### for subsection headlines (h3)
  - - for bullet points
  - **text** for bold emphasis
  - *text* for italic emphasis
  - [text] for placeholder descriptions

**Section Organization:**
- Clear heading for each section (## Section Title)
- Body copy under each heading (paragraphs of 2-5 sentences)
- Bullet-point lists for benefits, features, or proof points
- Whitespace between sections for readability

**Copy Style:**
- Conversational tone matching ${tone}
- Short sentences (10-15 words max) for skimmability
- Use "you" language addressing the reader directly
- Action-oriented language in CTAs
- Avoid marketing jargon or overclaimed superlatives

**Placeholder Markings:**
- [IMAGE PLACEHOLDER: brief description of visual] where images would appear
  - Example: [IMAGE PLACEHOLDER: Customer using product outdoors, smiling]
- [CTA BUTTON: button text] for call-to-action buttons
  - Example: [CTA BUTTON: Beli Sekarang]
- [VIDEO PLACEHOLDER: brief description] for video content
  - Example: [VIDEO PLACEHOLDER: 2-minute product demo video]
- [SECTION DIVIDER] between major sections

**Content Requirements:**
- All copy in Bahasa Indonesia
- Reference product name, pricing, and key benefits naturally
- Maintain brand tone and voice throughout
- Keep copy concise: 150-250 words per section
- Include social proof where relevant
- Clear, compelling CTA text

**Output Format:**
- Plain markdown text, no HTML
- Save as .txt or .md file
- Ready to copy-paste into Canva, Google Docs, Figma, or other design tools
- Maintain formatting when pasting (keep bold, bullet structure)

**Example Structure:**
```
# Solusi Marketing Terpadu Untuk Brand Anda

## Apa Masalahnya?
[Copy addressing audience pain points...]

- Benefit 1
- Benefit 2
- Benefit 3

[IMAGE PLACEHOLDER: Dashboard screenshot showing analytics]

## Bagaimana Kami Membantu?
[Copy explaining solution...]

[CTA BUTTON: Mulai Sekarang]
```
```

---

## Assembler Logic (Pseudocode)

```javascript
function assemblePrompt(project, product, brand, sections) {
  let prompt = "";

  // STEP 0: VARIABLE RESOLUTION
  // Resolve custom fallbacks for font style and design vibe before rendering templates
  const resolvedVars = resolveVariables(brand, product, project);

  // Layer 1: Global Context
  const globalContext = renderGlobalContext({
    tone: project.tone,
    platform: project.platform,
    platformConstraints: getPlatformConstraints(project.platform),
    mobileCopyRules: getMobileCopyRules(project.platform), // injected only for scalev, berdu, lynk.id
    platformSpecificRules: getPlatformSpecificRules(project.platform, project.output_mode),
    fontStyle: resolvedVars.fontStyle,
    colorPrimary: resolvedVars.colorPrimary,
    colorAccent: resolvedVars.colorAccent,
    colorNeutral: resolvedVars.colorNeutral,
    buttonStyle: brand.button_style,
    designVibe: resolvedVars.designVibe,
  });
  prompt += globalContext;
  prompt += "\n\n";

  // Layer 2: Product Brief
  const productBrief = renderProductBrief({
    productName: product.name,
    brandName: brand.name,
    description: product.description,
    priceNormal: product.price_normal,
    pricePromo: product.price_promo || null,
    targetAudience: product.target_audience || null,
    painPoints: product.pain_points || null,
    objections: product.objections || null,
    usp: product.usp || null,
  });
  prompt += productBrief;
  prompt += "\n\n";

  // Layer 2.5: Formula Context (conditional)
  // Only injected when project uses a formula (not custom mode)
  if (project.mode === 'formula' && project.formula_id) {
    const formula = getFormulaById(project.formula_id);
    if (formula?.context) {
      prompt += `### FRAMEWORK CONTEXT\n\n`;
      prompt += `**Formula:** ${formula.name}\n\n`;
      prompt += `${formula.context}\n\n`;
      prompt += `---\n\n`;
    }
  }

  // Layer 3: Section Blocks
  prompt += "=== SECTION BLOCKS ===\n\n";

  sections.forEach((section, index) => {
    const layoutFormat = getLayoutFormatInstruction(section.layout_format);
    const styleInstruction = section.style_mode === 'custom'
      ? section.style_custom
      : `Follow the global brand design guidelines: ${resolvedVars.designVibe} vibe, using ${resolvedVars.fontStyle} font, ${brand.button_style} button style. Use primary color (${resolvedVars.colorPrimary}) for key elements and accent color (${resolvedVars.colorAccent}) for secondary highlights. Maintain the consistent visual language across all sections.`;
    const frameworkPositionLine = (project.mode === 'formula' && section.framework_position)
      ? `Framework Position: This section is the "${section.framework_position}" stage of the ${project.framework} framework.`
      : "";
    const additionalContextLine = section.additional_context
      ? `Additional Context:\n${section.additional_context}`
      : "";

    const sectionBlock = renderSectionBlock({
      index: index + 1,
      sectionTitle: section.section_title,
      sectionGoals: section.section_goals,
      layoutFormatInstruction: layoutFormat,
      styleInstruction: styleInstruction,
      frameworkPositionLine: frameworkPositionLine,
      additionalContextLine: additionalContextLine,
      productName: product.name,
    });

    prompt += sectionBlock;
    prompt += "\n\n";
  });

  // Layer 4: Output Instruction
  const outputInstruction = project.output_mode === 'html'
    ? renderOutputInstructionHTML({
        colorPrimary: resolvedVars.colorPrimary,
        colorAccent: resolvedVars.colorAccent,
        colorNeutral: resolvedVars.colorNeutral,
        fontStyle: resolvedVars.fontStyle,
        buttonStyle: brand.button_style,
        platformSpecificRules: getPlatformSpecificRules(project.platform, 'html'),
      })
    : renderOutputInstructionCopy({
        tone: project.tone,
      });

  prompt += outputInstruction;

  return prompt;
}

// MOBILE-FIRST COPY RULES
// Single-column platforms (scalev, berdu, lynk.id) inject additional copy rules into Layer 1.
// These platforms are viewed almost entirely on mobile screens (320px–430px wide).

const MOBILE_SINGLE_COLUMN_PLATFORMS = ['scalev', 'berdu', 'lynk.id'];

function isMobilePlatform(platform) {
  return MOBILE_SINGLE_COLUMN_PLATFORMS.includes(platform);
}

function getMobileCopyRules(platform) {
  if (!isMobilePlatform(platform)) return '';
  return `
### MOBILE-FIRST COPY RULES (${platform.toUpperCase()})

This platform is viewed **almost entirely on mobile screens (320px–430px wide)**. Apply these rules strictly on top of the general copy guidelines:

**Paragraph Length:**
- Maximum **2 sentences per paragraph** — no exceptions
- Each sentence max **15 words**
- Add a line break between every paragraph — never stack more than 2 paragraphs without a visual break

**Headlines:**
- Main headline (h1): max **8 words**, punchy and direct — no dependent clauses
- Section headline (h2): max **10 words**
- Subheadline (h3): max **12 words**
- Headlines must be readable at a glance while scrolling fast

**Bullet Points:**
- Max **5 items** per list
- Each item max **1 line** on mobile (roughly 40–50 characters)
- Start each bullet with a strong verb or key noun — no filler words

**CTA Copy:**
- Button text: max **4 words**, action-first (e.g., "Coba Gratis Sekarang", "Dapatkan Aksesnya")
- Never use passive or vague CTAs ("Klik di sini", "Submit")
- Surround every CTA with 1 short supporting line (benefit or urgency) — max 10 words

**Text Density:**
- No walls of text — if a block feels long, split it
- Prioritize white space over completeness
- Every section must be readable in under 10 seconds on a phone screen`;
}

// MOBILE HTML RULES (applied in Layer 4 / getPlatformSpecificRules for mobile platforms)
const MOBILE_HTML_RULES = `
**Mobile HTML Rules (single-column platform):**
- All CTA buttons must be full-width: use \`w-full\` class — never inline or auto-width buttons
- Minimum button height: \`py-4\` or \`min-h-[52px]\` for thumb-friendly tap targets
- All interactive elements (links, buttons) minimum 44×44px tap area
- Body font size: minimum \`text-base\` (16px) — never smaller on mobile
- Section headlines: minimum \`text-2xl\` (24px)
- Horizontal padding on all sections: minimum \`px-5\` to prevent text touching screen edges
- No side-by-side elements — everything stacks vertically (\`flex-col\`)
- Images: always \`w-full\` and \`h-auto\`, never fixed pixel dimensions
- Line height: use \`leading-relaxed\` on body text for comfortable reading
- Spacing between sections: minimum \`py-12\` — give breathing room on small screens`;

function getPlatformConstraints(platform) {
  const constraints = {
    'scalev': 'Single column layout. Use CSS !important rules to override any default multi-column styles. Width: 100% of container, max-width: 100%.',
    'berdu': 'Single column layout. CSS !important rules required. No multi-column grids allowed. Full-width design.',
    'lynk.id': 'Single column layout. Strict width constraints: 100% of available width. No sidebar layouts. Centered content.',
    'wordpress': 'Responsive design. Compatible with Elementor and Divi builders. Use standard semantic HTML. Avoid absolute positioning.',
    'shopify': 'Responsive design. Compatible with Liquid templating. Use standard HTML5. Avoid custom JavaScript. Class naming compatible with Shopify CSS framework.',
    'buat.id': 'Responsive design. Standard HTML5 embed. No special constraints. Full responsive support.',
    'order-hero': 'Responsive design. Standard HTML5 embed. Compatible with checkout page layouts.',
    'mayar': 'Responsive design. Support payment gateway integration hooks. Use standard semantic HTML.',
  };
  return constraints[platform] || constraints['wordpress'];
}

function getPlatformSpecificRules(platform, outputMode) {
  if (outputMode !== 'html') return '';

  const rules = {
    'scalev': 'Single Column Rule: Every section must use grid-cols-1 and display as a single column. Do not use grid-cols-2, grid-cols-3, or multi-column layouts. Use !important CSS rule: .scalev-section { grid-template-columns: 1fr !important; }',
    'berdu': 'Single Column Rule: All sections must stack vertically in one column. No multi-column layouts. Use Tailwind grid-cols-1 exclusively. Add !important overrides if needed.',
    'lynk.id': 'Single Column Rule: Width locked to 100% of container. No side margins on main content. Centered alignment. Use max-width: 100% and width: 100% with !important if needed.',
    'wordpress': 'Elementor/Divi Compatible: Use standard Tailwind grid without conflicting utility names. Avoid custom grid system. All classes should be prefixed or scoped to avoid conflicts with builder CSS.',
    'shopify': 'Liquid Compatible: Avoid embedded Liquid syntax. Use standard HTML5 only. Class names compatible with base Shopify theme CSS. Use Tailwind utilities that don\'t conflict with Shopify default styles.',
    'buat.id': 'Standard Responsive: Use standard Tailwind responsive prefixes (md:, lg:, xl:). Mobile-first design required. All features available.',
    'order-hero': 'Checkout Page Compatible: Design for integration with order/checkout flow. Keep CTAs clear and prominent. Use standard responsive design.',
    'mayar': 'Payment Integration Ready: Include hooks/placeholders for payment gateway integration. Keep form areas accessible and clearly defined.',
  };

  const base = rules[platform] || '';
  // Append mobile HTML rules for single-column mobile platforms
  const mobileExtra = isMobilePlatform(platform) ? MOBILE_HTML_RULES : '';
  return [base, mobileExtra].filter(Boolean).join('\n');
}

function getLayoutFormatInstruction(format) {
  // Returns one of the 22 layout format instructions defined above
  const formats = {
    'standard_image': '[See "Standard Image" instruction above]',
    'vsl': '[See "VSL (Video Sales Letter)" instruction above]',
    'typographic': '[See "Typographic / Text-Heavy" instruction above]',
    'split_screen': '[See "Split Screen" instruction above]',
    'story_based': '[See "Story-Based" instruction above]',
    'stat_counter': '[See "Stat Counter / Numbers-Heavy" instruction above]',
    'before_after': '[See "Before-After" instruction above]',
    'feature_grid': '[See "Feature Grid" instruction above]',
    'icon_list': '[See "Icon List" instruction above]',
    'bento_layout': '[See "Bento Layout" instruction above]',
    'quote_testimonial': '[See "Quote/Testimonial Card" instruction above]',
    'video_testimonial': '[See "Video Testimonial" instruction above]',
    'screenshot_chat': '[See "Screenshot / Chat Interface" instruction above]',
    'single_offer': '[See "Single Offer / Pricing Card" instruction above]',
    'comparison_table': '[See "Comparison Table" instruction above]',
    'tier_cards': '[See "Tier / Pricing Card Stacks" instruction above]',
    'moving_marquee': '[See "Moving Marquee / Scrolling List" instruction above]',
    'promo_coretan': '[See "Promo Coretan / Strikethrough Pricing" instruction above]',
    'accordion': '[See "Accordion / Collapsible Sections" instruction above]',
    'timeline': '[See "Timeline" instruction above]',
    'logo_bar': '[See "Logo Bar / Social Proof Grid" instruction above]',
    'card_grid': '[See "Card Grid / Multiple Options" instruction above]',
  };

  return formats[format] || formats['standard_image'];
}

function getDefaultStyleFromBrand(brand) {
  return `Follow the global brand design guidelines: ${brand.design_vibe} vibe, using ${brand.font_style} font, ${brand.button_style} button style. Use primary color (${brand.color_primary}) for key elements and accent color (${brand.color_accent}) for secondary highlights. Maintain the consistent visual language across all sections.`;
}

// FONT_PRESET_MAP: Maps font style presets to actual font names
const FONT_PRESET_MAP = {
  'modern_sans': 'Inter, Plus Jakarta Sans, atau DM Sans',
  'bold_impact': 'Montserrat Bold, Poppins Black, atau Bebas Neue',
  'elegant_serif': 'Playfair Display, Lora, atau Cormorant',
  'playful_rounded': 'Nunito, Quicksand, atau Comfortaa',
  'monospace_tech': 'JetBrains Mono, Fira Code, atau Space Mono',
};

// VIBE_PRESET_MAP: Maps design vibe presets to descriptive design guidelines
const VIBE_PRESET_MAP = {
  'minimalist': 'Clean and minimal. Use generous whitespace, subtle borders, muted backgrounds. Let the content breathe.',
  'corporate': 'Professional and trustworthy. Structured layout with clear hierarchy. Use subtle gradients and shadows.',
  'energetic': 'Bold and dynamic. Use bright accent colors, strong contrast, and impactful typography sizes.',
  'premium': 'Luxurious and refined. Use dark backgrounds with gold/light accents, sophisticated typography, and elegant spacing.',
  'playful': 'Fun and approachable. Use rounded corners, cheerful colors, playful icons, and casual spacing.',
  'dark_mode': 'Dark background (#0f172a or similar) with light text. Use subtle glow effects and neon-style accent colors.',
};

function resolveVariables(brand, product, project) {
  // Resolve font style: use custom value if selected, otherwise resolve from preset map
  const fontStyle = brand.font_style === 'custom'
    ? brand.font_custom
    : FONT_PRESET_MAP[brand.font_style] || brand.font_style;

  // Resolve design vibe: use custom value if selected, otherwise resolve from preset map
  const designVibe = brand.design_vibe === 'custom'
    ? brand.vibe_custom
    : VIBE_PRESET_MAP[brand.design_vibe] || brand.design_vibe;

  // Colors are already in hex format, no resolution needed
  const colorPrimary = brand.color_primary;
  const colorAccent = brand.color_accent;
  const colorNeutral = brand.color_neutral;

  // Return resolved variables object
  return {
    fontStyle,
    designVibe,
    colorPrimary,
    colorAccent,
    colorNeutral,
  };
}

function renderGlobalContext(vars) {
  // Substitutes all ${variable} placeholders with actual values
  // Returns the Layer 1 template with all substitutions completed
}

function renderProductBrief(vars) {
  // Substitutes all ${variable} placeholders
  // Conditionally includes optional sections if data exists
  // Returns the Layer 2 template
}

function renderSectionBlock(vars) {
  // Substitutes all ${variable} placeholders
  // Conditionally includes frameworkPositionLine and additionalContextLine
  // Returns the Layer 3 template for one section
}

function renderOutputInstructionHTML(vars) {
  // Substitutes all ${variable} placeholders in HTML mode output instruction
  // Returns the Layer 4 HTML template
}

function renderOutputInstructionCopy(vars) {
  // Substitutes all ${variable} placeholders in Copy mode output instruction
  // Returns the Layer 4 Copy template
}
```

---

## Template Variable Reference

### Layer 1 Variables

| Variable | Type | Example | Source |
|---|---|---|---|
| `${platform}` | string | "scalev", "wordpress", "shopify" | projects.platform |
| `${platformConstraints}` | string | "Single column layout..." | Derived from platform |
| `${mobileCopyRules}` | string (conditional) | "### MOBILE-FIRST COPY RULES (SCALEV)..." | Injected only for single-column mobile platforms |
| `${platformSpecificRules}` | string | "Every section must use grid-cols-1..." | Derived from platform + output_mode |
| `${fontStyle}` | string | "modern_sans", "elegant_serif", "custom" | brands.font_style |
| `${colorPrimary}` | string (hex) | "#2563EB" | brands.color_primary |
| `${colorAccent}` | string (hex) | "#60A5FA" | brands.color_accent |
| `${colorNeutral}` | string (hex) | "#F1F5F9" | brands.color_neutral |
| `${buttonStyle}` | string | "rounded", "pill", "sharp", "outline" | brands.button_style |
| `${designVibe}` | string | "minimalist", "premium", "energetic" | brands.design_vibe |
| `${tone}` | string | "professional", "conversational", "playful" | projects.tone |

### Layer 2 Variables

| Variable | Type | Example | Source |
|---|---|---|---|
| `${productName}` | string | "Landing Page Builder Pro" | products.name |
| `${brandName}` | string | "Acme Corp" | brands.name |
| `${description}` | string | "Full product description..." | products.description |
| `${priceNormal}` | string | "Rp 500.000" | products.price_normal |
| `${pricePromo}` | string (optional) | "Rp 350.000" | products.price_promo |
| `${targetAudience}` | string (optional) | "Digital marketers, agencies..." | products.target_audience |
| `${painPoints}` | string (optional) | "Struggle to create..." | products.pain_points |
| `${objections}` | string (optional) | "Is it easy to use?" | products.objections |
| `${usp}` | string (optional) | "Only platform with..." | products.usp |

### Layer 2.5 Variables (Formula Context — Conditional)

| Variable | Type | Example | Source |
|---|---|---|---|
| `${formulaName}` | string | "PASTOR", "AIDA" | `formula.name` via `getFormulaById(project.formula_id)` |
| `${formulaContext}` | string | "PASTOR adalah framework high-ticket sales..." | `formula.context` from `formulas.ts` |

> Only rendered when `project.mode === 'formula'` and `formula.context` exists. Skipped for custom mode.

### Layer 3 Variables (Per Section)

| Variable | Type | Example | Source |
|---|---|---|---|
| `${index}` | number | 1, 2, 3... | sections.order_index + 1 |
| `${sectionTitle}` | string | "Masalah yang Kamu Hadapi" | sections.section_title |
| `${sectionGoals}` | string | "Identify specific problem..." | sections.section_goals |
| `${layoutFormatInstruction}` | string | "Layout: Split layout with..." | Derived from sections.layout_format |
| `${styleInstruction}` | string | "Follow global brand guidelines..." | sections.style_custom OR brand defaults |
| `${frameworkPositionLine}` | string (optional) | "Framework Position: Problem stage..." | sections.framework_position (if formula mode) |
| `${additionalContextLine}` | string (optional) | "Additional Context: Focus on..." | sections.additional_context |
| `${productName}` | string | "Product name reference" | products.name |
| `${framework}` | string | "AIDCA", "PASTOR" | projects.framework |

### Layer 4 Variables (HTML Mode)

| Variable | Type | Example | Source |
|---|---|---|---|
| `${colorPrimary}` | string (hex) | "#2563EB" | brands.color_primary |
| `${colorAccent}` | string (hex) | "#60A5FA" | brands.color_accent |
| `${colorNeutral}` | string (hex) | "#F1F5F9" | brands.color_neutral |
| `${fontStyle}` | string | "modern_sans" | brands.font_style |
| `${buttonStyle}` | string | "rounded", "pill" | brands.button_style |
| `${platformSpecificRules}` | string | "Single Column Rule: ..." | Derived from platform |

### Layer 4 Variables (Copy Mode)

| Variable | Type | Example | Source |
|---|---|---|---|
| `${tone}` | string | "professional", "conversational" | projects.tone |

---

## Template Quality Guidelines

### Writing Standards

1. **Clarity First:** Every instruction should be immediately understandable to an AI language model
2. **Specificity:** Use concrete examples and exact formatting requirements
3. **Completeness:** Include all edge cases and conditional requirements
4. **Consistency:** Use parallel structure across similar instructions
5. **Compliance:** Emphasize anti-overclaim rules and regulatory requirements

### Prompt Optimization

- Keep templates focused on single responsibilities (each layer has distinct purpose)
- Avoid redundancy across layers
- Place critical instructions early in each template
- Use bold formatting for emphasis of key rules
- Include examples where helpful for clarity

### Testing Checklist

- [ ] All 22 layout format instructions are unique and specific
- [ ] Platform rules clearly specify single-column vs responsive requirements
- [ ] Brand guidelines variables are correctly mapped to database fields
- [ ] Conditional sections only appear when data exists
- [ ] Font imports reflect actual Google Fonts names
- [ ] Color variables use exact hex codes from brand settings
- [ ] Tone variable reflects user selection from tone options
- [ ] Output instructions account for both HTML and Copy modes
- [ ] Assembler logic correctly concatenates all layers in order (L1, L2, L2.5 conditional, L3, L4)
- [ ] Formula context (Layer 2.5) is injected only for formula mode, skipped for custom
- [ ] Prompt output is Bahasa Indonesia by default unless otherwise specified

---

## Usage Example

When a user creates an LP with:
- Platform: `scalev`
- Brand: `Ocean Blue` (font: modern_sans, primary: #2563EB)
- Product: `Marketing Tool Pro` (name, description, pricing)
- Framework: `AIDCA`
- Section 1: "Hero" (layout: standard_image, goals: "Hook with headline")

The final prompt would look like:

```
You are an expert landing page copywriter...

[Layer 1: Global Context with Scalev single-column constraints, mobile copy rules, modern_sans font, #2563EB colors, etc.]

---

[Layer 2: Product Brief]
### PRODUCT BRIEF
Product Name: Marketing Tool Pro
Brand: Ocean Blue
Description: [Full description]
Pricing: ...

---

[Layer 2.5: Formula Context — conditional, only for formula mode]
### FRAMEWORK CONTEXT
**Formula:** AIDCA
AIDCA (Attention → Interest → Desire → Conviction → Action) adalah...
[Full framework philosophy in Bahasa Indonesia]

---

[Layer 3: Section Blocks]
=== SECTION BLOCKS ===

--- SECTION 1: "Hero" ---
Goals: Hook with headline...
Layout Format: [Standard Image instruction]
Style: Follow global design guidelines...
Framework Position: This section is the "Attention" stage of the AIDCA framework.
Product Reference: Marketing Tool Pro
--- END SECTION 1 ---

[Additional sections...]

---

[Layer 4: Output Instruction]
### OUTPUT FORMAT: HTML
Generate a complete, production-ready, single-file HTML document...
[Full HTML mode instructions with Scalev single-column rules]
```

This concatenated string is then sent to the Claude API for LP generation.

---

## Files Generated From This Template

In the MVP codebase, all prompt logic lives in a single assembler file:

- `/src/prompts/assembler.ts` - All layer render functions + `assemblePrompt()` combiner
  - `renderLayer1()` - Global Context (platform, brand, tone, mobile copy rules)
  - `renderLayer2()` - Product Brief (product details, conditional sections)
  - `renderFormulaContext()` - Layer 2.5 Formula Context (conditional, formula mode only)
  - `renderLayer3()` - Section Blocks (repeated per section with layout + style)
  - `renderLayer4HTML()` / `renderLayer4Copy()` - Output Instructions
  - `assemblePrompt(project, product, brand, sections)` - Combines all layers

Supporting config files:
- `/src/config/formulas.ts` - Formula definitions with `context` field (Layer 2.5 source)
- `/src/config/layouts.ts` - 22 layout instruction lookup (`getLayoutInstruction()`)
- `/src/config/brand-presets.ts` - Font/vibe preset resolution maps

Each render function:
1. Accepts typed parameters (Project, Product, Brand, Section[])
2. Builds template strings with interpolated values
3. Conditionally includes optional sections (promo price, formula context, etc.)
4. Returns the rendered template string
5. Is pure/deterministic (same inputs = same output)

---

**Document Version:** 1.0
**Last Updated:** 6 April 2026
**Status:** Production Ready for Implementation
