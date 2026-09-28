export interface WebsiteCustomColorConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColorLight: string;
  backgroundColorDark: string;
  headerColor: string;
  headerTextColor: string;
  footerColor: string;
  footerTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;
  textColorLight: string;
  textColorDark: string;
  headingColorLight: string;
  headingColorDark: string;
  borderColorLight: string;
  borderColorDark: string;
  cardColorLight: string;
  cardColorDark: string;
  menuNavbarColor: string;
  linkColor: string;
  activeStateColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
}

export const STANDARD_JOB_LINK_FONT_SIZE = 14.5;
export const STANDARD_JOB_LINK_FONT_SIZE_MOBILE = 13;
export const STANDARD_JOB_LINK_FONT_WEIGHT: '500' | '600' | '700' | '800' = '600';
export const STANDARD_JOB_LINK_LINE_HEIGHT = '1.4';

export interface WebsiteTypographyConfig {
  fontFamily: string;
  headingFontFamily: string;
  fontSizeScale: number; // percentage, e.g. 100
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: string; // e.g. '1.5', '1.6', '1.7'
  letterSpacing: string; // e.g. '0px', '-0.02em', '0.03em'
  textTransform: 'none' | 'uppercase' | 'capitalize';
  // Job links specific font size control
  jobLinkFontSize?: number; // in px, e.g. 16 (Standard desktop font size)
  jobLinkFontSizeMobile?: number; // in px, e.g. 15 (Standard mobile font size)
  jobLinkFontWeight?: '500' | '600' | '700' | '800'; // Standard '700'
  jobLinkLineHeight?: string; // Standard '1.45'
}

export interface WebsiteLayoutConfig {
  containerMaxWidth: string; // '1280px' | '1440px' | '1600px' | '100%'
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  cardBorderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  columnGridColumns: 2 | 3 | 4;
  mobileColumnLayout?: '1-col' | '2-col'; // Support for 2 columns on mobile
  cardBorderWidth: string; // '0px' | '1px' | '2px'
}

export interface CustomNavLinkItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  enabled: boolean;
  isExternal?: boolean;
}

export interface WebsiteHeaderConfig {
  portalTitle: string;
  portalTagline: string;
  domainName?: string; // e.g. GovtBharat.info
  logoUrl: string;
  logoSize: number; // in px e.g. 36
  headerHeight: number; // in px e.g. 64
  stickyHeader: boolean;
  showSearch: boolean;
  showThemeToggle: boolean;
  showSocialBar: boolean;
  customNavLinks: CustomNavLinkItem[];
}

export interface WebsiteFooterConfig {
  footerLogo: string;
  footerTitle: string;
  footerDescription: string;
  copyrightText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  showSocialIcons: boolean;
  showSubscribeButton: boolean;
  disclaimerText: string;
}

export interface WebsiteSectionItem {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  background: 'default' | 'card' | 'gradient' | 'highlight';
  customBgColor?: string;
  paddingY: 'none' | 'sm' | 'md' | 'lg';
  hideOnMobile?: boolean;
}

export interface WebsiteMediaConfig {
  faviconUrl: string;
  heroBannerUrl: string;
  heroBannerLink: string;
  promotionalBannerUrl: string;
  promotionalBannerLink: string;
  showHeroBanner: boolean;
  showPromoBanner: boolean;
}

export interface WebsiteContentConfig {
  heroWelcomeTitle: string;
  heroWelcomeSubtitle: string;
  searchPlaceholder: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  marqueeHeadline: string;
  badgeHotText: string;
}

export interface WebsiteSeoConfig {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface WebsiteVersionSnapshot {
  id: string;
  timestamp: string;
  author: string;
  label: string;
  configSnapshot: WebsiteControlConfig;
}

export interface WebsiteControlConfig {
  colors: WebsiteCustomColorConfig;
  typography: WebsiteTypographyConfig;
  layout: WebsiteLayoutConfig;
  header: WebsiteHeaderConfig;
  footer: WebsiteFooterConfig;
  sections: WebsiteSectionItem[];
  media: WebsiteMediaConfig;
  content: WebsiteContentConfig;
  seo?: WebsiteSeoConfig;
  versionHistory?: WebsiteVersionSnapshot[];
  lastUpdated?: string;
  lastUpdatedBy?: string;
}

export const DEFAULT_WEBSITE_SECTIONS: WebsiteSectionItem[] = [
  {
    id: 'sec-marquee',
    key: 'marquee',
    name: '📢 Breaking News Marquee',
    description: 'Top flash headline banner with live alerts ticker',
    enabled: true,
    order: 1,
    background: 'default',
    paddingY: 'none'
  },
  {
    id: 'sec-hero-banner',
    key: 'hero_banner',
    name: '🖼️ Hero Banner & Promotional Slider',
    description: 'Eye-catching graphic banner at the top of homepage',
    enabled: true,
    order: 2,
    background: 'default',
    paddingY: 'sm'
  },
  {
    id: 'sec-quick-cards',
    key: 'quick_cards',
    name: '⚡ Category Quick Cards Bar',
    description: '8-card quick access buttons with live vacancy count numbers',
    enabled: true,
    order: 3,
    background: 'default',
    paddingY: 'sm'
  },
  {
    id: 'sec-primary-cols',
    key: 'primary_columns',
    name: '📋 Main 3-Column Job Board (Results, Admit Card, Latest Jobs)',
    description: 'High-priority core recruitment feeds',
    enabled: true,
    order: 4,
    background: 'default',
    paddingY: 'md'
  },
  {
    id: 'sec-secondary-cols',
    key: 'secondary_columns',
    name: '📚 Secondary Columns (Answer Key, Syllabus, Admission, Important)',
    description: 'Curriculum, answer keys, certificates and official alerts',
    enabled: true,
    order: 5,
    background: 'default',
    paddingY: 'md'
  },
  {
    id: 'sec-faq',
    key: 'faq',
    name: '❓ Frequently Asked Questions (FAQ)',
    description: 'Interactive accordion for common candidate inquiries',
    enabled: true,
    order: 6,
    background: 'default',
    paddingY: 'lg'
  }
];

export const DEFAULT_WEBSITE_CONTROL_CONFIG: WebsiteControlConfig = {
  colors: {
    primaryColor: '#2563eb',
    secondaryColor: '#f59e0b',
    backgroundColorLight: '#f8fafc',
    backgroundColorDark: '#0b1120',
    headerColor: '#0f172a',
    headerTextColor: '#ffffff',
    footerColor: '#0b1120',
    footerTextColor: '#94a3b8',
    buttonColor: '#2563eb',
    buttonTextColor: '#ffffff',
    buttonHoverColor: '#1d4ed8',
    textColorLight: '#0f172a',
    textColorDark: '#f8fafc',
    headingColorLight: '#0f172a',
    headingColorDark: '#ffffff',
    borderColorLight: '#e2e8f0',
    borderColorDark: '#1e293b',
    cardColorLight: '#ffffff',
    cardColorDark: '#0f172a',
    menuNavbarColor: '#0f172a',
    linkColor: '#2563eb',
    activeStateColor: '#f59e0b',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444'
  },
  typography: {
    fontFamily: 'Plus Jakarta Sans',
    headingFontFamily: 'Plus Jakarta Sans',
    fontSizeScale: 100,
    fontWeight: '500',
    lineHeight: '1.6',
    letterSpacing: '-0.01em',
    textTransform: 'none',
    jobLinkFontSize: STANDARD_JOB_LINK_FONT_SIZE,
    jobLinkFontSizeMobile: STANDARD_JOB_LINK_FONT_SIZE_MOBILE,
    jobLinkFontWeight: STANDARD_JOB_LINK_FONT_WEIGHT,
    jobLinkLineHeight: STANDARD_JOB_LINK_LINE_HEIGHT
  },
  layout: {
    containerMaxWidth: '1440px',
    sectionSpacing: 'normal',
    cardBorderRadius: 'xl',
    cardShadow: 'sm',
    columnGridColumns: 3,
    mobileColumnLayout: '1-col',
    cardBorderWidth: '1px'
  },
  header: {
    portalTitle: 'GovtBharat',
    portalTagline: 'Fastest Central & State Govt Exam Notifications',
    domainName: 'GovtBharat.com',
    logoUrl: '/logo.png',
    logoSize: 38,
    headerHeight: 64,
    stickyHeader: true,
    showSearch: true,
    showThemeToggle: true,
    showSocialBar: true,
    customNavLinks: [
      { id: 'nl-home', label: 'Home', url: '#home', enabled: true },
      { id: 'nl-jobs', label: 'Latest Jobs', url: '#latest-jobs', enabled: true },
      { id: 'nl-admit', label: 'Admit Card', url: '#admit-card', enabled: true },
      { id: 'nl-results', label: 'Results', url: '#results', enabled: true },
      { id: 'nl-answerkey', label: 'Answer Key', url: '#answer-key', enabled: true },
      { id: 'nl-syllabus', label: 'Syllabus', url: '#syllabus', enabled: true },
      { id: 'nl-admission', label: 'Admission', url: '#admission', enabled: true },
      { id: 'nl-student-docs', label: 'Tools', url: '/student-documents', enabled: true }
    ]
  },
  footer: {
    footerLogo: '/logo.png',
    footerTitle: 'GovtBharat',
    footerDescription: 'GovtBharat Jobs Portal offers lightning-fast notification updates for Central & State Government examinations, admit cards, answer keys, results, and curriculum PDF patterns.',
    copyrightText: '© 2026 GovtBharat.com - GovtBharat. All Rights Reserved.',
    contactEmail: 'support@govtbharat.com',
    contactPhone: '+91 98765 43210',
    contactAddress: 'New Delhi, India',
    showSocialIcons: true,
    showSubscribeButton: true,
    disclaimerText: 'GovtBharat is an informative educational web portal. We are NOT associated with any government ministry or official recruitment board.'
  },
  sections: DEFAULT_WEBSITE_SECTIONS,
  media: {
    faviconUrl: '/logo.png',
    heroBannerUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200&auto=format&fit=crop',
    heroBannerLink: '#latest-jobs',
    promotionalBannerUrl: '',
    promotionalBannerLink: '',
    showHeroBanner: false,
    showPromoBanner: false
  },
  content: {
    heroWelcomeTitle: 'India\'s #1 Fast Sarkari Job Portal 2026',
    heroWelcomeSubtitle: 'Instant authentic alerts for Central, State, Railway, Defence & Banking Exams',
    searchPlaceholder: 'Search 10,000+ Sarkari Naukri, Admit Cards, Results, Exam Patterns...',
    ctaButtonText: 'View All Jobs',
    ctaButtonLink: '#latest-jobs',
    marqueeHeadline: '⚡ RRB Technician 2026 Admit Card Released | SSC CGL Tier 1 Online Application Form Active | UPSC CSE Prelims Result Announced',
    badgeHotText: 'NEW'
  },
  seo: {
    metaTitle: 'GovtBharat - Latest Sarkari Naukri, Results, Admit Card',
    metaDescription: 'Find the latest Govt Jobs, Sarkari Naukri, Results, Admit Cards, and Exam updates instantly on GovtBharat.',
    metaKeywords: 'GovtBharat, Sarkari Naukri, Govt Jobs, Results, Admit Card, SSC, Railway'
  },
  versionHistory: []
};

// Available Google Fonts
export const AVAILABLE_GOOGLE_FONTS = [
  { name: 'Plus Jakarta Sans', category: 'Modern Geometric Sans' },
  { name: 'Inter', category: 'Clean Neutral UI' },
  { name: 'Poppins', category: 'Rounded Geometric' },
  { name: 'Outfit', category: 'Crisp Tech Sans' },
  { name: 'Roboto', category: 'Classic Android Sans' },
  { name: 'Montserrat', category: 'Modern High Impact' },
  { name: 'Open Sans', category: 'Highly Readable' },
  { name: 'Merriweather', category: 'Formal Editorial Serif' },
  { name: 'Playfair Display', category: 'Luxury Headline Serif' }
];

// Preset Themes for 1-Click Transformation
export interface GlobalWebsiteThemePreset {
  id: string;
  name: string;
  description: string;
  previewColors: string[];
  colors: WebsiteCustomColorConfig;
  typography?: Partial<WebsiteTypographyConfig>;
}

export const GLOBAL_THEME_PRESETS: GlobalWebsiteThemePreset[] = [
  {
    id: 'theme-deep-cyber',
    name: '🌌 Deep Cyber Slate (Default)',
    description: 'High-contrast dark indigo canvas with amber gold highlights and ultra-sharp legibility.',
    previewColors: ['#0f172a', '#2563eb', '#f59e0b', '#0b1120'],
    colors: DEFAULT_WEBSITE_CONTROL_CONFIG.colors
  },
  {
    id: 'theme-royal-blue',
    name: '💎 Royal Sapphire & Navy',
    description: 'Corporate high-trust navy blue with vivid sapphire accents and clean white cards.',
    previewColors: ['#0a192f', '#0284c7', '#fbbf24', '#f0f9ff'],
    colors: {
      ...DEFAULT_WEBSITE_CONTROL_CONFIG.colors,
      primaryColor: '#0284c7',
      secondaryColor: '#fbbf24',
      headerColor: '#0a192f',
      headerTextColor: '#ffffff',
      footerColor: '#030712',
      footerTextColor: '#94a3b8',
      buttonColor: '#0284c7',
      buttonHoverColor: '#0369a1',
      linkColor: '#0284c7',
      activeStateColor: '#fbbf24',
      backgroundColorLight: '#f0f9ff',
      backgroundColorDark: '#020617'
    }
  },
  {
    id: 'theme-emerald-gov',
    name: '🌲 Official Emerald & Tricolor',
    description: 'National green and saffron hues tailored for authentic government exam portals.',
    previewColors: ['#064e3b', '#059669', '#ea580c', '#f0fdf4'],
    colors: {
      ...DEFAULT_WEBSITE_CONTROL_CONFIG.colors,
      primaryColor: '#059669',
      secondaryColor: '#ea580c',
      headerColor: '#064e3b',
      headerTextColor: '#ffffff',
      footerColor: '#022c22',
      footerTextColor: '#a7f3d0',
      buttonColor: '#059669',
      buttonHoverColor: '#047857',
      linkColor: '#059669',
      activeStateColor: '#ea580c',
      backgroundColorLight: '#f0fdf4',
      backgroundColorDark: '#021810'
    }
  },
  {
    id: 'theme-crimson-fire',
    name: '🔥 Crimson Ruby & Urgent Alerts',
    description: 'High-visibility vibrant red styling designed for breaking notifications.',
    previewColors: ['#450a0a', '#dc2626', '#f59e0b', '#fff1f2'],
    colors: {
      ...DEFAULT_WEBSITE_CONTROL_CONFIG.colors,
      primaryColor: '#dc2626',
      secondaryColor: '#f59e0b',
      headerColor: '#450a0a',
      headerTextColor: '#ffffff',
      footerColor: '#2a0808',
      footerTextColor: '#fca5a5',
      buttonColor: '#dc2626',
      buttonHoverColor: '#b91c1c',
      linkColor: '#dc2626',
      activeStateColor: '#f59e0b',
      backgroundColorLight: '#fff1f2',
      backgroundColorDark: '#180404'
    }
  },
  {
    id: 'theme-midnight-violet',
    name: '⚡ Midnight Neon Purple',
    description: 'Futuristic purple and cyan design with glowing highlights and clean borders.',
    previewColors: ['#2e1065', '#9333ea', '#06b6d4', '#faf5ff'],
    colors: {
      ...DEFAULT_WEBSITE_CONTROL_CONFIG.colors,
      primaryColor: '#9333ea',
      secondaryColor: '#06b6d4',
      headerColor: '#2e1065',
      headerTextColor: '#ffffff',
      footerColor: '#17062e',
      footerTextColor: '#d8b4fe',
      buttonColor: '#9333ea',
      buttonHoverColor: '#7e22ce',
      linkColor: '#9333ea',
      activeStateColor: '#06b6d4',
      backgroundColorLight: '#faf5ff',
      backgroundColorDark: '#0f041c'
    }
  },
  {
    id: 'theme-warm-amber',
    name: '🍯 Golden Honey & Warm Slate',
    description: 'Premium amber and dark charcoal palette with friendly warm tones.',
    previewColors: ['#1c1917', '#d97706', '#f59e0b', '#fffbeb'],
    colors: {
      ...DEFAULT_WEBSITE_CONTROL_CONFIG.colors,
      primaryColor: '#d97706',
      secondaryColor: '#f59e0b',
      headerColor: '#1c1917',
      headerTextColor: '#ffffff',
      footerColor: '#0c0a09',
      footerTextColor: '#d6d3d1',
      buttonColor: '#d97706',
      buttonHoverColor: '#b45309',
      linkColor: '#d97706',
      activeStateColor: '#f59e0b',
      backgroundColorLight: '#fffbeb',
      backgroundColorDark: '#0c0a09'
    }
  }
];

// Load from LocalStorage
export const loadWebsiteControlConfig = (): WebsiteControlConfig => {
  if (typeof window === 'undefined') return DEFAULT_WEBSITE_CONTROL_CONFIG;
  try {
    const saved = localStorage.getItem('GovtBharat_website_control_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_WEBSITE_CONTROL_CONFIG,
        ...parsed,
        colors: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.colors, ...(parsed.colors || {}) },
        typography: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.typography, ...(parsed.typography || {}) },
        layout: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.layout, ...(parsed.layout || {}) },
        header: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.header, ...(parsed.header || {}) },
        footer: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.footer, ...(parsed.footer || {}) },
        sections: parsed.sections && parsed.sections.length > 0 ? parsed.sections : DEFAULT_WEBSITE_SECTIONS,
        media: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.media, ...(parsed.media || {}) },
        content: { ...DEFAULT_WEBSITE_CONTROL_CONFIG.content, ...(parsed.content || {}) },
        versionHistory: parsed.versionHistory || []
      };
    }
  } catch (err) {
    console.error('Error reading website control config from storage:', err);
  }
  return DEFAULT_WEBSITE_CONTROL_CONFIG;
};

// Save to LocalStorage
export const saveWebsiteControlConfig = (config: WebsiteControlConfig) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('GovtBharat_website_control_config', JSON.stringify(config));
    applyWebsiteControlToDOM(config);
  } catch (err) {
    console.error('Error saving website control config to storage:', err);
  }
};

// Inject Google Font Dynamically into Head
export const loadGoogleFont = (fontFamily: string) => {
  if (typeof document === 'undefined') return;
  if (!fontFamily) return;

  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
};

// Apply All Custom Styles & Configs to DOM
export const applyWebsiteControlToDOM = (config: WebsiteControlConfig) => {
  if (typeof document === 'undefined') return;

  // 1. Load Fonts
  if (config.typography?.fontFamily) {
    loadGoogleFont(config.typography.fontFamily);
  }
  if (config.typography?.headingFontFamily && config.typography.headingFontFamily !== config.typography.fontFamily) {
    loadGoogleFont(config.typography.headingFontFamily);
  }

  // 2. Compute radius and shadows
  const radiusMap: Record<string, string> = {
    none: '0px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem'
  };

  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
  };

  const cardRadius = radiusMap[config.layout?.cardBorderRadius || 'xl'] || '1rem';
  const cardShadow = shadowMap[config.layout?.cardShadow || 'sm'] || '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  const scale = (config.typography?.fontSizeScale || 100) / 100;
  
  const jobLinkFontSize = config.typography?.jobLinkFontSize || STANDARD_JOB_LINK_FONT_SIZE;
  const jobLinkFontSizeMobile = config.typography?.jobLinkFontSizeMobile || STANDARD_JOB_LINK_FONT_SIZE_MOBILE;
  const jobLinkFontWeight = config.typography?.jobLinkFontWeight || STANDARD_JOB_LINK_FONT_WEIGHT;
  const jobLinkLineHeight = config.typography?.jobLinkLineHeight || STANDARD_JOB_LINK_LINE_HEIGHT;

  // 3. Inject CSS Variables
  const styleId = 'GovtBharat-master-website-control-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const { colors, typography, layout, header } = config;

  styleEl.innerHTML = `
    :root {
      --wc-primary: ${colors.primaryColor};
      --wc-secondary: ${colors.secondaryColor};
      --wc-bg-light: ${colors.backgroundColorLight};
      --wc-bg-dark: ${colors.backgroundColorDark};
      --wc-header-bg: ${colors.headerColor};
      --wc-header-text: ${colors.headerTextColor};
      --wc-footer-bg: ${colors.footerColor};
      --wc-footer-text: ${colors.footerTextColor};
      --wc-btn-bg: ${colors.buttonColor};
      --wc-btn-text: ${colors.buttonTextColor};
      --wc-btn-hover-bg: ${colors.buttonHoverColor};
      --wc-text-light: ${colors.textColorLight};
      --wc-text-dark: ${colors.textColorDark};
      --wc-heading-light: ${colors.headingColorLight};
      --wc-heading-dark: ${colors.headingColorDark};
      --wc-border-light: ${colors.borderColorLight};
      --wc-border-dark: ${colors.borderColorDark};
      --wc-card-light: ${colors.cardColorLight};
      --wc-card-dark: ${colors.cardColorDark};
      --wc-link: ${colors.linkColor};
      --wc-active: ${colors.activeStateColor};
      --wc-success: ${colors.successColor};
      --wc-warning: ${colors.warningColor};
      --wc-error: ${colors.errorColor};
      
      --wc-font-family: '${typography?.fontFamily || 'Plus Jakarta Sans'}', sans-serif;
      --wc-heading-font: '${typography?.headingFontFamily || typography?.fontFamily || 'Plus Jakarta Sans'}', sans-serif;
      --wc-font-scale: ${scale};
      --wc-font-weight: ${typography?.fontWeight || '500'};
      --wc-line-height: ${typography?.lineHeight || '1.6'};
      --wc-letter-spacing: ${typography?.letterSpacing || '-0.01em'};
      
      --wc-job-link-font-size: ${jobLinkFontSize}px;
      --wc-job-link-font-size-mobile: ${jobLinkFontSizeMobile}px;
      --wc-job-link-font-weight: ${jobLinkFontWeight};
      --wc-job-link-line-height: ${jobLinkLineHeight};

      --wc-container-max: ${layout?.containerMaxWidth || '1440px'};
      --wc-card-radius: ${cardRadius};
      --wc-card-shadow: ${cardShadow};
      --wc-header-height: ${header?.headerHeight || 64}px;
    }

    body {
      font-family: var(--wc-font-family) !important;
      letter-spacing: var(--wc-letter-spacing) !important;
      line-height: var(--wc-line-height) !important;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--wc-heading-font) !important;
    }

    /* Standardized & Customizable Job Link Title Typography Across Portal */
    .job-link-title-text,
    .job-link-item-title,
    .job-title-custom-font {
      font-size: var(--wc-job-link-font-size-mobile) !important;
      font-weight: var(--wc-job-link-font-weight) !important;
      line-height: var(--wc-job-link-line-height) !important;
    }

    @media (min-width: 640px) {
      .job-link-title-text,
      .job-link-item-title,
      .job-title-custom-font {
        font-size: var(--wc-job-link-font-size) !important;
      }
    }

    .custom-master-header {
      background-color: var(--wc-header-bg) !important;
      color: var(--wc-header-text) !important;
      height: var(--wc-header-height) !important;
    }

    .custom-master-footer {
      background-color: var(--wc-footer-bg) !important;
      color: var(--wc-footer-text) !important;
    }

    .custom-master-btn {
      background-color: var(--wc-btn-bg) !important;
      color: var(--wc-btn-text) !important;
    }
    .custom-master-btn:hover {
      background-color: var(--wc-btn-hover-bg) !important;
    }

    .custom-master-card {
      border-radius: var(--wc-card-radius) !important;
      box-shadow: var(--wc-card-shadow) !important;
    }
  `;
};
