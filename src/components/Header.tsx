import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, ChevronDown, Sun, Moon, ShieldCheck, Menu, X, Briefcase, FileText, 
  Award, BookOpen, GraduationCap, CheckSquare, HelpCircle, Phone, 
  Info, Shield, AlertCircle, Send, Sparkles, MoreVertical, BarChart3, Megaphone, 
  Settings, Database, Users, UserPlus, ChevronRight, Package, LogOut, Monitor, History, Palette, Type, SlidersHorizontal, Download, Search, Bell, Mic, Smartphone
} from 'lucide-react';
import { SocialLinkItem, SuperAdminTabType, JobAlert } from '../types';
import { SUPER_ADMIN_MODULES } from '../config/superAdminConfig';
import { OfficialSocialLogo } from './SocialIcons';
import { LanguageModal, HindiEnglishIcon, SUPPORTED_LANGUAGES, changeSiteLanguage } from './LanguageModal';
import { openJobInNewTab } from '../utils/jobUrl';


interface HeaderProps {
  themeMode?: 'light' | 'dark' | 'system';
  onSetThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  onAdminLoginClick: () => void;
  isLoggedIn: boolean;
  isSuperAdmin?: boolean;
  employeeName?: string;
  onOpenSuperAdminModal?: (tab?: SuperAdminTabType) => void;
  onOpenNpmSystem?: () => void;
  onLogout: () => void;
  onInfoClick: (pageId: string) => void;
  activeTab: string;
  onTabChange: (id: string) => void;
  onSelectState?: (stateName: string) => void;
  socialLinks?: SocialLinkItem[];
  siteLogo?: string;
  onSearchClick?: () => void;
  onOpenNotifications?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  jobs?: JobAlert[];
}

export const Header: React.FC<HeaderProps> = ({ 
  themeMode = 'system',
  onSetThemeMode,
  onToggleDarkMode, 
  isDarkMode, 
  onAdminLoginClick, 
  isLoggedIn, 
  isSuperAdmin,
  employeeName,
  onOpenSuperAdminModal,
  onOpenNpmSystem,
  onLogout, 
  onInfoClick, 
  activeTab, 
  onTabChange,
  onSelectState,
  socialLinks,
  siteLogo = "/logo.png",
  onSearchClick,
  onOpenNotifications,
  searchQuery = "",
  setSearchQuery,
  jobs = []
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSuperAdminMenuExpanded, setIsSuperAdminMenuExpanded] = useState(false);
  const [expandedSidebarSections, setExpandedSidebarSections] = useState<Record<string, boolean>>({
    portal: true,
    connect: true,
    pages: true
  });
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    core: true,
    content: true,
    system: false,
    users: false,
    tools: false
  });
  const [isDesktopAdminOpen, setIsDesktopAdminOpen] = useState(false);
  const [isHeader3DotOpen, setIsHeader3DotOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAppSearchOpen, setIsAppSearchOpen] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isApplication, setIsApplication] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'app') return true;
    if (mode === 'web') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      urlParams.get('source') === 'pwa' ||
      urlParams.get('utm_source') === 'pwa' ||
      localStorage.getItem('fastarc_app_view') === 'app'
    );
  });

  useEffect(() => {
    const checkAppMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      if (mode === 'app') {
        setIsApplication(true);
        return;
      }
      if (mode === 'web') {
        setIsApplication(false);
        return;
      }
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://') ||
        urlParams.get('source') === 'pwa' ||
        urlParams.get('utm_source') === 'pwa' ||
        localStorage.getItem('fastarc_app_view') === 'app';
      setIsApplication(!!isStandalone);
    };
    checkAppMode();

    const mqStandalone = window.matchMedia('(display-mode: standalone)');
    const handleMq = () => checkAppMode();
    if (mqStandalone.addEventListener) {
      mqStandalone.addEventListener('change', handleMq);
    }

    const handleAppModeSwitch = (e: any) => {
      if (e.detail?.mode === 'app') {
        setIsApplication(true);
      } else if (e.detail?.mode === 'web') {
        setIsApplication(false);
      }
    };
    window.addEventListener('fastarc_toggle_app_mode', handleAppModeSwitch);

    return () => {
      if (mqStandalone.removeEventListener) {
        mqStandalone.removeEventListener('change', handleMq);
      }
      window.removeEventListener('fastarc_toggle_app_mode', handleAppModeSwitch);
    };
  }, []);
  const [currentLangCode, setCurrentLangCode] = useState<string>('en');
  const moreRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);
  const header3DotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/(?:auto|en)\/([a-zA-Z-]+)/);
    const cookieLang = match ? match[1] : null;
    const saved = localStorage.getItem('fastarc_preferred_language');
    setCurrentLangCode(cookieLang || saved || 'en');
  }, []);

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[1];


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
        setIsDesktopAdminOpen(false);
      }
      if (header3DotRef.current && !header3DotRef.current.contains(event.target as Node)) {
        setIsHeader3DotOpen(false);
      }
    };

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAppSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isAppSearchOpen]);

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setVoiceListening(true);
      };
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        if (setSearchQuery) {
          setSearchQuery(transcript);
        }
        setVoiceListening(false);
      };
      recognition.onerror = () => {
        setVoiceListening(false);
      };
      recognition.onend = () => {
        setVoiceListening(false);
      };
      recognition.start();
    } catch (err) {
      console.error('Voice search error:', err);
      setVoiceListening(false);
    }
  };

  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2 || !jobs) return [];
    const q = searchQuery.toLowerCase().trim();
    return jobs
      .filter(j => 
        j.title?.toLowerCase().includes(q) || 
        j.shortInfo?.toLowerCase().includes(q) ||
        j.category?.toLowerCase().includes(q) ||
        j.state?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, jobs]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        try {
          localStorage.setItem('fastarc_app_view', 'app');
          window.dispatchEvent(new CustomEvent('fastarc_toggle_app_mode', { detail: { mode: 'app' } }));
        } catch (e) {}
      }
    } else {
      // If browser has already installed or doesn't support deferredPrompt, toggle app view directly
      try {
        localStorage.setItem('fastarc_app_view', 'app');
        window.dispatchEvent(new CustomEvent('fastarc_toggle_app_mode', { detail: { mode: 'app' } }));
        if (!window.location.search.includes('mode=app')) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('mode', 'app');
          window.history.pushState({}, '', newUrl.toString());
        }
      } catch (e) {}
    }
  };

  const handleShareClick = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'FastArc - Govt Jobs Portal',
      text: 'FastArc - Sarkari Result, Latest Govt Jobs, Admit Card & Answer Key',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (e) {
        console.error('Clipboard copy failed', e);
      }
    }
  };

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    onTabChange(id);
    setIsDrawerOpen(false);
  };

  const navLinks = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Sparkles,
      iconColor: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60',
      activeCard: 'bg-amber-50/90 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-sm shadow-amber-500/10'
    },
    { 
      id: 'latest-jobs', 
      label: 'Latest Jobs', 
      icon: Briefcase,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/80 dark:border-blue-800/60',
      activeCard: 'bg-blue-50/90 dark:bg-blue-500/15 border-blue-300 dark:border-blue-500/40 text-blue-900 dark:text-blue-300 shadow-sm shadow-blue-500/10'
    },
    { 
      id: 'admit-card', 
      label: 'Admit Card', 
      icon: FileText,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60',
      activeCard: 'bg-rose-50/90 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-300 shadow-sm shadow-rose-500/10'
    },
    { 
      id: 'results', 
      label: 'Results', 
      icon: Award,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60',
      activeCard: 'bg-emerald-50/90 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 shadow-sm shadow-emerald-500/10'
    },
    { 
      id: 'answer-key', 
      label: 'Answer Key', 
      icon: CheckSquare,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200/80 dark:border-purple-800/60',
      activeCard: 'bg-purple-50/90 dark:bg-purple-500/15 border-purple-300 dark:border-purple-500/40 text-purple-900 dark:text-purple-300 shadow-sm shadow-purple-500/10'
    },
    { 
      id: 'syllabus', 
      label: 'Syllabus', 
      icon: BookOpen,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200/80 dark:border-sky-800/60',
      activeCard: 'bg-sky-50/90 dark:bg-sky-500/15 border-sky-300 dark:border-sky-500/40 text-sky-900 dark:text-sky-300 shadow-sm shadow-sky-500/10'
    },
    { 
      id: 'admission', 
      label: 'Admission', 
      icon: GraduationCap,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/80 dark:border-indigo-800/60',
      activeCard: 'bg-indigo-50/90 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-300 shadow-sm shadow-indigo-500/10'
    },
    { 
      id: 'student-docs', 
      label: 'Tools', 
      icon: FileText,
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50 border-fuchsia-200/80 dark:border-fuchsia-800/60',
      activeCard: 'bg-fuchsia-50/90 dark:bg-fuchsia-500/15 border-fuchsia-300 dark:border-fuchsia-500/40 text-fuchsia-900 dark:text-fuchsia-300 shadow-sm shadow-fuchsia-500/10'
    },
  ];

  return (
    <>
      {/* Blank & Blur Backdrop Overlay when search is open in mobile app */}
      {isApplication && isAppSearchOpen && (
        <div 
          className="fixed inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md z-40 transition-all duration-300 pointer-events-auto"
          onClick={() => setIsAppSearchOpen(false)}
        />
      )}

      <header className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 w-full transition-colors duration-300 relative z-50">
      <div className="w-full mx-auto px-3 sm:px-5 lg:px-6">
        {isApplication && isAppSearchOpen ? (
          /* Mobile App View: Full Header Search Column (matching image.png) */
          <div className="flex items-center w-full h-14 sm:h-16 gap-2 py-1 animate-in fade-in duration-200">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const el = document.getElementById('main-job-columns') || document.getElementById('section-latest-jobs');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 relative flex items-center bg-slate-100 dark:bg-[#070d1a] border border-slate-300 dark:border-amber-500/40 rounded-2xl shadow-sm dark:shadow-lg px-2.5 sm:px-3 py-1 sm:py-1.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all"
            >
              {/* Yellow/Amber Magnifier Icon */}
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#f59e0b] shrink-0 mr-2" />

              {/* Search Input Field */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery?.(e.target.value)}
                placeholder="Search Jobs, Admit Cards, Results..."
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none border-none pr-1"
              />

              {/* Clear Text button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery?.('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors mr-1 cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice Search Mic Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-full transition-colors mr-1.5 sm:mr-2 cursor-pointer ${
                  voiceListening 
                    ? 'text-red-500 bg-red-500/20 animate-pulse' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-amber-500'
                }`}
                title="Voice Search (Hindi / English)"
              >
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Orange/Amber Search Button */}
              <button
                type="submit"
                className="bg-[#f59e0b] hover:bg-[#d97706] active:bg-[#b45309] text-slate-950 font-black text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 rounded-xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Close Search Column Button */}
            <button
              type="button"
              onClick={() => setIsAppSearchOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer shadow-xs"
              title="Close Search"
              aria-label="Close Search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Normal Header Bar */
          <div className="flex justify-between h-14 sm:h-16 items-center py-1">
          
          {/* Left Side: All Options Hamburger Button + FastArc Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92, rotate: -4 }}
              onClick={() => setIsDrawerOpen(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer flex flex-col justify-center items-center gap-[4.5px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow hover:border-amber-400/70 group overflow-hidden shrink-0"
              title="All Options & Categories Menu"
              aria-label="Open Navigation Drawer"
            >
              {/* 3-bar Tiranga / Tricolor Hamburger Lines (Saffron, White/Silver, Green) */}
              <motion.span 
                className="w-5 sm:w-5.5 h-[2.5px] bg-[#EA580C] dark:bg-[#F97316] rounded-xs transition-all duration-200 group-hover:scale-x-110" 
              />
              <motion.span 
                className="w-5 sm:w-5.5 h-[2.5px] bg-slate-300 dark:bg-white border border-slate-300/80 dark:border-transparent rounded-xs transition-all duration-200 group-hover:scale-x-110" 
              />
              <motion.span 
                className="w-5 sm:w-5.5 h-[2.5px] bg-[#046A38] dark:bg-[#16A34A] rounded-xs transition-all duration-200 group-hover:scale-x-110" 
              />
            </motion.button>

            <a href="#" className="flex items-center space-x-2 sm:space-x-2.5 group" onClick={(e) => handleNavClick(e, 'home')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center overflow-hidden shrink-0 transform group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={siteLogo} 
                  alt="FastArc Logo" 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1IE6MQ8EUwyKmGeXnpLTXx7d5HBLJiKb4";
                  }}
                />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-0.5">
                  <span>Fast</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-300">Arc</span>
                </h1>
                <p className="text-[9.5px] sm:text-[10.5px] text-amber-700 dark:text-amber-400/90 font-extrabold tracking-wider uppercase mt-0.5">Govt Jobs Portal</p>
              </div>
            </a>
          </div>
          
          <nav className="hidden md:flex space-x-4 lg:space-x-6 text-sm sm:text-[15px] font-bold items-center">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href="#"
                onClick={(e) => handleNavClick(e, link.id)}
                className={`transition-colors font-bold text-[14px] lg:text-[15px] py-1 ${
                  activeTab === link.id
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                    : 'text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            <div className="relative flex items-center group" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors focus:outline-none outline-none font-bold text-[14px] lg:text-[15px] py-1 cursor-pointer"
              >
                More <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-2xl py-2 z-50 flex-col transition-all duration-200 origin-top-left ${isMoreOpen ? 'opacity-100 scale-100 flex' : 'opacity-0 scale-95 hidden pointer-events-none'}`}
              >
                <button onClick={() => { setIsMoreOpen(false); onInfoClick('about'); }} className="text-left w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-white font-bold text-xs">About Us</button>
                <button onClick={() => { setIsMoreOpen(false); onInfoClick('privacy'); }} className="text-left w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-white font-bold text-xs flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-500 font-black px-1.5 py-0.5 rounded">AdSense</span>
                </button>
                <button onClick={() => { setIsMoreOpen(false); onInfoClick('disclaimer'); }} className="text-left w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-white font-bold text-xs">Disclaimer</button>
                <button onClick={() => { setIsMoreOpen(false); onInfoClick('terms'); }} className="text-left w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-white font-bold text-xs">Terms & Conditions</button>
                <button onClick={() => { setIsMoreOpen(false); onInfoClick('contact'); }} className="text-left w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-white font-bold text-xs">Contact & Grievance</button>
                {isSuperAdmin && onOpenSuperAdminModal && (
                  <button 
                    onClick={() => { setIsMoreOpen(false); onOpenSuperAdminModal('websiteControl'); }} 
                    className="text-left w-full px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Website Control & Settings</span>
                  </button>
                )}
              </div>
            </div>

            {isSuperAdmin && (
              <div className="relative flex items-center ml-2" ref={adminRef}>
                <button
                  onClick={() => setIsDesktopAdminOpen(!isDesktopAdminOpen)}
                  className="flex items-center px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all font-bold text-xs focus:outline-none"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isDesktopAdminOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Desktop Super Admin Dropdown Mega-Menu */}
                <div 
                  className={`absolute top-full right-0 mt-2 w-72 bg-[#070d18] border border-amber-500/30 rounded-xl shadow-2xl z-50 flex-col transition-all duration-200 origin-top-right ${isDesktopAdminOpen ? 'opacity-100 scale-100 flex' : 'opacity-0 scale-95 hidden pointer-events-none'}`}
                >
                  <div className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Super Admin</span>
                    <span className="text-[8px] bg-amber-400/20 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">{SUPER_ADMIN_MODULES.length} PANELS</span>
                  </div>
                  <div className="p-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {Object.entries(
                      SUPER_ADMIN_MODULES.reduce((acc, mod) => {
                        if (!acc[mod.category]) acc[mod.category] = { label: mod.categoryLabel, items: [] };
                        acc[mod.category].items.push(mod);
                        return acc;
                      }, {} as Record<string, { label: string, items: typeof SUPER_ADMIN_MODULES }>)
                    ).map(([category, { label, items }]) => {
                      const isOpen = expandedCategories[category];
                      return (
                      <div key={category} className="mb-2 last:mb-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCategories(prev => ({ [category]: !prev[category] }));
                          }}
                          className="w-full px-2.5 py-1 flex items-center justify-between text-[9px] font-black text-slate-500 hover:text-slate-400 uppercase tracking-widest cursor-pointer group"
                        >
                          <span>{label}</span>
                          <div className="p-0.5 rounded bg-slate-800/50 group-hover:bg-slate-700 transition-colors">
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
                            {items.map((mod) => {
                              const IconComp = mod.icon;
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => { onOpenSuperAdminModal?.(mod.id); setIsDesktopAdminOpen(false); }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-amber-300 hover:bg-white/5 transition-all flex items-center group/item"
                                >
                                  <IconComp className="w-3.5 h-3.5 mr-2 text-amber-400/70 group-hover/item:text-amber-400 transition-colors" />
                                  <span className="truncate flex-1">{mod.label}</span>
                                  {mod.tag && (
                                    <span className="text-[8px] bg-amber-500/10 text-amber-300/80 font-bold px-1 rounded ml-1 shrink-0">{mod.tag}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Mobile App Search Button (Just to the left of Bell Icon, ONLY in Mobile App View) */}
            {isApplication && (
              <button 
                onClick={() => setIsAppSearchOpen(true)}
                className="relative w-9 h-9 flex items-center justify-center text-slate-700 hover:text-amber-500 dark:text-slate-200 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all focus:outline-none cursor-pointer shrink-0" 
                title="Search Jobs, Admit Cards, Results"
                aria-label="Search Jobs"
              >
                <Search className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </button>
            )}

            {/* 1. Notifications Button */}
            <button 
              onClick={onOpenNotifications}
              className="relative w-9 h-9 flex items-center justify-center text-slate-700 hover:text-amber-500 dark:text-slate-200 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all focus:outline-none cursor-pointer shrink-0" 
              title="Job Notifications & Alerts"
              aria-label="Job Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {/* 2. Dark Mode Toggle Button */}
            <button 
              onClick={onToggleDarkMode} 
              className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all focus:outline-none cursor-pointer shrink-0" 
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20 drop-shadow-md" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
            
            {/* Official Social Media Channels with Original Logos (Telegram & WhatsApp) - Hidden in Mobile App mode */}
            {!isApplication && (() => {
              const activeSocials = (socialLinks?.filter(l => l.enabled && l.platform !== 'youtube')) || [
                { id: 'tg', platform: 'telegram' as const, title: 'Telegram Channel', url: 'https://t.me/fastarcgovtofficial' },
                { id: 'wa', platform: 'whatsapp' as const, title: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/fastarcgovtofficial' }
              ];
              return (
                <div className="flex items-center space-x-2 sm:space-x-2.5">
                  {activeSocials.slice(0, 2).map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-110 active:scale-95 transition-transform flex items-center justify-center p-1 rounded-full"
                      title={`${item.title} - Official Channel`}
                    >
                      <OfficialSocialLogo platform={item.platform} className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] drop-shadow-sm" />
                    </a>
                  ))}
                </div>
              );
            })()}
            
            {/* Admin Control Bar / Action Buttons Dock Placeholder */}
            <div className="flex items-center space-x-0 ml-1.5 sm:ml-2">
              {!isLoggedIn && (
                <button
                  onClick={onAdminLoginClick}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-amber-500/40 bg-[#1e1e48] hover:bg-blue-950 text-amber-400 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Portal Login"
                  aria-label="Portal Login"
                >
                  <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
                </button>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Floating Live Autocomplete Dropdown when searching in Mobile App */}
      {isApplication && isAppSearchOpen && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 max-w-2xl mx-auto px-3 sm:px-4 mt-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="bg-white/95 dark:bg-[#070d18]/95 backdrop-blur-md border border-slate-200 dark:border-amber-500/30 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden py-1.5 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="px-3.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Matching Jobs &amp; Alerts ({searchSuggestions.length})</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Tap to view</span>
            </div>
            {searchSuggestions.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => {
                  setIsAppSearchOpen(false);
                  openJobInNewTab(job);
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 truncate">
                    {job.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="capitalize bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">{job.category?.replace('-', ' ')}</span>
                    <span>{job.postDate}</span>
                    {job.state && <span>• {job.state}</span>}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </header>

      {/* Slide-out Navigation Drawer Menu (All Options Panel) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDrawerOpen(false)} 
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" 
            />

            {/* Drawer Sidebar Panel */}
            <motion.div 
              initial={{ x: '-100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
              className="relative w-[86vw] sm:w-[420px] max-w-[88vw] sm:max-w-[430px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 h-full shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-y-auto"
            >
              
              {/* Top Official India Tricolor Line */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-white to-emerald-600 shrink-0 sticky top-0 z-20" />

              {/* Drawer Header */}
              <div className="px-3.5 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-between shadow-sm dark:shadow-md sticky top-1 z-10 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={siteLogo} 
                      alt="FastArc Logo" 
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1IE6MQ8EUwyKmGeXnpLTXx7d5HBLJiKb4";
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      Fast<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-300">Arc</span>
                    </h2>
                    <p className="text-[9px] text-amber-700 dark:text-amber-400/80 font-extrabold tracking-widest uppercase mt-0.5">Govt Jobs Portal</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Close Drawer"
                  aria-label="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            {/* Drawer Navigation Content */}
            <div className="p-3 space-y-5 flex-1 custom-scrollbar">

            {/* SECTION 1: Super Admin Control Options (for Super Admin) */}
            {isSuperAdmin && (
              <div className="bg-gradient-to-br from-slate-900 to-[#070d18] p-2.5 rounded-xl text-white shadow-lg border border-amber-500/30 flex flex-col gap-2">
                
                {/* Action Buttons Dock (Moved from Header) */}
                <div className="flex items-center h-10 rounded-lg border border-amber-500/40 bg-[#1e1e48] shadow-md divide-x divide-white/10 relative text-xs mb-2">
                  <div className="relative h-full flex-1" ref={header3DotRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsHeader3DotOpen(prev => !prev);
                      }}
                      className={`h-full w-full px-3 flex items-center justify-center transition-all hover:bg-blue-950 text-amber-400 cursor-pointer rounded-l-lg ${
                        isHeader3DotOpen ? 'bg-blue-950 text-amber-300 ring-1 ring-amber-400 shadow-inner' : ''
                      }`}
                      title="3-Dot Menu"
                      aria-label="3-Dot Menu"
                    >
                      <MoreVertical className="w-4 h-4 text-amber-400" />
                    </button>
                    {isHeader3DotOpen && (
                      <div 
                        className="absolute left-0 top-full mt-2 w-64 bg-[#090d16] border border-amber-500 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-4 py-3 bg-[#060a12] border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md flex items-center justify-center shrink-0">
                              <MoreVertical className="w-4 h-4 text-slate-950 stroke-[3]" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-white uppercase tracking-wider">3–DOT MENU OPTIONS</div>
                              <div className="text-[10.5px] text-amber-400 font-bold">Quick Access</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 space-y-2 bg-[#090d16]">
                           <button onClick={() => { setIsHeader3DotOpen(false); setIsDrawerOpen(false); onOpenSuperAdminModal?.('websiteControl'); }} className="w-full flex items-center space-x-3 p-2 rounded-lg bg-[#111936] hover:bg-[#18244d] text-left text-xs font-bold text-white">
                             <SlidersHorizontal className="w-4 h-4 text-white" />
                             <span>Website Control</span>
                           </button>
                           <button onClick={() => { setIsHeader3DotOpen(false); setIsDrawerOpen(false); onOpenSuperAdminModal?.('colors'); }} className="w-full flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-lg text-left text-xs font-bold text-slate-200">
                             <Palette className="w-4 h-4 text-pink-400" />
                             <span>Theme Customizer</span>
                           </button>
                           <button onClick={() => { setIsHeader3DotOpen(false); setIsDrawerOpen(false); onOpenSuperAdminModal?.('columns'); }} className="w-full flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-lg text-left text-xs font-bold text-slate-200">
                             <Type className="w-4 h-4 text-sky-400" />
                             <span>Column Settings</span>
                           </button>
                           <button 
                             onClick={() => { 
                               setIsHeader3DotOpen(false); 
                               setIsDrawerOpen(false); 
                               const nextMode = isApplication ? 'web' : 'app';
                               try {
                                 localStorage.setItem('fastarc_app_view', nextMode);
                               } catch(e) {}
                               window.dispatchEvent(new CustomEvent('fastarc_toggle_app_mode', { detail: { mode: nextMode } }));
                               const newUrl = new URL(window.location.href);
                               newUrl.searchParams.set('mode', nextMode);
                               window.history.pushState({}, '', newUrl.toString());
                             }} 
                             className="w-full flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-lg text-left text-xs font-bold text-amber-300 border border-amber-500/30 bg-amber-500/10"
                           >
                             <Smartphone className="w-4 h-4 text-amber-400" />
                             <span>{isApplication ? '🌐 Switch to Website View' : '📱 Switch to App View'}</span>
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => { setIsDrawerOpen(false); onOpenSuperAdminModal?.('analytics'); }}
                    className="h-full flex-1 px-3 flex items-center justify-center transition-colors hover:bg-blue-950 text-amber-400 cursor-pointer"
                    title="Control Center"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setIsDrawerOpen(false); onAdminLoginClick(); }}
                    className="h-full flex-1 px-3 flex items-center justify-center transition-colors hover:bg-blue-950 text-amber-400 cursor-pointer"
                    title="Add Job"
                  >
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>

                  <button 
                    type="button"
                    onClick={onLogout} 
                    className="h-full flex-1 px-3 bg-rose-950/90 hover:bg-rose-900 text-rose-400 flex items-center justify-center transition-colors cursor-pointer rounded-r-lg"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                  </button>
                </div>

                <button 
                  onClick={() => setIsSuperAdminMenuExpanded(!isSuperAdminMenuExpanded)}
                  className="w-full flex items-center justify-between pb-1.5 border-b border-slate-800/60 cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </h3>
                    <span className="text-[8px] bg-amber-400/20 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">
                      {SUPER_ADMIN_MODULES.length} PANELS
                    </span>
                  </div>
                  <div className={`p-1 rounded-md bg-slate-800 transition-colors group-hover:bg-slate-700 ${isSuperAdminMenuExpanded ? 'text-amber-400' : 'text-slate-400'}`}>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSuperAdminMenuExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {isSuperAdminMenuExpanded && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {Object.entries(
                      SUPER_ADMIN_MODULES.reduce((acc, mod) => {
                        if (!acc[mod.category]) acc[mod.category] = { label: mod.categoryLabel, items: [] };
                        acc[mod.category].items.push(mod);
                        return acc;
                      }, {} as Record<string, { label: string, items: typeof SUPER_ADMIN_MODULES }>)
                    ).map(([category, { label, items }]) => {
                      const isOpen = expandedCategories[category];
                      return (
                      <div key={category} className="bg-slate-900/60 rounded-lg p-1">
                        <button 
                          onClick={() => setExpandedCategories(prev => ({ [category]: !prev[category] }))}
                          className="w-full px-2 py-1 flex items-center justify-between text-[9px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest cursor-pointer group"
                        >
                          <span>{label}</span>
                          <div className="p-0.5 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="flex flex-col gap-0.5 mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
                            {items.map((mod) => {
                              const IconComp = mod.icon;
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => { setIsDrawerOpen(false); onOpenSuperAdminModal?.(mod.id); }}
                                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-bold hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 transition-all cursor-pointer group"
                                >
                                  <span className="flex items-center gap-2 truncate">
                                    <IconComp className="w-3 h-3 text-amber-500/70 group-hover:text-amber-400 group-hover:scale-110 transition-all shrink-0" />
                                    <span className="truncate">{mod.shortLabel}</span>
                                  </span>
                                  {mod.tag && (
                                    <span className="text-[7px] bg-amber-500/10 text-amber-300/80 font-bold px-1 rounded ml-1 shrink-0">
                                      {mod.tag}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )}

              {/* SECTION 2: Core Portal Sections (2-Column Grid) */}
              <div>
                <div className="flex gap-2 mb-2.5">
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center justify-center gap-1.5 flex-1 px-2 py-1.5 rounded-md bg-transparent border border-amber-600/80 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-none hover:bg-amber-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    title="Install App"
                  >
                    <Download className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>App Install</span>
                  </button>

                  <button
                    onClick={handleShareClick}
                    className="flex items-center justify-center gap-1.5 flex-1 px-2 py-1.5 rounded-md bg-transparent border border-amber-600/80 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-none hover:bg-amber-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    title="Share App"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="goldShareIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FDE68A" />
                          <stop offset="35%" stopColor="#FBBF24" />
                          <stop offset="75%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M9 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V14"
                        stroke="url(#goldShareIconGrad)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 15.5C8.5 11 11.5 7.5 20.5 6.5M20.5 6.5L15 2M20.5 6.5L15.5 11"
                        stroke="url(#goldShareIconGrad)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{isCopied ? 'Link Copied!' : 'Share App'}</span>
                  </button>
                </div>
                <button 
                  onClick={() => setExpandedSidebarSections(prev => ({ portal: !prev.portal }))}
                  className="w-full text-left flex items-center justify-between mb-2 px-1 cursor-pointer group"
                >
                  <h3 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Portal Sections
                  </h3>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedSidebarSections.portal ? 'rotate-180' : ''}`} />
                </button>
                {expandedSidebarSections.portal && (
                  <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 fade-in duration-200">
                    {navLinks.map((link) => {
                      const IconComp = link.icon;
                      const isActive = activeTab === link.id;
                      return (
                        <button
                          key={link.id}
                          onClick={(e) => handleNavClick(e as any, link.id)}
                          className={`flex flex-col items-start justify-center p-2.5 rounded-xl transition-all cursor-pointer border group ${
                            isActive 
                              ? `${link.activeCard}`
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs'
                          }`}
                        >
                          <div className={`p-2 rounded-xl mb-1.5 transition-transform group-hover:scale-105 border ${link.iconBg}`}>
                            <IconComp className={`w-4 h-4 ${link.iconColor}`} />
                          </div>
                          <span className={`text-[11px] tracking-tight truncate w-full text-left ${isActive ? 'font-black' : 'font-bold text-slate-700 dark:text-slate-200'}`}>
                            {link.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 3: Community & Social Links (Compact Pills) */}
              <div>
                <button 
                  onClick={() => setExpandedSidebarSections(prev => ({ connect: !prev.connect }))}
                  className="w-full text-left flex items-center justify-between mb-2 px-1 cursor-pointer group"
                >
                  <h3 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    <Send className="w-3 h-3 text-sky-500" /> Connect
                  </h3>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedSidebarSections.connect ? 'rotate-180' : ''}`} />
                </button>
                {expandedSidebarSections.connect && (
                  <div className="grid grid-cols-2 gap-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                    {(socialLinks?.filter(l => l.enabled) || [
                      { id: 'tg', platform: 'telegram' as const, title: 'Telegram Channel', url: 'https://t.me/fastarcgovtofficial' },
                      { id: 'wa', platform: 'whatsapp' as const, title: 'WhatsApp Alerts', url: 'https://whatsapp.com/channel/fastarcgovtofficial' }
                    ]).map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 font-bold text-[10px] transition-all shadow-none hover:scale-[1.02]"
                      >
                        <OfficialSocialLogo platform={item.platform} className="w-4 h-4 shrink-0" />
                        <span className="truncate leading-tight">{item.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: Information & Help Pages (Compact List) */}
              <div>
                <button 
                  onClick={() => setExpandedSidebarSections(prev => ({ pages: !prev.pages }))}
                  className="w-full text-left flex items-center justify-between mb-2 px-1 cursor-pointer group"
                >
                  <h3 className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    <Info className="w-3 h-3 text-indigo-500" /> Pages & Info
                  </h3>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expandedSidebarSections.pages ? 'rotate-180' : ''}`} />
                </button>
                {expandedSidebarSections.pages && (
                  <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-800/30 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800/50 animate-in slide-in-from-top-1 fade-in duration-200">
                  <button 
                    onClick={() => { setIsDrawerOpen(false); onInfoClick('about'); }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" /> <span className="truncate">About Us</span>
                  </button>
                  <button 
                    onClick={() => { setIsDrawerOpen(false); onInfoClick('privacy'); }}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Shield className="w-3 h-3" /> <span className="truncate">Privacy</span>
                    </span>
                    <span className="text-[7px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-black uppercase ml-1 shrink-0">AdSense</span>
                  </button>
                  <button 
                    onClick={() => { setIsDrawerOpen(false); onInfoClick('disclaimer'); }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <AlertCircle className="w-3 h-3" /> <span className="truncate">Disclaimer</span>
                  </button>
                  <button 
                    onClick={() => { setIsDrawerOpen(false); onInfoClick('terms'); }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <FileText className="w-3 h-3" /> <span className="truncate">Terms</span>
                  </button>
                  <button 
                    onClick={() => { setIsDrawerOpen(false); onInfoClick('contact'); }}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors text-[10px] font-bold cursor-pointer col-span-2"
                  >
                    <Phone className="w-3 h-3" /> <span className="truncate">Contact Support & Grievance</span>
                  </button>
                </div>
                )}
              </div>

              {/* SECTION: Language Selector (Added directly above Theme Mode button) */}
              <div className="pt-2">
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLanguageModalOpen(true)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500/60 hover:bg-amber-50/50 dark:hover:bg-slate-750 transition-all cursor-pointer group"
                    title="Change Website Language / भाषा बदलें"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <HindiEnglishIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left truncate">
                        <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>Language</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">भाषा</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                          {activeLangObj.flag} {activeLangObj.nativeName} ({activeLangObj.name})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                      <span className="text-[11px]">Change</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION: Theme Mode Selection (Light, Dark, System) */}
              <div className="pt-1.5 flex justify-center pb-4">
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSetThemeMode) onSetThemeMode('light');
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        themeMode === 'light'
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Sun className={`w-3.5 h-3.5 ${themeMode === 'light' ? 'text-amber-500' : ''}`} />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSetThemeMode) onSetThemeMode('dark');
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        themeMode === 'dark'
                          ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Moon className={`w-3.5 h-3.5 ${themeMode === 'dark' ? 'text-indigo-400' : ''}`} />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSetThemeMode) onSetThemeMode('system');
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        themeMode === 'system'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-800/50'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>System</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Footer Admin Quick Portal Access */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 flex justify-center">
              {isLoggedIn ? (
                <button
                  onClick={() => { setIsDrawerOpen(false); onLogout(); }}
                  className="group relative flex items-center bg-rose-950/80 hover:bg-rose-900/90 text-rose-400 border border-rose-800/80 hover:border-rose-500/80 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer hover:shadow-rose-500/20 active:scale-95"
                  title="Click to Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="max-w-0 group-hover:max-w-[80px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out text-rose-400 font-extrabold text-xs group-hover:ml-1.5">
                    Logout
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => { setIsDrawerOpen(false); onAdminLoginClick(); }}
                  className="p-2 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 bg-transparent transition-all cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                  title="Staff / Admin Login"
                >
                  <ShieldCheck className="w-6 h-6" />
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Language Modal */}
    <LanguageModal
      isOpen={isLanguageModalOpen}
      onClose={() => setIsLanguageModalOpen(false)}
      currentLangCode={currentLangCode}
      onSelectLanguage={(code) => {
        setCurrentLangCode(code);
        changeSiteLanguage(code);
      }}
    />
  </>
);
};
