import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { 
  Search, Mic, MicOff, X, Sparkles, ChevronLeft, ChevronRight,
  Crop, FileText, HeartHandshake, Calendar, Keyboard, ArrowRight,
  Wrench, Clock, Layers, ExternalLink, ShieldCheck, Flame
} from 'lucide-react';
import { JobAlert, SocialLinkItem, MobileTabsConfig, AppToolItem, AppBannerItem } from '../types';
import { ColumnConfigsMap } from '../utils/columnConfig';
import { isImageIconUrl } from './CategoryIcon';
import { OfficialSocialLogo } from './SocialIcons';
import { ToolDetailModal } from './ToolDetailModal';
import { DEFAULT_MOBILE_TABS_CONFIG, DEFAULT_TRENDING_BANNERS, DEFAULT_BANNER_SLIDER_CONFIG } from '../data/mobileTabsData';
import { openInDefaultBrowser } from '../utils/urlUtils';

interface ModernAppViewProps {
  jobs: JobAlert[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSelectJob?: (job: JobAlert) => void;
  socialLinks?: SocialLinkItem[];
  siteLogo?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  columnConfigs?: ColumnConfigsMap;
  mobileTabsConfig?: MobileTabsConfig;
}

export const ModernAppView: React.FC<ModernAppViewProps> = ({
  jobs,
  activeTab,
  onTabChange,
  onSelectJob,
  socialLinks,
  siteLogo = "/logo.png",
  searchQuery = "",
  setSearchQuery,
  columnConfigs,
  mobileTabsConfig = DEFAULT_MOBILE_TABS_CONFIG
}) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const lastTapRef = useRef<{ [key: string]: number }>({});

  const handleGoHome = () => {
    onTabChange('home');
    if (setSearchQuery) {
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const checkDoubleTap = (btnKey: string, singleTapAction: () => void) => {
    const now = Date.now();
    const last = lastTapRef.current[btnKey] || 0;
    if (now - last < 400) {
      lastTapRef.current[btnKey] = 0;
      handleGoHome();
    } else {
      lastTapRef.current[btnKey] = now;
      singleTapAction();
    }
  };

  // Active dynamic banners from Super Admin configuration
  const bannerList: AppBannerItem[] = useMemo(() => {
    if (mobileTabsConfig?.banners && Array.isArray(mobileTabsConfig.banners) && mobileTabsConfig.banners.length > 0) {
      const active = mobileTabsConfig.banners.filter(b => b.enabled);
      if (active.length > 0) return active;
    }
    return DEFAULT_TRENDING_BANNERS;
  }, [mobileTabsConfig?.banners]);

  // Dynamic Slider Settings (speed, auto-slide, pause, dots, arrows)
  const sliderConfig = useMemo(() => {
    return mobileTabsConfig?.bannerSliderConfig || DEFAULT_BANNER_SLIDER_CONFIG;
  }, [mobileTabsConfig?.bannerSliderConfig]);

  // Pagination and slide animation helpers
  const paginate = (newDirection: number) => {
    if (bannerList.length <= 1) return;
    setDirection(newDirection);
    setPage(prev => (prev + newDirection + bannerList.length) % bannerList.length);
  };

  const goToSlide = (idx: number) => {
    if (idx === page) return;
    setDirection(idx > page ? 1 : -1);
    setPage(idx);
  };

  // Safe page index bounds check if banner list length changes
  useEffect(() => {
    if (page >= bannerList.length) {
      setPage(0);
    }
  }, [bannerList.length, page]);

  // Dynamic auto-play timer configurable from Super Admin
  useEffect(() => {
    if (!sliderConfig.autoSlide || (sliderConfig.pauseOnHover && isPaused) || bannerList.length <= 1) return;
    const intervalTime = Math.max(2000, sliderConfig.slideIntervalMs || 4500);
    const timer = setInterval(() => {
      paginate(1);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPaused, page, bannerList.length, sliderConfig.autoSlide, sliderConfig.pauseOnHover, sliderConfig.slideIntervalMs]);

  // Ultra-smooth slide variants with tuned spring physics and fluid easing
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
      opacity: 0.7,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28, mass: 0.8 },
        opacity: { duration: 0.35, ease: "easeOut" },
        scale: { duration: 0.35, ease: "easeOut" }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0.7,
      scale: 0.98,
      zIndex: 0,
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28, mass: 0.8 },
        opacity: { duration: 0.3, ease: "easeIn" },
        scale: { duration: 0.3, ease: "easeIn" }
      }
    })
  };

  // Dynamic banner action click handler (supports URLs, specific Jobs, and Categories)
  const handleReadMore = (slide: AppBannerItem) => {
    if (slide.targetType === 'url' && slide.targetValue) {
      openInDefaultBrowser(slide.targetValue);
      return;
    }

    if (slide.targetType === 'job' && slide.targetValue) {
      const targetJob = jobs.find(j => j.id === slide.targetValue || j.title.toLowerCase() === slide.targetValue?.toLowerCase());
      if (targetJob && onSelectJob) {
        onSelectJob(targetJob);
        return;
      }
    }

    const targetCategory = slide.category || 'latest-jobs';
    const terms = [slide.id, slide.title, targetCategory];
    const matching = jobs.find(j => 
      terms.some(t => j.title.toLowerCase().includes(t.toLowerCase()) || (j.shortInfo && j.shortInfo.toLowerCase().includes(t.toLowerCase())))
    ) || jobs.find(j => j.category === targetCategory) || jobs[0];

    if (matching && onSelectJob) {
      onSelectJob(matching);
    } else {
      onTabChange(targetCategory);
      if (setSearchQuery) {
        setSearchQuery(slide.title.split(' ')[0]);
      }
      const el = document.getElementById(`section-${targetCategory}`) || document.getElementById('main-job-columns');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Round Categories from Screenshot & Column Configs
  const categories = [
    {
      id: 'home',
      label: 'HOME',
      type: 'logo',
      targetTab: 'home',
      configKey: undefined,
      icon: null
    },
    {
      id: 'latest-jobs',
      label: 'LATEST JOBS',
      type: 'jobs',
      targetTab: 'latest-jobs',
      configKey: 'latest-jobs',
      icon: (
        // Bright Golden 5-Point Star matching Screenshot PNG
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M24 5.5l5.8 11.8 13 1.9-9.4 9.2 2.2 13-11.6-6.1-11.6 6.1 2.2-13-9.4-9.2 13-1.9L24 5.5z" 
            fill="url(#goldStarGrad)" 
            stroke="#F59E0B" 
            strokeWidth="1.2" 
            strokeLinejoin="round" 
          />
          <defs>
            <linearGradient id="goldStarGrad" x1="24" y1="5.5" x2="24" y2="41.4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="35%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'result',
      label: 'RESULT',
      type: 'result',
      targetTab: 'results',
      configKey: 'results',
      icon: (
        // Golden Trophy Cup matching Screenshot PNG
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldTrophyGrad" x1="24" y1="7" x2="24" y2="39" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="80%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path d="M15 9h18v11c0 5-4 9-9 9s-9-4-9-9V9z" fill="url(#goldTrophyGrad)" stroke="#D97706" strokeWidth="1.2" />
          <path d="M15 12H9a3 3 0 0 0-3 3v2a6 6 0 0 0 6 6h3" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M33 12h6a3 3 0 0 1 3 3v2a6 6 0 0 1-6 6h-3" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24 29v6" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
          <rect x="14" y="35" width="20" height="4" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
        </svg>
      )
    },
    {
      id: 'admit-card',
      label: 'ADMIT CARD',
      type: 'admit',
      targetTab: 'admit-card',
      configKey: 'admit-cards',
      icon: (
        // White Document with blue header band matching Screenshot PNG
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="8" width="24" height="32" rx="3" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M12 11a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v5H12v-5z" fill="#0284C7" />
          <line x1="17" y1="21" x2="31" y2="21" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="26" x2="31" y2="26" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="31" x2="26" y2="31" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'admission',
      label: 'ADMISSION',
      type: 'admission',
      targetTab: 'admission',
      configKey: 'admission',
      icon: (
        // Graduation mortarboard cap with golden tassel matching Screenshot PNG
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 10L6 19l18 9 18-9-18-9z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M14 23.5v8c0 3.2 4.5 5.5 10 5.5s10-2.3 10-5.5v-8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M38 20.5v11" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="38" cy="33" r="2" fill="#FBBF24" />
        </svg>
      )
    },
    {
      id: 'answer-key',
      label: 'ANSWER KEY',
      type: 'answer',
      targetTab: 'answer-key',
      configKey: 'answer-key',
      icon: (
        // Golden diagonal key matching Screenshot PNG
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="17" cy="17" r="7.5" fill="none" stroke="#FBBF24" strokeWidth="3" />
          <path d="M23 23l14 14" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 32l3-3" stroke="#FBBF24" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M35 35l3-3" stroke="#FBBF24" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'syllabus',
      label: 'SYLLABUS',
      type: 'syllabus',
      targetTab: 'syllabus',
      configKey: 'syllabus',
      icon: (
        // Open book with graduation cap
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 28c4-2 8-2 12 1 4-3 8-3 12-1v10c-4-2-8-2-12 1-4-3-8-3-12-1V28z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.8" />
          <path d="M24 29v10" stroke="#38BDF8" strokeWidth="1.8" />
          {/* Cap */}
          <path d="M24 10l12 6-12 6-12-6 12-6z" fill="#FBBF24" />
          <path d="M18 19v4c0 3.3 2.7 6 6 6s6-2.7 6-6v-4" fill="#FBBF24" />
          <path d="M33 17v7" stroke="#F59E0B" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'certificates',
      label: 'CERTIFICATE',
      type: 'certificates',
      targetTab: 'documents',
      configKey: 'documents',
      icon: (
        // Certificate with rosette seal
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="11" y="9" width="26" height="30" rx="3" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="24" cy="22" r="5.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
          <path d="M22 26.5l-2.5 6.5 4.5-2 4.5 2-2.5-6.5" fill="#EF4444" />
          <rect x="15" y="31" width="18" height="2" rx="1" fill="#38BDF8" />
        </svg>
      )
    },
    {
      id: 'important',
      label: 'IMPORTANT',
      type: 'important',
      targetTab: 'important',
      configKey: 'important',
      icon: (
        // Important warning / notice
        <svg viewBox="0 0 48 48" className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 7l18 31H6L24 7z" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
          <line x1="24" y1="18" x2="24" y2="28" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="24" cy="33.5" r="2.2" fill="#FBBF24" />
        </svg>
      )
    }
  ];

  // Render category icon helper: respects custom admin icons and provides fallback
  const renderCategoryIcon = (cat: typeof categories[0]) => {
    if (cat.configKey && columnConfigs?.[cat.configKey]?.icon) {
      const customIcon = columnConfigs[cat.configKey].icon;
      if (isImageIconUrl(customIcon)) {
        return (
          <img
            src={customIcon}
            alt={cat.label}
            className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 object-contain rounded-full"
          />
        );
      }
      // If emoji or text string
      return (
        <span className="text-xl sm:text-2xl select-none" role="img" aria-label={cat.label}>
          {customIcon}
        </span>
      );
    }
    return cat.icon;
  };

  // Social Links matching exact order and design from the uploaded screenshot:
  // 1. Telegram, 2. WhatsApp, 3. YouTube, 4. Instagram, 5. X, 6. Facebook
  const socials = [
    {
      id: 'telegram',
      label: 'TELEGRAM',
      platform: 'telegram',
      url: socialLinks?.find(s => s.platform === 'telegram')?.url || 'https://t.me/fastarcgovtofficial',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none">
          <path 
            d="M21.5 3.5L2.5 10.8C1.2 11.3 1.2 12.1 2.3 12.4L7.2 13.9L18.5 6.8C19 6.5 19.5 6.7 19.1 7.1L10 15.3L9.6 19.8C10.1 19.8 10.3 19.6 10.6 19.3L13.5 16.5L18.8 20.4C19.8 21 20.5 20.7 20.7 19.5L22.8 4.6C23.2 3.2 22.3 2.6 21.5 3.5Z" 
            fill="#29B6F6" 
          />
        </svg>
      )
    },
    {
      id: 'whatsapp',
      label: 'WHATSAPP',
      platform: 'whatsapp',
      url: socialLinks?.find(s => s.platform === 'whatsapp')?.url || 'https://whatsapp.com/channel/fastarcgovtofficial',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none">
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12.04 2C6.56 2 2.1 6.46 2.1 11.94C2.1 13.72 2.57 15.45 3.46 16.98L2.05 22.14L7.34 20.76C8.82 21.57 10.48 22 12.04 22C17.52 22 21.98 17.54 21.98 12.06C21.98 6.58 17.52 2 12.04 2ZM17.48 16.2C17.25 16.84 16.35 17.42 15.63 17.57C15.14 17.67 14.49 17.75 12.35 16.86C9.62 15.73 7.85 12.97 7.71 12.79C7.58 12.6 6.57 11.26 6.57 9.87C6.57 8.48 7.28 7.8 7.55 7.52C7.78 7.28 8.16 7.17 8.52 7.17C8.64 7.17 8.75 7.18 8.85 7.18C9.14 7.2 9.29 7.21 9.48 7.67C9.72 8.24 10.3 9.68 10.37 9.83C10.45 9.98 10.52 10.18 10.42 10.38C10.33 10.58 10.24 10.67 10.1 10.84C9.95 11 9.81 11.13 9.66 11.31C9.5 11.49 9.34 11.69 9.52 12C9.7 12.31 10.33 13.34 11.26 14.17C12.46 15.24 13.45 15.58 13.81 15.73C14.09 15.85 14.43 15.82 14.63 15.6C14.89 15.32 15.21 14.86 15.54 14.4C15.77 14.07 16.07 14.12 16.37 14.23C16.68 14.34 18.32 15.15 18.66 15.32C19 15.49 19.23 15.57 19.29 15.69C19.35 15.8 19.35 16.44 17.48 16.2Z" 
            fill="#25D366" 
          />
        </svg>
      )
    },
    {
      id: 'youtube',
      label: 'YOUTUBE',
      platform: 'youtube',
      url: socialLinks?.find(s => s.platform === 'youtube')?.url || 'https://youtube.com/@fastarcgovtofficial',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="4.5" fill="#FF0000" />
          <path d="M10 8.5L15.5 12L10 15.5V8.5Z" fill="#FFFFFF" />
        </svg>
      )
    },
    {
      id: 'instagram',
      label: 'INSTAGRAM',
      platform: 'instagram',
      url: socialLinks?.find(s => s.platform === 'instagram')?.url || 'https://instagram.com/fastarcgovtofficial',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none">
          <defs>
            <linearGradient id="ig-grad-modern" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFDC80" />
              <stop offset="25%" stopColor="#F56040" />
              <stop offset="50%" stopColor="#FD1D1D" />
              <stop offset="75%" stopColor="#E1306C" />
              <stop offset="100%" stopColor="#833AB4" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="url(#ig-grad-modern)" strokeWidth="2.2" fill="none" />
          <circle cx="12" cy="12" r="4" stroke="url(#ig-grad-modern)" strokeWidth="2.2" fill="none" />
          <circle cx="17.2" cy="6.8" r="1.3" fill="url(#ig-grad-modern)" />
        </svg>
      )
    },
    {
      id: 'twitter',
      label: 'X',
      platform: 'twitter',
      url: socialLinks?.find(s => s.platform === 'twitter')?.url || 'https://x.com/fastarcgovt',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none">
          <path 
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" 
            fill="#00BAF2" 
          />
        </svg>
      )
    },
    {
      id: 'facebook',
      label: 'FACEBOOK',
      platform: 'facebook',
      url: socialLinks?.find(s => s.platform === 'facebook')?.url || 'https://facebook.com/fastarcgovtofficial',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="none">
          <circle cx="12" cy="12" r="10" fill="#1877F2" />
          <path 
            d="M13.5 12H15.2L15.5 9.8H13.5V8.4C13.5 7.8 13.7 7.3 14.6 7.3H15.6V5.4C15.1 5.3 14.3 5.2 13.5 5.2C11.8 5.2 10.6 6.2 10.6 8.1V9.8H8.8V12H10.6V17.8C11.1 17.9 11.6 18 12.1 18C12.6 18 13.1 17.9 13.5 17.8V12Z" 
            fill="#FFFFFF" 
          />
        </svg>
      )
    }
  ];

  const activeSlideData: AppBannerItem = bannerList[page] || bannerList[0] || DEFAULT_TRENDING_BANNERS[0];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/50 pb-2 transition-colors">
      {/* 1. TRENDING SECTION */}
      <section className="w-full max-w-6xl mx-auto pt-3 px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide flex items-center gap-2 uppercase">
              <span>Trending</span>
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300/50 dark:border-slate-700">
            {page + 1} / {bannerList.length}
          </span>
        </div>

        {/* Carousel Container with Interactive Drag & Touch Swipe */}
        <div 
          className="relative w-full max-w-4xl mx-auto h-44 sm:h-56 md:h-64 overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl select-none"
          onMouseEnter={() => sliderConfig.pauseOnHover && setIsPaused(true)}
          onMouseLeave={() => sliderConfig.pauseOnHover && setIsPaused(false)}
          onTouchStart={() => sliderConfig.pauseOnHover && setIsPaused(true)}
          onTouchEnd={() => sliderConfig.pauseOnHover && setIsPaused(false)}
        >
          {/* Navigation Chevrons for Quick Slide Navigation */}
          {sliderConfig.showArrows !== false && bannerList.length > 1 && (
            <>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs shadow-lg transition-transform active:scale-90 cursor-pointer border border-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs shadow-lg transition-transform active:scale-90 cursor-pointer border border-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Active Sliding Card with Real Horizontal Spring Physics */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -40 || velocity.x < -300) {
                  paginate(1);
                } else if (swipe > 40 || velocity.x > 300) {
                  paginate(-1);
                }
              }}
              className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-r ${activeSlideData.gradient} p-4 sm:p-6 md:p-8 flex items-center justify-between shadow-xl overflow-hidden text-white cursor-grab active:cursor-grabbing touch-pan-y`}
            >
              {/* Left Side Scene Illustration / Custom Image / Blackboard */}
              <div className="w-1/2 sm:w-5/12 h-full flex items-center justify-center relative shrink-0 pointer-events-none">
                {activeSlideData.illustrationType === 'custom_image' && activeSlideData.customImageUrl ? (
                  <img
                    src={activeSlideData.customImageUrl}
                    alt={activeSlideData.title}
                    className="w-full h-full max-h-48 sm:max-h-56 object-contain drop-shadow-xl select-none"
                    onError={(e) => {
                      // Fallback to SVG if image fails
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : activeSlideData.illustrationType === 'gradient_only' ? (
                  <div className="flex flex-col items-center justify-center text-white/20">
                    <Sparkles className="w-16 h-16 sm:w-24 sm:h-24 stroke-[1.2]" />
                  </div>
                ) : (
                  <svg viewBox="0 0 280 200" className="w-full h-full max-h-52 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Green Chalkboard with wooden frame */}
                    <rect x="20" y="20" width="130" height="85" rx="4" fill="#654321" stroke="#4a3525" strokeWidth="2.5" />
                    <rect x="25" y="25" width="120" height="75" rx="2" fill="#2d5a27" />
                    {/* Chalkboard Hindi Text */}
                    <text x="85" y="65" fill="#ffffff" fontSize="19" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" opacity="0.95">
                      {activeSlideData.boardText || 'इतिहास'}
                    </text>
                    <line x1="45" y1="78" x2="125" y2="78" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                    {/* Floor line */}
                    <line x1="5" y1="175" x2="275" y2="175" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />

                    {/* Wooden Teacher/Student Desk */}
                    <rect x="75" y="105" width="125" height="10" rx="2" fill="#d97706" />
                    <rect x="85" y="115" width="6" height="60" fill="#92400e" />
                    <rect x="185" y="115" width="6" height="60" fill="#92400e" />
                    <rect x="80" y="145" width="115" height="4" fill="#b45309" opacity="0.6" />

                    {/* Teacher / Candidate Character */}
                    <circle cx="160" cy="80" r="14" fill="#fed7aa" />
                    {/* Hair */}
                    <path d="M148 78c0-8 6-15 14-15s14 7 14 15c-3-2-7-3-11-2-5 1-9 1-17 2z" fill="#1e293b" />
                    {/* Specs */}
                    <rect x="153" y="77" width="6" height="4" rx="1" stroke="#0f172a" strokeWidth="1" fill="none" />
                    <rect x="162" y="77" width="6" height="4" rx="1" stroke="#0f172a" strokeWidth="1" fill="none" />
                    <line x1="159" y1="79" x2="162" y2="79" stroke="#0f172a" strokeWidth="1" />
                    {/* Body & Blue Shirt */}
                    <path d="M142 120c0-14 8-24 18-24s18 10 18 24v25h-36v-25z" fill="#0284c7" />
                    {/* Collar & Tie */}
                    <path d="M156 96l4 8 4-8h-8z" fill="#ffffff" />
                    <path d="M158 104l2 12 2-12h-4z" fill="#e11d48" />

                    {/* Globe on desk */}
                    <circle cx="100" cy="90" r="10" fill="#38bdf8" />
                    <path d="M93 88c4 3 10 2 14-2" stroke="#22c55e" strokeWidth="2.5" fill="none" />
                    <path d="M96 95c3 2 7 1 8-2" stroke="#22c55e" strokeWidth="2" fill="none" />
                    <path d="M100 80a10 10 0 0 1 0 20" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
                    <line x1="100" y1="100" x2="100" y2="105" stroke="#64748b" strokeWidth="2" />
                    <rect x="95" y="104" width="10" height="2" rx="1" fill="#64748b" />

                    {/* Books Stack on desk */}
                    <rect x="120" y="99" width="22" height="4" rx="1" fill="#ef4444" />
                    <rect x="122" y="95" width="18" height="4" rx="1" fill="#f59e0b" />
                    <rect x="121" y="91" width="20" height="4" rx="1" fill="#10b981" />

                    {/* Green Potted Plant on floor */}
                    <path d="M40 148l5 27h16l5-27H40z" fill="#b45309" />
                    <circle cx="53" cy="138" r="10" fill="#22c55e" />
                    <circle cx="44" cy="144" r="8" fill="#16a34a" />
                    <circle cx="62" cy="144" r="8" fill="#15803d" />
                  </svg>
                )}
              </div>

              {/* Right Side Info & Action Button */}
              <div className="w-1/2 sm:w-7/12 pl-2 sm:pl-6 flex flex-col items-start justify-center z-10">
                <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5 sm:mb-2.5 pointer-events-none ${
                  activeSlideData.badgeColor ? activeSlideData.badgeColor : 'bg-white/20 backdrop-blur-xs text-white'
                }`}>
                  {activeSlideData.badgeText || 'Top Alert'}
                </span>
                <h3 className="text-base sm:text-2xl md:text-3xl font-black text-white leading-snug sm:leading-tight mb-2 sm:mb-4 drop-shadow-sm pointer-events-none">
                  {activeSlideData.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/90 line-clamp-1 sm:line-clamp-2 mb-3 sm:mb-4 hidden sm:block pointer-events-none">
                  {activeSlideData.subtitle}
                </p>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => checkDoubleTap(activeSlideData.id, () => handleReadMore(activeSlideData))}
                  onDoubleClick={handleGoHome}
                  className={`bg-white ${activeSlideData.readMoreColor || 'text-[#8c1328]'} font-black text-xs sm:text-sm px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                >
                  {activeSlideData.buttonText || 'Read More'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Dots with Expanding Active Pill */}
        {sliderConfig.showDots !== false && bannerList.length > 1 && (
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mt-3.5 mb-2">
            {bannerList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => checkDoubleTap(`dot-${idx}`, () => goToSlide(idx))}
                onDoubleClick={handleGoHome}
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
                  page === idx
                    ? 'w-7 h-2.5 bg-[#8c1328] dark:bg-[#e11d48] scale-105 shadow-sm'
                    : 'w-2.5 h-2.5 border-2 border-slate-400 dark:border-slate-500 bg-transparent hover:border-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. CATEGORIES SECTION (Squircle Buttons with Light/Dark Mode Theme) */}
      <section className="w-full mt-2.5 bg-white dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-sm py-2.5 sm:py-3 transition-colors duration-300">
        {/* Category Header Bar */}
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between mb-2 sm:mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <h2 className="text-[11px] sm:text-xs md:text-sm font-black tracking-[0.16em] sm:tracking-[0.2em] text-slate-900 dark:text-white uppercase drop-shadow-xs transition-colors">
              CATEGORIES
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline uppercase tracking-wider transition-colors">
            Select category to view notices
          </span>
        </div>

        {/* Categories Squircle Scroll Strip */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-start justify-start sm:justify-center gap-2 sm:gap-3 md:gap-4 min-w-max px-2">
            {categories.map((cat) => {
              const isCatActive = activeTab === cat.targetTab;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    checkDoubleTap(cat.id, () => {
                      onTabChange(cat.targetTab);
                      if (cat.targetTab === 'home') {
                        if (setSearchQuery) setSearchQuery('');
                        window.scrollTo({ top: 0, behavior: 'auto' });
                      } else {
                        const el = document.getElementById(`section-${cat.targetTab}`) || document.getElementById('main-job-columns');
                        if (el) {
                          el.scrollIntoView({ behavior: 'auto' });
                        } else {
                          window.scrollTo({ top: 260, behavior: 'auto' });
                        }
                      }
                    });
                  }}
                  onDoubleClick={handleGoHome}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none transition-transform active:scale-95 shrink-0"
                >
                  {/* Squircle Container matching PNG with Light & Dark Mode */}
                  <div className={`relative w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:-translate-y-0.5 aspect-square ${
                    isCatActive 
                      ? 'bg-amber-50/90 dark:bg-[#15233e] border-2 border-amber-500 dark:border-amber-400 ring-2 ring-amber-400/30 shadow-md scale-105' 
                      : 'bg-slate-100 hover:bg-slate-200/90 dark:bg-[#0f172a] dark:hover:bg-[#162238] border border-slate-200 dark:border-slate-700/70 group-hover:border-amber-500/70 dark:group-hover:border-amber-400/70 shadow-xs dark:shadow-md dark:shadow-black/40 group-hover:shadow-md'
                  }`}>
                    {/* Inside Icon */}
                    <div className="relative z-10 flex items-center justify-center w-full h-full p-1.5 sm:p-2">
                      {cat.type === 'logo' ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden p-0.5 bg-slate-200/70 dark:bg-white/10 flex items-center justify-center transition-colors">
                          <img 
                            src={siteLogo} 
                            alt="Home" 
                            className="w-full h-full object-contain rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1IE6MQ8EUwyKmGeXnpLTXx7d5HBLJiKb4";
                            }}
                          />
                        </div>
                      ) : (
                        renderCategoryIcon(cat)
                      )}
                    </div>
                  </div>

                  {/* Label underneath */}
                  <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center mt-1.5 max-w-[72px] truncate transition-colors ${
                    isCatActive 
                      ? 'text-amber-600 dark:text-amber-400 font-black underline underline-offset-4' 
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                  }`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FOLLOW US SECTION (Squircle Buttons with Light/Dark Mode Theme) */}
      <section className="w-full mt-2.5 bg-white dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-sm py-2.5 sm:py-3 transition-colors duration-300">
        {/* Follow Us Header Bar */}
        <div className="max-w-6xl mx-auto px-4 text-center mb-2 sm:mb-2.5">
          <h2 className="text-[11px] sm:text-xs md:text-sm font-black tracking-[0.16em] sm:tracking-[0.22em] text-slate-900 dark:text-white uppercase drop-shadow-xs transition-colors">
            OFFICIAL CHANNELS &amp; SOCIAL LINKS
          </h2>
        </div>

        {/* Social Squircle Scroll Strip */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-start justify-start sm:justify-center gap-2 sm:gap-3 md:gap-4 min-w-max px-2">
            {socials.map((soc) => (
              <a
                key={soc.id}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  checkDoubleTap(soc.id, () => {
                    // normal link click continues
                  });
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  handleGoHome();
                }}
                className="flex flex-col items-center group cursor-pointer focus:outline-none transition-transform active:scale-95 shrink-0"
              >
                {/* Squircle Container matching PNG with Light & Dark Mode */}
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center bg-slate-100 hover:bg-slate-200/90 dark:bg-[#0f172a] dark:hover:bg-[#162238] border border-slate-200 dark:border-slate-700/70 group-hover:border-sky-500/80 dark:group-hover:border-sky-400/80 group-hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 shadow-xs dark:shadow-md dark:shadow-black/40 aspect-square">
                  {/* Inside Social Icon */}
                  <div className="relative z-10 flex items-center justify-center w-full h-full p-1.5 sm:p-2">
                    {soc.icon}
                  </div>
                </div>

                {/* Label underneath */}
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 text-center mt-1.5 max-w-[72px] truncate transition-colors">
                  {soc.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export interface ModernAppBottomSectionProps {
  mobileTabsConfig?: MobileTabsConfig;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  siteLogo?: string;
  onTabChange?: (tabId: string) => void;
  onSelectJob?: (job: JobAlert) => void;
  jobs?: JobAlert[];
}

export const ModernAppBottomSection: React.FC<ModernAppBottomSectionProps> = ({
  mobileTabsConfig,
  searchQuery = '',
  setSearchQuery,
  siteLogo,
  onTabChange,
  onSelectJob,
  jobs
}) => {
  const [selectedTool, setSelectedTool] = useState<AppToolItem | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState<boolean>(false);
  const lastTapRef = useRef<{ [key: string]: number }>({});

  const handleGoHome = () => {
    if (onTabChange) {
      onTabChange('home');
    }
    if (setSearchQuery) {
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const checkDoubleTap = (btnKey: string, singleTapAction: () => void) => {
    const now = Date.now();
    const last = lastTapRef.current[btnKey] || 0;
    if (now - last < 400) {
      lastTapRef.current[btnKey] = 0;
      handleGoHome();
    } else {
      lastTapRef.current[btnKey] = now;
      singleTapAction();
    }
  };

  const handleToolClick = (tool: AppToolItem) => {
    setSelectedTool(tool);
    setIsToolModalOpen(true);
  };

  const handleCategoryClick = (filterKey: string) => {
    if (onTabChange) {
      onTabChange('home');
    }
    if (setSearchQuery) {
      if (searchQuery.toLowerCase().trim() === filterKey.toLowerCase().trim()) {
        setSearchQuery('');
      } else {
        setSearchQuery(filterKey);
      }
    }
    const el = document.getElementById('main-job-columns') || document.getElementById('section-latest-jobs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  const renderToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'image-resizer':
        return <Crop className="w-5 h-5 sm:w-6 sm:h-6 text-white" />;
      case 'bg-remover':
        return <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />;
      case 'pdf-portal':
        return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-rose-300" />;
      case 'biodata-maker':
        return <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />;
      case 'name-date':
        return <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-300" />;
      case 'age-calculator':
        return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />;
      case 'typing-test':
        return <Keyboard className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />;
      default:
        return <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />;
    }
  };

  const enabledCategoryButtons = useMemo(() => {
    const list = mobileTabsConfig?.categoryButtons || DEFAULT_MOBILE_TABS_CONFIG.categoryButtons;
    return [...list].filter(c => c.enabled !== false).sort((a, b) => a.order - b.order);
  }, [mobileTabsConfig?.categoryButtons]);

  const enabledTools = useMemo(() => {
    const list = mobileTabsConfig?.tools || DEFAULT_MOBILE_TABS_CONFIG.tools;
    return [...list].filter(t => t.enabled !== false).sort((a, b) => a.order - b.order);
  }, [mobileTabsConfig?.tools]);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/80 pt-4 pb-12 mt-6 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* 1. ONLINE TOOLS & UTILITIES SECTION (Modern brand cards with badges & click to open) */}
      {enabledTools.length > 0 && (
        <section className="w-full bg-white dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-sm py-3.5 sm:py-4 transition-colors duration-300 mb-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-[11px] sm:text-xs md:text-sm font-black tracking-[0.16em] sm:tracking-[0.2em] text-slate-900 dark:text-white uppercase drop-shadow-xs transition-colors">
                {mobileTabsConfig?.toolsSectionTitle || 'TOOLS'}
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline uppercase tracking-wider transition-colors">
              Free utilities for exam applications
            </span>
          </div>

          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-3 sm:gap-4 pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 snap-x">
              {enabledTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => checkDoubleTap(tool.id, () => handleToolClick(tool))}
                  onDoubleClick={handleGoHome}
                  className={`bg-gradient-to-r ${tool.gradient} rounded-2xl p-3.5 sm:p-4 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group border border-white/10 w-[240px] sm:w-[280px] shrink-0 snap-start`}
                >
                  {/* Subtle decorative background shape */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

                  {/* Top row: Badge & Icon */}
                  <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
                    {tool.badge ? (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${tool.badgeColor || 'bg-amber-400 text-slate-950'} shadow-2xs`}>
                        {tool.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                      {renderToolIcon(tool.icon)}
                    </div>
                  </div>

                  {/* Middle content: Title & Subtitle */}
                  <div className="relative z-10 my-1">
                    <h3 className="font-black text-xs sm:text-sm tracking-tight text-white uppercase drop-shadow-xs group-hover:text-amber-200 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 mt-0.5 leading-snug">
                      {tool.subtitle}
                    </p>
                  </div>

                  {/* Bottom Action Pill */}
                  <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/15 text-[10px] font-bold">
                    <span className="text-rose-100 flex items-center gap-1">
                      <span>Open Tool &amp; Guide</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-white/60 text-[9px] uppercase">
                      FastArc
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORY WISE UPDATES SECTION (Placed below Tools section in footer) */}
      {enabledCategoryButtons.length > 0 && (
        <section className="w-full bg-white dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-sm py-2.5 sm:py-3 transition-colors duration-300 mb-6">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between mb-2 sm:mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-[11px] sm:text-xs md:text-sm font-black tracking-[0.16em] sm:tracking-[0.2em] text-slate-900 dark:text-white uppercase drop-shadow-xs transition-colors">
                {mobileTabsConfig?.categorySectionTitle || 'CATEGORY WISE UPDATES'}
              </h2>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline uppercase tracking-wider transition-colors">
              Tap to view recruitment notices
            </span>
          </div>

          {/* Horizontal scroll strip */}
          <div className="max-w-6xl mx-auto px-2 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 min-w-max px-2 py-0.5">
              {enabledCategoryButtons.map((cat) => {
                const isActive = searchQuery?.toLowerCase().trim() === cat.filterKey.toLowerCase().trim();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => checkDoubleTap(cat.id, () => handleCategoryClick(cat.filterKey))}
                    onDoubleClick={handleGoHome}
                    style={{ backgroundColor: cat.color, color: cat.textColor || '#ffffff' }}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-xs tracking-wide shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 min-w-[78px] sm:min-w-[90px] border cursor-pointer select-none ${
                      isActive 
                        ? 'ring-3 ring-amber-400 border-white scale-105 shadow-md' 
                        : 'border-white/20'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Footer Brand, Version & In-App Update Trigger */}
      <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-xs py-2 space-y-1.5">
        <p className="font-semibold text-[11px]">
          FastArc Govt Jobs Portal &bull; All Rights Reserved
        </p>
        <div className="flex items-center justify-center gap-3 text-[10px]">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('fastarc:check-updates'));
            }}
            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
          >
            <span>⚡ Check for App Updates / नया वर्जन चेक करें</span>
          </button>
        </div>
      </div>

      {/* Tool Detail & Interactive Utility Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        siteLogo={siteLogo}
      />
    </div>
  );
};
