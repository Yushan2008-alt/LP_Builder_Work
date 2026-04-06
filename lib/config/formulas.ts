/**
 * FORMULAS.ts
 * Complete Formula Gallery Configuration (20 Formulas + Custom)
 * Extracted from PRD section 4.2
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FormulaSection {
  title: string;
  goals: string;
  frameworkPosition: string;
  defaultLayout?: string; // explicit layout override — takes priority over keyword inference
}

export type FormulaTier =
  | "foundational"
  | "comprehensive"
  | "modern"
  | "specialized"
  | "custom";

export interface Formula {
  id: string; // kebab-case
  name: string;
  tier: FormulaTier;
  description: string; // 1-liner
  bestCase: string;
  context?: string; // framework philosophy & how sections connect — injected into prompt for AI context
  sectionCount: number;
  sections: FormulaSection[];
}

export interface FormulaTierInfo {
  id: string;
  label: string;
  description: string;
}

// ============================================================================
// TIERS
// ============================================================================

export const FORMULA_TIERS: FormulaTierInfo[] = [
  {
    id: "foundational",
    label: "Foundational",
    description: "Core frameworks for beginners and universal use cases",
  },
  {
    id: "comprehensive",
    label: "Comprehensive Sales",
    description: "Advanced sales frameworks for complex conversions",
  },
  {
    id: "modern",
    label: "Modern Guru",
    description: "Story-driven frameworks from modern marketing gurus",
  },
  {
    id: "specialized",
    label: "Specialized",
    description: "Niche frameworks for specific use cases",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Blank canvas for experienced copywriters",
  },
];

// ============================================================================
// FORMULAS DATA
// ============================================================================

export const FORMULAS: Formula[] = [
  // ──────────────────────────────────────────────────────────────────
  // TIER 1: FOUNDATIONAL
  // ──────────────────────────────────────────────────────────────────
  {
    id: "aida",
    name: "AIDA",
    tier: "foundational",
    description: "Universal attention-to-action framework",
    bestCase:
      "Product launches, awareness campaigns, considered purchases",
    context:
      "AIDA (Attention → Interest → Desire → Action) adalah framework copywriting paling universal. Alurnya mengikuti psikologi keputusan: pertama HENTIKAN scroll dengan hook yang kuat, lalu BANGUN ketertarikan dengan informasi yang relevan, kemudian CIPTAKAN keinginan dengan menunjukkan transformasi hidup, dan akhirnya DORONG aksi dengan CTA yang jelas. Setiap section harus mengalir natural ke section berikutnya — jangan buat setiap section berdiri sendiri. Escalate emosi dari section ke section.",
    sectionCount: 4,
    sections: [
      {
        title: "Hero",
        goals:
          "Buat headline yang menghentikan scroll dan langsung relevan dengan masalah atau keinginan target audience. Gunakan subheadline untuk memperjelas value proposition utama. Tambahkan visual yang mendukung pesan utama.",
        frameworkPosition: "Attention",
        defaultLayout: "standard_image",
      },
      {
        title: "Interest",
        goals:
          "Sajikan informasi yang membuat pembaca ingin tahu lebih lanjut — bisa berupa fakta mengejutkan, statistik, atau insight yang belum umum diketahui. Tampilkan 3-4 poin utama yang membedakan produk ini dari alternatif lain. Gunakan format yang mudah di-scan.",
        frameworkPosition: "Interest",
        defaultLayout: "feature_grid",
      },
      {
        title: "Desire",
        goals:
          "Gambarkan bagaimana hidup pembaca akan berubah setelah menggunakan produk. Gunakan bahasa emosional dan skenario spesifik yang relatable. Fokus pada transformasi 'before → after' dalam kehidupan mereka sehari-hari.",
        frameworkPosition: "Desire",
        defaultLayout: "story_based",
      },
      {
        title: "CTA",
        goals:
          "Tampilkan penawaran utama dengan harga yang jelas. Buat tombol CTA yang action-oriented (bukan 'Submit' atau 'Klik di sini'). Tambahkan elemen pendukung: garansi, risk-reversal, atau urgency yang genuine.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "pas",
    name: "PAS",
    tier: "foundational",
    description: "Problem-Agitation-Solution pain-driven framework",
    bestCase:
      "Pain-driven products (health, finance, productivity), ads, short LP",
    context:
      "PAS (Problem → Agitation → Solution) adalah framework pain-driven yang memanfaatkan psikologi loss aversion. Mulai dengan MENGIDENTIFIKASI masalah spesifik yang dirasakan audience, lalu PERKUAT rasa sakit dan urgency dari masalah tersebut (agitation), baru kemudian PRESENTASIKAN produk sebagai relief/solusi. Kunci PAS adalah agitation yang kuat — pembaca harus merasa masalah ini terlalu mendesak untuk diabaikan SEBELUM solusi ditawarkan. Transisi dari Agitation ke Solution harus terasa seperti 'akhirnya ada jalan keluar'.",
    sectionCount: 4,
    sections: [
      {
        title: "Hero",
        goals:
          "Identifikasi masalah spesifik yang dirasakan target audience — bukan masalah umum, tapi yang membuat mereka berpikir 'ini gue banget'. Gunakan bahasa yang mereka sendiri gunakan untuk mendeskripsikan frustrasi mereka.",
        frameworkPosition: "Problem",
        defaultLayout: "typographic",
      },
      {
        title: "Pain Deep-Dive",
        goals:
          "Perkuat rasa sakit dari masalah tersebut. Tunjukkan konsekuensi jika masalah tidak diselesaikan — apa yang mereka kehilangan (waktu, uang, peluang, ketenangan). Buat pembaca merasakan urgency untuk bertindak sekarang, bukan nanti.",
        frameworkPosition: "Agitation",
        defaultLayout: "typographic",
      },
      {
        title: "Solution",
        goals:
          "Perkenalkan produk sebagai jawaban langsung dari masalah yang sudah di-agitate. Jelaskan BAGAIMANA produk menyelesaikan masalah secara konkret. Tampilkan produk secara visual bersamaan dengan penjelasan solusi.",
        frameworkPosition: "Solution",
        defaultLayout: "split_screen",
      },
      {
        title: "CTA",
        goals:
          "Buat transisi yang mulus dari 'ini solusinya' ke 'ambil sekarang'. Tampilkan harga, penawaran spesial jika ada, dan satu tombol CTA yang jelas. Tambahkan social proof singkat atau garansi untuk menghilangkan keraguan terakhir.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "bab",
    name: "BAB",
    tier: "foundational",
    description: "Before-After-Bridge transformation framework",
    bestCase:
      "Cold emails, aspirational/transformation products, coaching, health/fitness",
    context:
      "BAB (Before → After → Bridge) adalah framework transformasi yang bekerja dengan kontras emosional. BEFORE menggambarkan kondisi menyakitkan saat ini, AFTER melukiskan masa depan ideal yang diinginkan, dan BRIDGE memperkenalkan produk sebagai jembatan antara keduanya. Kekuatan BAB ada di kontras — semakin tajam perbedaan antara Before dan After, semakin kuat desire untuk menyeberangi Bridge. Produk bukan hero cerita, produk adalah JEMBATAN menuju kehidupan yang lebih baik.",
    sectionCount: 4,
    sections: [
      {
        title: "Before",
        goals:
          "Gambarkan kondisi pembaca saat ini dengan detail yang spesifik dan relatable. Fokus pada frustrasi harian, hambatan yang mereka hadapi, dan perasaan yang muncul dari situasi tersebut. Buat mereka mengangguk dan merasa dipahami.",
        frameworkPosition: "Before",
        defaultLayout: "typographic",
      },
      {
        title: "After",
        goals:
          "Lukiskan gambaran ideal masa depan mereka setelah masalah terselesaikan. Gunakan skenario konkret: bagaimana pagi hari mereka, bagaimana pekerjaan mereka berubah, bagaimana perasaan mereka. Buat kontras yang kuat dengan kondisi 'Before'.",
        frameworkPosition: "After",
        defaultLayout: "story_based",
      },
      {
        title: "Bridge",
        goals:
          "Posisikan produk sebagai jembatan dari 'Before' ke 'After'. Jelaskan secara spesifik fitur atau mekanisme apa yang membuat transformasi ini mungkin. Tampilkan produk secara visual dengan penjelasan di sampingnya.",
        frameworkPosition: "Bridge",
        defaultLayout: "split_screen",
      },
      {
        title: "CTA",
        goals:
          "Dorong pembaca untuk mengambil langkah pertama menuju 'After' yang sudah dijanjikan. Tampilkan penawaran dengan harga jelas dan CTA yang mengingatkan kembali transformasi yang menunggu mereka.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "fab",
    name: "FAB",
    tier: "foundational",
    description: "Features-Advantages-Benefits product breakdown",
    bestCase:
      "Product pages, feature sections, SaaS breakdown, ecommerce, B2B comparison",
    context:
      "FAB (Features → Advantages → Benefits) adalah framework product-centric yang mentranslasi spesifikasi teknis menjadi value yang dirasakan pelanggan. FEATURES menyatakan apa yang produk PUNYA, ADVANTAGES menjelaskan apa yang fitur-fitur itu LAKUKAN, dan BENEFITS menunjukkan apa ARTINYA bagi kehidupan pelanggan. Alurnya bergerak dari objektif ke emosional: fakta → fungsi → perasaan. Framework ini cocok untuk audience yang sudah tahu mereka butuh solusi tapi perlu memahami kenapa produk INI yang tepat.",
    sectionCount: 3,
    sections: [
      {
        title: "Features",
        goals:
          "Daftarkan fitur utama produk dalam format grid yang mudah di-scan. Setiap fitur ditampilkan dengan ikon/gambar, nama fitur, dan deskripsi singkat 1-2 kalimat. Fokus pada fakta objektif: apa yang produk PUNYA atau BISA lakukan.",
        frameworkPosition: "Features",
        defaultLayout: "feature_grid",
      },
      {
        title: "Advantages",
        goals:
          "Jelaskan apa yang DILAKUKAN setiap fitur untuk pengguna — translasi fitur teknis menjadi keunggulan praktis. Format sebagai daftar dengan ikon yang menjelaskan setiap poin. Bandingkan secara implisit dengan alternatif yang ada di pasar.",
        frameworkPosition: "Advantages",
        defaultLayout: "icon_list",
      },
      {
        title: "Benefits",
        goals:
          "Ceritakan dampak nyata bagi kehidupan atau bisnis pengguna — bukan apa yang produk lakukan, tapi apa ARTINYA bagi mereka. Gunakan narasi yang emosional dan bahasa 'Anda/kamu'. Hubungkan benefit dengan aspirasi atau pain point target audience.",
        frameworkPosition: "Benefits",
        defaultLayout: "story_based",
      },
    ],
  },

  {
    id: "1-2-3-4",
    name: "1-2-3-4 Formula",
    tier: "foundational",
    description: "Four-step clarity formula for beginners",
    bestCase:
      "Lead-gen pages, email campaigns, beginners, quality-control checklist",
    context:
      "Formula 1-2-3-4 adalah checklist sederhana yang memastikan 4 pertanyaan fundamental terjawab: (1) Apa yang kamu tawarkan? (2) Apa manfaatnya buat saya? (3) Kenapa saya harus percaya kamu? (4) Apa yang harus saya lakukan sekarang? Framework ini sangat direct dan cocok untuk audience yang butuh kejelasan cepat. Tidak ada storytelling atau emotional manipulation — murni clarity dan trust-building. Setiap section menjawab satu pertanyaan dengan tuntas sebelum lanjut ke pertanyaan berikutnya.",
    sectionCount: 4,
    sections: [
      {
        title: "What I've Got",
        goals:
          "Nyatakan dengan jelas dan langsung apa yang ditawarkan. Tampilkan produk/layanan secara visual di samping deskripsi singkat. Hindari jargon — gunakan bahasa yang bisa dipahami orang awam dalam 5 detik pertama.",
        frameworkPosition: "Offering",
        defaultLayout: "split_screen",
      },
      {
        title: "What It Does For You",
        goals:
          "Jelaskan manfaat dalam bahasa 'kamu/Anda'. Tampilkan 3-4 benefit utama dalam format grid card. Setiap benefit harus menjawab pertanyaan: 'Terus, apa untungnya buat gue?' Gunakan contoh konkret, bukan abstrak.",
        frameworkPosition: "Benefits",
        defaultLayout: "feature_grid",
      },
      {
        title: "Who Am I",
        goals:
          "Bangun trust dengan menampilkan kredensial, pengalaman, atau pencapaian yang relevan. Bisa berupa testimoni dari klien, logo partner/media, atau kutipan dari founder. Tujuannya menjawab: 'Kenapa gue harus percaya sama lu?'",
        frameworkPosition: "Credibility",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "What To Do Next",
        goals:
          "Berikan instruksi yang sangat jelas tentang langkah selanjutnya. Tampilkan CTA button yang menonjol dengan teks action-oriented. Tambahkan urgency jika relevan (kuota terbatas, harga naik) dan garansi untuk menghilangkan risiko.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // TIER 2: COMPREHENSIVE SALES
  // ──────────────────────────────────────────────────────────────────
  {
    id: "pastor",
    name: "PASTOR",
    tier: "comprehensive",
    description: "Six-step high-ticket sales framework",
    bestCase:
      "High-ticket ($500+), info products, coaching, courses, personality brands",
    context:
      "PASTOR (Problem → Amplify → Story → Transformation → Offer → Response) adalah framework high-ticket sales dari Ray Edwards. Alurnya mengikuti psikologi penjualan mendalam: IDENTIFIKASI masalah, AMPLIFIKASI urgency-nya, BANGUN koneksi emosional lewat cerita, BUKTIKAN transformasi nyata, PRESENTASIKAN penawaran yang irresistible, dan TUTUP dengan CTA yang kuat. Framework ini dirancang untuk produk mahal di mana kepercayaan harus dibangun bertahap. Setiap section menambah layer kepercayaan — jangan skip langsung ke offer tanpa membangun fondasi emosional dulu.",
    sectionCount: 6,
    sections: [
      {
        title: "Problem",
        goals:
          "Sebut masalah spesifik yang dialami target audience dengan bahasa mereka sendiri. Tunjukkan bahwa kamu paham situasi mereka secara mendalam. Gunakan pertanyaan retoris yang membuat mereka berhenti dan berpikir.",
        frameworkPosition: "Problem",
        defaultLayout: "typographic",
      },
      {
        title: "Amplify",
        goals:
          "Perkuat konsekuensi dari TIDAK menyelesaikan masalah ini. Tunjukkan apa yang dipertaruhkan — waktu yang terbuang, uang yang hilang, peluang yang lewat. Buat pembaca merasa bahwa menunda bukan opsi yang bijak.",
        frameworkPosition: "Amplify",
        defaultLayout: "typographic",
      },
      {
        title: "Story",
        goals:
          "Ceritakan kisah yang relatable — bisa kisah founder, klien, atau narasi yang mewakili perjalanan target audience. Cerita harus punya arc: dari struggle ke turning point. Bangun koneksi emosional sebelum memperkenalkan solusi.",
        frameworkPosition: "Story",
        defaultLayout: "story_based",
      },
      {
        title: "Transformation",
        goals:
          "Tampilkan bukti transformasi nyata dalam format before/after. Bisa berupa testimoni klien dengan hasil konkret, screenshot hasil, atau data perbandingan. Kontras visual antara kondisi sebelum dan sesudah harus sangat jelas.",
        frameworkPosition: "Transformation",
        defaultLayout: "before_after",
      },
      {
        title: "Offer",
        goals:
          "Presentasikan semua yang didapat pembeli: deliverables utama, bonus, dan value total. Tampilkan harga dengan framing yang menguntungkan (harga normal vs harga spesial). Buat pembaca merasa mendapat nilai jauh lebih besar dari yang dibayar.",
        frameworkPosition: "Offer",
        defaultLayout: "tier_cards",
      },
      {
        title: "Response",
        goals:
          "CTA final dengan urgency yang genuine. Ringkas ulang value proposition dalam 1-2 kalimat. Tambahkan garansi/risk-reversal dan buat tombol CTA yang tidak bisa diabaikan. Hilangkan keraguan terakhir.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "aidca",
    name: "AIDCA",
    tier: "comprehensive",
    description: "AIDA + Conviction for skeptical audiences",
    bestCase:
      "Skeptical audiences, new/unknown brands, paid traffic, high-ticket items",
    context:
      "AIDCA adalah evolusi AIDA dengan tambahan layer CONVICTION sebelum Action. Framework ini dirancang khusus untuk audience skeptis — mereka yang sudah tertarik dan menginginkan produk, tapi belum PERCAYA. Section Conviction menjadi jembatan kritis: testimoni, data, garansi, dan bukti konkret yang mengubah 'saya mau tapi...' menjadi 'saya yakin ini aman'. Untuk brand baru atau produk high-ticket, Conviction section bisa jadi penentu konversi.",
    sectionCount: 5,
    sections: [
      {
        title: "Hero",
        goals:
          "Buat headline yang menghentikan scroll dan langsung bicara ke masalah/keinginan utama audience. Gunakan visual yang kuat dan subheadline yang memperjelas value proposition. Untuk audience skeptis, hindari overclaim — gunakan bahasa yang kredibel.",
        frameworkPosition: "Attention",
        defaultLayout: "standard_image",
      },
      {
        title: "Interest",
        goals:
          "Sajikan informasi yang counter-intuitive atau belum diketahui audience. Tampilkan 3-4 insight atau fitur unik dalam format yang mudah di-scan. Tujuannya membuat mereka berpikir: 'Hmm, ini menarik — belum pernah denger ini sebelumnya.'",
        frameworkPosition: "Interest",
        defaultLayout: "feature_grid",
      },
      {
        title: "Desire",
        goals:
          "Bangun keinginan emosional dengan menggambarkan hasil yang bisa dicapai. Gunakan skenario konkret dan bahasa sensori. Hubungkan produk dengan aspirasi atau identitas yang diinginkan pembaca.",
        frameworkPosition: "Desire",
        defaultLayout: "story_based",
      },
      {
        title: "Conviction",
        goals:
          "Buktikan bahwa klaim yang dibuat itu BENAR dan AMAN. Tampilkan testimoni nyata, studi kasus, data/statistik, logo klien, sertifikasi, atau garansi. Ini section kunci untuk audience skeptis — setiap klaim harus ada buktinya.",
        frameworkPosition: "Conviction",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "CTA",
        goals:
          "Tampilkan penawaran dengan harga jelas dan CTA yang kuat. Ulangi garansi/risk-reversal secara singkat. Buat tombol CTA yang menonjol dengan copy action-oriented yang mengingatkan benefit utama.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "quest",
    name: "QUEST",
    tier: "comprehensive",
    description: "Qualification-to-conversion sales funnel",
    bestCase:
      "Long-form sales, courses, coaching, membership, audience filtering needed",
    context:
      "QUEST (Qualify → Understand → Educate → Stimulate → Transition) adalah framework yang dimulai dengan MENYARING audience yang tepat. Berbeda dengan framework lain yang langsung hook semua orang, QUEST sengaja membuat pembaca yang tidak cocok pergi — sehingga yang tersisa adalah prospek berkualitas tinggi. Setelah qualify, framework membangun trust lewat empati (Understand), edukasi (Educate), dan desire yang intens (Stimulate) sebelum transisi halus ke penawaran. Cocok untuk produk premium di mana kualitas leads lebih penting dari kuantitas.",
    sectionCount: 5,
    sections: [
      {
        title: "Qualify",
        goals:
          "Filter pembaca ideal dengan bahasa yang spesifik: 'Ini untuk kamu yang...' atau 'Jika kamu mengalami X, Y, Z...'. Buat pembaca yang tepat merasa terpilih, dan yang tidak tepat merasa ini bukan untuk mereka. Gunakan pertanyaan retoris.",
        frameworkPosition: "Qualify",
        defaultLayout: "typographic",
      },
      {
        title: "Understand",
        goals:
          "Tunjukkan empati mendalam — bahwa kamu benar-benar paham situasi mereka. Ceritakan kembali pengalaman mereka seolah kamu pernah ada di posisi yang sama. Gunakan narasi yang membuat mereka merasa: 'Akhirnya ada yang ngerti.'",
        frameworkPosition: "Understand",
        defaultLayout: "story_based",
      },
      {
        title: "Educate",
        goals:
          "Edukasi pembaca tentang solusi yang ada dan posisikan produkmu sebagai pilihan terbaik. Sajikan framework, metodologi, atau pendekatan unik yang membedakan produkmu. Tampilkan dalam format grid atau card yang mudah dipahami.",
        frameworkPosition: "Educate",
        defaultLayout: "feature_grid",
      },
      {
        title: "Stimulate",
        goals:
          "Bangkitkan desire yang intens dan rasa takut kehilangan (FOMO). Tunjukkan kontras tajam: apa yang terjadi jika mereka bertindak vs tidak bertindak. Gunakan format before/after untuk memvisualisasikan dua jalur berbeda ini.",
        frameworkPosition: "Stimulate",
        defaultLayout: "before_after",
      },
      {
        title: "Transition",
        goals:
          "Transisi halus ke penawaran — 'Sekarang tinggal satu langkah lagi.' Tampilkan offer lengkap dengan harga, garansi, dan bonus. Buat proses pembelian terasa mudah dan tanpa risiko.",
        frameworkPosition: "Transition",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "4ps-pppp",
    name: "4Ps (PPPP)",
    tier: "comprehensive",
    description: "Promise-Picture-Proof-Push emotional selling",
    bestCase:
      "Emotionally-driven B2C, product-aware prospects, conversion-focused pages",
    context:
      "4Ps / PPPP (Promise → Picture → Proof → Push) adalah framework emotional selling yang sangat efektif untuk B2C. Mulai dengan satu JANJI BESAR yang bold dan spesifik, lalu LUKISKAN gambaran vivid tentang kehidupan setelah janji terpenuhi, kemudian BUKTIKAN bahwa janji itu bukan omong kosong, dan akhirnya DORONG ke aksi. Framework ini bekerja karena mengikuti alur emosional: harapan → imajinasi → kepercayaan → tindakan. Kunci suksesnya: janji harus spesifik dan terukur, bukan vague.",
    sectionCount: 4,
    sections: [
      {
        title: "Promise",
        goals:
          "Buat satu janji besar yang bold dan spesifik — bukan 'produk terbaik' tapi janji hasil yang terukur. Headline harus menyampaikan janji ini dalam 1 kalimat yang kuat. Subheadline memperkuat dengan detail pendukung.",
        frameworkPosition: "Promise",
        defaultLayout: "typographic",
      },
      {
        title: "Picture",
        goals:
          "Bantu pembaca membayangkan kehidupan mereka setelah janji terpenuhi. Gunakan storytelling sensori: apa yang mereka lihat, rasakan, dan alami. Buat narasi yang begitu vivid sehingga mereka bisa 'merasakan' hasilnya sekarang.",
        frameworkPosition: "Picture",
        defaultLayout: "story_based",
      },
      {
        title: "Proof",
        goals:
          "Buktikan bahwa janji tadi bukan omong kosong. Tampilkan testimoni pelanggan nyata, studi kasus dengan angka konkret, statistik, atau endorsement dari pihak ketiga. Semakin spesifik dan terverifikasi, semakin kuat.",
        frameworkPosition: "Proof",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "Push",
        goals:
          "Dorong pembaca ke tindakan dengan mengikat kembali janji, gambaran, dan bukti menjadi satu CTA yang tak terhindarkan. Tambahkan urgency atau scarcity jika genuine. Buat merasa bahwa TIDAK bertindak justru lebih berisiko.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "acca",
    name: "ACCA",
    tier: "comprehensive",
    description: "Awareness-Comprehension-Conviction-Action education-first",
    bestCase:
      "Complex/innovative products, nonprofits, B2B, unaware audiences, education-first",
    context:
      "ACCA (Awareness → Comprehension → Conviction → Action) adalah framework education-first untuk audience yang BELUM SADAR mereka punya masalah atau belum tahu ada solusinya. Berbeda dengan AIDA yang assume audience sudah aware, ACCA mulai dari nol: buat mereka SADAR ada masalah, bantu mereka PAHAM dampaknya, bangun KEYAKINAN bahwa solusi ini works, baru dorong ACTION. Framework ini membutuhkan patience — jangan rush ke selling sebelum audience benar-benar paham. Cocok untuk produk inovatif, B2B kompleks, atau kategori baru yang belum familiar.",
    sectionCount: 4,
    sections: [
      {
        title: "Awareness",
        goals:
          "Angkat masalah atau topik yang mungkin belum disadari audience. Gunakan headline yang membuka mata dan visual yang mendukung. Buat mereka sadar bahwa ada masalah yang selama ini mereka abaikan atau tidak tahu ada solusinya.",
        frameworkPosition: "Awareness",
        defaultLayout: "standard_image",
      },
      {
        title: "Comprehension",
        goals:
          "Jelaskan secara mendalam bagaimana masalah ini berdampak pada mereka. Breakdown kompleksitas menjadi poin-poin yang mudah dipahami. Gunakan analogi, infografik, atau framework visual. Audience harus keluar dari section ini dengan pemahaman yang jelas.",
        frameworkPosition: "Comprehension",
        defaultLayout: "feature_grid",
      },
      {
        title: "Conviction",
        goals:
          "Bangun keyakinan melalui bukti: data riset, testimoni ahli, studi kasus, atau demonstrasi produk. Jawab keraguan utama yang mungkin muncul. Untuk produk kompleks/inovatif, conviction adalah kunci konversi.",
        frameworkPosition: "Conviction",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "Action",
        goals:
          "Berikan langkah selanjutnya yang jelas dan sederhana. Untuk produk kompleks, bisa berupa 'Jadwalkan Demo Gratis' atau 'Mulai Trial'. Pastikan CTA terasa seperti langkah kecil yang aman, bukan komitmen besar.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // TIER 3: MODERN GURU
  // ──────────────────────────────────────────────────────────────────
  {
    id: "storybrand-sb7",
    name: "StoryBrand (SB7)",
    tier: "modern",
    description: "Seven-part narrative framework for clear messaging",
    bestCase:
      "Service businesses, coaches, consultants, B2B, unclear messaging",
    context:
      "StoryBrand (SB7) dari Donald Miller menggunakan struktur cerita untuk memperjelas messaging. Prinsip utamanya: PELANGGAN adalah hero, BRAND adalah guide. Alurnya mengikuti 7 elemen story: Character (pelanggan punya keinginan) → Problem (ada hambatan di 3 level) → Guide (brand hadir dengan empati + otoritas) → Plan (langkah sederhana) → CTA (ajakan bertindak) → Failure (apa yang dipertaruhkan) → Success (kehidupan yang dijanjikan). PENTING: jangan posisikan brand sebagai hero — pelanggan yang harus merasa mereka tokoh utama cerita ini. Brand hanya 'Yoda', pelanggan adalah 'Luke Skywalker'.",
    sectionCount: 7,
    sections: [
      {
        title: "Character",
        goals:
          "Posisikan PELANGGAN sebagai hero cerita, bukan brand. Gambarkan apa yang mereka inginkan dalam kehidupan atau bisnis mereka. Gunakan narasi orang kedua ('Kamu ingin...') agar mereka merasa jadi tokoh utama.",
        frameworkPosition: "Character",
        defaultLayout: "story_based",
      },
      {
        title: "Problem",
        goals:
          "Sajikan masalah di 3 level: eksternal (masalah praktis), internal (frustrasi/emosi), dan filosofis (kenapa ini tidak adil). Contoh: eksternal = 'website lambat', internal = 'malu sama klien', filosofis = 'bisnis bagus layak punya website bagus'.",
        frameworkPosition: "Problem",
        defaultLayout: "typographic",
      },
      {
        title: "Guide",
        goals:
          "Posisikan brand sebagai 'guide' yang punya dua kualitas: EMPATI (kamu paham perasaan mereka) dan OTORITAS (kamu punya kompetensi menyelesaikannya). Tampilkan melalui kutipan, testimoni, atau statement yang menunjukkan keduanya.",
        frameworkPosition: "Guide",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "Plan",
        goals:
          "Berikan rencana sederhana 3 langkah yang menunjukkan betapa mudahnya memulai. Contoh: '1. Daftar → 2. Setup dalam 5 menit → 3. Mulai hasil pertama'. Eliminasi complexity anxiety — buat prosesnya terasa ringan dan achievable.",
        frameworkPosition: "Plan",
        defaultLayout: "timeline",
      },
      {
        title: "CTA",
        goals:
          "Buat dua jenis CTA: Direct CTA (tombol utama — 'Mulai Sekarang') dan Transitional CTA (untuk yang belum siap — 'Download Panduan Gratis'). Kedua CTA harus jelas dan mudah ditemukan.",
        frameworkPosition: "CTA",
        defaultLayout: "single_offer",
      },
      {
        title: "Failure",
        goals:
          "Tunjukkan apa yang dipertaruhkan jika mereka TIDAK bertindak. Bukan menakut-nakuti, tapi membuat mereka sadar konsekuensi nyata dari status quo. Gunakan bahasa yang tegas tapi empatik — 'Tanpa sistem yang tepat, kamu akan terus...'",
        frameworkPosition: "Failure",
        defaultLayout: "typographic",
      },
      {
        title: "Success",
        goals:
          "Lukiskan gambaran sukses yang vivid dan aspiratif. Bagaimana kehidupan/bisnis mereka setelah menggunakan produkmu? Buat mereka bisa membayangkan diri mereka di 'promised land' tersebut. Akhiri dengan reinforcement CTA.",
        frameworkPosition: "Success",
        defaultLayout: "story_based",
      },
    ],
  },

  {
    id: "hook-story-offer",
    name: "Hook-Story-Offer",
    tier: "modern",
    description: "Interrupt-Engage-Convert product framework",
    bestCase:
      "Digital products, courses, SaaS, ecommerce, funnel optimization",
    context:
      "Hook-Story-Offer dari Russell Brunson adalah framework funnel yang sangat efektif: HOOK menghentikan scroll dan mengidentifikasi audience yang tepat, STORY membangun koneksi emosional dan mengarahkan ke produk, dan OFFER mempresentasikan value stack yang irresistible. Kunci framework ini: Hook harus melakukan 3 hal sekaligus (interrupt + intrigue + identify), Story harus punya arc emosional yang mengarah natural ke produk, dan Offer harus terasa seperti 'deal of a lifetime' — bukan sekadar harga, tapi value stack yang membuat menolak terasa bodoh.",
    sectionCount: 4,
    sections: [
      {
        title: "Hook",
        goals:
          "Interrupt perhatian pembaca dengan headline yang provokatif, pertanyaan mengejutkan, atau statement bold. Hook harus melakukan 3 hal: menghentikan scroll, memicu rasa ingin tahu, dan mengidentifikasi target audience yang tepat.",
        frameworkPosition: "Hook",
        defaultLayout: "standard_image",
      },
      {
        title: "Story",
        goals:
          "Ceritakan kisah emosional yang menghubungkan masalah audience dengan solusi produk. Ikuti arc: situasi awal → konflik/masalah → turning point → discovery produk. Cerita bisa dari founder, pelanggan, atau narasi komposit.",
        frameworkPosition: "Story",
        defaultLayout: "story_based",
      },
      {
        title: "Offer Stack",
        goals:
          "Presentasikan value stack yang irresistible: produk utama + semua bonus + garansi. Tampilkan value total vs harga aktual untuk framing yang kuat. List setiap item dengan perceived value-nya. Buat pembaca merasa bodoh kalau menolak.",
        frameworkPosition: "Offer",
        defaultLayout: "tier_cards",
      },
      {
        title: "CTA",
        goals:
          "Final push dengan satu CTA yang clear dan urgent. Ringkas ulang offer dalam 1 kalimat. Tambahkan risk-reversal terakhir (garansi uang kembali, trial gratis). Buat tombol yang impossible to miss.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "star-story-solution",
    name: "Star-Story-Solution",
    tier: "modern",
    description: "Character-Journey-Resolution narrative",
    bestCase:
      "Lead-gen pages, personality brands, info products, coaching",
    context:
      "Star-Story-Solution adalah framework naratif 3 bagian yang sederhana tapi powerful. STAR memperkenalkan karakter utama yang relatable (bisa founder, pelanggan, atau persona), STORY menceritakan perjalanan mereka melalui tantangan dan kegagalan, dan SOLUTION menunjukkan bagaimana produk menjadi resolution dari cerita. Framework ini bekerja karena manusia hardwired untuk merespons cerita. Kunci: karakter harus relatable dengan target audience, cerita harus authentic (bukan fairy tale), dan solusi harus terasa natural — bukan dipaksakan.",
    sectionCount: 3,
    sections: [
      {
        title: "Star",
        goals:
          "Perkenalkan karakter utama yang relatable dengan target audience — bisa founder, pelanggan, atau persona. Tampilkan karakter ini di kondisi awal yang mirip dengan situasi pembaca saat ini. Buat koneksi emosional sejak awal.",
        frameworkPosition: "Character",
        defaultLayout: "standard_image",
      },
      {
        title: "Story",
        goals:
          "Ceritakan perjalanan 'Star' melalui tantangan, kegagalan, dan momen-momen kritis. Gunakan detail sensori dan emosional. Narasi harus membawa pembaca dari empati ke curiosity: 'Terus gimana dong?'",
        frameworkPosition: "Journey",
        defaultLayout: "story_based",
      },
      {
        title: "Solution",
        goals:
          "Tunjukkan bagaimana produk/layanan menjadi 'resolution' dari cerita. Tampilkan produk secara visual bersama penjelasan bagaimana produk membantu karakter berhasil. Transisi alami dari cerita ke penawaran — jangan terasa dipaksakan.",
        frameworkPosition: "Resolution",
        defaultLayout: "split_screen",
      },
    ],
  },

  {
    id: "epiphany-bridge",
    name: "Epiphany Bridge",
    tier: "modern",
    description: "Eight-part transformation story framework",
    bestCase:
      "Personal brands, course creators, selling transformation, story-driven LP",
    context:
      "Epiphany Bridge dari Russell Brunson adalah framework story-driven 8 bagian yang membawa pembaca melalui perjalanan transformasi lengkap. Alurnya: Backstory → Desires → The Wall → The Epiphany → The Plan → The Conflict → The Achievement → The Transformation. Tujuan utamanya adalah membuat pembaca mengalami 'epiphany' yang sama dengan narrator — momen 'aha!' yang mengubah paradigma. PENTING: cerita harus terasa NYATA dan vulnerable, bukan polished marketing. Konflik dan kegagalan justru menambah kredibilitas. Pembaca harus merasa 'kalau dia bisa, saya juga bisa' di akhir.",
    sectionCount: 8,
    sections: [
      {
        title: "Backstory",
        goals:
          "Ceritakan latar belakang — siapa kamu sebelum menemukan 'epiphany'. Gambarkan situasi yang relatable: pekerjaan yang melelahkan, bisnis yang stuck, atau kehidupan yang tidak memuaskan. Buat pembaca melihat dirinya sendiri.",
        frameworkPosition: "Backstory",
        defaultLayout: "story_based",
      },
      {
        title: "Desires",
        goals:
          "Ungkapkan keinginan mendalam yang kamu punya saat itu — impian yang sama dengan yang dimiliki pembaca sekarang. Gunakan bahasa aspiratif tapi grounded. Hubungkan desire ini dengan motivasi universal (kebebasan, pengakuan, keamanan).",
        frameworkPosition: "Desires",
        defaultLayout: "typographic",
      },
      {
        title: "The Wall",
        goals:
          "Deskripsikan hambatan besar yang menghalangi — dan yang juga mungkin dihadapi pembaca saat ini. Tunjukkan frustrasi dan kegagalan mencoba cara-cara konvensional. Buat mereka merasa: 'Iya, gue juga pernah nyoba dan gagal.'",
        frameworkPosition: "The Wall",
        defaultLayout: "typographic",
      },
      {
        title: "The Epiphany",
        goals:
          "Ceritakan momen 'aha!' yang mengubah segalanya — insight kunci yang membuka jalan baru. Tampilkan secara visual: satu sisi adalah pemikiran lama, sisi lain adalah paradigma baru. Ini adalah titik balik cerita dan produk.",
        frameworkPosition: "The Epiphany",
        defaultLayout: "split_screen",
      },
      {
        title: "The Plan",
        goals:
          "Jelaskan langkah-langkah yang kamu ambil setelah epiphany. Sajikan sebagai timeline atau proses yang terstruktur. Ini secara tidak langsung menunjukkan bahwa ada jalur yang jelas — dan produkmu adalah peta jalannya.",
        frameworkPosition: "The Plan",
        defaultLayout: "timeline",
      },
      {
        title: "The Conflict",
        goals:
          "Tunjukkan bahwa perjalanan tidak mudah — ada tantangan, keraguan, dan momen hampir menyerah. Ini menambah autentisitas cerita dan membuat pembaca percaya bahwa ini kisah nyata, bukan fairy tale marketing.",
        frameworkPosition: "The Conflict",
        defaultLayout: "story_based",
      },
      {
        title: "The Achievement",
        goals:
          "Tampilkan hasil konkret yang dicapai — angka, statistik, milestone. Gunakan format angka besar yang impactful: revenue yang dihasilkan, waktu yang dihemat, pelanggan yang dilayani. Data berbicara lebih keras dari kata-kata.",
        frameworkPosition: "The Achievement",
        defaultLayout: "stat_counter",
      },
      {
        title: "The Transformation",
        goals:
          "Kontraskan 'siapa kamu dulu' vs 'siapa kamu sekarang' secara visual. Format before/after yang kuat. Kemudian posisikan: 'Transformasi ini juga bisa terjadi pada kamu.' Bridge ke produk/penawaran.",
        frameworkPosition: "The Transformation",
        defaultLayout: "before_after",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // TIER 4: SPECIALIZED
  // ──────────────────────────────────────────────────────────────────
  {
    id: "aicpbsawn",
    name: "AICPBSAWN",
    tier: "specialized",
    description: "Comprehensive nine-step long-form framework",
    bestCase:
      "Long-form cold traffic, high-ticket, comprehensive pages, leave nothing out",
    context:
      "AICPBSAWN (Attention → Interest → Credibility → Proof → Benefits → Scarcity → Action → Warn → Now) adalah framework long-form paling komprehensif — 9 section yang 'leave nothing out'. Dirancang untuk cold traffic dan high-ticket di mana setiap objection harus dijawab. Framework ini punya DUA CTA: Action (mid-page, untuk yang sudah yakin) dan Now (final, setelah warning). Section Warn berfungsi sebagai 'last chance saloon' — mengingatkan konsekuensi tidak bertindak sebelum CTA final. Gunakan untuk halaman penjualan panjang di mana audience belum kenal brand sama sekali.",
    sectionCount: 9,
    sections: [
      {
        title: "Attention",
        goals:
          "Buat hook visual yang kuat dengan headline yang menghentikan scroll. Untuk cold traffic, hook harus langsung relevan — jangan assumsi mereka tahu siapa kamu. Gunakan gambar hero yang mendukung pesan utama.",
        frameworkPosition: "Attention",
        defaultLayout: "standard_image",
      },
      {
        title: "Interest",
        goals:
          "Pertahankan rasa ingin tahu dengan menyajikan 3-4 insight atau fakta menarik tentang masalah/solusi. Gunakan format grid card agar mudah di-scan. Setiap poin harus membuat mereka ingin baca terus.",
        frameworkPosition: "Interest",
        defaultLayout: "feature_grid",
      },
      {
        title: "Credibility",
        goals:
          "Bangun kredibilitas lewat social proof visual: logo klien, media mention, partnership badges, atau sertifikasi. Untuk cold traffic ini esensial — mereka belum tahu siapa kamu, jadi tunjukkan siapa yang sudah percaya.",
        frameworkPosition: "Credibility",
        defaultLayout: "logo_bar",
      },
      {
        title: "Proof",
        goals:
          "Tampilkan testimoni pelanggan yang spesifik dan terverifikasi. Prioritaskan testimoni yang menyebutkan hasil konkret (angka, timeframe). Minimal 2-3 testimoni dari persona yang berbeda untuk menunjukkan bukti yang beragam.",
        frameworkPosition: "Proof",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "Benefits",
        goals:
          "Daftarkan benefit utama dalam format icon list yang clean. Setiap benefit harus menjawab 'so what?' — bukan fitur, tapi dampak nyata. Gunakan kata kerja aksi: 'Hemat 5 jam per minggu', bukan 'Fitur otomasi'.",
        frameworkPosition: "Benefits",
        defaultLayout: "icon_list",
      },
      {
        title: "Scarcity",
        goals:
          "Tampilkan elemen kelangkaan yang genuine: kuota terbatas, harga promo yang berakhir, atau bonus eksklusif. Gunakan visual harga coret (harga normal → harga promo) dengan badge diskon yang eye-catching. HARUS honest — jangan fake scarcity.",
        frameworkPosition: "Scarcity",
        defaultLayout: "promo_coretan",
      },
      {
        title: "Action",
        goals:
          "CTA utama dengan offer card yang prominent: harga, fitur inklusi, dan tombol beli. Ini adalah CTA pertama — untuk pembaca yang sudah yakin dan siap beli sekarang.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
      {
        title: "Warn",
        goals:
          "Untuk pembaca yang masih ragu — tunjukkan konsekuensi jika mereka TIDAK bertindak. Bukan menakut-nakuti, tapi membuat mereka sadar opportunity cost dari inaction. Gunakan bahasa yang tegas dan empatik.",
        frameworkPosition: "Warn",
        defaultLayout: "typographic",
      },
      {
        title: "Now",
        goals:
          "CTA final dengan urgency maksimal. Ulangi offer secara ringkas, tekankan bahwa sekarang adalah waktu terbaik, dan berikan satu alasan kuat terakhir untuk bertindak SEKARANG. Garansi sebagai safety net terakhir.",
        frameworkPosition: "Now",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "idca",
    name: "IDCA",
    tier: "specialized",
    description: "Interest-Desire-Conviction-Action post-ad framework",
    bestCase:
      "Post-ad landing pages, retargeting, email click-throughs, paid traffic",
    context:
      "IDCA (Interest → Desire → Conviction → Action) adalah AIDA tanpa Attention — karena attention sudah di-capture oleh iklan, email, atau referral yang membawa mereka ke halaman ini. Framework ini langsung mulai dari Interest karena pembaca sudah tahu context-nya. PENTING: jangan ulangi headline iklan — perluas dan perdalam pesan yang sudah mereka lihat. Konsistensi pesan antara sumber traffic (iklan/email) dan landing page ini sangat krusial — mismatch = bounce rate tinggi.",
    sectionCount: 4,
    sections: [
      {
        title: "Interest",
        goals:
          "Langsung engage — audience sudah tahu context dari iklan yang mereka klik. Jangan ulangi headline iklan, tapi perluas dengan 3-4 poin yang memperdalam interest. Konsisten dengan pesan iklan sumber traffic.",
        frameworkPosition: "Interest",
        defaultLayout: "feature_grid",
      },
      {
        title: "Desire",
        goals:
          "Eskalasi dari 'menarik' ke 'gue mau ini'. Gambarkan outcome spesifik yang bisa dicapai. Gunakan narasi yang menghubungkan fitur produk dengan keinginan mendalam audience — status, kenyamanan, keamanan, atau kebebasan.",
        frameworkPosition: "Desire",
        defaultLayout: "story_based",
      },
      {
        title: "Conviction",
        goals:
          "Hilangkan keraguan terakhir dengan proof + risk reversal. Tampilkan testimoni yang relevan dan garansi yang kuat. Untuk retargeting traffic, mereka butuh sedikit dorongan tambahan — conviction adalah dorongan itu.",
        frameworkPosition: "Conviction",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "Action",
        goals:
          "CTA langsung tanpa banyak basa-basi — mereka sudah hampir siap. Tampilkan harga, tombol beli, dan satu reminder singkat tentang benefit utama atau garansi. Keep it clean dan frictionless.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "slap",
    name: "SLAP",
    tier: "specialized",
    description: "Stop-Look-Act-Purchase impulse buying framework",
    bestCase:
      "Low-cost impulse buys, flash sales, daily deals, Groupon-style offers",
    context:
      "SLAP (Stop → Look → Act → Purchase) adalah framework impulse buying untuk produk low-cost dan flash sales. Setiap section harus CEPAT dan HIGH IMPACT — pembeli impulsif tidak baca panjang-panjang. STOP = visual striking + headline bold, LOOK = tahan perhatian beberapa detik kritis, ACT = picu aksi dengan deal irresistible dan urgency, PURCHASE = selesaikan transaksi tanpa friction. Kunci: semuanya harus bisa di-consume dalam hitungan detik, bukan menit. Copy pendek, visual kuat, harga menonjol, CTA impossible to miss.",
    sectionCount: 4,
    sections: [
      {
        title: "Stop",
        goals:
          "Hentikan scroll dengan visual yang striking dan headline yang bold. Untuk impulse buy, first impression adalah segalanya — gunakan warna kontras, gambar produk yang eye-catching, dan satu kalimat yang membuat berhenti.",
        frameworkPosition: "Stop",
        defaultLayout: "standard_image",
      },
      {
        title: "Look",
        goals:
          "Tahan perhatian selama beberapa detik kritis. Tampilkan produk dari angle terbaik bersama 2-3 selling point utama. Fokus pada visual dan copy yang snappy — pembeli impulsif tidak baca panjang-panjang.",
        frameworkPosition: "Look",
        defaultLayout: "split_screen",
      },
      {
        title: "Act",
        goals:
          "Picu aksi cepat dengan deal yang irresistible. Tampilkan harga normal dicoret + harga promo besar + badge diskon. Tambahkan urgency: 'Hari ini saja' atau 'Stok terbatas'. Untuk impulse buy, harga dan diskon adalah segalanya.",
        frameworkPosition: "Act",
        defaultLayout: "promo_coretan",
      },
      {
        title: "Purchase",
        goals:
          "Selesaikan transaksi dengan CTA yang clear. Tombol beli yang besar dan dominant. Tambahkan micro-copy: 'Gratis ongkir', 'Garansi 30 hari', atau 'Bayar nanti'. Eliminasi semua friction — 1-click purchase mindset.",
        frameworkPosition: "Purchase",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "6-plus-1",
    name: "6+1 Formula",
    tier: "specialized",
    description: "Six elements plus credibility throughout",
    bestCase:
      "Cold traffic, new brands, trust-first selling, loss aversion driven",
    context:
      "Formula 6+1 adalah framework trust-first dengan 6 elemen utama + kredibilitas yang ditanam di SELURUH halaman (bukan hanya satu section). Alurnya: Context (kenapa mereka di sini) → Attention (hook) → Desire (keinginan) → The Gap (apa yang dipertaruhkan jika tidak bertindak) → Solution (produk) → CTA. Yang '+1' adalah KREDIBILITAS — yang harus hadir di setiap section: testimoni kecil, logo trust, data pendukung, atau social proof. Untuk brand baru dan cold traffic, kepercayaan harus dibangun dari setiap sudut halaman, bukan hanya satu section.",
    sectionCount: 6,
    sections: [
      {
        title: "Context",
        goals:
          "Jawab pertanyaan 'Kenapa gue lihat halaman ini sekarang?' Berikan konteks yang relevan — tren industri, perubahan yang terjadi, atau situasi yang membuat produk ini timely. Buat pembaca merasa ada alasan mereka menemukan halaman ini.",
        frameworkPosition: "Context",
        defaultLayout: "typographic",
      },
      {
        title: "Attention",
        goals:
          "Setelah konteks jelas, hook perhatian dengan visual kuat dan headline yang menjanjikan solusi. Gunakan gambar hero yang relevan. Untuk brand baru, kredibilitas visual (desain profesional) = first trust signal.",
        frameworkPosition: "Attention",
        defaultLayout: "standard_image",
      },
      {
        title: "Desire",
        goals:
          "Bangun keinginan dengan menampilkan apa yang bisa mereka capai. Gunakan narasi yang aspiratif tapi achievable. Untuk cold traffic, desire harus concrete dan believable — jangan overclaim.",
        frameworkPosition: "Desire",
        defaultLayout: "story_based",
      },
      {
        title: "The Gap",
        goals:
          "Tunjukkan 'gap' antara posisi mereka sekarang dan kondisi yang diinginkan. Perjelas apa yang terjadi jika mereka TIDAK bertindak — bukan ancaman, tapi awareness tentang opportunity cost. Loss aversion is powerful.",
        frameworkPosition: "The Gap",
        defaultLayout: "before_after",
      },
      {
        title: "Solution",
        goals:
          "Presentasikan produk sebagai jembatan yang menutup 'gap'. Tampilkan produk secara visual di satu sisi dan manfaat utama di sisi lain. Jelaskan mekanisme: BAGAIMANA produk ini menyelesaikan masalah secara konkret.",
        frameworkPosition: "Solution",
        defaultLayout: "split_screen",
      },
      {
        title: "CTA",
        goals:
          "Untuk brand baru/cold traffic, CTA harus low-risk: free trial, konsultasi gratis, atau garansi uang kembali. Tampilkan harga dengan penawaran introductory. Tekankan bahwa langkah pertama ini aman dan mudah.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "crossroads",
    name: "Crossroads",
    tier: "specialized",
    description: "Old vs New way comparison framework",
    bestCase:
      "SaaS pages, B2B, comparison/upgrade offers, competitor positioning",
    context:
      "Crossroads adalah framework perbandingan yang memposisikan produk sebagai 'jalan baru' vs 'cara lama' yang sudah usang. Alurnya: gambarkan Old Way yang menyakitkan → perkenalkan New Way yang menyegarkan → bandingkan outcomes secara langsung → CTA. Framework ini sangat efektif untuk disruptor, SaaS pengganti tools lama, atau upgrade dari metode manual ke otomatis. Kunci: kontras harus TAJAM dan VISUAL — pembaca harus langsung melihat Old Way sebagai pilihan yang inferior. Jangan subtle — be bold tentang kenapa cara lama sudah tidak relevan.",
    sectionCount: 4,
    sections: [
      {
        title: "The Old Way",
        goals:
          "Deskripsikan cara lama yang menyakitkan — proses manual, tools yang outdated, atau metode yang tidak efisien. Gunakan bahasa yang membuat pembaca merasakan frustrasi status quo. Jadikan 'Old Way' terasa melelahkan dan tidak sustainable.",
        frameworkPosition: "The Old Way",
        defaultLayout: "typographic",
      },
      {
        title: "The New Way",
        goals:
          "Perkenalkan produkmu sebagai 'New Way' yang secara fundamental berbeda. Tampilkan produk secara visual bersamaan dengan penjelasan pendekatan baru. Kontras harus jelas: Old Way = painful, New Way = empowering.",
        frameworkPosition: "The New Way",
        defaultLayout: "split_screen",
      },
      {
        title: "Contrast Outcomes",
        goals:
          "Tampilkan perbandingan langsung: fitur vs fitur, hasil vs hasil, waktu vs waktu. Gunakan tabel atau kolom perbandingan dengan check/cross marks. Buat perbedaannya visual dan undeniable — pembaca harus langsung lihat mana yang lebih baik.",
        frameworkPosition: "Contrast Outcomes",
        defaultLayout: "comparison_table",
      },
      {
        title: "CTA",
        goals:
          "Framing: 'Pilihan ada di tangan kamu — Old Way atau New Way?' Buat CTA yang memposisikan pembelian sebagai pilihan cerdas, bukan pengeluaran. Tampilkan harga dengan konteks value: berapa yang mereka hemat/hasilkan.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  {
    id: "string-of-pearls",
    name: "String of Pearls",
    tier: "specialized",
    description: "Multiple proof points stacking framework",
    bestCase:
      "Testimonial-heavy pages, bullet-heavy sales pages, social proof stacking",
    context:
      "String of Pearls adalah framework proof-stacking: setelah hook, tampilkan beberapa 'pearl' (bukti) yang semakin menumpuk sampai conviction tak terbantahkan. Setiap Pearl adalah jenis bukti yang BERBEDA: bisa testimoni, data statistik, studi kasus, atau endorsement. Kekuatan framework ini bukan dari satu bukti yang kuat, tapi dari AKUMULASI bukti yang beragam — quantity AND variety of proof. Di akhir, pembaca harus merasa: 'Dengan sebanyak ini buktinya, ini pasti legit.' PENTING: variasikan format setiap Pearl agar tidak monoton.",
    sectionCount: 5,
    sections: [
      {
        title: "Hook",
        goals:
          "Set the stage: kenapa social proof penting untuk produk ini. Gunakan headline yang mengundang curiosity tentang apa yang orang lain alami. Tampilkan visual yang menarik dan hint bahwa buktinya overwhelming.",
        frameworkPosition: "Hook",
        defaultLayout: "standard_image",
      },
      {
        title: "Pearl 1",
        goals:
          "Bukti pertama dan paling kuat — tampilkan testimoni pelanggan dengan kutipan, nama, dan hasil konkret. Ini adalah 'pearl' yang paling impactful, jadi pilih testimoni terbaik. Sertakan foto atau detail yang memverifikasi.",
        frameworkPosition: "Pearl 1",
        defaultLayout: "quote_testimonial",
      },
      {
        title: "Pearl 2",
        goals:
          "Bukti kedua dengan pendekatan berbeda — gunakan angka dan data: statistik pengguna, persentase peningkatan, jumlah pelanggan. Variasi format dari Pearl 1 agar halaman tidak monoton. Data numerik menambah kredibilitas.",
        frameworkPosition: "Pearl 2",
        defaultLayout: "stat_counter",
      },
      {
        title: "Pearl 3",
        goals:
          "Bukti ketiga — bisa berupa studi kasus mini, cerita sukses pelanggan, atau narasi transformasi. Format naratif memberi kedalaman emosional setelah Pearl 1 (quote) dan Pearl 2 (angka). Tiga jenis bukti = conviction kuat.",
        frameworkPosition: "Pearl 3",
        defaultLayout: "story_based",
      },
      {
        title: "CTA",
        goals:
          "Setelah 3 bukti yang menumpuk, conversion harusnya natural. CTA framing: 'Bergabung dengan [jumlah] orang yang sudah membuktikan.' Tampilkan offer, harga, dan reminder bahwa buktinya sudah jelas.",
        frameworkPosition: "Action",
        defaultLayout: "single_offer",
      },
    ],
  },

  // Tier 5: Custom
  {
    id: "custom",
    name: "Custom",
    tier: "custom",
    description: "Blank canvas for experienced copywriters",
    bestCase:
      "Experienced copywriters, unique/hybrid structures",
    sectionCount: 0,
    sections: [],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a formula by its ID
 */
export function getFormulaById(id: string): Formula | undefined {
  return FORMULAS.find((formula) => formula.id === id);
}

/**
 * Get all formulas by tier
 */
export function getFormulasByTier(tier: FormulaTier): Formula[] {
  return FORMULAS.filter((formula) => formula.tier === tier);
}

/**
 * Get all formulas grouped by tier
 */
export function getFormulasGroupedByTier(): Record<FormulaTier, Formula[]> {
  const grouped: Record<FormulaTier, Formula[]> = {
    foundational: [],
    comprehensive: [],
    modern: [],
    specialized: [],
    custom: [],
  };

  FORMULAS.forEach((formula) => {
    grouped[formula.tier].push(formula);
  });

  return grouped;
}

/**
 * Get tier info by ID
 */
export function getTierInfoById(id: string): FormulaTierInfo | undefined {
  return FORMULA_TIERS.find((tier) => tier.id === id);
}

/**
 * Get total section count for a formula
 */
export function getTotalSectionCount(formula: Formula): number {
  return formula.sections.length;
}

/**
 * Validate a formula's section count matches its data
 */
export function validateFormula(formula: Formula): boolean {
  return formula.sectionCount === formula.sections.length;
}

/**
 * Get all formulas (non-custom)
 */
export function getAllCoreFormulas(): Formula[] {
  return FORMULAS.filter((f) => f.tier !== "custom");
}

/**
 * Get custom formula
 */
export function getCustomFormula(): Formula | undefined {
  return getFormulaById("custom");
}

/**
 * Get tier label by tier ID
 */
export function getTierLabel(tierId: FormulaTier): string {
  const tierInfo = getTierInfoById(tierId);
  return tierInfo?.label || tierId;
}
