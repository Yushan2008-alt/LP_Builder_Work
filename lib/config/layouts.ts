// ============================================================================
// LAYOUT FORMAT CONFIGURATION (22 Formats)
// ============================================================================

export interface LayoutFormat {
  id: string;
  label: string;
  description: string;
  promptInstruction: string;
  category: "hero" | "content" | "proof" | "conversion" | "interactive";
  skeletonType: string; // used for visual skeleton preview
}

export const LAYOUT_FORMATS: LayoutFormat[] = [
  {
    id: "standard_image",
    label: "Standard Image",
    description: "Split layout with image and text side by side",
    promptInstruction: "Layout: Split layout with image on one side and text content on the other. Use a 2-column grid (grid-cols-2) on desktop, stack vertically on mobile. Image should be responsive with rounded corners (rounded-lg). Text side includes headline, body copy, and optional CTA button. Ensure image placeholder has descriptive alt text reflecting section content.",
    category: "hero",
    skeletonType: "split_image",
  },
  {
    id: "vsl",
    label: "VSL (Video Sales Letter)",
    description: "Video-centric section with headline and CTA",
    promptInstruction: "Layout: Video-centric section. Large video embed (16:9 aspect ratio) centered, using <iframe> with responsive width/height. Headline positioned above the video. Body copy below video emphasizing key messages. CTA button prominently placed below all content. Keep surrounding whitespace minimal to focus attention on the video. Use placehold.co for video thumbnail if needed.",
    category: "hero",
    skeletonType: "video",
  },
  {
    id: "typographic",
    label: "Typographic / Text-Heavy",
    description: "Full-width text with typography as main visual",
    promptInstruction: "Layout: Full-width text section with typography as the main visual element. Large, bold headline (h2 with 2xl-3xl size). Subheading (h3) below. Multiple paragraphs of body copy organized by clear visual hierarchy. Use color accents (primary or accent color) on key phrases. Whitespace is critical—generous padding between text blocks. No images required. Suitable for storytelling, problem statement, or educational sections.",
    category: "content",
    skeletonType: "text_only",
  },
  {
    id: "split_screen",
    label: "Split Screen",
    description: "Two equal columns side by side",
    promptInstruction: "Layout: Two equal columns side by side on desktop, stacked on mobile. Left column contains text/headline/copy. Right column contains image, video, or visual content. Clear visual separation with border or subtle background color difference. Use grid-cols-2 on desktop, grid-cols-1 on mobile. Equal padding on both sides. Image or media in right column should be full-height relative to text.",
    category: "content",
    skeletonType: "split_equal",
  },
  {
    id: "story_based",
    label: "Story-Based",
    description: "Narrative-driven layout with story arc",
    promptInstruction: "Layout: Narrative-driven layout. Headline setting the scene. Body organized in short, compelling paragraphs (3-4 lines each) that guide reader through a story arc. Consider using a large supporting image or illustration midway through the narrative. Use color callouts (accent color background) for pivotal moments or realizations in the story. End with a subtle CTA or reflection that ties story to product.",
    category: "content",
    skeletonType: "text_image_text",
  },
  {
    id: "stat_counter",
    label: "Stat Counter / Numbers",
    description: "Grid of prominent statistics",
    promptInstruction: "Layout: Grid of prominent statistics with large numerical displays. Use 2-3 columns on desktop, 1 column on mobile. Each stat should show: large number (4xl size, primary color), label below (small text, neutral color). Organize stats in a card-based format with subtle borders or background. Optional: Add context paragraph above or below the grid.",
    category: "proof",
    skeletonType: "stats_grid",
  },
  {
    id: "before_after",
    label: "Before-After",
    description: "Side-by-side transformation comparison",
    promptInstruction: "Layout: Side-by-side comparison layout. Left side labeled 'Before' with text describing the problem or current state. Right side labeled 'After' showing the transformation or solution. Use visual divider (vertical line or contrasting background). Can include images on both sides if available. Typography and spacing should highlight the contrast. Use accent color to emphasize 'After' state positively.",
    category: "proof",
    skeletonType: "before_after",
  },
  {
    id: "feature_grid",
    label: "Feature Grid",
    description: "Grid of feature cards with icons",
    promptInstruction: "Layout: Grid display of 3-4 features per row on desktop, 1-2 on tablet, 1 on mobile. Each feature as a card with icon/image, headline (h4), and brief description. Use grid-cols-3 on desktop, grid-cols-2 on tablet, grid-cols-1 on mobile. Add subtle shadows or borders to cards for depth. Consistent spacing between cards. Suitable for showcasing product capabilities or benefits.",
    category: "content",
    skeletonType: "card_grid_3",
  },
  {
    id: "icon_list",
    label: "Icon List",
    description: "Vertical list with icon and text per item",
    promptInstruction: "Layout: Vertical list of items, each with an icon on the left and text on the right. Use flex layout with icon (size: 24-32px, primary color) and wrapped text. Stack vertically with even spacing (gap-4). Each item can have headline and short description. Suitable for benefits, features, or bullet-point lists. Icons should be simple and consistent.",
    category: "content",
    skeletonType: "icon_list",
  },
  {
    id: "bento_layout",
    label: "Bento Layout",
    description: "Asymmetric grid inspired by Apple Bento design",
    promptInstruction: "Layout: Asymmetric grid inspired by Apple's Bento design. Mix of differently-sized cards arranged in a responsive grid. Some cards span 2 columns, others span 1. Use grid-cols-3 on desktop with varied row spans (row-span-1, row-span-2). On mobile, collapse to grid-cols-1. Each card contains an image, headline, or short copy. Create visual hierarchy through sizing and color.",
    category: "content",
    skeletonType: "bento",
  },
  {
    id: "quote_testimonial",
    label: "Quote / Testimonial Card",
    description: "Prominent quote with attribution",
    promptInstruction: "Layout: Large, prominent quote display. Quotation mark icon or symbol at top. Large quote text (xl-2xl size) in primary or accent color. Attribution below (name, title, company) in smaller text, neutral color. Optional: Small avatar image or brand logo before attribution. Use generous padding and subtle background color to create card effect. Suitable for powerful customer testimonials or inspirational quotes.",
    category: "proof",
    skeletonType: "testimonial",
  },
  {
    id: "video_testimonial",
    label: "Video Testimonial",
    description: "Video embed of customer testimonial",
    promptInstruction: "Layout: Video embed (16:9 aspect ratio) of a customer or user testimonial. Headline above: 'What [Customer Name] Says'. Optional: Customer name, title, company displayed below video. Brief quote or key message highlighted in text below. Keep video and surrounding content minimal to maintain focus. Use placehold.co for video placeholder.",
    category: "proof",
    skeletonType: "video",
  },
  {
    id: "screenshot_chat",
    label: "Screenshot / Chat Interface",
    description: "Mockup of app or chat interface",
    promptInstruction: "Layout: Screenshot-like display, often mimicking a chat, message thread, or app interface. Use a bordered container (border-2, rounded-lg) styled like a mobile phone or message window. Dark or light background depending on theme. Messages or UI elements arranged vertically. Include visual indicators (timestamps, avatars, read receipts) if appropriate.",
    category: "proof",
    skeletonType: "phone_mockup",
  },
  {
    id: "single_offer",
    label: "Single Offer / Pricing Card",
    description: "Standalone offer card with price and CTA",
    promptInstruction: "Layout: Prominent standalone offer card. Headline: offer or deal title. Price display (large, primary color). Key features listed as bullet points or small text blocks. CTA button at bottom (full width or large). Optional: Discount badge or scarcity indicator in top-right corner. Use substantial padding, card shadows, and accent color highlights.",
    category: "conversion",
    skeletonType: "offer_card",
  },
  {
    id: "comparison_table",
    label: "Comparison Table",
    description: "Horizontal table comparing features or options",
    promptInstruction: "Layout: Horizontal table comparing product features, pricing, or options. Use <table> with thead and tbody. Columns: Feature name (left), then 2-4 comparison columns. Use striped rows (alternate neutral background). Check marks (✓) in primary color for included features. X marks for excluded. Header row highlighted in primary color with white text. Responsive: horizontal scroll on mobile if needed.",
    category: "content",
    skeletonType: "table",
  },
  {
    id: "tier_cards",
    label: "Tier / Pricing Cards",
    description: "Multiple pricing tier cards in columns",
    promptInstruction: "Layout: Vertical stack of 2-3 pricing tier cards displayed as columns on desktop. Each card shows: tier name (headline), price (large, primary color), features list (bullet points), CTA button. Highlight recommended tier with accent color border or background. Use equal-width columns (flex or grid-cols-3). On mobile, stack vertically. Include a 'Most Popular' badge on recommended tier.",
    category: "conversion",
    skeletonType: "tier_cards",
  },
  {
    id: "moving_marquee",
    label: "Moving Marquee",
    description: "Horizontal scrolling list of logos or proof",
    promptInstruction: "Layout: Horizontal scrolling marquee or ticker display. Use <div> with horizontal scrolling or CSS animation. Display: logos, testimonial snippets, feature list, or social proof items in a continuous loop. Items separated by dividers or spacing. Consider using image placeholders for logos with smooth fade-in/out at edges.",
    category: "proof",
    skeletonType: "marquee",
  },
  {
    id: "promo_coretan",
    label: "Promo Coretan (Strikethrough)",
    description: "Discounted pricing with strikethrough",
    promptInstruction: "Layout: Emphasis on discounted pricing. Display normal price with strikethrough text (line-through, neutral color), then new/promo price below in large, bold, primary color. Add discount percentage badge (e.g., '-30%') in accent color. Optional: 'Limited Time' or urgency text above. Use generous spacing and bold typography. Suitable for flash sales, promotions, or limited-time offers.",
    category: "conversion",
    skeletonType: "promo",
  },
  {
    id: "accordion",
    label: "Accordion / FAQ",
    description: "Expandable sections for FAQ or features",
    promptInstruction: "Layout: Expandable FAQ or feature list. Use accordion component with headers that toggle content visibility. Each header includes question or topic (headline), optional icon (chevron or +/-). Expanded content shows answer or details below. Use primary color for headers, neutral for content background. Smooth transition animation on expand/collapse. Stack vertically with clear spacing between items.",
    category: "interactive",
    skeletonType: "accordion",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Step-by-step vertical or horizontal timeline",
    promptInstruction: "Layout: Vertical or horizontal timeline showing process steps, journey, or chronological events. Central line (vertical or horizontal) with events/steps branching off on alternating sides. Each event: headline, optional date/number, brief description. Use primary color for timeline line and event markers (circles). Responsive: vertical timeline on mobile, horizontal on desktop if space allows.",
    category: "content",
    skeletonType: "timeline",
  },
  {
    id: "logo_bar",
    label: "Logo Bar / Social Proof",
    description: "Horizontal bar of logos or trust badges",
    promptInstruction: "Layout: Horizontal bar or grid of logos, client names, or trust badges. Use flex layout with centered, evenly-spaced logos (height: 40-60px). Add introductory text above: 'Trusted by...' or 'As featured in...'. Use neutral color for logos and text. Optional: Add subtle dividers between logos. On mobile, wrap to 2 columns if needed.",
    category: "proof",
    skeletonType: "logo_bar",
  },
  {
    id: "card_grid",
    label: "Card Grid / Multiple Options",
    description: "Grid of identical or similar option cards",
    promptInstruction: "Layout: Grid of identical or similar cards, typically 2-3 per row on desktop, 1-2 on tablet, 1 on mobile. Each card: optional image/icon at top, headline, description/bullet points, and CTA button. Use grid-cols-3 on desktop, grid-cols-2 on tablet, grid-cols-1 on mobile. Consistent card height with equal padding. Add subtle borders, shadows, or background colors for visual separation.",
    category: "content",
    skeletonType: "card_grid_3",
  },
];

export const LAYOUT_FORMAT_MAP: Record<string, string> = Object.fromEntries(
  LAYOUT_FORMATS.map((f) => [f.id, f.promptInstruction])
);

export function getLayoutById(id: string): LayoutFormat | undefined {
  return LAYOUT_FORMATS.find((f) => f.id === id);
}

export function getLayoutInstruction(id: string): string {
  return LAYOUT_FORMAT_MAP[id] ?? LAYOUT_FORMAT_MAP["standard_image"];
}
