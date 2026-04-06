# SesuaiFormat Engine - Full Prompt Template & Logic

> Reverse-engineered dari `landingpage.sesuaiformat.id/generator`
> Source: `index-B-PALmDU.js` (minified React app, ~474KB)
> Last updated: 5 April 2026 (cross-checked by 3 parallel agents)

---

## 0. ARCHITECTURE OVERVIEW

**100% Frontend. Tidak ada backend API call.**

Diverifikasi via Network Monitor: klik "Generate Sekarang" menghasilkan **0 network requests**.

### Flow Sebenarnya:

1. User isi form -> populate state object `u`
2. Frontend build prompt via **template literal interpolation** (pure string concatenation)
3. Prompt di-set ke React state dan ditampilkan di panel kanan
4. User bisa: **Copy prompt** (clipboard) ATAU **Buka di chat.z.ai** (tab baru)

### 3 Action Functions:

| Function | Trigger | Apa yang Dilakukan |
|---|---|---|
| `ye()` | Tombol "Generate Sekarang" | Build prompt dari template, set ke state, tampilkan di UI. **Tidak ada fetch/API call.** |
| `it()` | Tombol "Salin" | `navigator.clipboard.writeText(ee)` - copy prompt ke clipboard |
| `Be()` | Tombol terpisah (generate + redirect) | `window.open('https://chat.z.ai/?q=${prompt}', '_blank')` - buka prompt di AI chat service external |

### External Services:

| Service | Dipakai Untuk |
|---|---|
| **Supabase** (`gqjirdumececjcevwimk.supabase.co`) | Auth only (signIn, signOut). Tidak ada database/storage query. |
| **chat.z.ai** | AI chat service external. Prompt dikirim via URL query parameter, dibuka di tab baru. Bukan backend milik SesuaiFormat. |
| **Cloudflare** | Analytics (beacon.min.js) |
| **placehold.co** | Hanya di-reference di prompt template sebagai placeholder image URL |

### Stats:
Total expressions di template: **30** (16 static var + 9 form direct + 1 conditional inline + 1 fallback inline + 3 reused)
Hanya ada **1 template** di seluruh codebase. Tidak ada secondary template untuk mode "Live HTML Editor".

---

## 1. VARIABLE RESOLUTION LOGIC

Sebelum prompt template di-render, semua variabel dihitung dulu dari form state (`u`):

```javascript
// === RESOLUSI CUSTOM vs DROPDOWN ===
J  = u.category_base === "custom" ? u.category_custom : u.category_base
Ee = u.target_base   === "custom" ? u.target_custom   : u.target_base
Ue = u.cta_base      === "custom" ? u.cta_custom      : u.cta_base
pt = u.brand_color   === "custom" ? u.color_custom     : u.brand_color

// === DIRECT MAPPING ===
At = u.platform
Bi = u.scarcity_type
hn = u.hero_type

// === FALLBACK VALUES ===
ha = u.pain_points || "Tidak dispesifikan, harap riset mandiri."
me = u.objections  || "Umum (Harga/Kualitas)."

// === CONDITIONAL: BONUS ===
Pr = u.has_bonus
       ? (u.bonus_details || "Tidak ada detail.")
       : "Tidak ada bonus tambahan."

// === CONDITIONAL: PLATFORM -> LAYOUT ===
// [CORRECTED] Bukan cuma Lynk.id! 3 platform dipaksa single column
if (At === "Scalev" || At === "Berdu" || At === "Lynk.id") {
  da = "Desain WAJIB menggunakan SATU KOLOM TUNGGAL (Single Column). Jangan gunakan grid multi-kolom."
} else {
  // WordPress, Shopify, Buat.id, Order Hero, Mayar
  da = "Desain WAJIB RESPONSIF penuh. Gunakan layout adaptif."
}

// === CONDITIONAL: HERO TYPE -> INSTRUCTION ===
if (hn === "Video Sales Letter (VSL)") {
  Hi = "HERO SECTION: Gunakan layout VSL. Video embed (placeholder YT/Vimeo) harus menjadi fokus utama, dengan Headline besar di atasnya dan tombol CTA di bawahnya. JANGAN gunakan gambar samping."
} else {
  Hi = "HERO SECTION: Gunakan layout Hero standar (Gambar/Ilustrasi + Copy)."
}

// === CONDITIONAL: STICKY MOBILE ===
Ns = u.sticky_mobile ? "YA" : "TIDAK"
// Di template: Ns === "YA"
//   ? "WAJIB membuat tombol CTA Melayang (Sticky Bottom) yang hanya muncul di layar mobile..."
//   : "Tidak perlu sticky button."

// === CONDITIONAL: CTA TARGET ===
if (u.cta_target_type === "url") {
  Hn = `Arahkan \`href\` SEMUA tombol CTA (beli, keranjang, order, dsb) secara langsung ke URL berikut: ${u.cta_target_value}`
} else if (u.cta_target_type === "wa") {
  Hn = `Arahkan \`href\` ke link WhatsApp: https://wa.me/${u.cta_target_value}`
} else {
  // scroll (default)
  Hn = "Arahkan `href` semua tombol CTA agar SCROLL ke form/section terbawah halaman (gunakan anchor tag)."
}

// === TEMA VISUAL (COLOR STRING) ===
dn = "Tema warna harus disesuaikan sepenuhnya dengan gaya desain yang dipilih."
dn += " PENTING: Gunakan deklarasi `!important` pada CSS `background-color` untuk body atau container utama agar warna background mem-bypass/menimpa default CSS dari platform embed seperti Scalev, Berdu, WordPress, dll."

// === SECTIONS (CHECKBOXES) ===
// Xe = array dari checked section names, e.g. ["Social Proof", "FAQ", "Guarantee"]
ra = Xe.length > 0
       ? Xe.join(", ")
       : "Standar"

// [CORRECTED] vt block juga melakukan .toUpperCase() pada section names
vt = Xe.length > 0
       ? `\n\n[ PENTING: HIGHLIGHT SECTION TAMBAHAN ]\nAI, ANDA WAJIB membuat section tambahan berikut secara LENGKAP & DETAIL: [ ${Xe.join(", ").toUpperCase()} ]\nJANGAN SAMPAI ADA YANG TERLEWAT ATAU DIABAIKAN!`
       : ""
```

---

## 2. FULL PROMPT TEMPLATE

Ini template utuh yang di-generate. Variabel ditandai dengan `${...}`:

```
ANDA ADALAH: Senior Conversion Copywriter + UI/UX minded marketer yang sudah menciptakan ratusan landing page yang mengkonversi untuk penjualan di social media.

TUGAS ANDA: Menulis Copywriting Landing Page (Sales Page) dengan struktur HTML yang rapi, persuasif, dan aman untuk kebijakan iklan (Meta/Google Ads Compliance).

ATURAN PENULISAN & LAYOUT (WAJIB DIPATUHI):
1. LAYOUT: ${LAYOUT_INSTRUCTION}
2. TEMA VISUAL: ${TEMA_VISUAL_STRING}
3. HERO TYPE: ${HERO_TYPE_VALUE}. ${HERO_LAYOUT_INSTRUCTION}
4. STICKY CTA MOBILE: ${STICKY_CONDITIONAL}
5. SCARCITY LOGIC: Gunakan tipe kelangkaan "${SCARCITY_TYPE}". Jika Real Timer, buatkan placeholder script JS countdown sederhana. Jika Quantity, tuliskan teks "Sisa Slot: X".
6. Skimming-friendly: Gunakan heading yang jelas dan bullet points.
7. Anti Overclaim: Jangan gunakan kata "pasti", "jamin", "100%", atau klaim medis/finansial yang tidak realistis agar aman dari banned iklan.
8. Penyesuaian Awareness: Tulis copywriting dengan level awareness "${FORM.awareness}".
9. Tone: Gunakan gaya bahasa "${FORM.tone}".
10. GAMBAR & ICON: Gunakan placeholder dari 'https://placehold.co/600x400' untuk gambar, dan SVG inline (Lucide/Heroicons) untuk icon.
11. STYLING TOMBOL & LINK: DILARANG KERAS menggunakan garis bawah pada teks tombol (wajib berikan text-decoration: none !important). Warna teks di dalam tombol WAJIB menyesuaikan agar kontras tinggi (wajib berikan color: #... !important sesuai dengan background warna yang di generate).
12. TARGET TOMBOL CTA: ${CTA_TARGET_INSTRUCTION}

PROFIL PRODUK & MARKET:
- Nama Produk: ${FORM.product_name}
- Kategori: ${CATEGORY_RESOLVED}
- Deskripsi & Spesifikasi Produk: ${FORM.description}
- Target Market: ${TARGET_RESOLVED}
- Tujuan Utama: ${FORM.goal}
- Framework Utama: ${FORM.framework}

PSIKOLOGI AUDIENS (INPUT PENTING):
- Pain Points (Ketakutan Utama): ${PAIN_POINTS_RESOLVED}
- Objection Handling (Alasan Ragu): ${OBJECTIONS_RESOLVED} (Gunakan ini untuk section FAQ atau Reassurance).

PENAWARAN (OFFER STACK):
- Harga Normal: ${FORM.price_normal}
- Harga Promo: ${FORM.price_promo || "Tidak ada promo"}
- Bonus / Value Stack: ${BONUS_RESOLVED} (Jika ada, buatkan tabel/list "Total Value" vs "Harga Hari Ini").
- CTA Utama (Tulisan): "${CTA_RESOLVED}"

STRUKTUR HALAMAN (PLATFORM: ${PLATFORM}):
1. HERO SECTION: Hook maut yang relevan dengan ${PAIN_POINTS_RESOLVED}.
2. BODY CONTENT: Mengikuti alur framework ${FORM.framework}.
3. OBJECTION HANDLING BLOCK: Jawab keraguan "${OBJECTIONS_RESOLVED}" secara elegan.
4. ADDITIONAL SECTIONS: ${SECTIONS_LIST}
5. TRUST ELEMENTS: Masukkan Social Proof dan Reassurance.
6. CONVERSION BLOCK: Kontras harga, bonus stack, dan urgensi (${SCARCITY_TYPE}).
7. HIDDEN CTA: Pastikan ada micro-copy trust di bawah tombol.
${SECTIONS_EXTRA_BLOCK}

OUTPUT: Generate kode HTML utuh (single file) dengan Tailwind CSS, visual premium sesuai gaya "${FORM.design_style}" dengan nuansa warna dominan "${BRAND_COLOR_RESOLVED}", dan copywriting yang sangat persuasif namun aman secara regulasi.
```

---

## 3. VARIABLE REFERENCE TABLE

| Variable di Template | Source Form Field | Tipe | Fallback |
|---|---|---|---|
| `LAYOUT_INSTRUCTION` (da) | Platform Target (radio) | Conditional | Scalev/Berdu/Lynk.id = single col, else = responsif adaptif |
| `TEMA_VISUAL_STRING` (dn) | Warna Brand + Tema BG | Computed | Static CSS override instruction |
| `HERO_TYPE_VALUE` (hn) | Hero Section Type (select) | Direct | - |
| `HERO_LAYOUT_INSTRUCTION` (Hi) | Hero Section Type (select) | Conditional | VSL vs Standard vs Typo |
| `STICKY_CONDITIONAL` | Sticky Button (checkbox) | Conditional | false = "Tidak perlu" |
| `SCARCITY_TYPE` (Bi) | Tipe Scarcity (select) | Direct | - |
| `FORM.awareness` | Level Awareness (select) | Direct | - |
| `FORM.tone` | Gaya Bahasa (select) | Direct | - |
| `CTA_TARGET_INSTRUCTION` (Hn) | Aksi Tombol CTA (select) + value | Conditional | scroll/url/wa |
| `FORM.product_name` | Nama Produk (text) | Direct | - |
| `CATEGORY_RESOLVED` (J) | Tipe Produk (select/custom) | Computed | dropdown or custom text |
| `FORM.description` | Deskripsi (textarea) | Direct | - |
| `TARGET_RESOLVED` (Ee) | Target Audience (select/custom) | Computed | dropdown or custom text |
| `FORM.goal` | Tujuan Utama (select) | Direct | - |
| `FORM.framework` | Pilih Framework (select) | Direct | Appears 2x in template |
| `PAIN_POINTS_RESOLVED` (ha) | Pain Points (textarea) | Fallback | "Tidak dispesifikan, harap riset mandiri." |
| `OBJECTIONS_RESOLVED` (me) | Keberatan (textarea) | Fallback | "Umum (Harga/Kualitas)." |
| `FORM.price_normal` | Harga Normal (text) | Direct | - |
| `FORM.price_promo` | Harga Promo (text) | Fallback | "Tidak ada promo" |
| `BONUS_RESOLVED` (Pr) | has_bonus (check) + detail (text) | Conditional | "Tidak ada bonus tambahan." |
| `CTA_RESOLVED` (Ue) | CTA (select/custom) | Computed | dropdown or custom text |
| `PLATFORM` (At) | Platform Target (radio) | Direct | - |
| `SECTIONS_LIST` (ra) | Section checkboxes (11 options) | Join | "Standar" if none checked |
| `SECTIONS_EXTRA_BLOCK` (vt) | Section checkboxes | Conditional | "" if none, else WAJIB block |
| `FORM.design_style` | Gaya Desain (select) | Direct | - |
| `BRAND_COLOR_RESOLVED` (pt) | Warna Brand (select/custom) | Computed | dropdown or custom hex |

---

## 4. FORM STATE DEFAULT VALUES

```javascript
{
  framework: "AIDCA (Attention-Interest-Desire-Conviction-Action)",
  tone: "Friendly & Conversational (Santai tapi sopan)",
  category_base: "Digital (Ebook / Template)",
  category_custom: "",
  goal: "Lead Generation (Kumpulin No. WA / Email)",
  awareness: "Unaware",
  target_base: "Advertiser (FB Ads / TikTok Ads User)",
  target_custom: "",
  pain_points: "",
  product_name: "",
  price_normal: "",
  price_promo: "",
  description: "",
  objections: "",
  has_bonus: false,
  bonus_details: "",
  cta_base: "Beli Sekarang",
  cta_custom: "",
  scarcity_type: "None",
  cta_target_type: "scroll",
  cta_target_value: "",
  brand_color: "Neutral (White/Black/Gray)",
  color_custom: "",
  theme_override: "Default",
  design_style: "Apple Style",
  hero_type: "Standard Image",
  sticky_mobile: false,
  sections: [],
  platform: "Scalev"
}
```

---

## 5. AVAILABLE OPTIONS (All Dropdowns)

### Framework (17 options)
AIDCA, PAS, BAB, 4P, SLAP, StoryBrand, ABT, Hero's Journey, Hook-Story-Offer, QUEST, JTBD, Awareness Ladder, FAB, PASTOR, Problem-Promise-Proof, Useful-Urgent-Unique, The 3 Reason Why

### Tone (14 options)
Friendly & Conversational, Professional & Formal, Witty & Humorous, Bold & Disruptive, Empathetic, Storytelling, Inspirational, Exciting & Energetic, Direct & No-Nonsense, Scientific & Data-Driven, Trustworthy, Urgent & Aggressive, Luxury & Exclusive, Minimalist & Zen

### Design Style (30 options)
Apple, Stripe/Linear, Airbnb, Notion, Nike/Adidas, Tesla, Clean & Minimalist, Modern SaaS, Bold & High Conversion, Elegant & Premium, Trust & Authority, Dark Mode, Futuristic Cyberpunk, AI/SaaS Modern, Holographic & Glass, Abstract Gradient, Bento Grid, Neobrutalism, Glassmorphism, Medical/Health, Real Estate, Wedding/Event, Finance/Bank, Gamer/Neon, Organic & Natural, Corporate, Playful & Fun, Typography-Driven, Retro/Vintage, Visual Storytelling

### Platform (8 options)
Scalev, Berdu, Lynk.id, WordPress (Elementor/Divi), Shopify, Buat.id, Order Hero, Mayar

#### Platform Layout Mapping:
| Platform | Layout Instruction |
|---|---|
| Scalev | SATU KOLOM TUNGGAL (Single Column) |
| Berdu | SATU KOLOM TUNGGAL (Single Column) |
| Lynk.id | SATU KOLOM TUNGGAL (Single Column) |
| WordPress (Elementor/Divi) | RESPONSIF penuh, layout adaptif |
| Shopify | RESPONSIF penuh, layout adaptif |
| Buat.id | RESPONSIF penuh, layout adaptif |
| Order Hero | RESPONSIF penuh, layout adaptif |
| Mayar | RESPONSIF penuh, layout adaptif |

### Section Checkboxes (11 options)
Social Proof, Testimonial, FAQ, Bonus, Guarantee, Scarcity, Comparison, Pricing Table, Timeline, Team, Sales Notif

---

## 6. VARIABLE REUSE MAP

Beberapa variabel muncul lebih dari 1x di template:

| Variable | Jumlah | Posisi di Template |
|---|---|---|
| `ha` (pain_points) | 2x | PSIKOLOGI AUDIENS + HERO SECTION hook |
| `me` (objections) | 2x | PSIKOLOGI AUDIENS + OBJECTION HANDLING BLOCK |
| `u.framework` | 2x | PROFIL PRODUK + BODY CONTENT struktur |
| `Bi` (scarcity) | 2x | ATURAN rule 5 + CONVERSION BLOCK |

---

## 7. CROSS-CHECK NOTES

Koreksi dari audit 3 agent paralel + network verification (5 April 2026):

1. **Platform -> Layout**: Bukan cuma Lynk.id yang single column. **Scalev dan Berdu juga**. Total 3 platform single column, 5 platform responsif.
2. **vt block**: Section names di-`.toUpperCase()` dan ada tambahan warning "JANGAN SAMPAI ADA YANG TERLEWAT ATAU DIABAIKAN!"
3. **Architecture (KOREKSI BESAR)**: ~~Ada 3 POST fetch calls ke backend~~ **SALAH.** Network monitor membuktikan 0 requests saat generate. Fetch calls di source milik **Supabase SDK** (auth only) dan **Cloudflare analytics**, bukan untuk prompt generation. Tool ini **100% frontend**.
4. **chat.z.ai**: Bukan backend, tapi **external AI chat service** yang dibuka di tab baru via `window.open()`. Prompt dikirim sebagai URL query parameter.
5. **Supabase**: Hanya dipakai untuk authentication (signIn/signOut). Tidak ada database query atau storage.
6. **Single template**: Hanya ada 1 prompt template di seluruh ~474KB source. Mode "Live HTML Editor" di sidebar tidak punya template sendiri.
7. **Total expressions**: 30 ${} expressions di template.
