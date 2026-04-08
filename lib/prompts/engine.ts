import type { Brand, Product, Project, Section } from "@/lib/types";
import { resolveFontStyle, resolveDesignVibe } from "@/lib/config/brand-presets";
import { getLayoutInstruction } from "@/lib/config/layouts";
import { getPlatformConstraints, getPlatformHtmlRules, isMobilePlatform, MOBILE_HTML_RULES } from "@/lib/config/platforms";
import { getFormulaById } from "@/lib/config/formulas";

// ============================================================================
// RESOLVED VARIABLES
// ============================================================================

interface ResolvedVars {
  fontStyle: string;
  colorPrimary: string;
  colorAccent: string;
  colorNeutral: string;
  buttonStyle: string;
  designVibe: string;
}

function resolveVariables(brand: Brand): ResolvedVars {
  return {
    fontStyle: resolveFontStyle(brand),
    colorPrimary: brand.color_primary,
    colorAccent: brand.color_accent,
    colorNeutral: brand.color_neutral,
    buttonStyle: brand.button_style,
    designVibe: resolveDesignVibe(brand),
  };
}

// ============================================================================
// LAYER 1: GLOBAL CONTEXT
// ============================================================================

function renderGlobalContext(vars: ResolvedVars, platform: string, tone: string): string {
  const platformConstraints = getPlatformConstraints(platform);
  const mobileCopyRules = isMobilePlatform(platform) ? getMobileCopyRules(platform) : "";

  return `You are an expert landing page copywriter and web developer specializing in high-converting sales pages and landing pages.

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
- Avoid false urgency unless inventory/timing is verified
- No misleading claims about results or outcomes
- Include disclaimers if product makes health/financial claims
- Keep testimonials realistic and attribute them clearly

### PLATFORM CONSTRAINTS

**Platform:** ${platform}

${platformConstraints}
${mobileCopyRules ? "\n" + mobileCopyRules : ""}

### BRAND GUIDELINES

**Font Style:** ${vars.fontStyle}
**Primary Color:** ${vars.colorPrimary}
**Accent Color:** ${vars.colorAccent}
**Neutral/Background Color:** ${vars.colorNeutral}
**Button Style:** ${vars.buttonStyle}
**Design Vibe:** ${vars.designVibe}

Apply these consistently throughout all sections. Use primary color for main CTAs, accent for secondary elements, neutral for backgrounds and borders.

### TONE

Write in the following tone: ${tone}

### LANGUAGE

Write in Bahasa Indonesia. All copy must be in Bahasa Indonesia. Use clear, conversational language appropriate for Indonesian audiences.

---`;
}

function getMobileCopyRules(platform: string): string {
  const name = platform.toUpperCase();
  return `### MOBILE-FIRST COPY RULES (${name})

This platform is viewed **almost entirely on mobile screens (320px–430px wide)**. Apply these rules strictly:

**Paragraph Length:**
- Maximum **2 sentences per paragraph** — no exceptions
- Each sentence max **15 words**
- Add a line break between every paragraph

**Headlines:**
- Main headline (h1): max **8 words**, punchy and direct
- Section headline (h2): max **10 words**
- Subheadline (h3): max **12 words**

**Bullet Points:**
- Max **5 items** per list
- Each item max **1 line** on mobile (roughly 40–50 characters)
- Start each bullet with a strong verb or key noun

**CTA Copy:**
- Button text: max **4 words**, action-first (e.g., "Coba Gratis Sekarang")
- Never use passive or vague CTAs ("Klik di sini", "Submit")
- Surround every CTA with 1 short supporting line — max 10 words

**Text Density:**
- No walls of text — if a block feels long, split it
- Prioritize white space over completeness
- Every section must be readable in under 10 seconds on a phone screen`;
}

// ============================================================================
// LAYER 2: PRODUCT BRIEF
// ============================================================================

function renderProductBrief(product: Product, brand: Brand): string {
  const lines: string[] = [
    "### PRODUCT BRIEF",
    "",
    `**Product Name:** ${product.name}`,
    "",
    `**Brand:** ${brand.name}`,
    "",
    "**Description:**",
    product.description,
    "",
    "**Pricing:**",
    `- Normal Price: ${product.price_normal}`,
  ];

  if (product.price_promo) {
    lines.push(`- Promo Price: ${product.price_promo}`);
  }

  if (product.target_audience) {
    lines.push("", "**Target Audience:**", product.target_audience);
  }

  if (product.pain_points) {
    lines.push("", "**Key Pain Points Your Audience Faces:**", product.pain_points);
  }

  if (product.objections) {
    lines.push("", "**Common Objections You May Encounter:**", product.objections);
  }

  if (product.usp) {
    lines.push("", "**Unique Selling Proposition:**", product.usp);
  }

  lines.push("", "---");
  return lines.join("\n");
}

// ============================================================================
// LAYER 2.5: FORMULA CONTEXT (CONDITIONAL)
// ============================================================================

function renderFormulaContext(project: Project): string {
  if (project.mode !== "formula" || !project.framework) return "";

  const formula = getFormulaById(project.framework);
  if (!formula?.context) return "";

  return `### FRAMEWORK CONTEXT

**Formula:** ${formula.name}

${formula.context}

---`;
}

// ============================================================================
// LAYER 3: SECTION BLOCKS
// ============================================================================

function renderSectionBlock(
  section: Section,
  index: number,
  vars: ResolvedVars,
  project: Project,
  productName: string,
  sectionProduct?: Product,
  sectionBrand?: Brand
): string {
  const layoutInstruction = getLayoutInstruction(section.layout_format);

  const styleInstruction =
    section.style_mode === "custom" && section.style_custom
      ? section.style_custom
      : `Follow the global brand design guidelines: ${vars.designVibe} vibe, using ${vars.fontStyle} font, ${vars.buttonStyle} button style. Use primary color (${vars.colorPrimary}) for key elements and accent color (${vars.colorAccent}) for secondary highlights. Maintain consistent visual language across all sections.`;

  const frameworkLine =
    project.mode === "formula" && section.framework_position && project.framework
      ? `**Framework Position:** This section is the "${section.framework_position}" stage of the ${project.framework.toUpperCase()} framework.`
      : "";

  const additionalContextLine = section.additional_context
    ? `**Additional Context:**\n${section.additional_context}`
    : "";

  const sectionProductLine =
    sectionProduct && sectionBrand
      ? `**Section Product Override:**\nUse this section's selected product instead of the global product brief when writing this section.\n- Product: ${sectionProduct.name}\n- Brand: ${sectionBrand.name}\n- Description: ${sectionProduct.description}\n- Normal Price: ${sectionProduct.price_normal}${sectionProduct.price_promo ? `\n- Promo Price: ${sectionProduct.price_promo}` : ""}${sectionProduct.target_audience ? `\n- Target Audience: ${sectionProduct.target_audience}` : ""}${sectionProduct.pain_points ? `\n- Pain Points: ${sectionProduct.pain_points}` : ""}${sectionProduct.objections ? `\n- Objections: ${sectionProduct.objections}` : ""}${sectionProduct.usp ? `\n- USP: ${sectionProduct.usp}` : ""}`
      : "";

  const parts = [
    `--- SECTION ${index}: "${section.section_title}" ---`,
    "",
    "**Goals:**",
    section.section_goals,
    "",
    "**Layout Format:**",
    layoutInstruction,
    "",
    "**Style:**",
    styleInstruction,
  ];

  if (frameworkLine) {
    parts.push("", frameworkLine);
  }

  if (additionalContextLine) {
    parts.push("", additionalContextLine);
  }

  if (sectionProductLine) {
    parts.push("", sectionProductLine);
  }

  parts.push(
    "",
    "**Product Reference:**",
    `This section should reference and build on the product brief above (${productName}). Weave in relevant product details, pricing, benefits, or positioning as appropriate to the section goals.`,
    "",
    `--- END SECTION ${index} ---`
  );

  return parts.join("\n");
}

// ============================================================================
// LAYER 4: OUTPUT INSTRUCTION
// ============================================================================

function renderOutputInstructionHTML(vars: ResolvedVars, platform: string): string {
  const platformSpecificRules = getPlatformHtmlRules(platform);
  const mobileHtmlRules = isMobilePlatform(platform) ? "\n" + MOBILE_HTML_RULES : "";

  return `### OUTPUT FORMAT: HTML

Generate a complete, production-ready, single-file HTML document. Follow these requirements:

**Structural Requirements:**
- Use semantic HTML5 elements (<header>, <main>, <section>, <footer>, etc.)
- Include proper <!DOCTYPE html> declaration and <meta charset="utf-8">
- Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> for responsive design
- Wrap all content in a <main> element for accessibility

**Styling & CSS:**
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Apply Tailwind utility classes for all styling
- Mobile-first responsive design: use md:, lg:, xl: prefixes for breakpoints
- Use the exact hex colors provided in brand guidelines:
  - Primary: ${vars.colorPrimary}
  - Accent: ${vars.colorAccent}
  - Neutral: ${vars.colorNeutral}

**Typography & Fonts:**
- Font Style: ${vars.fontStyle}
- Import fonts from Google Fonts in <head>
- Use semantic heading hierarchy: h1 for page title, h2 for section headlines, h3 for subsections

**Button Styling:**
- Button style: ${vars.buttonStyle}
  - rounded: Use rounded-lg class
  - sharp: Use rounded-none
  - pill: Use rounded-full
  - outline: Use border-2 border-current with transparent background
- Primary buttons: primary color background, white text
- Add hover effects: hover:opacity-90 or hover:scale-105

**Platform-Specific Rules:**
${platformSpecificRules}${mobileHtmlRules}

**Image Handling:**
- Use placeholder images via https://placehold.co/WIDTHxHEIGHT
- Add descriptive alt text to all images
- Make images responsive: w-full h-auto

**Responsive Design:**
- Mobile-first approach: design for mobile, then add desktop enhancements
- Test layout at: 320px, 768px, 1024px, 1280px viewports

**Code Quality:**
- Clean, well-indented code (2-space indentation)
- HTML comments separating major sections
- Single-file output: all HTML, CSS (Tailwind CDN), no external JS dependencies

**Accessibility:**
- Use semantic HTML
- Add alt text to all images
- Use <button> elements for clickable actions`;
}

function renderOutputInstructionCopy(tone: string): string {
  return `### OUTPUT FORMAT: COPY (TEXT ONLY)

Generate copy text only, without HTML markup. Follow these requirements:

**Structure & Formatting:**
- Use markdown-style formatting:
  - # for main page headline (h1)
  - ## for section headlines (h2)
  - ### for subsection headlines (h3)
  - - for bullet points
  - **text** for bold emphasis

**Section Organization:**
- Clear heading for each section (## Section Title)
- Body copy under each heading (paragraphs of 2-5 sentences)
- Bullet-point lists for benefits, features, or proof points

**Copy Style:**
- Conversational tone matching: ${tone}
- Short sentences (10-15 words max) for skimmability
- Use "you" language addressing the reader directly
- Action-oriented language in CTAs

**Placeholder Markings:**
- [IMAGE PLACEHOLDER: brief description] where images would appear
- [CTA BUTTON: button text] for call-to-action buttons
- [VIDEO PLACEHOLDER: brief description] for video content

**Content Requirements:**
- All copy in Bahasa Indonesia
- Keep copy concise: 150-250 words per section
- Clear, compelling CTA text`;
}

// ============================================================================
// MAIN ASSEMBLER
// ============================================================================

export interface AssemblePromptInput {
  project: Project;
  product: Product;
  brand: Brand;
  sections: Section[];
  products?: Product[];
  brands?: Brand[];
}

export function assemblePrompt({ project, product, brand, sections, products = [], brands = [] }: AssemblePromptInput): string {
  const vars = resolveVariables(brand);
  const platform = project.platform ?? "wordpress";
  const tone = project.tone ?? "profesional dan persuasif";

  const layers: string[] = [];

  // Layer 1: Global Context
  layers.push(renderGlobalContext(vars, platform, tone));

  // Layer 2: Product Brief
  layers.push(renderProductBrief(product, brand));

  // Layer 2.5: Formula Context (conditional)
  const formulaContext = renderFormulaContext(project);
  if (formulaContext) {
    layers.push(formulaContext);
  }

  // Layer 3: Section Blocks
  layers.push("=== SECTION BLOCKS ===");
  const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index);
  const productsById = new Map(products.map((item) => [item.id, item]));
  const brandsById = new Map(brands.map((item) => [item.id, item]));
  sortedSections.forEach((section, i) => {
    const sectionProduct =
      section.product_id && section.product_id !== product.id
        ? productsById.get(section.product_id)
        : undefined;
    const sectionBrand = sectionProduct ? brandsById.get(sectionProduct.brand_id) : undefined;
    layers.push(renderSectionBlock(section, i + 1, vars, project, product.name, sectionProduct, sectionBrand));
  });

  // Layer 4: Output Instruction
  if (project.output_mode === "html") {
    layers.push(renderOutputInstructionHTML(vars, platform));
  } else {
    layers.push(renderOutputInstructionCopy(tone));
  }

  return layers.join("\n\n");
}

export function canGenerate(project: Project | null, sections: Section[], productId: string | null): boolean {
  if (!project) return false;
  if (!productId) return false;
  if (sections.length === 0) return false;
  // Check all sections have title, goals, and selected layout format
  const allSectionsValid = sections.every(
    (s) =>
      s.section_title.trim().length > 0 &&
      s.section_goals.trim().length > 0 &&
      s.layout_format.trim().length > 0 &&
      (s.style_mode !== "custom" || (s.style_custom?.trim() ?? "").length > 0)
  );
  return allSectionsValid;
}
