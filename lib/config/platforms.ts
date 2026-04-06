// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

export interface Platform {
  id: string;
  label: string;
  description: string;
  isingleColumn: boolean;
  isMobile: boolean;
  constraints: string;
  htmlRules: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "scalev",
    label: "Scalev",
    description: "Single-column, mobile-first checkout pages",
    isingleColumn: true,
    isMobile: true,
    constraints: "Single column layout. Use CSS !important rules to override any default multi-column styles. Width: 100% of container, max-width: 100%.",
    htmlRules: "Single Column Rule: Every section must use grid-cols-1 and display as a single column. Do not use grid-cols-2, grid-cols-3, or multi-column layouts. Use !important CSS rule: .scalev-section { grid-template-columns: 1fr !important; }",
  },
  {
    id: "berdu",
    label: "Berdu",
    description: "Single-column product pages, mobile-dominant",
    isingleColumn: true,
    isMobile: true,
    constraints: "Single column layout. CSS !important rules required. No multi-column grids allowed. Full-width design.",
    htmlRules: "Single Column Rule: All sections must stack vertically in one column. No multi-column layouts. Use Tailwind grid-cols-1 exclusively. Add !important overrides if needed.",
  },
  {
    id: "lynk.id",
    label: "Lynk.id",
    description: "Link-in-bio format, almost exclusively mobile",
    isingleColumn: true,
    isMobile: true,
    constraints: "Single column layout. Strict width constraints: 100% of available width. No sidebar layouts. Centered content.",
    htmlRules: "Single Column Rule: Width locked to 100% of container. No side margins on main content. Centered alignment. Use max-width: 100% and width: 100% with !important if needed.",
  },
  {
    id: "wordpress",
    label: "WordPress",
    description: "Responsive, compatible with Elementor & Divi",
    isingleColumn: false,
    isMobile: false,
    constraints: "Responsive design. Compatible with Elementor and Divi builders. Use standard semantic HTML. Avoid absolute positioning.",
    htmlRules: "Elementor/Divi Compatible: Use standard Tailwind grid without conflicting utility names. Avoid custom grid system. All classes should be prefixed or scoped to avoid conflicts with builder CSS.",
  },
  {
    id: "shopify",
    label: "Shopify",
    description: "Responsive, compatible with Liquid templating",
    isingleColumn: false,
    isMobile: false,
    constraints: "Responsive design. Compatible with Liquid templating. Use standard HTML5. Avoid custom JavaScript. Class naming compatible with Shopify CSS framework.",
    htmlRules: "Liquid Compatible: Avoid embedded Liquid syntax. Use standard HTML5 only. Class names compatible with base Shopify theme CSS. Use Tailwind utilities that don't conflict with Shopify default styles.",
  },
  {
    id: "buat.id",
    label: "Buat.id",
    description: "Responsive design, standard HTML5 embed",
    isingleColumn: false,
    isMobile: false,
    constraints: "Responsive design. Standard HTML5 embed. No special constraints. Full responsive support.",
    htmlRules: "Standard Responsive: Use standard Tailwind responsive prefixes (md:, lg:, xl:). Mobile-first design required. All features available.",
  },
  {
    id: "order-hero",
    label: "Order Hero",
    description: "Responsive, compatible with checkout pages",
    isingleColumn: false,
    isMobile: false,
    constraints: "Responsive design. Standard HTML5 embed. Compatible with checkout page layouts.",
    htmlRules: "Checkout Page Compatible: Design for integration with order/checkout flow. Keep CTAs clear and prominent. Use standard responsive design.",
  },
  {
    id: "mayar",
    label: "Mayar",
    description: "Responsive, supports payment gateway hooks",
    isingleColumn: false,
    isMobile: false,
    constraints: "Responsive design. Support payment gateway integration hooks. Use standard semantic HTML.",
    htmlRules: "Payment Integration Ready: Include hooks/placeholders for payment gateway integration. Keep form areas accessible and clearly defined.",
  },
];

export const MOBILE_SINGLE_COLUMN_PLATFORMS = ["scalev", "berdu", "lynk.id"];

export function isMobilePlatform(platform: string): boolean {
  return MOBILE_SINGLE_COLUMN_PLATFORMS.includes(platform);
}

export function getPlatformById(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function getPlatformConstraints(platform: string): string {
  const p = getPlatformById(platform);
  return p?.constraints ?? PLATFORMS.find(p => p.id === "wordpress")!.constraints;
}

export function getPlatformHtmlRules(platform: string): string {
  const p = getPlatformById(platform);
  return p?.htmlRules ?? "";
}

export const TONES = [
  { id: "professional", label: "Profesional & Formal" },
  { id: "conversational", label: "Santai & Conversational" },
  { id: "persuasive", label: "Persuasif & Sales" },
  { id: "educational", label: "Edukatif & Informatif" },
  { id: "inspirational", label: "Inspiratif & Motivasional" },
  { id: "humorous", label: "Humoris & Ringan" },
  { id: "urgent", label: "Urgent & High-Energy" },
  { id: "empathetic", label: "Empatik & Supportif" },
];

export const MOBILE_HTML_RULES = `
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
- Spacing between sections: minimum \`py-12\` — give breathing room on small screens`.trim();
