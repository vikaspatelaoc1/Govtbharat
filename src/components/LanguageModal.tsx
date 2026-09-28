import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check, Globe, Sparkles, RotateCcw, ChevronRight, Languages } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: 'indian' | 'international';
  flag?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Indian Official & Regional Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'indian', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English (Original)', region: 'indian', flag: '🇬🇧' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'indian', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'indian', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'indian', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'indian', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'indian', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'indian', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'indian', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'indian', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'indian', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'indian', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'indian', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'indian', flag: '🇳🇵' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'indian', flag: '🇮🇳' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', region: 'indian', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'indian', flag: '🇮🇳' },
  { code: 'gom', name: 'Konkani', nativeName: 'कोंकणी', region: 'indian', flag: '🇮🇳' },
  
  // Major International Languages
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'international', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'international', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'international', flag: '🇸🇦' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'international', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'international', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'international', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', region: 'international', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'international', flag: '🇧🇷' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'international', flag: '🇮🇩' },
];

/**
 * Custom | अ A | icon exactly matching user's reference image
 */
export const HindiEnglishIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => {
  return (
    <svg 
      viewBox="0 0 38 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left vertical divider bar */}
      <line x1="4.5" y1="3" x2="4.5" y2="29" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      
      {/* Hindi glyph 'अ' on top */}
      <text 
        x="13.5" 
        y="13.5" 
        fill="currentColor" 
        fontSize="13" 
        fontWeight="800" 
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        अ
      </text>
      
      {/* English glyph 'A' on bottom */}
      <text 
        x="23.5" 
        y="26.5" 
        fill="currentColor" 
        fontSize="12.5" 
        fontWeight="900" 
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        A
      </text>
      
      {/* Right vertical divider bar */}
      <line x1="33.5" y1="3" x2="33.5" y2="29" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

// Set translate cookies for Google Translate API
export function changeSiteLanguage(langCode: string) {
  const isEn = !langCode || langCode === 'en';
  const cookieVal = isEn ? '' : `/auto/${langCode}`;
  const expireStr = isEn ? 'expires=Thu, 01 Jan 1970 00:00:00 UTC;' : '';

  localStorage.setItem('GovtBharat_preferred_language', langCode);

  document.cookie = `googtrans=${cookieVal}; path=/; ${expireStr}`;
  if (!isEn) {
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
  }

  try {
    const host = window.location.hostname;
    const parts = host.split('.');
    for (let i = 0; i < parts.length; i++) {
      const d = parts.slice(i).join('.');
      if (d) {
        document.cookie = `googtrans=${cookieVal}; domain=.${d}; path=/; ${expireStr}`;
        document.cookie = `googtrans=${cookieVal}; domain=${d}; path=/; ${expireStr}`;
        if (!isEn) {
          document.cookie = `googtrans=/en/${langCode}; domain=.${d}; path=/;`;
          document.cookie = `googtrans=/en/${langCode}; domain=${d}; path=/;`;
        }
      }
    }
  } catch (e) {
    console.error('Error applying cookie:', e);
  }

  // Trigger Google Translate dropdown if loaded
  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    combo.value = langCode === 'en' ? '' : langCode;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    combo.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // Reload page to apply translated cookie
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  // Hide top toolbar / banner if injected by Google Translate
  const cleanupBanner = () => {
    if (document.body) {
      document.body.style.top = '0px';
      document.body.style.position = 'static';
    }
    if (document.documentElement) {
      document.documentElement.style.top = '0px';
    }
    const elements = document.querySelectorAll(
      '.goog-te-banner-frame, iframe.skiptranslate, .VIpgJd-ZVi9od-ORHb-OJu5Fn, .goog-te-banner, iframe[class*="goog"], body > .skiptranslate:not(#google_translate_element)'
    );
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.setProperty('display', 'none', 'important');
      htmlEl.style.setProperty('visibility', 'hidden', 'important');
      htmlEl.style.setProperty('height', '0px', 'important');
    });
  };

  cleanupBanner();
  setTimeout(cleanupBanner, 50);
  setTimeout(cleanupBanner, 200);
  setTimeout(cleanupBanner, 500);
  setTimeout(cleanupBanner, 1200);
}

export const LanguageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentLangCode: string;
  onSelectLanguage: (code: string) => void;
}> = ({ isOpen, onClose, currentLangCode, onSelectLanguage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'indian' | 'international'>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesSearch = 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || lang.region === selectedTab;
    return matchesSearch && matchesTab;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs shrink-0">
                  <HindiEnglishIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    <span>Select Language</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                      भाषा चुनें
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Translate the entire website into your preferred language
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Close Language Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Tabs */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search language (हिन्दी, Bengali, தமிழ், ગુજરાતી, Marathi)..."
                  className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTab === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All ({SUPPORTED_LANGUAGES.length})
                </button>
                <button
                  onClick={() => setSelectedTab('indian')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedTab === 'indian'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>🇮🇳 Indian</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    ({SUPPORTED_LANGUAGES.filter(l => l.region === 'indian').length})
                  </span>
                </button>
                <button
                  onClick={() => setSelectedTab('international')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedTab === 'international'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>🌍 Global</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    ({SUPPORTED_LANGUAGES.filter(l => l.region === 'international').length})
                  </span>
                </button>
              </div>
            </div>

            {/* Language Grid */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 max-h-[50vh]">
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">No languages matched "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredLanguages.map((lang) => {
                    const isSelected = currentLangCode === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onSelectLanguage(lang.code);
                          onClose();
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-sm scale-[1.01]'
                            : 'bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-amber-400 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{lang.flag || '🌐'}</span>
                          <div className="truncate">
                            <div className="text-xs font-black truncate">{lang.nativeName}</div>
                            <div className={`text-[10.5px] truncate ${isSelected ? 'text-slate-900/80 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                              {lang.name}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-slate-950 shrink-0 ml-1" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-amber-500 transition-colors shrink-0 ml-1 opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Reset Button */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Multi-Language Translation</span>
              </div>
              
              {currentLangCode !== 'en' && (
                <button
                  onClick={() => {
                    onSelectLanguage('en');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to English</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
