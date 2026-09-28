export interface ThemeColorConfig {
  // 0. Global Primary Accent (e.g. Amber default)
  primaryAccent: string;
  primaryAccentHover?: string;
  primaryAccentLight?: string;
  primaryAccentName?: string;

  // 1. Header & Navigation Brand
  headerBg: string;
  headerText: string;
  headerAccent: string;
  
  // 2. Breaking News Marquee Ticker
  marqueeBg: string;
  marqueeText: string;
  marqueeBadgeBg: string;
  marqueeBadgeText: string;

  // 3. Top Category Quick Cards
  latestJobsColor: string;
  admitCardColor: string;
  resultsColor: string;
  answerKeyColor: string;
  syllabusColor: string;
  admissionColor: string;

  // 4. Buttons & Badges
  primaryButtonBg: string;
  primaryButtonText: string;
  newBadgeBg: string;
  newBadgeText: string;
  searchBorderColor: string;

  // 5. Footer & Base Accents
  footerBg: string;
  footerText: string;
  footerBorder: string;
}

export interface AccentPreset {
  id: string;
  name: string;
  color: string;
  hoverColor: string;
  lightColor: string;
  description: string;
  badge?: string;
}

export const PRIMARY_ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'amber',
    name: 'Amber Gold (Default)',
    color: '#f59e0b',
    hoverColor: '#d97706',
    lightColor: '#fef3c7',
    description: 'Warm gold and amber glowing tones (Original GovtBharat signature)',
    badge: 'DEFAULT'
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    color: '#10b981',
    hoverColor: '#059669',
    lightColor: '#d1fae5',
    description: 'Official government green & fresh environmental look',
    badge: 'OFFICIAL'
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    color: '#6366f1',
    hoverColor: '#4f46e5',
    lightColor: '#e0e7ff',
    description: 'Modern digital tech & futuristic UI indigo',
    badge: 'TECH'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    color: '#f43f5e',
    hoverColor: '#e11d48',
    lightColor: '#ffe4e6',
    description: 'High-energy vibrant alert rose & ruby tones',
    badge: 'ALERT'
  },
  {
    id: 'sky',
    name: 'Sky Cyan',
    color: '#0ea5e9',
    hoverColor: '#0284c7',
    lightColor: '#e0f2fe',
    description: 'Clean high-visibility ocean sky blue',
    badge: 'COOL'
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    color: '#8b5cf6',
    hoverColor: '#7c3aed',
    lightColor: '#ede9fe',
    description: 'Regal purple, lavender & luxury gradient styling',
    badge: 'PREMIUM'
  },
  {
    id: 'orange',
    name: 'Flame Orange',
    color: '#f97316',
    hoverColor: '#ea580c',
    lightColor: '#ffedd5',
    description: 'Vivid high-urgency saffron flame orange',
    badge: 'VIVID'
  },
  {
    id: 'teal',
    name: 'Oceanic Teal',
    color: '#14b8a6',
    hoverColor: '#0d9488',
    lightColor: '#ccfbf1',
    description: 'Refreshing tropical oceanic teal & cyan',
    badge: 'FRESH'
  },
  {
    id: 'yellow',
    name: 'Sun Gold',
    color: '#eab308',
    hoverColor: '#ca8a04',
    lightColor: '#fef9c3',
    description: 'Radiant sunshine yellow and high contrast gold',
    badge: 'BRIGHT'
  },
  {
    id: 'ruby',
    name: 'Ruby Red',
    color: '#dc2626',
    hoverColor: '#b91c1c',
    lightColor: '#fee2e2',
    description: 'Urgent breaking notification red styling',
    badge: 'HOT'
  }
];

export const DEFAULT_THEME_COLORS: ThemeColorConfig = {
  primaryAccent: '#f59e0b',
  primaryAccentHover: '#d97706',
  primaryAccentLight: '#fef3c7',
  primaryAccentName: 'Amber Gold',

  headerBg: '#0f172a',
  headerText: '#ffffff',
  headerAccent: '#f59e0b',

  marqueeBg: '#1e1b4b',
  marqueeText: '#fde047',
  marqueeBadgeBg: '#dc2626',
  marqueeBadgeText: '#ffffff',

  latestJobsColor: '#4f46e5',
  admitCardColor: '#2563eb',
  resultsColor: '#059669',
  answerKeyColor: '#d97706',
  syllabusColor: '#db2777',
  admissionColor: '#7c3aed',

  primaryButtonBg: '#2563eb',
  primaryButtonText: '#ffffff',
  newBadgeBg: '#ef4444',
  newBadgeText: '#ffffff',
  searchBorderColor: '#6366f1',

  footerBg: '#0b1120',
  footerText: '#94a3b8',
  footerBorder: '#1e293b'
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  previewColors: string[];
  colors: ThemeColorConfig;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default-cyber',
    name: '🌌 Deep Cyber Slate (Default)',
    description: 'Modern high-contrast dark indigo canvas with amber and gold accents.',
    badge: 'DEFAULT',
    previewColors: ['#0f172a', '#1e1b4b', '#f59e0b', '#059669'],
    colors: DEFAULT_THEME_COLORS
  },
  {
    id: 'govt-classic',
    name: '🏛️ Official Govt Classic (Tricolor)',
    description: 'Traditional National Saffron, Deep Ashoka Navy, and Forest Green styling.',
    badge: 'OFFICIAL',
    previewColors: ['#1e293b', '#ea580c', '#16a34a', '#2563eb'],
    colors: {
      primaryAccent: '#f97316',
      primaryAccentHover: '#ea580c',
      primaryAccentLight: '#ffedd5',
      primaryAccentName: 'Flame Orange',
      headerBg: '#172554',
      headerText: '#ffffff',
      headerAccent: '#f97316',
      marqueeBg: '#7c2d12',
      marqueeText: '#fed7aa',
      marqueeBadgeBg: '#15803d',
      marqueeBadgeText: '#ffffff',
      latestJobsColor: '#ea580c',
      admitCardColor: '#1d4ed8',
      resultsColor: '#15803d',
      answerKeyColor: '#b45309',
      syllabusColor: '#c026d3',
      admissionColor: '#6d28d9',
      primaryButtonBg: '#ea580c',
      primaryButtonText: '#ffffff',
      newBadgeBg: '#dc2626',
      newBadgeText: '#ffffff',
      searchBorderColor: '#ea580c',
      footerBg: '#0f172a',
      footerText: '#94a3b8',
      footerBorder: '#334155'
    }
  },
  {
    id: 'royal-sapphire',
    name: '💎 Royal Sapphire & Gold',
    description: 'Deep navy blue with radiant golden highlights and luxury styling.',
    badge: 'PREMIUM',
    previewColors: ['#091e42', '#fbbf24', '#0284c7', '#10b981'],
    colors: {
      primaryAccent: '#fbbf24',
      primaryAccentHover: '#d97706',
      primaryAccentLight: '#fef3c7',
      primaryAccentName: 'Amber Gold',
      headerBg: '#0a192f',
      headerText: '#ffffff',
      headerAccent: '#fbbf24',
      marqueeBg: '#0c2340',
      marqueeText: '#fde68a',
      marqueeBadgeBg: '#d97706',
      marqueeBadgeText: '#000000',
      latestJobsColor: '#0284c7',
      admitCardColor: '#2563eb',
      resultsColor: '#059669',
      answerKeyColor: '#eab308',
      syllabusColor: '#8b5cf6',
      admissionColor: '#06b6d4',
      primaryButtonBg: '#0284c7',
      primaryButtonText: '#ffffff',
      newBadgeBg: '#f59e0b',
      newBadgeText: '#000000',
      searchBorderColor: '#38bdf8',
      footerBg: '#030712',
      footerText: '#94a3b8',
      footerBorder: '#1e3a8a'
    }
  },
  {
    id: 'emerald-mint',
    name: '🌲 Emerald Forest & Mint',
    description: 'Fresh, eco-friendly green palette with high clarity and calm contrast.',
    badge: 'CLEAN',
    previewColors: ['#064e3b', '#10b981', '#34d399', '#0284c7'],
    colors: {
      primaryAccent: '#10b981',
      primaryAccentHover: '#059669',
      primaryAccentLight: '#d1fae5',
      primaryAccentName: 'Emerald Green',
      headerBg: '#064e3b',
      headerText: '#ffffff',
      headerAccent: '#34d399',
      marqueeBg: '#022c22',
      marqueeText: '#a7f3d0',
      marqueeBadgeBg: '#059669',
      marqueeBadgeText: '#ffffff',
      latestJobsColor: '#059669',
      admitCardColor: '#0d9488',
      resultsColor: '#16a34a',
      answerKeyColor: '#d97706',
      syllabusColor: '#6366f1',
      admissionColor: '#0284c7',
      primaryButtonBg: '#059669',
      primaryButtonText: '#ffffff',
      newBadgeBg: '#ef4444',
      newBadgeText: '#ffffff',
      searchBorderColor: '#10b981',
      footerBg: '#022c22',
      footerText: '#a7f3d0',
      footerBorder: '#065f46'
    }
  },
  {
    id: 'crimson-ruby',
    name: '🍷 Crimson Ruby & Fire Red',
    description: 'High-urgency red and burgundy theme for maximum notice and breaking alerts.',
    badge: 'URGENT',
    previewColors: ['#450a0a', '#dc2626', '#f87171', '#f59e0b'],
    colors: {
      primaryAccent: '#f43f5e',
      primaryAccentHover: '#e11d48',
      primaryAccentLight: '#ffe4e6',
      primaryAccentName: 'Crimson Rose',
      headerBg: '#450a0a',
      headerText: '#ffffff',
      headerAccent: '#f87171',
      marqueeBg: '#7f1d1d',
      marqueeText: '#fecaca',
      marqueeBadgeBg: '#b91c1c',
      marqueeBadgeText: '#ffffff',
      latestJobsColor: '#dc2626',
      admitCardColor: '#b91c1c',
      resultsColor: '#059669',
      answerKeyColor: '#d97706',
      syllabusColor: '#9333ea',
      admissionColor: '#2563eb',
      primaryButtonBg: '#dc2626',
      primaryButtonText: '#ffffff',
      newBadgeBg: '#f59e0b',
      newBadgeText: '#000000',
      searchBorderColor: '#ef4444',
      footerBg: '#2a0808',
      footerText: '#fca5a5',
      footerBorder: '#7f1d1d'
    }
  },
  {
    id: 'midnight-violet',
    name: '⚡ Midnight Neon Violet',
    description: 'Futuristic purple, fuchsia and cyan accents for a modern sleek look.',
    badge: 'NEON',
    previewColors: ['#2e1065', '#a855f7', '#ec4899', '#06b6d4'],
    colors: {
      primaryAccent: '#8b5cf6',
      primaryAccentHover: '#7c3aed',
      primaryAccentLight: '#ede9fe',
      primaryAccentName: 'Royal Violet',
      headerBg: '#2e1065',
      headerText: '#ffffff',
      headerAccent: '#c084fc',
      marqueeBg: '#1e0840',
      marqueeText: '#e9d5ff',
      marqueeBadgeBg: '#9333ea',
      marqueeBadgeText: '#ffffff',
      latestJobsColor: '#9333ea',
      admitCardColor: '#7c3aed',
      resultsColor: '#06b6d4',
      answerKeyColor: '#f59e0b',
      syllabusColor: '#ec4899',
      admissionColor: '#3b82f6',
      primaryButtonBg: '#9333ea',
      primaryButtonText: '#ffffff',
      newBadgeBg: '#ec4899',
      newBadgeText: '#ffffff',
      searchBorderColor: '#c084fc',
      footerBg: '#17062e',
      footerText: '#d8b4fe',
      footerBorder: '#581c87'
    }
  }
];

export function hexToRgb(hex: string): string {
  let c = (hex || '#f59e0b').replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return '245, 158, 11';
  const num = parseInt(c, 16);
  if (isNaN(num)) return '245, 158, 11';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

export const loadThemeColors = (): ThemeColorConfig => {
  if (typeof window === 'undefined') return DEFAULT_THEME_COLORS;
  try {
    const saved = localStorage.getItem('GovtBharat_theme_colors');
    if (saved) {
      return { ...DEFAULT_THEME_COLORS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Error loading theme colors:', err);
  }
  return DEFAULT_THEME_COLORS;
};

export const saveThemeColors = (colors: ThemeColorConfig) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('GovtBharat_theme_colors', JSON.stringify(colors));
    applyThemeColorsToDOM(colors);
  } catch (err) {
    console.error('Error saving theme colors:', err);
  }
};

export const applyThemeColorsToDOM = (colors: ThemeColorConfig) => {
  if (typeof document === 'undefined') return;

  const styleId = 'GovtBharat-custom-theme-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const primaryAccent = colors.primaryAccent || colors.headerAccent || '#f59e0b';
  const primaryHover = colors.primaryAccentHover || '#d97706';
  const primaryLight = colors.primaryAccentLight || '#fef3c7';
  const accentRgb = hexToRgb(primaryAccent);

  // Inject CSS custom properties and direct style rules
  styleEl.innerHTML = `
    :root {
      --fc-primary-accent: ${primaryAccent};
      --fc-primary-accent-hover: ${primaryHover};
      --fc-primary-accent-light: ${primaryLight};
      --fc-primary-accent-rgb: ${accentRgb};
      --fc-header-bg: ${colors.headerBg};
      --fc-header-text: ${colors.headerText};
      --fc-header-accent: ${colors.headerAccent || primaryAccent};
      --fc-marquee-bg: ${colors.marqueeBg};
      --fc-marquee-text: ${colors.marqueeText};
      --fc-marquee-badge-bg: ${colors.marqueeBadgeBg};
      --fc-marquee-badge-text: ${colors.marqueeBadgeText};
      --fc-latest-jobs: ${colors.latestJobsColor};
      --fc-admit-card: ${colors.admitCardColor};
      --fc-results: ${colors.resultsColor};
      --fc-answer-key: ${colors.answerKeyColor};
      --fc-syllabus: ${colors.syllabusColor};
      --fc-admission: ${colors.admissionColor};
      --fc-primary-btn-bg: ${colors.primaryButtonBg};
      --fc-primary-btn-text: ${colors.primaryButtonText};
      --fc-new-badge-bg: ${colors.newBadgeBg};
      --fc-new-badge-text: ${colors.newBadgeText};
      --fc-search-border: ${colors.searchBorderColor};
      --fc-footer-bg: ${colors.footerBg};
      --fc-footer-text: ${colors.footerText};
      --fc-footer-border: ${colors.footerBorder};
    }

    /* Dynamic Custom Color Overrides */
    .custom-header-override {
      background-color: ${colors.headerBg} !important;
      color: ${colors.headerText} !important;
    }
    .custom-marquee-override {
      background-color: ${colors.marqueeBg} !important;
      color: ${colors.marqueeText} !important;
    }
    .custom-marquee-badge-override {
      background-color: ${colors.marqueeBadgeBg} !important;
      color: ${colors.marqueeBadgeText} !important;
    }
    .custom-footer-override {
      background-color: ${colors.footerBg} !important;
      color: ${colors.footerText} !important;
      border-color: ${colors.footerBorder} !important;
    }

    /* Global Dynamic Accent Utilities */
    .theme-accent-text {
      color: ${primaryAccent} !important;
    }
    .theme-accent-bg {
      background-color: ${primaryAccent} !important;
    }
    .theme-accent-border {
      border-color: ${primaryAccent} !important;
    }
    .theme-accent-ring {
      --tw-ring-color: rgba(${accentRgb}, 0.5) !important;
    }
    .theme-accent-gradient-text {
      background: linear-gradient(135deg, ${primaryLight}, ${primaryAccent}, ${primaryHover});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `;
};
