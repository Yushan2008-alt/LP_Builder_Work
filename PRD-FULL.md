# PRD: LP Block Builder Engine

> **AI-Powered Landing Page Generator with Visual Section Planning & Product Knowledge Database**

| Field | Detail |
|---|---|
| Document Version | 2.1 |
| Date | 6 April 2026 |
| Author | Gandhi Surya |
| Status | Draft - For Review |
| Target Launch | Q3 2026 (MVP) |
| Competitive Reference | SesuaiFormat Engine (landingpage.sesuaiformat.id/generator) |
| Changelog | v2.1 - Unified Formula Gallery (20 formulas + Custom), Brand Guidelines popup system, DB schema update. v2.0 - Major rewrite based on updated architecture flow |

---

## 1. Executive Summary

### 1.1 Problem Statement

Saat ini, tools LP generator di pasar Indonesia (seperti SesuaiFormat Engine) menggunakan pendekatan monolitik: satu form panjang menghasilkan satu prompt besar yang di-copy ke AI external. Ada beberapa masalah fundamental:

- User tidak bisa memvisualisasikan struktur LP sebelum generate
- Tidak ada kontrol per section (hanya on/off checkbox)
- Tidak bisa iterate tanpa regenerate seluruh halaman
- Info produk harus diisi ulang setiap kali bikin LP baru
- Framework copywriting yang dipilih tidak berdampak pada struktur prompt
- Tidak ada penyimpanan project (refresh = hilang)

### 1.2 Proposed Solution

LP Block Builder Engine adalah platform 3-in-1:

1. **Product Knowledge Database** - Kelola data produk & brand secara terpusat, reusable across projects
2. **LP Generator** - Visual block-based section planner dengan unified Formula Gallery (20 formulas + Custom builder)
3. **Live HTML Editor** - Edit output HTML langsung di platform

User bisa menyusun blueprint LP section per section menggunakan visual blocks dengan skeleton preview, lalu generate prompt yang section-aware dan terstruktur. Data produk cukup diinput sekali dan bisa dipakai berulang di banyak LP project.

### 1.3 Key Differentiators vs SesuaiFormat

| Feature | SesuaiFormat | LP Block Builder (Ours) |
|---|---|---|
| Product Data | Diisi per generate, hilang setelah refresh | Product Knowledge Database (persistent, reusable) |
| Multi-Brand | Tidak ada | Max 3 brands, 10 products (expandable via upgrade) |
| Brand Guidelines | Tidak ada | Font, color palette, button style, design vibe presets + custom (auto-applied ke semua LP) |
| Section Planning | 11 checkbox tanpa preview | Visual block gallery + drag to reorder + skeleton preview |
| Prompt Structure | 1 monolithic prompt (30 expressions) | Per-section modular prompt templates |
| Formula Gallery | 1 dropdown, 0 structural impact | 20 formulas + Custom dalam visual gallery, auto-generate section plan |
| Layout vs Section Type | Layout tied to section type | Layout DECOUPLED - any format bisa dipasang ke section apapun |
| Section Customization | Tidak ada (on/off saja) | Judul, Goals, Format/Layout, Style LP (Default/Custom), Additional Context per section |
| Visual Preview | Tidak ada | Skeleton wireframe preview per layout format |
| Save/Load | Tidak ada (refresh = hilang) | Manual save, max 4 projects, unsaved warning on close |
| HTML Editing | Terpisah (Live HTML Editor page) | Integrated dalam 1 platform |
| Platform Awareness | 3 platform single-col, 5 responsif | Deep per-platform optimization |

---

## 2. User Personas

### 2.1 Primary: Advertiser / Performance Marketer

- Butuh LP cepat untuk campaign iklan (Meta/Google Ads)
- Paham copywriting framework tapi tidak bisa coding
- Biasa pakai Scalev, Berdu, Lynk.id sebagai platform deploy
- Handle beberapa produk sekaligus, butuh product database
- Pain: Generate LP yang bagus tapi tidak bisa kontrol per section

### 2.2 Secondary: Business Owner / UMKM

- Tidak paham framework copywriting, butuh guided experience
- Mau yang cepat dan langsung jadi, prefer Default/Formula mode
- Budget terbatas, tidak mau hire designer/copywriter
- Biasanya punya 1-3 produk yang perlu LP

### 2.3 Tertiary: Agency / Freelancer

- Handle multiple clients dengan brand dan produk berbeda
- Butuh save/load project dan product database terpisah per brand
- Perlu customization tinggi per section untuk setiap client
- Value: efisiensi waktu dan konsistensi output

---

## 3. Platform Architecture

### 3.1 Application Structure

Setelah login, user masuk ke sidebar-based layout dengan 3 modul utama:

```
Sidebar
├── Product Knowledge Database
│   └── Brand Management
│       ├── Brand Guidelines (font, color, button, vibe)
│       └── CRUD Products (descriptions, harga)
├── LP Generator
│   ├── Create New LP → Formula Gallery (20 formulas + Custom)
│   └── Open Saved Project (max 4)
└── Live HTML Editor
```

### 3.2 Module Relationships

- **Product Knowledge Database** berdiri sendiri. Data produk di-define di sini terlebih dahulu.
- **LP Generator** membaca data dari Product Knowledge Database. Saat bikin LP, user pilih produk mana yang mau dipakai.
- **Live HTML Editor** menerima output dari LP Generator untuk diedit langsung.

---

## 4. Core Features

### 4.1 Feature 1: Product Knowledge Database

Modul terpisah di sidebar untuk mengelola semua data produk dan brand. Data ini menjadi sumber utama yang di-reference oleh LP Generator.

#### Kenapa Terpisah?

- Sekali input, pakai berkali-kali di banyak LP project
- Konsistensi data produk antar LP
- Agency bisa manage multiple clients dari satu tempat
- Perubahan harga/deskripsi cukup update di satu tempat

#### CRUD Operations

| Operation | Detail |
|---|---|
| Create | Tambah produk baru dengan deskripsi dan harga |
| Read | Lihat semua produk, filter by brand |
| Update | Edit deskripsi, harga, brand assignment |
| Delete | Hapus produk (dengan konfirmasi) |

#### Product Fields

| Field | Type | Required | Description |
|---|---|---|---|
| product_name | VARCHAR(255) | Yes | Nama produk |
| brand_name | VARCHAR(100) | Yes | Nama brand (untuk grouping) |
| brand_id | UUID (FK) | Yes | Reference ke brands table (brand guidelines otomatis ter-apply) |
| description | TEXT | Yes | Deskripsi lengkap produk |
| price_normal | VARCHAR(50) | Yes | Harga normal |
| price_promo | VARCHAR(50) | No | Harga promo (opsional) |
| target_audience | TEXT | No | Deskripsi target market |
| pain_points | TEXT | No | Pain points utama audiens |
| objections | TEXT | No | Keberatan umum calon pembeli |
| usp | TEXT | No | Unique selling proposition |
| created_at | TIMESTAMP | Auto | Waktu dibuat |
| updated_at | TIMESTAMP | Auto | Waktu terakhir diedit |

#### Brand Guidelines Popup (Style Preset System)

Saat user create brand baru (atau edit brand yang sudah ada), muncul popup/modal **"Brand Guidelines"** yang memungkinkan user set visual style brand mereka. Ini bukan full brand identity builder -- ini minimal tapi impactful. Hasilnya tersimpan di level brand dan otomatis di-inherit oleh setiap LP yang menggunakan brand tersebut.

**Kenapa Popup?** Supaya tidak menambah friction di flow utama. User bisa skip dengan pilih "Use Defaults" dan set nanti. Tapi kalau diisi, semua LP dari brand itu langsung konsisten tanpa perlu atur style manual per section.

##### Style Preset Options

| Setting | Preset Options | Custom Option |
|---|---|---|
| **Font Style** | Modern Sans / Bold Impact / Elegant Serif / Playful Rounded / Monospace Tech | User ketik nama font sendiri (Google Fonts) |
| **Primary Color** | 8 curated palettes (masing-masing palette punya primary + accent + neutral) ATAU color picker manual | Hex code input manual |
| **Button Style** | Rounded / Sharp Corner / Pill / Outline (Ghost) | - (pilih dari preset saja) |
| **Design Vibe** | Minimalist / Corporate / Energetic / Premium / Playful / Dark Mode | User tulis deskripsi vibe sendiri via text |

##### Preset Detail: Font Style

| Preset | Font Family (Prompt Instruction) | Cocok Untuk |
|---|---|---|
| Modern Sans | Inter, Plus Jakarta Sans, atau DM Sans | SaaS, tech, startup, clean professional |
| Bold Impact | Montserrat Bold, Poppins Black, atau Bebas Neue | Fitness, coaching, high-energy offers |
| Elegant Serif | Playfair Display, Lora, atau Cormorant | Premium brands, fashion, luxury, beauty |
| Playful Rounded | Nunito, Quicksand, atau Comfortaa | Kids, casual brands, friendly products |
| Monospace Tech | JetBrains Mono, Fira Code, atau Space Mono | Developer tools, tech products, hacker vibe |

##### Preset Detail: Color Palettes

| Palette | Primary | Accent | Neutral | Cocok Untuk |
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

- **First-time brand creation:** Popup muncul otomatis setelah user isi nama brand. User bisa "Use Defaults" (skip) atau set style.
- **Edit existing brand:** User bisa buka popup lagi dari brand settings di Product Knowledge Database.
- **Default values:** Jika user skip, sistem pakai: Modern Sans + Ocean Blue + Rounded + Minimalist.
- **Impact on prompt:** Brand guidelines masuk ke **Global Context layer** di Prompt Engine. AI receive instruction seperti: "Use Inter/DM Sans font family. Primary color: #2563EB, accent: #60A5FA. Button style: rounded corners. Design vibe: minimalist and clean."
- **Override per section:** Jika user set Style LP = Custom di section editor (Feature 4.3), custom style override brand guidelines untuk section itu saja.

#### Limits & Upgrade Path

| Resource | Free Tier | Upgrade |
|---|---|---|
| Brands | Max 3 | TBD (bayar per tambahan atau unlimited) |
| Products | Max 10 | TBD |
| Custom fields | Tidak ada | TBD |

---

### 4.2 Feature 2: LP Generator - Unified Formula Gallery

LP Generator adalah modul utama. Saat user klik "Create New LP", mereka langsung masuk ke **Formula Gallery** -- satu view gallery berisi 20 formula cards + 1 Custom card.

Konsep ini mirip dengan gallery di SaaS lain (Canva punya "Blank" di gallery template-nya, Notion punya "Empty Page" di antara template cards). Custom bukan mode terpisah, tapi item di dalam gallery yang sama. Ini menghilangkan decision fatigue "pilih mode apa ya?" dan menyatukan UX jadi satu alur.

#### Gallery Card Anatomy

Setiap card di gallery menampilkan:
- **Nama formula** (bold, prominent)
- **1-liner description** (apa formula ini)
- **Best case tag** (kapan pake ini, max 8 kata)
- **Section count badge** (misal: "5 sections", "7 sections")
- **Tier badge** (Foundational / Comprehensive / Modern / Specialized)

Card "Custom" punya visual distinct: blank canvas icon, label "Start from scratch", no section count.

#### Complete Formula Gallery (20 Formulas + Custom)

##### Tier 1: Foundational (5 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 1 | **AIDA** | 4 | Hero (Attention) > Interest > Desire > CTA (Action) | Grab attention with bold hook > Engage with fresh info > Show life improvement > Clear next step | Product launches, awareness campaigns, considered purchases |
| 2 | **PAS** | 4 | Hero > Pain Deep-Dive > Agitation > Solution + CTA | Identify specific problem > Amplify pain, make urgent > Present product as relief + close | Pain-driven products (health, finance, productivity), ads, short LP |
| 3 | **BAB** | 4 | Hero (Before) > After > Bridge > CTA | Describe current struggle > Paint ideal future > Introduce product as the link > Drive action | Cold emails, aspirational/transformation products, coaching, health/fitness |
| 4 | **FAB** | 3 | Features > Advantages > Benefits | State what product IS/HAS > Explain what features DO > Tell what's in it for THEM | Product pages, feature sections, SaaS breakdown, ecommerce, B2B comparison |
| 5 | **1-2-3-4 Formula** | 4 | What I've Got > What It Does For You > Who Am I > What To Do Next | State offering clearly > Explain benefits in "you" language > Build trust with credentials > Clear CTA with urgency | Lead-gen pages, email campaigns, beginners, quality-control checklist |

##### Tier 2: Comprehensive Sales Frameworks (5 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 6 | **PASTOR** | 6 | Hero (Problem) > Amplify > Story > Transformation > Offer > Response | Call out specific pain > Amplify consequences of NOT solving > Tell relatable story > Show before/after + testimonials > Present deliverables > Clear CTA with urgency | High-ticket ($500+), info products, coaching, courses, personality brands |
| 7 | **AIDCA** | 5 | Hero (Attention) > Interest > Desire > Conviction > CTA (Action) | Hook with compelling headline > Engage with counter-intuitive info > Appeal to emotions > Prove claims are TRUE and SAFE > Compelling CTA | Skeptical audiences, new/unknown brands, paid traffic, high-ticket items |
| 8 | **QUEST** | 5 | Qualify > Understand > Educate > Stimulate > Transition | Filter ideal readers with targeted language > Show deep empathy > Introduce solution + build credibility > Create intense desire + loss aversion > Convert with offer + guarantee | Long-form sales, courses, coaching, membership, audience filtering needed |
| 9 | **4Ps (PPPP)** | 4 | Promise > Picture > Proof > Push | Bold compelling claim > Vivid mental image of life after > Testimonials + case studies + stats > CTA tying everything together | Emotionally-driven B2C, product-aware prospects, conversion-focused pages |
| 10 | **ACCA** | 4 | Awareness > Comprehension > Conviction > Action | Bring problem to attention > Explain HOW it affects them > Build certainty through evidence > Clear CTA | Complex/innovative products, nonprofits, B2B, unaware audiences, education-first |

##### Tier 3: Modern Guru Frameworks (4 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 11 | **StoryBrand (SB7)** | 7 | Hero (Character) > Problem > Guide > Plan > CTA > Failure > Success | Customer wants something > 3-layer problem (external/internal/philosophical) > Show empathy + authority > Simple 3-step plan > Direct + transitional CTA > Consequences of not acting > Vivid promised land | Service businesses, coaches, consultants, B2B, unclear messaging |
| 12 | **Hook-Story-Offer** | 4 | Hero (Hook) > Story > Offer Stack > CTA | Interrupt + intrigue + target > Emotional story guiding to product > Compelling price/value stack + bonuses + guarantee > Final push | Digital products, courses, SaaS, ecommerce, funnel optimization |
| 13 | **Star-Story-Solution** | 3 | Star (Character Intro) > Story (Challenge) > Solution | Introduce relatable main character > Their challenges, pain, aspirations > Product is what helped them succeed | Lead-gen pages, personality brands, info products, coaching |
| 14 | **Epiphany Bridge** | 8 | Backstory > Desires > The Wall > The Epiphany > The Plan > The Conflict > The Achievement > The Transformation | Where you were before > What you wanted > What stopped you > The insight that shifted everything > What you did next > The path wasn't easy > Results achieved > Who you became | Personal brands, course creators, selling transformation, story-driven LP |

##### Tier 4: Specialized Formulas (6 formulas)

| # | Formula | Sections | Section Flow | Default Goals | Best Case |
|---|---|---|---|---|---|
| 15 | **AICPBSAWN** | 9 | Attention > Interest > Credibility > Proof > Benefits > Scarcity > Action > Warn > Now | Compelling hook > Sustain curiosity > Establish expertise > Third-party validation > Clear benefits > Limited time/quantity > Explicit CTA > Consequences of inaction > Final urgency | Long-form cold traffic, high-ticket, comprehensive pages, leave nothing out |
| 16 | **IDCA** | 4 | Interest > Desire > Conviction > Action | Engage immediately (attention already captured by ad) > Appeal to emotions > Provide proof + risk reversal > Clear CTA | Post-ad landing pages, retargeting, email click-throughs, paid traffic |
| 17 | **SLAP** | 4 | Stop > Look > Act > Purchase | Interrupt the scroll > Sustain attention for crucial seconds > Prompt immediate action > Complete the sale | Low-cost impulse buys, flash sales, daily deals, Groupon-style offers |
| 18 | **6+1 Formula** | 6 | Context > Attention > Desire > The Gap > Solution > CTA (+1: Credibility throughout) | Why are they seeing this? > Hook them > Build want > Consequences of inaction > Present solution > Drive action | Cold traffic, new brands, trust-first selling, loss aversion driven |
| 19 | **Crossroads** | 4 | The Old Way > The New Way > Contrast Outcomes > CTA | Paint the painful status quo > Introduce your solution as new path > Show diverging outcomes side by side > Make the choice obvious | SaaS pages, B2B, comparison/upgrade offers, competitor positioning |
| 20 | **String of Pearls** | 5 | Hook > Pearl 1 (Story/Proof) > Pearl 2 (Story/Proof) > Pearl 3 (Story/Proof) > CTA | Set the stage > First compelling evidence/story > Second compelling evidence/story > Third compelling evidence/story > Overwhelming evidence drives action | Testimonial-heavy pages, bullet-heavy sales pages, social proof stacking |

##### Custom (Blank Canvas)

| # | Card | Sections | Description | Best Case |
|---|---|---|---|---|
| 21 | **Custom** | 0 (start empty) | Canvas kosong. User manually add sections satu per satu. Tidak ada pre-populated sections atau default goals. | Experienced copywriters, unique/hybrid structures, niche use cases |

#### Gallery Flow

**Step 1:** User klik "Create New LP" di sidebar.

**Step 2:** Formula Gallery muncul (grid view). 21 cards ditampilkan dengan tier grouping. Search bar di atas untuk filter. Card "Custom" ditampilkan di akhir gallery dengan visual distinct (blank canvas style).

**Step 3a (Formula):** User klik formula card. Sistem auto-generate section plan sesuai tabel di atas. Semua sections sudah punya default judul dan goals.

**Step 3b (Custom):** User klik "Custom" card. Canvas kosong. User manually add sections via "+ Add Section".

**Step 4:** Dari sini, flow sama: user bisa edit, reorder, tambah, hapus sections sebelum generate.

#### Open Saved Project

User juga bisa klik "Open Saved Project" di sidebar untuk buka salah satu dari max 4 saved projects dan continue editing.

---

### 4.3 Feature 3: Section Editor

Setelah sections ter-create (via Formula atau Custom), user bisa edit masing-masing section. Setiap section punya fields berikut:

#### Per-Section Fields

| Field | Type | Required | Description |
|---|---|---|---|
| Judul Section | Text input | Yes | Label custom section (misal: "Kenapa Harus Sekarang?") |
| Goals Section | Text input | Yes | Tujuan section ini (misal: "Bikin audiens sadar masalahnya") |
| Format/Layout | Select from gallery | Yes | Pilih layout visual (decoupled dari tipe section, lihat 4.4) |
| Product | Select from DB | Yes | Pilih produk mana yang direferensikan di section ini |
| Style LP | Toggle | Yes | Default (AI tentukan) ATAU Custom (user tulis deskripsi style) |
| Additional Context | Textarea | No | Brief khusus untuk AI, instruksi tambahan |

#### Penting: Product & Brand di-reference, bukan diisi ulang

Saat user pilih produk di section editor, data (deskripsi, harga, pain points, dll.) ditarik otomatis dari Product Knowledge Database. User tidak perlu isi ulang.

#### Penting: Style LP punya 2 sub-mode

- **Default**: AI menentukan style berdasarkan format/layout yang dipilih + design style global. User tidak perlu input apa-apa.
- **Custom**: User bisa tulis deskripsi style sendiri via text (misal: "Warna gelap, typography besar, minimalis"). Ini override default style instruction di prompt.

---

### 4.4 Feature 4: Format/Layout Gallery (Decoupled)

Ini perbedaan fundamental dari PRD v1. Layout formats **tidak tied ke section type**. User bisa pasang layout apapun ke section apapun.

#### Available Layout Formats

| Format | Skeleton Preview Description |
|---|---|
| Standard Image | Split layout - image satu sisi, text sisi lain |
| VSL (Video) | Video embed besar di tengah, headline di atas, CTA di bawah |
| Typographic | Text-only, typography besar sebagai visual utama |
| Split Screen | 50/50 split dengan konten berbeda di tiap sisi |
| Story-Based | Narrative flow, paragraf panjang dengan visual pendukung |
| Stat Counter | Angka-angka besar dengan label, grid layout |
| Before-After | Side-by-side atau top-bottom comparison |
| Feature Grid | Grid cards dengan icon + title + description |
| Icon List | Vertical list dengan icon di kiri, text di kanan |
| Bento Layout | Asymmetric grid cards (bento box style) |
| Quote Cards | Card-based layout dengan quote marks, nama, foto |
| Video Testimonial | Video embed(s) dengan caption |
| Screenshot Chat | Chat bubble/screenshot style testimonials |
| Single Offer | Satu box besar dengan harga, benefit list, CTA |
| Comparison Table | Tabel perbandingan multi-kolom |
| Tier Cards | Side-by-side pricing cards (Basic/Pro/Premium style) |
| Moving Marquee | Horizontal scrolling content strip |
| Promo Coret | Harga coret (strikethrough) dengan harga baru |
| Accordion | Expandable Q&A sections |
| Timeline | Chronological steps/milestones |
| Logo Bar | Horizontal row of logos/badges |
| Card Grid | Equal-size cards in responsive grid |

#### Gallery UI: Skeleton Preview Popup

Saat user memilih format, muncul popup/modal yang menampilkan:
- Bukan cuma judul format, tapi **skeleton wireframe** (bentuk kotak-kotak abu-abu yang merepresentasikan layout)
- User bisa langsung kebayang "oh section aku nanti bentuknya kayak gini"
- Skeleton bisa dibuat pakai pure CSS/SVG (low maintenance, no image assets needed)

---

### 4.5 Feature 5: Section-Aware Prompt Engine

#### Prompt Architecture

Prompt dibangun dari 4 layer:

| Layer | Isi | Scope |
|---|---|---|
| Global Context | Persona AI, aturan umum (anti-overclaim, skimming-friendly, ad compliance), platform constraints, brand color, design style | Ditulis 1x di awal prompt |
| Product Brief | Ditarik otomatis dari Product Knowledge Database: nama, deskripsi, harga, target, pain points, objections, USP | Ditulis 1x setelah global context |
| Section Blocks | Per section: judul + goals + format/layout instruction + style instruction + additional context | Diulang per section |
| Output Instruction | Format output (HTML/Copy), responsive rules, Tailwind CSS instruction | Ditulis 1x di akhir |

#### Contoh Section Block di Prompt:

```
--- SECTION 2: "Masalah yang Kamu Rasakan" ---
Goals: Bikin audiens sadar dan relate dengan masalahnya
Format: Before-After (side-by-side comparison layout)
Style: Default (ikuti global design style)
Framework Position: Ini adalah bagian "Problem" dari framework AIDCA
Product Reference: [auto-pulled dari Product Knowledge DB]
Additional Context: Fokus ke pain point "takut boncos iklan"
--- END SECTION 2 ---
```

#### Perbedaan Kunci dari SesuaiFormat:

| Aspect | SesuaiFormat | Ours |
|---|---|---|
| Template | 1 monolithic string, semua variable di-inject flat | Modular per section, setiap section punya instruksi sendiri |
| Framework | Cuma masuk sebagai teks "Mengikuti alur framework AIDCA" | Framework menentukan section structure + setiap section tahu posisinya di framework |
| Product Data | Hardcoded di prompt saat generate | Referenced dari database, konsisten antar sections |
| Layout | 1 hero type instruction untuk seluruh LP | Per-section layout instruction, bisa beda-beda per section |

#### Template Count Estimate:

- 1x Global Context template
- 1x Product Brief template (auto-populated dari DB)
- 1x Brand Guidelines sub-template (populated from brands table)
- ~22x Format/Layout templates (lihat tabel 4.4)
- 2x Output Instruction templates (HTML + Copy)
- 20x Formula Mapping configs (default section arrangements + default goals per gallery formula)
- Total: ~47 template files

---

### 4.6 Feature 6: Project Management

#### Save Behavior: Manual Save

- Tidak ada auto-save. User klik tombol "Save" secara manual.
- Kalau user mau close tab dan ada perubahan yang belum di-save, tampilkan warning: "Kamu punya perubahan yang belum disimpan. Yakin mau keluar?"
- Alasan: User punya kontrol penuh, tidak takut perubahan tidak sengaja ke-save, lebih ringan di database.

#### Project Limits

| Resource | Limit | Upgrade |
|---|---|---|
| Saved Projects | Max 4 per akun | TBD (bayar per tambahan atau unlimited) |
| Sections per Project | No limit (tapi recommended max 15 untuk performa prompt) | - |

#### Project Operations

| Operation | Detail |
|---|---|
| Create New | Pilih dari Formula Gallery (20 formulas + Custom) lalu mulai |
| Open Saved | List max 4 projects, klik untuk buka |
| Save | Manual save, overwrite existing |
| Delete | Hapus project (dengan konfirmasi) |
| Duplicate | Copy project untuk buat variasi (counts toward 4 limit) |

---

### 4.7 Feature 7: Live HTML Editor

Modul terpisah di sidebar. Bisa diakses independently atau sebagai lanjutan dari LP Generator.

#### Fungsi Utama:

- Code editor untuk HTML (menggunakan Monaco Editor atau CodeMirror)
- Live preview di iframe (split panel: code kiri, preview kanan)
- User bisa paste output dari LP Generator dan edit langsung
- Syntax highlighting + basic auto-complete

#### Kenapa Terpisah dari LP Generator:

- Tidak semua user butuh edit HTML (UMKM biasanya langsung copy-paste)
- Menjaga LP Generator tetap simple dan tidak overwhelming
- Bisa dipakai untuk edit HTML dari sumber manapun, bukan cuma output LP Generator
- SesuaiFormat juga punya ini sebagai page terpisah

---

### 4.8 Feature 8: Copy-First Mode

Toggle switch di LP Generator antara 2 output mode:

- **HTML Mode** (default) - Generate kode HTML utuh dengan Tailwind CSS, siap deploy ke platform
- **Copy Mode** - Generate copywriting teks saja (tanpa markup), siap pakai di Canva, Figma, Google Docs, atau platform lain

Implementasi: Global Context dan Section templates tetap sama, hanya Output Instruction template yang berubah.

---

## 5. User Flows

### 5.1 First-Time User (Onboarding)

1. User register/login (Supabase Auth)
2. User diarahkan ke **Product Knowledge Database** untuk setup brand pertama
3. **Brand Guidelines popup** muncul otomatis: user pilih font style, color palette, button style, design vibe (atau "Use Defaults" untuk skip)
4. User tambah produk pertama: nama produk, deskripsi, harga
5. User masuk ke **LP Generator**
6. Lanjut ke flow 5.2

### 5.2 Flow A: Create New LP (Unified Gallery)

1. User klik "Create New LP" di sidebar
2. **Formula Gallery** muncul: 20 formula cards + 1 Custom card, grouped by tier
3. User browse gallery (bisa search/filter). Setiap card menampilkan nama, deskripsi, best case, section count
4. **Jika user pilih formula card** (misal: AIDCA):
   - Sistem auto-generate section plan (5 sections untuk AIDCA)
   - Setiap section sudah punya default judul & goals
5. **Jika user pilih Custom card:**
   - Canvas kosong. User manually add sections via "+ Add Section"
6. User pilih produk dari Product Knowledge Database (brand guidelines otomatis ter-apply)
7. Per section, user bisa:
   - Edit judul section
   - Edit goals section
   - Pilih format/layout dari gallery (skeleton preview popup)
   - Set style (Default = ikuti brand guidelines, atau Custom = tulis deskripsi sendiri)
   - Tambah additional context (opsional)
8. User bisa: reorder (drag), tambah section baru, hapus section, duplicate section
9. User pilih output mode (HTML / Copy)
10. User klik "Generate"
11. Prompt ditampilkan di output panel
12. User bisa: Copy to clipboard, atau Save project

### 5.3 Flow B: Open Saved Project

1. User klik "Open Saved Project" di sidebar
2. List max 4 projects ditampilkan (dengan nama, formula, last edited)
3. User pilih project
4. Project terbuka dengan semua section dan settings intact
5. User bisa continue editing atau langsung generate

---

## 6. Technical Specification

### 6.1 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | React 18 (SPA) | Same as SesuaiFormat, proven for this use case |
| Bundler | Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS | Utility-first, consistent dengan output LP |
| State Management | React Context + useReducer | Sufficient for block/section state |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Lightweight (4KB gzip), accessible |
| Auth | Supabase Auth | Email + social login |
| Database | Supabase PostgreSQL | Products, projects, sections |
| Storage | Supabase Storage | Skeleton preview assets (jika pakai image) |
| Hosting | Cloudflare Pages | Edge deployment, fast globally |
| Sanitization | DOMPurify | Required untuk Live HTML Editor preview |
| Code Editor | Monaco Editor atau CodeMirror | Untuk Live HTML Editor module |

### 6.2 Database Schema

#### Table: brands

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Reference ke auth.users |
| name | VARCHAR(100) | Nama brand |
| font_style | VARCHAR(50) | Preset key atau "custom" (default: "modern_sans") |
| font_custom | VARCHAR(255) | Custom font name, nullable (hanya jika font_style = "custom") |
| color_palette | VARCHAR(50) | Preset key atau "custom" (default: "ocean_blue") |
| color_primary | VARCHAR(7) | Hex primary color (auto-filled dari preset, atau manual) |
| color_accent | VARCHAR(7) | Hex accent color (auto-filled dari preset, atau manual) |
| color_neutral | VARCHAR(7) | Hex neutral/background color (auto-filled dari preset, atau manual) |
| button_style | VARCHAR(20) | rounded / sharp / pill / outline (default: "rounded") |
| design_vibe | VARCHAR(50) | Preset key atau "custom" (default: "minimalist") |
| vibe_custom | TEXT | Custom vibe description, nullable (hanya jika design_vibe = "custom") |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

Constraint: Max 3 brands per user_id (enforced via application logic + DB trigger).

#### Table: products

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Reference ke auth.users |
| brand_id | UUID (FK) | Reference ke brands |
| name | VARCHAR(255) | Nama produk |
| description | TEXT | Deskripsi lengkap |
| price_normal | VARCHAR(50) | Harga normal |
| price_promo | VARCHAR(50) | Harga promo (nullable) |
| target_audience | TEXT | Target market (nullable) |
| pain_points | TEXT | Pain points audiens (nullable) |
| objections | TEXT | Keberatan umum (nullable) |
| usp | TEXT | Unique selling proposition (nullable) |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

Constraint: Max 10 products per user_id.

#### Table: projects

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | Reference ke auth.users |
| product_id | UUID (FK) | Reference ke products (produk yang dipakai LP ini) |
| name | VARCHAR(255) | Nama project |
| framework | VARCHAR(100) | Formula yang dipilih dari gallery (nullable jika custom) |
| mode | ENUM | formula \| custom (ditentukan oleh gallery card yang dipilih) |
| tone | VARCHAR(100) | Gaya bahasa |
| platform | VARCHAR(50) | Target platform deploy |
| output_mode | ENUM | html \| copy |
| global_settings | JSONB | Settings lain yang tidak di-normalize |
| is_dirty | BOOLEAN | Flag unsaved changes (default false) |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

Constraint: Max 4 projects per user_id.

#### Table: sections

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| project_id | UUID (FK) | Reference ke projects |
| order_index | INTEGER | Position di LP (0, 1, 2, ...) |
| section_title | VARCHAR(255) | Judul section (user-defined) |
| section_goals | TEXT | Goals/tujuan section |
| layout_format | VARCHAR(50) | Format layout yang dipilih (standard_image, vsl, bento, dll) |
| style_mode | ENUM | default \| custom |
| style_custom | TEXT | Custom style description (nullable, hanya jika style_mode = custom) |
| additional_context | TEXT | Brief tambahan untuk AI (nullable) |
| framework_position | VARCHAR(100) | Posisi di framework (nullable, auto-filled jika formula mode) |
| created_at | TIMESTAMP | Auto |

#### Table: user_limits

| Column | Type | Description |
|---|---|---|
| user_id | UUID (PK, FK) | Reference ke auth.users |
| max_brands | INTEGER | Default 3 |
| max_products | INTEGER | Default 10 |
| max_projects | INTEGER | Default 4 |
| tier | ENUM | free \| pro \| enterprise |
| created_at | TIMESTAMP | Auto |

### 6.3 Prompt Engine Architecture

```
┌─────────────────────────────────────────────┐
│           PROMPT OUTPUT (final string)       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ Layer 1: GLOBAL CONTEXT ──────────────┐ │
│  │ Persona AI                             │ │
│  │ Rules (anti-overclaim, ad compliance)  │ │
│  │ Platform constraints (from project)    │ │
│  │ Brand Guidelines (from brands table):  │ │
│  │  ├─ Font style (preset/custom)         │ │
│  │  ├─ Color palette (primary/accent)     │ │
│  │  ├─ Button style (rounded/pill/etc)    │ │
│  │  └─ Design vibe (minimalist/etc)       │ │
│  │ Tone (from project)                    │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Layer 2: PRODUCT BRIEF ───────────────┐ │
│  │ Auto-pulled from Product Knowledge DB  │ │
│  │ Name, description, prices, audience    │ │
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
│  │ HTML mode: Tailwind CSS, single file   │ │
│  │ Copy mode: Text only, no markup        │ │
│  │ Platform-specific rules                │ │
│  └────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Template Count Estimate:

| Template Type | Count | Notes |
|---|---|---|
| Global Context | 1 | Shared across all projects (includes brand guidelines) |
| Brand Guidelines | 1 | Sub-template inside Global Context, populated from brands table |
| Product Brief | 1 | Auto-populated dari DB |
| Layout Format | ~22 | 1 per format di gallery |
| Output Instruction | 2 | HTML + Copy mode |
| Formula Mapping | 20 | Default section configs per formula in gallery |
| Total | ~47 | |

### 6.4 Platform Layout Rules

| Platform | Layout Rule | Additional Constraints |
|---|---|---|
| Scalev | Single Column | CSS !important untuk override platform default |
| Berdu | Single Column | CSS !important untuk override platform default |
| Lynk.id | Single Column | Strict width constraints |
| WordPress | Responsive/Adaptive | Elementor/Divi compatible markup |
| Shopify | Responsive/Adaptive | Liquid-aware class naming |
| Buat.id | Responsive/Adaptive | Standard HTML embed |
| Order Hero | Responsive/Adaptive | Standard HTML embed |
| Mayar | Responsive/Adaptive | Payment integration hooks |

### 6.5 Save Logic

```
User edits something
  → is_dirty = true (in React state only, NOT saved to DB)
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

### 7.2 Formula Gallery View (saat Create New LP)

```
┌────────────────────────────────────────────────────────────┐
│  Create New LP                                       [X]   │
│                                                            │
│  Pilih Formula                    [Search formulas...]     │
│                                                            │
│  ── Foundational ──────────────────────────────────────    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐  │
│  │ AIDA       │ │ PAS        │ │ BAB        │ │ FAB    │  │
│  │ 4 sections │ │ 4 sections │ │ 4 sections │ │ 3 sect │  │
│  │ Universal  │ │ Pain-driven│ │ Transform  │ │ Product│  │
│  └────────────┘ └────────────┘ └────────────┘ └────────┘  │
│                                                            │
│  ── Comprehensive ─────────────────────────────────────    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ PASTOR     │ │ AIDCA      │ │ QUEST      │  ...        │
│  │ 6 sections │ │ 5 sections │ │ 5 sections │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                            │
│  ── Modern ── ── Specialized ── ... (scroll)               │
│                                                            │
│  ┌─────────────────────┐                                   │
│  │  ┌──┐  Custom       │  ← visual distinct, blank canvas │
│  │  └──┘  Start from   │                                   │
│  │       scratch        │                                   │
│  └─────────────────────┘                                   │
└────────────────────────────────────────────────────────────┘
```

### 7.3 LP Generator Layout (setelah pilih formula / Custom)

```
┌──────────────────────────────────────────────────────────┐
│  [Global Bar: Product Selector | Formula: AIDCA | Platform]│
├────────────────────────────┬─────────────────────────────┤
│  Section Planner           │  Output Panel               │
│                            │                             │
│  ┌─ Section Card 1 ─────┐ │  ┌─ Prompt Output ────────┐ │
│  │ ≡ Hero               │ │  │                        │ │
│  │ Judul: ...            │ │  │  [Generated prompt     │ │
│  │ Goals: ...            │ │  │   appears here]        │ │
│  │ Format: [thumbnail]   │ │  │                        │ │
│  │ 🗑️ ⊕                 │ │  │                        │ │
│  └───────────────────────┘ │  │                        │ │
│  ┌─ Section Card 2 ─────┐ │  │                        │ │
│  │ ≡ Problem             │ │  │                        │ │
│  │ ...                   │ │  │                        │ │
│  └───────────────────────┘ │  │                        │ │
│                            │  └────────────────────────┘ │
│  [+ Add Section]           │  [Copy] [HTML/Copy Toggle]  │
│                            │                             │
│  [Save] [Generate]         │                             │
└────────────────────────────┴─────────────────────────────┘
```

### 7.4 Section Card Anatomy

Setiap section card berisi:

- **Drag handle** (kiri, ≡ icon) - untuk reorder via drag
- **Section title** (editable inline, bold)
- **Goals field** (editable, di bawah title)
- **Format badge** + skeleton thumbnail mini - menunjukkan layout yang dipilih
- **Style indicator** - "Default" badge atau "Custom" badge
- **Expand/collapse** - untuk show/hide additional context field
- **Delete button** (kanan atas, 🗑️)
- **Duplicate button** (kanan atas, ⊕)

### 7.5 Format Gallery Popup

Saat user klik format badge pada section card atau "+ Add Section":

```
┌────────────────────────────────────────────────┐
│  Pilih Format Layout                     [X]   │
│                                                │
│  [Search...]                                   │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ ░░░░░░░░ │  │ ░░▓▓▓▓░░ │  │ ████████ │     │
│  │ ░░████░░ │  │ ░░▓▓▓▓░░ │  │ ████████ │     │
│  │ ░░░░░░░░ │  │ ░░░░░░░░ │  │          │     │
│  │ Standard │  │   VSL    │  │  Typo    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ ██│░░██ │  │ ░░░░░░░░ │  │ 99  42   │     │
│  │ ██│░░██ │  │ ░  ...   │  │ 87  153  │     │
│  │          │  │ ░░░░░░░░ │  │          │     │
│  │  Split  │  │ Story    │  │  Stats   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                │
│  ... (scroll for more)                         │
└────────────────────────────────────────────────┘
```

Setiap format punya skeleton wireframe (bukan cuma judul) supaya user langsung kebayang bentuknya.

---

## 8. MVP Scope & Phasing

### 8.1 Phase 1: MVP (6-8 weeks)

**Product Knowledge Database:**
- CRUD produk (nama, deskripsi, harga)
- Brand management (nama + guidelines)
- Brand Guidelines popup: font style, color palette, button style, design vibe (presets + custom)
- Limits enforced: 3 brands, 10 products

**LP Generator:**
- Unified Formula Gallery dengan 10 core formulas (AIDA, PAS, BAB, FAB, 1-2-3-4, PASTOR, AIDCA, StoryBrand, Hook-Story-Offer, SLAP) + Custom card
- Section editor: judul, goals, format, style (default = brand guidelines), additional context
- Format gallery dengan 10 core layouts + skeleton preview
- Drag to reorder sections
- Prompt generation (modular per section, brand guidelines in Global Context)
- Copy to clipboard
- Manual save + unsaved warning
- Max 4 projects

**Platform:**
- Supabase Auth (email login)
- 3 platform support (Scalev, Berdu, Lynk.id)

**Not in MVP:**
- Live HTML Editor (Phase 2)
- Copy-First Mode (Phase 2)
- Custom style per section (Phase 2 -- MVP only supports Default style from brand guidelines)
- Social login (Phase 2)
- Remaining 10 formulas (Phase 2)

### 8.2 Phase 2: Enhancement (4-6 weeks after MVP)

- Live HTML Editor module (Monaco/CodeMirror + iframe preview)
- Copy-First Mode (toggle HTML vs Copy output)
- Custom style per section (user bisa tulis deskripsi style sendiri)
- Remaining 12 layout formats (expand to 22 total)
- Remaining 10 formulas in gallery (expand to 20 + Custom)
- Remaining 5 platforms (WordPress, Shopify, Buat.id, Order Hero, Mayar)
- Social login (Google, GitHub)
- Duplicate project
- Export project as JSON

### 8.3 Phase 3: Growth (ongoing)

- Upgrade tier system (pro/enterprise with higher limits)
- Live preview di LP Generator (bukan cuma di HTML Editor)
- Community format submissions (user-contributed layouts)
- AI auto-research pain points (scrape based on product + audience)
- Export langsung ke platform (WordPress JSON, Shopify Liquid)
- A/B variant generation (generate 2 versi LP dari 1 project)
- Analytics integration (track layout arrangement performance)
- Team/agency collaboration (shared product DB, multiple editors)
- Custom fields di Product Knowledge Database

---

## 9. Success Metrics

| Metric | Target (MVP) | Measurement |
|---|---|---|
| Time to first generate | < 8 minutes (incl. product setup) | From register to first prompt output |
| Product DB adoption | > 90% users have at least 1 product | Database query |
| Formula vs Custom ratio | Track (no target) | Understand user preference |
| Section customization rate | > 60% edit at least 1 default section | Track section edits |
| Format gallery usage | > 70% users browse gallery | UI interaction tracking |
| Prompt copy rate | > 80% generated prompts get copied | Clipboard API tracking |
| Return user rate (weekly) | > 40% | Supabase auth sessions |
| Projects per user | > 1.5 per active user per month | Database query |
| Save frequency | Track (baseline) | Manual save events |
| Unsaved close warnings triggered | Track (minimize over time) | beforeunload events |

---

## 10. Competitive Intelligence

### 10.1 SesuaiFormat Engine (Direct Competitor)

Reverse-engineered findings (full docs: `sesuaiformat-prompt-engine-source.md`):

- 100% frontend, no backend API. Pure template literal interpolation.
- 1 monolithic prompt template (2,843 chars, 47 lines, 30 expressions)
- Supabase for auth only, no data persistence
- No sanitization (DOMPurify absent)
- Framework selection has zero structural impact - only string injection
- 11 section checkboxes with no customization per section
- chat.z.ai integration via URL query parameter (external redirect)
- localStorage used (11 instances) but no project save/load feature
- Platform conditional: Scalev/Berdu/Lynk.id = single column; rest = responsive
- Has "Live HTML Editor" as separate page (we're matching this feature)

### 10.2 International Competitors

- **Leadpages** (2026 rebuild): AI-native, prompt to live page in 60 seconds. Strength: speed. Weakness: less control, no Indonesian market focus.
- **Landingi**: AI Composer generates sections from prompts. Strength: established. Weakness: not block-based, no formula mapping.
- **Unbounce** Smart Builder: AI powered by conversion data. Strength: data-driven. Weakness: not available for Indonesian platforms.
- **Framer**: Design-focused, beautiful output. Strength: aesthetics. Weakness: overkill for Indonesian advertiser, no local platform support.

### 10.3 Our Positioning

Kita bukan page builder (Framer, Webflow) dan bukan AI yang langsung generate (Leadpages). Kita adalah **visual LP planner dengan product database** yang menghasilkan optimized, section-aware prompts.

Key moat:
- Product Knowledge Database = user data lock-in (semakin banyak produk diinput, semakin sticky)
- Local platform support (Scalev, Berdu, Lynk.id) = niche tidak disentuh international competitors
- Framework-aware section planning = structural advantage vs flat prompt generators

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Onboarding friction (harus setup product DB dulu) | High | Guided onboarding flow. Bisa skip product DB dan isi inline (fallback). Quick-start template untuk product. |
| User overwhelm (terlalu banyak format options) | High | Default formula mode sebagai entry point. Gallery with search + skeleton preview reduces cognitive load. |
| Decoupled layout = user pilih format yang gak cocok | Medium | Guidance hints per section goals. "Recommended" badge on formats that match common use cases. |
| Prompt quality inconsistent across sections | High | Extensive prompt engineering. Format-specific templates tuned per layout. User testing per format. |
| SesuaiFormat copy feature ini | Medium | Speed to market. Product DB = moat. Saved projects = user retention. |
| Manual save = user loses work | Medium | Prominent unsaved indicator. beforeunload warning. Consider periodic auto-draft in Phase 2. |
| AI output quality varies per model | Medium | Test across GPT-4, Claude, Gemini. Optimize for most common model used by Indonesian market. |
| Supabase cost at scale | Low | Free tier generous (50K MAU, 500MB DB). Product + project data is small. Clear upgrade path. |
| Max 4 projects too limiting | Low | Monitor user behavior. Adjust in Phase 2 if needed. Upgrade tier available. |

---

## 12. Open Questions

1. **Monetization**: Freemium (limited products/projects) vs subscription vs one-time? Apa yang lebih cocok untuk pasar Indonesia?
2. **AI Integration**: Tetap sebagai prompt builder, atau integrate AI API langsung (generate HTML in-platform)?
3. **Skeleton previews**: Pure CSS/SVG (low maintenance) atau static images (higher fidelity)?
4. **Product DB onboarding**: Mandatory sebelum bisa bikin LP, atau bisa skip dan isi inline?
5. **chat.z.ai**: Partner integration, atau build own AI endpoint?
6. **Bahasa**: Indonesian-only dari MVP, atau bilingual (ID + EN)?
7. **Upgrade pricing**: Berapa limit yang reasonable untuk free tier? 3 brands + 10 products + 4 projects sudah cukup?
8. **Analytics**: Apakah perlu track prompt yang di-generate untuk improve template quality?

---

## Appendix A: SesuaiFormat Engine Technical Analysis

Full reverse-engineering documentation: `sesuaiformat-prompt-engine-source.md`

Key findings:
- Tech stack: React 18 + Vite + Tailwind CSS + Supabase Auth + Cloudflare Pages
- Source: ~474KB minified JS (single bundle)
- Template: 1 monolithic template literal, 2,843 chars, 30 ${} expressions
- Conditionals: 4 ternary operators (platform layout, hero type, sections, section highlight)
- Platform logic: Scalev/Berdu/Lynk.id = single column; rest = responsive
- Sections use `.toUpperCase()` + warning "JANGAN SAMPAI ADA YANG TERLEWAT"
- No DOMPurify or sanitization
- iframe + srcdoc (12 instances) for preview
- localStorage (11 instances) for preferences
- Zero network requests on Generate - 100% frontend
- 3 action functions: `ye()` = generate prompt, `it()` = copy to clipboard, `Be()` = open in chat.z.ai

## Appendix B: Layout Format Reference

Full list of 22 layout formats with descriptions:

| # | Format | Description | Best For |
|---|---|---|---|
| 1 | Standard Image | Split layout, image + text side by side | Hero, Solution, About |
| 2 | VSL | Video embed center, headline above, CTA below | Hero (video-focused) |
| 3 | Typographic | Large typography as visual, minimal imagery | Hero, Statement sections |
| 4 | Split Screen | 50/50 content split | Before-After, Comparison |
| 5 | Story-Based | Narrative paragraphs with visual support | Problem, Founder Story |
| 6 | Stat Counter | Big numbers in grid | Social Proof, Results |
| 7 | Before-After | Side-by-side or stacked comparison | Transformation, Problem-Solution |
| 8 | Feature Grid | Cards with icon + title + desc | Features, Benefits |
| 9 | Icon List | Vertical list with icons | Features, Steps, Checklist |
| 10 | Bento Layout | Asymmetric grid cards | Features, Mixed content |
| 11 | Quote Cards | Quote marks + name + photo cards | Testimonials |
| 12 | Video Testimonial | Video embed(s) with captions | Testimonials |
| 13 | Screenshot Chat | Chat bubble / screenshot style | Social proof, Testimonials |
| 14 | Single Offer | One big box with price + benefits + CTA | Pricing (single product) |
| 15 | Comparison Table | Multi-column comparison | Pricing, vs Competitor |
| 16 | Tier Cards | Side-by-side plan cards | Pricing (tiered) |
| 17 | Moving Marquee | Horizontal scrolling strip | Logos, Trust badges, Highlights |
| 18 | Promo Coret | Strikethrough price + new price | Pricing, Urgency |
| 19 | Accordion | Expandable Q&A sections | FAQ |
| 20 | Timeline | Chronological steps/milestones | Process, History, Roadmap |
| 21 | Logo Bar | Horizontal row of logos/badges | Social proof, Trust |
| 22 | Card Grid | Equal-size cards in responsive grid | Generic multi-item |
