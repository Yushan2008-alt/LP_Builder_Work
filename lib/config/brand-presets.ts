// ============================================================================
// BRAND PRESETS CONFIGURATION
// ============================================================================

export interface FontPreset {
  id: string;
  label: string;
  fonts: string[];
  promptInstruction: string;
  bestFor: string;
}

export interface ColorPalette {
  id: string;
  label: string;
  primary: string;
  accent: string;
  neutral: string;
  bestFor: string;
}

export interface ButtonStyleOption {
  id: string;
  label: string;
  tailwindClass: string;
  description: string;
}

export interface DesignVibeOption {
  id: string;
  label: string;
  promptInstruction: string;
  description: string;
}

// ============================================================================
// FONT STYLE PRESETS
// ============================================================================

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "modern_sans",
    label: "Modern Sans",
    fonts: ["Inter", "Plus Jakarta Sans", "DM Sans"],
    promptInstruction: "Use Inter, Plus Jakarta Sans, or DM Sans. Clean, modern, highly readable. Apply font-weight variations (400/600/700) for hierarchy.",
    bestFor: "SaaS, tech, startup, clean professional",
  },
  {
    id: "bold_impact",
    label: "Bold Impact",
    fonts: ["Montserrat", "Poppins", "Bebas Neue"],
    promptInstruction: "Use Montserrat Bold, Poppins Black, or Bebas Neue for headlines. Bold and assertive typography. High contrast weight between headlines and body.",
    bestFor: "Fitness, coaching, high-energy offers",
  },
  {
    id: "elegant_serif",
    label: "Elegant Serif",
    fonts: ["Playfair Display", "Lora", "Cormorant"],
    promptInstruction: "Use Playfair Display, Lora, or Cormorant Garamond. Refined, classic, premium feel. Pair with light sans-serif for body text.",
    bestFor: "Premium, fashion, luxury, beauty",
  },
  {
    id: "playful_rounded",
    label: "Playful Rounded",
    fonts: ["Nunito", "Quicksand", "Comfortaa"],
    promptInstruction: "Use Nunito, Quicksand, or Comfortaa. Friendly, approachable, soft curves. Light to medium weight for body, semi-bold for headlines.",
    bestFor: "Kids, casual brands, friendly products",
  },
  {
    id: "monospace_tech",
    label: "Monospace Tech",
    fonts: ["JetBrains Mono", "Fira Code", "Space Mono"],
    promptInstruction: "Use JetBrains Mono, Fira Code, or Space Mono. Technical, developer-centric aesthetic. Mix with a clean sans-serif for body copy.",
    bestFor: "Developer tools, tech, hacker vibe",
  },
];

export const FONT_PRESET_MAP: Record<string, string> = {
  modern_sans: "Inter, Plus Jakarta Sans, or DM Sans (Modern Sans — clean and professional)",
  bold_impact: "Montserrat Bold, Poppins Black, or Bebas Neue (Bold Impact — assertive and high-energy)",
  elegant_serif: "Playfair Display, Lora, or Cormorant (Elegant Serif — refined and premium)",
  playful_rounded: "Nunito, Quicksand, or Comfortaa (Playful Rounded — friendly and approachable)",
  monospace_tech: "JetBrains Mono, Fira Code, or Space Mono (Monospace Tech — technical and developer-focused)",
};

export function resolveFontStyle(brand: { font_style: string; font_custom: string | null }): string {
  if (brand.font_style === "custom" && brand.font_custom) {
    return brand.font_custom;
  }
  return FONT_PRESET_MAP[brand.font_style] ?? FONT_PRESET_MAP["modern_sans"];
}

// ============================================================================
// COLOR PALETTE PRESETS
// ============================================================================

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "ocean_blue",
    label: "Ocean Blue",
    primary: "#2563EB",
    accent: "#60A5FA",
    neutral: "#F1F5F9",
    bestFor: "SaaS, corporate, trust",
  },
  {
    id: "sunset_orange",
    label: "Sunset Orange",
    primary: "#EA580C",
    accent: "#FB923C",
    neutral: "#FFF7ED",
    bestFor: "Energy, food, urgency",
  },
  {
    id: "forest_green",
    label: "Forest Green",
    primary: "#16A34A",
    accent: "#4ADE80",
    neutral: "#F0FDF4",
    bestFor: "Health, eco, organic",
  },
  {
    id: "royal_purple",
    label: "Royal Purple",
    primary: "#7C3AED",
    accent: "#A78BFA",
    neutral: "#F5F3FF",
    bestFor: "Premium, creative, luxury",
  },
  {
    id: "rose_pink",
    label: "Rose Pink",
    primary: "#E11D48",
    accent: "#FB7185",
    neutral: "#FFF1F2",
    bestFor: "Beauty, fashion, feminine",
  },
  {
    id: "midnight_dark",
    label: "Midnight Dark",
    primary: "#1E293B",
    accent: "#475569",
    neutral: "#F8FAFC",
    bestFor: "Tech, dark mode, modern",
  },
  {
    id: "warm_gold",
    label: "Warm Gold",
    primary: "#B45309",
    accent: "#FCD34D",
    neutral: "#FFFBEB",
    bestFor: "Finance, premium, coaching",
  },
  {
    id: "coral_bright",
    label: "Coral Bright",
    primary: "#DC2626",
    accent: "#F87171",
    neutral: "#FEF2F2",
    bestFor: "Bold, sales, attention-grab",
  },
];

export const COLOR_PALETTE_MAP: Record<string, { primary: string; accent: string; neutral: string }> = {
  ocean_blue: { primary: "#2563EB", accent: "#60A5FA", neutral: "#F1F5F9" },
  sunset_orange: { primary: "#EA580C", accent: "#FB923C", neutral: "#FFF7ED" },
  forest_green: { primary: "#16A34A", accent: "#4ADE80", neutral: "#F0FDF4" },
  royal_purple: { primary: "#7C3AED", accent: "#A78BFA", neutral: "#F5F3FF" },
  rose_pink: { primary: "#E11D48", accent: "#FB7185", neutral: "#FFF1F2" },
  midnight_dark: { primary: "#1E293B", accent: "#475569", neutral: "#F8FAFC" },
  warm_gold: { primary: "#B45309", accent: "#FCD34D", neutral: "#FFFBEB" },
  coral_bright: { primary: "#DC2626", accent: "#F87171", neutral: "#FEF2F2" },
};

// ============================================================================
// BUTTON STYLE OPTIONS
// ============================================================================

export const BUTTON_STYLES: ButtonStyleOption[] = [
  {
    id: "rounded",
    label: "Rounded",
    tailwindClass: "rounded-lg",
    description: "Softly rounded corners — modern and friendly",
  },
  {
    id: "sharp",
    label: "Sharp Corner",
    tailwindClass: "rounded-none",
    description: "No rounding — bold and corporate",
  },
  {
    id: "pill",
    label: "Pill",
    tailwindClass: "rounded-full",
    description: "Fully rounded — playful and modern",
  },
  {
    id: "outline",
    label: "Outline (Ghost)",
    tailwindClass: "border-2 border-current bg-transparent",
    description: "Transparent with border — elegant and secondary",
  },
];

// ============================================================================
// DESIGN VIBE OPTIONS
// ============================================================================

export const DESIGN_VIBES: DesignVibeOption[] = [
  {
    id: "minimalist",
    label: "Minimalist",
    promptInstruction: "Minimalist and clean: maximum whitespace, minimal decorative elements, focus on typography and content hierarchy. Less is more.",
    description: "Clean, spacious, focused on content",
  },
  {
    id: "corporate",
    label: "Corporate",
    promptInstruction: "Corporate and professional: structured layouts, conservative color usage, formal typography, trust-building elements prominent.",
    description: "Professional, structured, trustworthy",
  },
  {
    id: "energetic",
    label: "Energetic",
    promptInstruction: "Energetic and bold: strong color contrasts, dynamic layouts, bold typography, movement and energy in design choices.",
    description: "Bold, dynamic, high-impact",
  },
  {
    id: "premium",
    label: "Premium",
    promptInstruction: "Premium and luxurious: refined typography, ample white space, subtle gradients, gold or dark accents, exclusivity signals throughout.",
    description: "Refined, exclusive, high-end",
  },
  {
    id: "playful",
    label: "Playful",
    promptInstruction: "Playful and friendly: rounded shapes, bright colors, casual tone, approachable layouts, fun visual elements.",
    description: "Fun, friendly, approachable",
  },
  {
    id: "dark_mode",
    label: "Dark Mode",
    promptInstruction: "Dark mode aesthetic: dark backgrounds (#0F172A or #1E293B), light text, neon or vibrant accent colors, sleek modern tech feel.",
    description: "Dark backgrounds, sleek tech aesthetic",
  },
];

export const VIBE_PRESET_MAP: Record<string, string> = {
  minimalist: "minimalist and clean — maximum whitespace, focus on typography, minimal decoration",
  corporate: "corporate and professional — structured, conservative, trust-building",
  energetic: "energetic and bold — strong contrasts, dynamic, high-energy",
  premium: "premium and luxurious — refined, exclusive, high-end",
  playful: "playful and friendly — rounded, bright, approachable",
  dark_mode: "dark mode aesthetic — dark backgrounds, light text, vibrant accents",
};

export function resolveDesignVibe(brand: { design_vibe: string; vibe_custom: string | null }): string {
  if (brand.design_vibe === "custom" && brand.vibe_custom) {
    return brand.vibe_custom;
  }
  return VIBE_PRESET_MAP[brand.design_vibe] ?? VIBE_PRESET_MAP["minimalist"];
}

// ============================================================================
// DEFAULT BRAND VALUES
// ============================================================================

export const DEFAULT_BRAND_VALUES = {
  font_style: "modern_sans",
  font_custom: null,
  color_palette: "ocean_blue",
  color_primary: "#2563EB",
  color_accent: "#60A5FA",
  color_neutral: "#F1F5F9",
  button_style: "rounded",
  design_vibe: "minimalist",
  vibe_custom: null,
};
