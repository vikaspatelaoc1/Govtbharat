import { MobileTabsConfig, MobilePwaCardConfig, AppBannerItem, BannerSliderConfig } from '../types';

export const DEFAULT_PWA_CARD_CONFIG: MobilePwaCardConfig = {
  // Job Card Dimensions (Mobile PWA)
  cardWidthPercent: 100,
  cardCustomMaxWidth: 0, // 0 = fluid 100%
  cardHeightMode: 'auto',
  cardMinHeight: 74,
  cardPaddingY: 8,
  cardPaddingX: 12,
  cardBorderRadius: 12,

  // Job Card Icon Dimensions (Mobile PWA)
  showCardIcon: false,
  iconContainerWidth: 34,
  iconContainerHeight: 34,
  iconGraphicSize: 18,
  iconShape: 'squircle',
  iconBgStyle: 'brand',

  // Column Card & Header Icon
  columnCardWidthPercent: 100,
  columnHeaderIconWidth: 28,
  columnHeaderIconHeight: 28,
  columnBorderRadius: 16,

  // Font sizes
  cardTitleFontSize: 14,
  cardMetaFontSize: 11
};

export const DEFAULT_BANNER_SLIDER_CONFIG: BannerSliderConfig = {
  autoSlide: true,
  slideIntervalMs: 4500,
  showDots: true,
  showArrows: true,
  pauseOnHover: true,
  transitionSpeed: 'smooth'
};

export const DEFAULT_TRENDING_BANNERS: AppBannerItem[] = [
  {
    id: 'ssc-chsl',
    title: 'SSC 10+2 CHSL Apply Online',
    subtitle: 'Staff Selection Commission Combined Higher Secondary Level (10+2) Examination 2026',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#7db61a] via-[#85b822] to-[#8c1328]',
    readMoreColor: 'text-[#8c1328]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'latest-jobs',
    boardText: 'इतिहास',
    illustrationType: 'classroom',
    enabled: true,
    order: 1
  },
  {
    id: 'railway-alp',
    title: 'Railway RRB ALP & Technician Online Form',
    subtitle: 'Ministry of Railways Recruitment Board 18,799+ Vacancies Apply Online',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#ea580c] via-[#f97316] to-[#991b1b]',
    readMoreColor: 'text-[#991b1b]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'latest-jobs',
    boardText: 'भूगोल',
    illustrationType: 'classroom',
    enabled: true,
    order: 2
  },
  {
    id: 'upsc-civil',
    title: 'UPSC Civil Services Pre 2026 Apply',
    subtitle: 'Union Public Service Commission IAS / IFS Examination Online Application',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#0284c7] via-[#0369a1] to-[#1e1b4b]',
    readMoreColor: 'text-[#0369a1]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'latest-jobs',
    boardText: 'संविधान',
    illustrationType: 'classroom',
    enabled: true,
    order: 3
  },
  {
    id: 'up-police',
    title: 'UP Police Constable Exam City / Admit Card',
    subtitle: 'Uttar Pradesh Police Recruitment & Promotion Board 60,244 Posts',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#10b981] via-[#059669] to-[#881337]',
    readMoreColor: 'text-[#881337]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'admit-cards',
    boardText: 'गणित',
    illustrationType: 'classroom',
    enabled: true,
    order: 4
  },
  {
    id: 'neet-jee',
    title: 'NTA NEET UG & JEE Main 2026 Registration',
    subtitle: 'National Testing Agency Medical & Engineering Entrance Exam Online Form',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#e11d48] via-[#be123c] to-[#4c0519]',
    readMoreColor: 'text-[#be123c]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'admission',
    boardText: 'विज्ञान',
    illustrationType: 'classroom',
    enabled: true,
    order: 5
  },
  {
    id: 'ibps-po',
    title: 'IBPS PO / Clerk Recruitment Form',
    subtitle: 'Institute of Banking Personnel Selection Common Recruitment Process',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#854d0e] via-[#ca8a04] to-[#7f1d1d]',
    readMoreColor: 'text-[#7f1d1d]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'latest-jobs',
    boardText: 'तर्कशक्ति',
    illustrationType: 'classroom',
    enabled: true,
    order: 6
  },
  {
    id: 'ctet-exam',
    title: 'CBSE CTET 2026 Online Application Form',
    subtitle: 'Central Board of Secondary Education Teacher Eligibility Test',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#4338ca] via-[#6366f1] to-[#831843]',
    readMoreColor: 'text-[#4338ca]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'latest-jobs',
    boardText: 'शिक्षा',
    illustrationType: 'classroom',
    enabled: true,
    order: 7
  },
  {
    id: 'bihar-police',
    title: 'Bihar Police CSBC Constable Result & Cutoff',
    subtitle: 'Central Selection Board of Constable Bihar Police Exam Results Released',
    badgeText: 'TOP ALERT',
    badgeColor: 'bg-white/20 text-white',
    gradient: 'from-[#059669] via-[#10b981] to-[#1e3a8a]',
    readMoreColor: 'text-[#059669]',
    buttonText: 'Read More',
    targetType: 'category',
    category: 'results',
    boardText: 'हिन्दी',
    illustrationType: 'classroom',
    enabled: true,
    order: 8
  }
];

export const DEFAULT_MOBILE_TABS_CONFIG: MobileTabsConfig = {
  toolsSectionTitle: 'Tools',
  categorySectionTitle: 'Category Wise Updates',
  pwaCardConfig: DEFAULT_PWA_CARD_CONFIG,
  bannerSliderConfig: DEFAULT_BANNER_SLIDER_CONFIG,
  banners: DEFAULT_TRENDING_BANNERS,
  tools: [
    {
      id: 'image-resizer',
      title: 'IMAGE RESIZER',
      subtitle: 'Resize Photo & Signature for SSC, UPSC & Police',
      badge: '100% FREE',
      badgeColor: 'bg-amber-500 text-black',
      icon: 'image-resizer',
      gradient: 'from-[#8c1328] via-[#a61935] to-[#590b19]',
      accentColor: '#8c1328',
      enabled: true,
      order: 1,
      category: 'Photo & Docs',
      description: 'Online instant image resizer specially tailored for Government Job application forms (SSC CGL/CHSL, UPSC CSE, RRB NTPC, State Police, Banking). Easily compress and resize your passport photo and signature to exact pixel dimensions (Width x Height) and required file size (under 20KB, 50KB, or 100KB) without losing quality.',
      examSpecs: [
        'SSC (CGL, CHSL, MTS, GD): Photo 20 KB to 50 KB (3.5 cm x 4.5 cm), Sign 10 KB to 20 KB',
        'UPSC (Civil Services, NDA, CDS): Photo 20 KB to 300 KB (Min 350x350 px), Sign 20 KB to 300 KB',
        'IBPS / SBI (PO, Clerk): Photo 20 KB to 50 KB (200x230 px), Sign 10 KB to 20 KB (140x60 px)',
        'Railway (RRB NTPC, ALP, Group D): Photo 15 KB to 40 KB, Sign 10 KB to 20 KB',
        'Police & State PSC (UP Police, BPSC, MPPSC): Photo 20 KB to 50 KB, Sign 10 KB to 20 KB'
      ],
      howToUse: [
        'Step 1: Upload your passport size photo or scanned signature.',
        'Step 2: Choose an official exam preset (e.g. SSC, UPSC, IBPS) or enter custom width, height, and target KB.',
        'Step 3: Click "Resize & Compress" to generate the output instantly in your browser.',
        'Step 4: Download the final high-clarity JPG/PNG file and directly upload to your application portal.'
      ],
      features: [
        '100% Secure & Client-Side: Your photos are processed right in your browser, never uploaded to external servers',
        'Pre-configured presets for all major central and state recruitment boards',
        'Precise KB limiter to guarantee file size compliance without blurriness',
        'Instant download with one click'
      ]
    },
    {
      id: 'remove-bg',
      title: 'REMOVE IMAGE BACKGROUND',
      subtitle: '100% Automatic White & Light Blue Passport BG',
      badge: 'AUTO & FREE',
      badgeColor: 'bg-emerald-500 text-slate-950',
      icon: 'bg-remover',
      gradient: 'from-[#0B1120] via-[#162238] to-[#0f172a]',
      accentColor: '#38bdf8',
      enabled: true,
      order: 2,
      category: 'Photo & Docs',
      description: 'Clean official passport background editor for government examination forms. Most recruitment boards strictly reject photos with busy, dark, or outdoor backgrounds. Use this tool to get a crisp, clean plain white, light blue, or off-white background as required by official guidelines.',
      examSpecs: [
        'White Background: Mandatory for SSC, UPSC, NTA JEE/NEET, CUET & CDS',
        'Light Sky Blue Background: Accepted by State PSCs, RRB & Police recruitment boards',
        'Uniform Lighting: Both ears and shoulders must be clearly visible without shadows'
      ],
      howToUse: [
        'Step 1: Choose or snap your photo with clear facial lighting.',
        'Step 2: Choose background replacement: Plain White (#FFFFFF), Sky Blue (#E0F2FE), or Transparent PNG.',
        'Step 3: Preview the official passport crop.',
        'Step 4: Download in full HD resolution.'
      ],
      features: [
        'Automatic edge detection and clean silhouette clipping',
        'Official white and light blue solid color fills',
        'Zero watermark, zero sign-in required',
        'Optimized for instant form upload'
      ]
    },
    {
      id: 'pdf-portal',
      title: 'PDF PORTAL',
      subtitle: 'Merge, Split, Compress & All PDF Related Work',
      badge: 'ALL-IN-ONE',
      badgeColor: 'bg-rose-500 text-white',
      icon: 'pdf-portal',
      gradient: 'from-[#991b1b] via-[#b91c1c] to-[#7f1d1d]',
      accentColor: '#ef4444',
      enabled: true,
      order: 3,
      category: 'Documents',
      description: 'Complete PDF utility suite for exam candidates. Online applications often require merging 10th/12th marksheets, caste certificates, domicile, and photo ID into a single PDF under 200KB or 500KB. Our PDF portal helps you compress, merge, split, and convert images to PDF seamlessly.',
      examSpecs: [
        'Max File Size for SSC/UPSC Certificates: Usually 200 KB to 500 KB per document',
        'Format: Unprotected PDF, all pages readable in vertical orientation',
        'Resolution: 100 to 200 DPI grayscale or color scans'
      ],
      howToUse: [
        'Step 1: Select the PDF action (Merge multiple PDFs, Compress PDF, or Image to PDF).',
        'Step 2: Select your certificate documents from your device.',
        'Step 3: Adjust target size (e.g. Under 200 KB) and click Process.',
        'Step 4: Download your optimized official PDF.'
      ],
      features: [
        'Fast browser-based processing with high security',
        'Compress high-res scans down to required 150KB - 300KB limits',
        'Convert camera JPG photos directly into standard A4 PDF documents',
        'No watermarks or quality degradation'
      ]
    },
    {
      id: 'marital-biodata',
      title: 'MARITAL DATA MAKER',
      subtitle: 'Shaadi & Job Biodata Maker 100% Free',
      badge: 'PREMIUM',
      badgeColor: 'bg-amber-400 text-amber-950',
      icon: 'biodata-maker',
      gradient: 'from-[#b45309] via-[#d97706] to-[#78350f]',
      accentColor: '#f59e0b',
      enabled: true,
      order: 4,
      category: 'Biodata & Resume',
      description: 'Professional Biodata generator for Marriage (Shaadi Biodata) as well as Govt/Private Job applications. Create elegant, cultured, and beautifully formatted Hindi & English biodatas with traditional religious symbols (Om, Swastik, Ganesh, Bismillah) or modern clean corporate layouts in under 2 minutes.',
      examSpecs: [
        'Supports Hindi, English, and Hinglish fonts',
        'Sections for Personal Details, Physical Attributes, Astrological/Kundli, Education, Occupation, and Family Background',
        'Ready for direct WhatsApp sharing, printing, or PDF saving'
      ],
      howToUse: [
        'Step 1: Fill in candidate details (Name, Date of Birth, Height, Education, Job/Post, Family).',
        'Step 2: Optionally upload a passport or full portrait photo.',
        'Step 3: Choose your preferred layout (Traditional Gold Frame, Royal Maroon, or Modern Clean).',
        'Step 4: Click Print / Download PDF to get a print-ready document.'
      ],
      features: [
        'Pre-written cultural and respectful template wording',
        'Instant live preview while typing',
        'One-click Print and WhatsApp share format',
        '100% free with unlimited edits'
      ]
    },
    {
      id: 'name-date-photo',
      title: 'NAME & DATE ON PHOTO',
      subtitle: 'Photo par Name aur Date (DOP) Online Likhe',
      badge: 'EXAM MUST',
      badgeColor: 'bg-red-600 text-white',
      icon: 'name-date',
      gradient: 'from-[#431407] via-[#7c2d12] to-[#270c04]',
      accentColor: '#ea580c',
      enabled: true,
      order: 5,
      category: 'Photo & Docs',
      description: 'Mandatory tool for SSC, Railway, State Police and PSC exams where candidates are strictly required to have their full name and Date of Photo (DOP) printed on a clean white strip at the bottom of their passport photograph. Submitting a photo without DOP often leads to application rejection.',
      examSpecs: [
        'SSC Rule: Date of Photo must not be more than 3 months older from notification date',
        'Layout: Crisp white rectangular strip at bottom of photograph with bold black typography',
        'Format: Name on first line, DOP (e.g. DOP: 14/09/2026) on second line'
      ],
      howToUse: [
        'Step 1: Upload your passport size photo.',
        'Step 2: Type your Candidate Name (in capital letters) as per 10th marksheet.',
        'Step 3: Select the Date of Photo (defaults to today or recent date).',
        'Step 4: See the real-time canvas preview and click "Download Official Exam Photo".'
      ],
      features: [
        'Exact standard white strip height (20% of photo bottom) matching official commission rules',
        'High contrast bold black sans-serif font for 100% machine-readable clarity',
        'Auto-scales to standard 3.5cm x 4.5cm / 350x450px aspect ratio',
        'Direct download with zero compression artifacts'
      ]
    },
    {
      id: 'age-calculator',
      title: 'AGE CALCULATOR',
      subtitle: 'Calculate Exact Age as per Exam Cutoff Date',
      badge: 'ACCURATE',
      badgeColor: 'bg-emerald-600 text-white',
      icon: 'age-calculator',
      gradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
      accentColor: '#10b981',
      enabled: true,
      order: 6,
      category: 'Exam Tools',
      description: 'Government notifications specify age limits calculated as of a specific date (e.g., "Age as on 01/08/2026: 18 to 27 years"). This tool calculates your exact age in years, months, and days, and checks if you qualify within general or reserved category relaxations.',
      examSpecs: [
        'SSC / UPSC: Age as on 1st August or 1st January of notification year',
        'Age Relaxation: OBC (+3 Years), SC/ST (+5 Years), PwD (+10 Years)'
      ],
      howToUse: [
        'Step 1: Enter your Date of Birth (DOB).',
        'Step 2: Enter the notification target cutoff date.',
        'Step 3: Instant result displays exact Years, Months, Days, and total days lived.'
      ],
      features: [
        'Millisecond precision calculation',
        'Next birthday countdown',
        'Category-wise eligibility check'
      ]
    },
    {
      id: 'typing-speed-test',
      title: 'TYPING TEST PORTAL',
      subtitle: 'Practice Hindi & English Typing for SSC / HC',
      badge: 'LIVE TEST',
      badgeColor: 'bg-indigo-500 text-white',
      icon: 'typing-test',
      gradient: 'from-[#1e1b4b] via-[#312e81] to-[#0f172a]',
      accentColor: '#6366f1',
      enabled: true,
      order: 7,
      category: 'Exam Tools',
      description: 'Real-time typing test simulator designed according to SSC CGL, CHSL (DEO/LDC), High Court Steno, and State Clerk exam standards. Practice with official exam passages with real-time Gross WPM, Net WPM, and Accuracy tracking.',
      examSpecs: [
        'SSC CHSL LDC: 35 WPM English or 30 WPM Hindi (Mangal / Krutidev font)',
        'SSC CGL DEO: 27 WPM (8000 key depressions per hour)',
        'Court Stenographer: 40-50 WPM accuracy requirement'
      ],
      howToUse: [
        'Step 1: Select test duration (1 min, 5 min, 10 min, or 15 min).',
        'Step 2: Start typing the prompt text in the typing area.',
        'Step 3: View instant live WPM, error count, and final percentage accuracy report.'
      ],
      features: [
        'Supports standard keyboard layouts and backspace restriction option',
        'Accurate calculation of keystrokes and net word count',
        'Official passage difficulty ratings'
      ]
    }
  ],
  categoryButtons: [
    {
      id: 'cat-ssc',
      label: 'SSC',
      color: '#8c1328', // GovtBharat Signature Maroon
      textColor: '#ffffff',
      filterKey: 'SSC',
      enabled: true,
      order: 1
    },
    {
      id: 'cat-railway',
      label: 'Railway',
      color: '#16a34a', // Vivid Emerald Green
      textColor: '#ffffff',
      filterKey: 'Railway',
      enabled: true,
      order: 2
    },
    {
      id: 'cat-upsc',
      label: 'UPSC',
      color: '#15803d', // Dark Forest Green
      textColor: '#ffffff',
      filterKey: 'UPSC',
      enabled: true,
      order: 3
    },
    {
      id: 'cat-police',
      label: 'Police',
      color: '#7c3aed', // Electric Violet
      textColor: '#ffffff',
      filterKey: 'Police',
      enabled: true,
      order: 4
    },
    {
      id: 'cat-banking',
      label: 'Banking',
      color: '#0284c7', // Ocean Sky Blue
      textColor: '#ffffff',
      filterKey: 'Banking',
      enabled: true,
      order: 5
    },
    {
      id: 'cat-teaching',
      label: 'Teaching',
      color: '#d97706', // Amber Gold
      textColor: '#ffffff',
      filterKey: 'Teaching',
      enabled: true,
      order: 6
    },
    {
      id: 'cat-defence',
      label: 'Defence',
      color: '#047857', // Army Emerald
      textColor: '#ffffff',
      filterKey: 'Defence',
      enabled: true,
      order: 7
    },
    {
      id: 'cat-state-psc',
      label: 'State PSC',
      color: '#c026d3', // Fuchsia
      textColor: '#ffffff',
      filterKey: 'State PSC',
      enabled: true,
      order: 8
    }
  ]
};

const STORAGE_KEY = 'GovtBharat_mobile_tabs_config_v1';

export function loadMobileTabsConfig(): MobileTabsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tools) && Array.isArray(parsed.categoryButtons)) {
        return {
          ...DEFAULT_MOBILE_TABS_CONFIG,
          ...parsed,
          banners: Array.isArray(parsed.banners) && parsed.banners.length > 0 
            ? parsed.banners 
            : DEFAULT_TRENDING_BANNERS,
          bannerSliderConfig: {
            ...DEFAULT_BANNER_SLIDER_CONFIG,
            ...(parsed.bannerSliderConfig || {})
          },
          pwaCardConfig: {
            ...DEFAULT_PWA_CARD_CONFIG,
            ...(parsed.pwaCardConfig || {})
          }
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse mobile tabs config from local storage', e);
  }
  return DEFAULT_MOBILE_TABS_CONFIG;
}

export function saveMobileTabsConfigToLocal(config: MobileTabsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save mobile tabs config to local storage', e);
  }
}
