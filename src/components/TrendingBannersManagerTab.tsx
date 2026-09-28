import React, { useState } from 'react';
import { 
  Sparkles, Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, 
  Save, RotateCcw, Copy, Edit3, Check, ChevronLeft, ChevronRight, 
  Sliders, Link2, ExternalLink, Image as ImageIcon, Palette, 
  Upload, X, CheckCircle2, AlertTriangle, Monitor, Smartphone,
  BookOpen, Compass, Layers, Zap
} from 'lucide-react';
import { MobileTabsConfig, AppBannerItem, BannerSliderConfig, JobAlert } from '../types';
import { DEFAULT_TRENDING_BANNERS, DEFAULT_BANNER_SLIDER_CONFIG } from '../data/mobileTabsData';

interface TrendingBannersManagerTabProps {
  config: MobileTabsConfig;
  onSave: (newConfig: MobileTabsConfig) => Promise<void> | void;
  onToast: (msg: string) => void;
  jobs?: JobAlert[];
}

const GRADIENT_PRESETS = [
  { label: 'Lime to Wine (SSC Style)', value: 'from-[#7db61a] via-[#85b822] to-[#8c1328]', readMore: 'text-[#8c1328]' },
  { label: 'Orange to Crimson (Railway Style)', value: 'from-[#ea580c] via-[#f97316] to-[#991b1b]', readMore: 'text-[#991b1b]' },
  { label: 'Sky Blue to Navy (UPSC Style)', value: 'from-[#0284c7] via-[#0369a1] to-[#1e1b4b]', readMore: 'text-[#0369a1]' },
  { label: 'Emerald to Crimson (UP Police Style)', value: 'from-[#10b981] via-[#059669] to-[#881337]', readMore: 'text-[#881337]' },
  { label: 'Rose to Burgundy (NEET/JEE Style)', value: 'from-[#e11d48] via-[#be123c] to-[#4c0519]', readMore: 'text-[#be123c]' },
  { label: 'Gold to Dark Red (Banking Style)', value: 'from-[#854d0e] via-[#ca8a04] to-[#7f1d1d]', readMore: 'text-[#7f1d1d]' },
  { label: 'Indigo to Magenta (CTET Style)', value: 'from-[#4338ca] via-[#6366f1] to-[#831843]', readMore: 'text-[#4338ca]' },
  { label: 'Forest Green to Deep Blue', value: 'from-[#059669] via-[#10b981] to-[#1e3a8a]', readMore: 'text-[#059669]' },
  { label: 'Purple to Electric Violet', value: 'from-[#7c3aed] via-[#9333ea] to-[#4c1d95]', readMore: 'text-[#7c3aed]' },
  { label: 'Vibrant Amber to Deep Rust', value: 'from-[#d97706] via-[#b45309] to-[#78350f]', readMore: 'text-[#92400e]' },
  { label: 'Dark Midnight to Teal', value: 'from-[#0f172a] via-[#134e4a] to-[#042f2e]', readMore: 'text-[#0d9488]' },
  { label: 'Royal GovtBharat Maroon', value: 'from-[#8c1328] via-[#a61935] to-[#4c0519]', readMore: 'text-[#8c1328]' }
];

const BOARD_TEXT_PRESETS = [
  'गणित', 'इतिहास', 'भूगोल', 'संविधान', 'विज्ञान', 
  'तर्कशक्ति', 'शिक्षा', 'हिन्दी', 'English', 'करंट अफेयर्स', 
  'SSC 2026', 'UPSC CSE', 'RRB NTPC', 'POLICE', 'ADMIT CARD'
];

const BADGE_PRESETS = [
  { label: 'TOP ALERT', color: 'bg-white/20 text-white' },
  { label: 'LIVE NOW', color: 'bg-emerald-500/90 text-slate-950 font-black' },
  { label: 'NEW ADMIT CARD', color: 'bg-amber-400 text-slate-950 font-black' },
  { label: 'RESULT OUT', color: 'bg-rose-500 text-white font-black' },
  { label: 'URGENT NOTICE', color: 'bg-red-600 text-white font-black' },
  { label: 'APPLY ONLINE', color: 'bg-sky-400 text-slate-950 font-black' }
];

export const TrendingBannersManagerTab: React.FC<TrendingBannersManagerTabProps> = ({
  config,
  onSave,
  onToast,
  jobs = []
}) => {
  const [currentConfig, setCurrentConfig] = useState<MobileTabsConfig>(() => {
    return {
      ...config,
      banners: Array.isArray(config.banners) && config.banners.length > 0 
        ? config.banners 
        : DEFAULT_TRENDING_BANNERS,
      bannerSliderConfig: {
        ...DEFAULT_BANNER_SLIDER_CONFIG,
        ...(config.bannerSliderConfig || {})
      }
    };
  });

  const banners = currentConfig.banners || DEFAULT_TRENDING_BANNERS;
  const sliderConfig = currentConfig.bannerSliderConfig || DEFAULT_BANNER_SLIDER_CONFIG;

  const [previewIndex, setPreviewIndex] = useState(0);
  const [editingBanner, setEditingBanner] = useState<AppBannerItem | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeSlide = banners[previewIndex] || banners[0] || DEFAULT_TRENDING_BANNERS[0];

  // Move slide up/down
  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    newBanners.forEach((b, i) => { b.order = i + 1; });
    setCurrentConfig({ ...currentConfig, banners: newBanners });
    setPreviewIndex(targetIndex);
    onToast(`Banner moved ${direction}`);
  };

  // Toggle visibility
  const toggleVisibility = (id: string) => {
    const newBanners = banners.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b);
    setCurrentConfig({ ...currentConfig, banners: newBanners });
    onToast('Banner visibility updated');
  };

  // Duplicate banner
  const duplicateBanner = (banner: AppBannerItem) => {
    const newId = `banner-${Date.now()}`;
    const duplicated: AppBannerItem = {
      ...banner,
      id: newId,
      title: `${banner.title} (Copy)`,
      order: banners.length + 1
    };
    const newBanners = [...banners, duplicated];
    setCurrentConfig({ ...currentConfig, banners: newBanners });
    onToast('Banner duplicated successfully');
  };

  // Delete banner
  const deleteBanner = (id: string) => {
    if (banners.length <= 1) {
      onToast('You must keep at least 1 banner in the system');
      return;
    }
    const newBanners = banners.filter(b => b.id !== id);
    newBanners.forEach((b, i) => { b.order = i + 1; });
    setCurrentConfig({ ...currentConfig, banners: newBanners });
    setPreviewIndex(0);
    setDeleteConfirmId(null);
    onToast('Banner deleted');
  };

  // Add new banner
  const handleAddNewBanner = () => {
    const newId = `banner-${Date.now()}`;
    const newBanner: AppBannerItem = {
      id: newId,
      title: 'New Government Job / Exam Notice',
      subtitle: 'Official recruitment details, eligibility and online application process',
      badgeText: 'TOP ALERT',
      badgeColor: 'bg-white/20 text-white',
      gradient: 'from-[#10b981] via-[#059669] to-[#881337]',
      readMoreColor: 'text-[#881337]',
      buttonText: 'Read More',
      targetType: 'category',
      category: 'latest-jobs',
      boardText: 'नया अपडेट',
      illustrationType: 'classroom',
      enabled: true,
      order: banners.length + 1
    };
    setEditingBanner(newBanner);
    setIsEditingNew(true);
  };

  // Save banner edit
  const handleSaveBannerEdit = (updatedBanner: AppBannerItem) => {
    let newBanners: AppBannerItem[];
    if (isEditingNew) {
      newBanners = [...banners, updatedBanner];
    } else {
      newBanners = banners.map(b => b.id === updatedBanner.id ? updatedBanner : b);
    }
    setCurrentConfig({ ...currentConfig, banners: newBanners });
    setEditingBanner(null);
    setIsEditingNew(false);
    onToast(isEditingNew ? 'New banner added successfully!' : 'Banner updated successfully!');
  };

  // Update slider settings
  const updateSliderConfig = (field: keyof BannerSliderConfig, value: any) => {
    setCurrentConfig({
      ...currentConfig,
      bannerSliderConfig: {
        ...sliderConfig,
        [field]: value
      }
    });
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all banners and slider settings to the official GovtBharat defaults?')) {
      setCurrentConfig({
        ...currentConfig,
        banners: DEFAULT_TRENDING_BANNERS,
        bannerSliderConfig: DEFAULT_BANNER_SLIDER_CONFIG
      });
      setPreviewIndex(0);
      onToast('Reset to default trending banners successfully');
    }
  };

  // Save everything to Firestore + local storage
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave(currentConfig);
      onToast('🎉 All Trending Banners & Slider Settings saved and synced in real-time!');
    } catch (e) {
      onToast('Error saving banner settings');
    }
    setIsSaving(false);
  };

  // Handle local image upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onToast('Image size should be under 2MB for fast mobile loading');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result && editingBanner) {
        setEditingBanner({
          ...editingBanner,
          illustrationType: 'custom_image',
          customImageUrl: result
        });
        onToast('Custom image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Trending Banners & Slider Manager
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-400/30">
                  Live Mobile App
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full Super Admin rights to edit, reorder, create new banners, change colors, custom images, chalkboard text and animation speed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Defaults
          </button>
          <button
            onClick={handleAddNewBanner}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Banner
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save & Publish
          </button>
        </div>
      </div>

      {/* Grid: Left Live Preview + Right Slider Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Live Interactive Preview (Col 7) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Live Banner Preview</span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  Slide {previewIndex + 1} of {banners.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewIndex((prev) => (prev + 1) % banners.length)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banner Canvas */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
              <div className={`w-full h-full bg-gradient-to-r ${activeSlide.gradient} p-4 sm:p-6 flex items-center justify-between text-white relative`}>
                
                {/* Left Side Graphic */}
                {activeSlide.illustrationType === 'custom_image' && activeSlide.customImageUrl ? (
                  <div className="w-5/12 h-full flex items-center justify-center relative shrink-0">
                    <img 
                      src={activeSlide.customImageUrl} 
                      alt="Banner graphic" 
                      className="max-h-36 sm:max-h-44 object-contain rounded-xl drop-shadow-lg"
                    />
                  </div>
                ) : activeSlide.illustrationType === 'gradient_only' ? (
                  <div className="w-3/12 h-full flex items-center justify-center shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-1/2 sm:w-5/12 h-full flex items-center justify-center relative shrink-0 pointer-events-none">
                    <svg viewBox="0 0 280 200" className="w-full h-full max-h-44 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="20" y="20" width="130" height="85" rx="4" fill="#654321" stroke="#4a3525" strokeWidth="2.5" />
                      <rect x="25" y="25" width="120" height="75" rx="2" fill="#2d5a27" />
                      <text x="85" y="65" fill="#ffffff" fontSize="19" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" opacity="0.95">
                        {activeSlide.boardText || 'इतिहास'}
                      </text>
                      <line x1="45" y1="78" x2="125" y2="78" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="5" y1="175" x2="275" y2="175" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
                      <rect x="75" y="105" width="125" height="10" rx="2" fill="#d97706" />
                      <rect x="85" y="115" width="6" height="60" fill="#92400e" />
                      <rect x="185" y="115" width="6" height="60" fill="#92400e" />
                      <rect x="80" y="145" width="115" height="4" fill="#b45309" opacity="0.6" />
                      <circle cx="160" cy="80" r="14" fill="#fed7aa" />
                      <path d="M148 78c0-8 6-15 14-15s14 7 14 15c-3-2-7-3-11-2-5 1-9 1-17 2z" fill="#1e293b" />
                      <path d="M142 120c0-14 8-24 18-24s18 10 18 24v25h-36v-25z" fill="#0284c7" />
                      <path d="M156 96l4 8 4-8h-8z" fill="#ffffff" />
                      <path d="M158 104l2 12 2-12h-4z" fill="#e11d48" />
                      <circle cx="100" cy="90" r="10" fill="#38bdf8" />
                      <rect x="120" y="99" width="22" height="4" rx="1" fill="#ef4444" />
                      <path d="M40 148l5 27h16l5-27H40z" fill="#b45309" />
                      <circle cx="53" cy="138" r="10" fill="#22c55e" />
                    </svg>
                  </div>
                )}

                {/* Right Side Info */}
                <div className={`${activeSlide.illustrationType === 'gradient_only' ? 'w-9/12' : 'w-1/2 sm:w-7/12'} pl-2 sm:pl-4 flex flex-col items-start justify-center z-10`}>
                  <span className={`${activeSlide.badgeColor || 'bg-white/20 text-white'} backdrop-blur-xs text-[9px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5 shadow-xs`}>
                    {activeSlide.badgeText || 'TOP ALERT'}
                  </span>
                  <h4 className="text-sm sm:text-lg md:text-xl font-black text-white leading-tight line-clamp-2 mb-1.5 drop-shadow-sm">
                    {activeSlide.title}
                  </h4>
                  {activeSlide.subtitle && (
                    <p className="text-[10px] sm:text-xs text-white/85 line-clamp-1 mb-2.5">
                      {activeSlide.subtitle}
                    </p>
                  )}
                  <button
                    type="button"
                    className={`bg-white ${activeSlide.readMoreColor || 'text-rose-900'} font-black text-[11px] sm:text-xs px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full shadow-md`}
                  >
                    {activeSlide.buttonText || 'Read More'}
                  </button>
                </div>
              </div>
            </div>

            {/* Pagination Dots Preview */}
            <div className="flex items-center justify-center space-x-1.5 mt-3">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    previewIndex === idx
                      ? 'w-6 h-2 bg-amber-400 scale-105'
                      : 'w-2 h-2 border border-slate-600 bg-transparent hover:border-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Status: <strong className={activeSlide.enabled ? 'text-emerald-400' : 'text-slate-500'}>{activeSlide.enabled ? 'Active on Portal' : 'Hidden'}</strong></span>
            <button
              onClick={() => {
                setEditingBanner(activeSlide);
                setIsEditingNew(false);
              }}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit This Banner
            </button>
          </div>
        </div>

        {/* Global Slider Timings & Animation Settings (Col 5) */}
        <div className="lg:col-span-5 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Slider & Animation Timings
            </h4>
          </div>

          {/* Auto-Slide Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-white block">Auto-Slide Rotation</span>
              <span className="text-[10px] text-slate-400">Automatically cycle banners smoothly</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sliderConfig.autoSlide}
                onChange={(e) => updateSliderConfig('autoSlide', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Slide Interval Duration */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Slide Duration / Speed</span>
              <span className="font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[11px]">
                {(sliderConfig.slideIntervalMs / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="10000"
              step="500"
              value={sliderConfig.slideIntervalMs}
              onChange={(e) => updateSliderConfig('slideIntervalMs', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Fast (2s)</span>
              <span>Standard (4.5s)</span>
              <span>Relaxed (10s)</span>
            </div>
          </div>

          {/* Pause on Hover */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-white block">Pause on Hover / Touch</span>
              <span className="text-[10px] text-slate-400">Stops rotating when candidate is reading</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sliderConfig.pauseOnHover}
                onChange={(e) => updateSliderConfig('pauseOnHover', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Show Navigation Arrows */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-white block">Navigation Arrows</span>
              <span className="text-[10px] text-slate-400">Left/Right circular chevron buttons</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sliderConfig.showArrows}
                onChange={(e) => updateSliderConfig('showArrows', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Show Pagination Dots */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-white block">Pagination Dots</span>
              <span className="text-[10px] text-slate-400">Expanding pill indicators below slider</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sliderConfig.showDots}
                onChange={(e) => updateSliderConfig('showDots', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Banners List (Sortable Cards) */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Manage All Banners ({banners.length} Total)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Drag or use arrows to change display order on mobile app
          </span>
        </div>

        <div className="space-y-2.5">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                banner.enabled 
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' 
                  : 'bg-slate-950/50 border-slate-900 opacity-60'
              }`}
            >
              {/* Left Order + Color Swatch + Title Info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Order Index */}
                <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                  {index + 1}
                </div>

                {/* Mini Gradient Preview */}
                <div className={`w-12 h-9 rounded-lg bg-gradient-to-r ${banner.gradient} shrink-0 border border-white/20 shadow-xs flex items-center justify-center`}>
                  {banner.illustrationType === 'custom_image' && banner.customImageUrl ? (
                    <ImageIcon className="w-4 h-4 text-white drop-shadow" />
                  ) : banner.illustrationType === 'gradient_only' ? (
                    <Sparkles className="w-4 h-4 text-white drop-shadow" />
                  ) : (
                    <span className="text-[9px] font-bold text-white drop-shadow">
                      {banner.boardText || 'इतिहास'}
                    </span>
                  )}
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs text-white truncate">
                      {banner.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {banner.badgeText || 'TOP ALERT'}
                    </span>
                    {banner.illustrationType === 'custom_image' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        Custom Image
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Board: {banner.boardText || 'इतिहास'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {banner.subtitle || `Category: ${banner.category || 'latest-jobs'}`}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                {/* Move Up */}
                <button
                  onClick={() => moveBanner(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => moveBanner(index, 'down')}
                  disabled={index === banners.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Eye */}
                <button
                  onClick={() => toggleVisibility(banner.id)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    banner.enabled ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                  title={banner.enabled ? 'Banner Active (Click to Hide)' : 'Banner Hidden (Click to Show)'}
                >
                  {banner.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => duplicateBanner(banner)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Duplicate Banner"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setIsEditingNew(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer border border-amber-400/30"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>

                {/* Delete */}
                {deleteConfirmId === banner.id ? (
                  <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg border border-red-800">
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[10px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(banner.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL BANNER EDIT MODAL */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {isEditingNew ? 'Create New Trending Banner' : 'Edit Trending Banner'}
                </h3>
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Banner Title (Headline) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="e.g. UP Police Constable Exam City / Admit Card"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subtitle / Short Description
                </label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  placeholder="e.g. Uttar Pradesh Police Recruitment & Promotion Board 60,244 Posts"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Grid: Badge Tag + Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Badge Tag Text
                  </label>
                  <input
                    type="text"
                    value={editingBanner.badgeText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badgeText: e.target.value })}
                    placeholder="e.g. TOP ALERT, LIVE NOW, NEW"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  {/* Badge Presets */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {BADGE_PRESETS.map((bp) => (
                      <button
                        key={bp.label}
                        type="button"
                        onClick={() => setEditingBanner({
                          ...editingBanner,
                          badgeText: bp.label,
                          badgeColor: bp.color
                        })}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {bp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={editingBanner.buttonText || 'Read More'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                    placeholder="e.g. Read More, Apply Online, Download"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Redirection / Target */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Target Redirection / Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={editingBanner.targetType || 'category'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, targetType: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="category">Portal Category Tab</option>
                    <option value="url">External / Custom URL</option>
                  </select>

                  {editingBanner.targetType === 'url' ? (
                    <input
                      type="text"
                      value={editingBanner.targetValue || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, targetValue: e.target.value })}
                      placeholder="https://example.com/apply"
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  ) : (
                    <select
                      value={editingBanner.category || 'latest-jobs'}
                      onChange={(e) => setEditingBanner({ ...editingBanner, category: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="latest-jobs">Latest Jobs</option>
                      <option value="admit-cards">Admit Cards</option>
                      <option value="results">Results</option>
                      <option value="answer-key">Answer Key</option>
                      <option value="syllabus">Syllabus</option>
                      <option value="admission">Admission</option>
                      <option value="documents">Certificate & Services</option>
                      <option value="important">Important Updates</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Background Gradient Palette Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Color Gradient Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((gp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditingBanner({
                        ...editingBanner,
                        gradient: gp.value,
                        readMoreColor: gp.readMore
                      })}
                      className={`p-2 rounded-xl text-left border flex items-center space-x-2 transition-all cursor-pointer ${
                        editingBanner.gradient === gp.value 
                          ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${gp.value} shrink-0 border border-white/20`} />
                      <span className="text-[10px] font-bold text-slate-200 line-clamp-1 truncate">
                        {gp.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Or Enter Custom Tailwind Gradient Classes:
                  </label>
                  <input
                    type="text"
                    value={editingBanner.gradient}
                    onChange={(e) => setEditingBanner({ ...editingBanner, gradient: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Left Side Graphic / Illustration Options */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-white">
                  Left Side Illustration / Media Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBanner({ ...editingBanner, illustrationType: 'classroom' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      editingBanner.illustrationType === 'classroom' || !editingBanner.illustrationType
                        ? 'bg-blue-950/80 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-extrabold block">Blackboard Illustration</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingBanner({ ...editingBanner, illustrationType: 'custom_image' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      editingBanner.illustrationType === 'custom_image'
                        ? 'bg-blue-950/80 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-extrabold block">Custom Image / Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingBanner({ ...editingBanner, illustrationType: 'gradient_only' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      editingBanner.illustrationType === 'gradient_only'
                        ? 'bg-blue-950/80 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-extrabold block">Minimal Card</span>
                  </button>
                </div>

                {/* Sub-options based on type */}
                {editingBanner.illustrationType === 'custom_image' ? (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Upload Custom Graphic or Enter Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingBanner.customImageUrl || ''}
                        onChange={(e) => setEditingBanner({ ...editingBanner, customImageUrl: e.target.value })}
                        placeholder="https://... direct image URL or upload below"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {editingBanner.customImageUrl && (
                      <div className="mt-2 flex items-center gap-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <img
                          src={editingBanner.customImageUrl}
                          alt="Custom preview"
                          className="w-12 h-12 object-contain rounded bg-black/40"
                        />
                        <span className="text-[10px] text-emerald-400 font-bold">Image loaded successfully</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Chalkboard Hindi / English Subject Text
                    </label>
                    <input
                      type="text"
                      value={editingBanner.boardText || 'इतिहास'}
                      onChange={(e) => setEditingBanner({ ...editingBanner, boardText: e.target.value })}
                      placeholder="e.g. गणित, इतिहास, भूगोल, संविधान, विज्ञान"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {BOARD_TEXT_PRESETS.map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setEditingBanner({ ...editingBanner, boardText: bt })}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveBannerEdit(editingBanner)}
                className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Banner Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
