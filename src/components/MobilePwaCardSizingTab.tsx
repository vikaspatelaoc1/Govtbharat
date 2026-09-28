import React, { useState } from 'react';
import { 
  Smartphone, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Sliders, 
  Check, 
  Maximize2, 
  Minimize2, 
  Eye,
  Type,
  Square,
  Circle,
  HelpCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { MobileTabsConfig, MobilePwaCardConfig } from '../types';
import { DEFAULT_PWA_CARD_CONFIG } from '../data/mobileTabsData';
import { CategoryIcon } from './CategoryIcon';

interface MobilePwaCardSizingTabProps {
  config: MobileTabsConfig;
  onSave: (newConfig: MobileTabsConfig) => Promise<void> | void;
  onToast: (msg: string) => void;
}

export const MobilePwaCardSizingTab: React.FC<MobilePwaCardSizingTabProps> = ({
  config,
  onSave,
  onToast
}) => {
  const [pwaConfig, setPwaConfig] = useState<MobilePwaCardConfig>(() => ({
    ...DEFAULT_PWA_CARD_CONFIG,
    ...(config.pwaCardConfig || {})
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [lockIconRatio, setLockIconRatio] = useState(true);
  const [activePreviewSample, setActivePreviewSample] = useState<'latest' | 'results' | 'admit'>('latest');

  // Update a field
  const updateField = <K extends keyof MobilePwaCardConfig>(field: K, val: MobilePwaCardConfig[K]) => {
    setPwaConfig(prev => {
      const updated = { ...prev, [field]: val };
      if (lockIconRatio) {
        if (field === 'iconContainerWidth') {
          updated.iconContainerHeight = val as number;
        } else if (field === 'iconContainerHeight') {
          updated.iconContainerWidth = val as number;
        }
      }
      return updated;
    });
  };

  // Quick Preset Handlers
  const applyPreset = (type: 'modern' | 'compact' | 'spacious' | 'boxed') => {
    if (type === 'modern') {
      setPwaConfig({
        ...pwaConfig,
        cardWidthPercent: 100,
        cardCustomMaxWidth: 0,
        cardHeightMode: 'standard',
        cardMinHeight: 74,
        cardPaddingY: 8,
        cardPaddingX: 12,
        cardBorderRadius: 12,
        showCardIcon: false,
        iconContainerWidth: 34,
        iconContainerHeight: 34,
        iconGraphicSize: 18,
        iconShape: 'squircle',
        iconBgStyle: 'brand',
        columnCardWidthPercent: 100,
        columnHeaderIconWidth: 28,
        columnHeaderIconHeight: 28,
        columnBorderRadius: 16,
        cardTitleFontSize: 14,
        cardMetaFontSize: 11
      });
      onToast('Applied "Modern GovtBharat App" preset');
    } else if (type === 'compact') {
      setPwaConfig({
        ...pwaConfig,
        cardWidthPercent: 100,
        cardCustomMaxWidth: 0,
        cardHeightMode: 'compact',
        cardMinHeight: 58,
        cardPaddingY: 6,
        cardPaddingX: 10,
        cardBorderRadius: 8,
        showCardIcon: false,
        iconContainerWidth: 28,
        iconContainerHeight: 28,
        iconGraphicSize: 15,
        iconShape: 'rounded',
        iconBgStyle: 'subtle',
        columnCardWidthPercent: 100,
        columnHeaderIconWidth: 24,
        columnHeaderIconHeight: 24,
        columnBorderRadius: 12,
        cardTitleFontSize: 13,
        cardMetaFontSize: 10
      });
      onToast('Applied "High Density Compact" preset');
    } else if (type === 'spacious') {
      setPwaConfig({
        ...pwaConfig,
        cardWidthPercent: 96,
        cardCustomMaxWidth: 0,
        cardHeightMode: 'spacious',
        cardMinHeight: 90,
        cardPaddingY: 12,
        cardPaddingX: 14,
        cardBorderRadius: 16,
        showCardIcon: false,
        iconContainerWidth: 42,
        iconContainerHeight: 42,
        iconGraphicSize: 22,
        iconShape: 'circle',
        iconBgStyle: 'gradient',
        columnCardWidthPercent: 98,
        columnHeaderIconWidth: 32,
        columnHeaderIconHeight: 32,
        columnBorderRadius: 20,
        cardTitleFontSize: 15,
        cardMetaFontSize: 11
      });
      onToast('Applied "Spacious Touch-Friendly" preset');
    } else if (type === 'boxed') {
      setPwaConfig({
        ...pwaConfig,
        cardWidthPercent: 92,
        cardCustomMaxWidth: 380,
        cardHeightMode: 'custom',
        cardMinHeight: 82,
        cardPaddingY: 10,
        cardPaddingX: 14,
        cardBorderRadius: 14,
        showCardIcon: false,
        iconContainerWidth: 36,
        iconContainerHeight: 36,
        iconGraphicSize: 19,
        iconShape: 'squircle',
        iconBgStyle: 'brand',
        columnCardWidthPercent: 94,
        columnHeaderIconWidth: 28,
        columnHeaderIconHeight: 28,
        columnBorderRadius: 16,
        cardTitleFontSize: 14,
        cardMetaFontSize: 11
      });
      onToast('Applied "Boxed Card with Margin" preset');
    }
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('Reset Mobile PWA job card and icon dimensions to default?')) {
      setPwaConfig(DEFAULT_PWA_CARD_CONFIG);
      onToast('Reset to default card and icon dimensions.');
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig: MobileTabsConfig = {
        ...config,
        pwaCardConfig: pwaConfig,
        updatedAt: new Date().toISOString()
      };
      await onSave(updatedConfig);
      onToast('Mobile PWA Job Card & Icon settings saved successfully!');
    } catch (e) {
      onToast('Error saving Mobile PWA card settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Icon Background Style Helper
  const getIconContainerStyleClass = () => {
    switch (pwaConfig.iconBgStyle) {
      case 'brand':
        return 'bg-gradient-to-br from-[#8c1328] to-[#670d1e] text-white shadow-xs border border-rose-900/40';
      case 'subtle':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700';
      case 'gradient':
        return 'bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 text-white shadow-xs';
      case 'minimal':
        return 'bg-transparent border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200';
      default:
        return 'bg-[#8c1328] text-white';
    }
  };

  const getIconRadiusClass = () => {
    switch (pwaConfig.iconShape) {
      case 'circle': return 'rounded-full';
      case 'squircle': return 'rounded-xl';
      case 'square': return 'rounded-xs';
      case 'rounded': return 'rounded-lg';
      default: return 'rounded-xl';
    }
  };

  // Effective min-height for sample
  const sampleMinHeight = pwaConfig.cardHeightMode === 'compact' ? 58
    : pwaConfig.cardHeightMode === 'standard' ? 74
    : pwaConfig.cardHeightMode === 'spacious' ? 90
    : pwaConfig.cardHeightMode === 'custom' ? pwaConfig.cardMinHeight
    : undefined;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white shadow-lg border border-sky-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Mobile PWA Job Cards &amp; Icons Customizer
              </h2>
              <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Target: Mobile PWA
              </span>
            </div>
            <p className="text-xs text-sky-200/80 mt-0.5">
              Adjust width, height, padding, icon dimensions, and border radius of job cards specifically for Mobile App &amp; PWA mode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to default dimensions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-black bg-sky-400 hover:bg-sky-300 text-slate-950 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Preset Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300">
            Quick 1-Click Sizing Presets:
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => applyPreset('modern')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 transition-all cursor-pointer"
          >
            📱 Modern App (Balanced)
          </button>
          <button
            onClick={() => applyPreset('compact')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
          >
            ⚡ Compact Density (Small Cards)
          </button>
          <button
            onClick={() => applyPreset('spacious')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 hover:bg-purple-100 transition-all cursor-pointer"
          >
            🛋️ Spacious (Large Touch Target)
          </button>
          <button
            onClick={() => applyPreset('boxed')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
          >
            📦 Boxed Card (With Margins)
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Live Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. Job Card Width & Max-Width */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    1. Job Card Width (Mobile PWA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control the horizontal width and margin of each individual job item
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                {pwaConfig.cardCustomMaxWidth > 0 ? `${pwaConfig.cardCustomMaxWidth}px` : `${pwaConfig.cardWidthPercent}%`}
              </span>
            </div>

            {/* Width Percentage Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Card Width Percentage:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{pwaConfig.cardWidthPercent}%</span>
              </div>
              <input 
                type="range"
                min={80}
                max={100}
                step={1}
                value={pwaConfig.cardWidthPercent}
                onChange={(e) => updateField('cardWidthPercent', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>80% (Inset)</span>
                <span>90%</span>
                <span>95%</span>
                <span>100% (Full Edge)</span>
              </div>
            </div>

            {/* Custom Max-Width in Pixels (Optional constraint) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span>Custom Max Width Limit (Pixels):</span>
                  <span className="text-[10px] font-normal text-slate-400">(0 = No limit / Fluid %)</span>
                </span>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                  {pwaConfig.cardCustomMaxWidth === 0 ? 'Fluid (100%)' : `${pwaConfig.cardCustomMaxWidth}px`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={pwaConfig.cardCustomMaxWidth}
                  onChange={(e) => updateField('cardCustomMaxWidth', Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={pwaConfig.cardCustomMaxWidth}
                  onChange={(e) => updateField('cardCustomMaxWidth', Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-1 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                />
              </div>
            </div>

            {/* Horizontal Padding */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Card Horizontal Padding (Left / Right):</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{pwaConfig.cardPaddingX}px</span>
              </div>
              <input 
                type="range"
                min={4}
                max={24}
                step={1}
                value={pwaConfig.cardPaddingX}
                onChange={(e) => updateField('cardPaddingX', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 2. Job Card Height & Vertical Padding */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    2. Job Card Height &amp; Density (Mobile PWA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose card height mode, min-height threshold, and vertical padding
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg uppercase">
                {pwaConfig.cardHeightMode}
              </span>
            </div>

            {/* Height Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Card Height Mode:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'auto', label: 'Auto Content', desc: 'Natural size' },
                  { id: 'compact', label: 'Compact', desc: '58px min-h' },
                  { id: 'standard', label: 'Standard', desc: '74px min-h' },
                  { id: 'custom', label: 'Custom Slider', desc: `${pwaConfig.cardMinHeight}px` }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateField('cardHeightMode', mode.id as any)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      pwaConfig.cardHeightMode === mode.id
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">{mode.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Min-Height Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Card Min-Height (in px):</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{pwaConfig.cardMinHeight}px</span>
              </div>
              <input 
                type="range"
                min={48}
                max={140}
                step={2}
                value={pwaConfig.cardMinHeight}
                onChange={(e) => updateField('cardMinHeight', Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>48px (Tight)</span>
                <span>74px (Normal)</span>
                <span>100px (Tall)</span>
                <span>140px (Hero)</span>
              </div>
            </div>

            {/* Vertical Padding & Border Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Vertical Padding (Top/Bottom):</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{pwaConfig.cardPaddingY}px</span>
                </div>
                <input 
                  type="range"
                  min={4}
                  max={20}
                  step={1}
                  value={pwaConfig.cardPaddingY}
                  onChange={(e) => updateField('cardPaddingY', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Card Corner Radius:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{pwaConfig.cardBorderRadius}px</span>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={24}
                  step={2}
                  value={pwaConfig.cardBorderRadius}
                  onChange={(e) => updateField('cardBorderRadius', Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Job Card Icon Sizing & Shape */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Square className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    3. Job Card Icon Dimensions &amp; Shape (Mobile PWA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adjust icon box width &amp; height, inner SVG graphic size, shape, and background style
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => updateField('showCardIcon', !pwaConfig.showCardIcon)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  pwaConfig.showCardIcon
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{pwaConfig.showCardIcon ? 'Icons: ON' : 'Icons: OFF'}</span>
              </button>
            </div>

            {/* Lock Aspect Ratio Toggle */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lock 1:1 Aspect Ratio (Square Container):
              </span>
              <button
                onClick={() => setLockIconRatio(!lockIconRatio)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  lockIconRatio
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lockIconRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{lockIconRatio ? 'Locked (1:1)' : 'Independent'}</span>
              </button>
            </div>

            {/* Icon Container Width & Height Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Icon Container Width:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">{pwaConfig.iconContainerWidth}px</span>
                </div>
                <input 
                  type="range"
                  min={20}
                  max={60}
                  step={1}
                  value={pwaConfig.iconContainerWidth}
                  onChange={(e) => updateField('iconContainerWidth', Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>20px (Mini)</span>
                  <span>34px (Default)</span>
                  <span>60px (Big)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Icon Container Height:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">{pwaConfig.iconContainerHeight}px</span>
                </div>
                <input 
                  type="range"
                  min={20}
                  max={60}
                  step={1}
                  value={pwaConfig.iconContainerHeight}
                  onChange={(e) => updateField('iconContainerHeight', Number(e.target.value))}
                  disabled={lockIconRatio}
                  className={`w-full accent-rose-600 cursor-pointer ${lockIconRatio ? 'opacity-60' : ''}`}
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>20px</span>
                  <span>34px</span>
                  <span>60px</span>
                </div>
              </div>
            </div>

            {/* Inner SVG Graphic Size */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Inner Icon Graphic / SVG Size:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">{pwaConfig.iconGraphicSize}px</span>
              </div>
              <input 
                type="range"
                min={12}
                max={36}
                step={1}
                value={pwaConfig.iconGraphicSize}
                onChange={(e) => updateField('iconGraphicSize', Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>12px (Small)</span>
                <span>18px (Standard)</span>
                <span>28px (Bold)</span>
                <span>36px (Max)</span>
              </div>
            </div>

            {/* Icon Shape & Background Palettes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Icon Container Shape:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'squircle', label: 'Squircle', icon: '▢' },
                    { id: 'rounded', label: 'Rounded', icon: '▢' },
                    { id: 'circle', label: 'Circle', icon: '○' },
                    { id: 'square', label: 'Square', icon: '■' }
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => updateField('iconShape', shape.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        pwaConfig.iconShape === shape.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-1 ring-rose-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{shape.icon}</span>
                      <span>{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Icon Container Style:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'brand', label: 'Brand Red' },
                    { id: 'subtle', label: 'Subtle Slate' },
                    { id: 'gradient', label: 'Gradient' },
                    { id: 'minimal', label: 'Minimal Outline' }
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateField('iconBgStyle', bg.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        pwaConfig.iconBgStyle === bg.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-1 ring-rose-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Column Header & Typography Sizing */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    4. Column Header &amp; Typography (Mobile PWA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Column card width, header category icon size, and mobile title font sizes
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Column Header Icon (W x H):</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {pwaConfig.columnHeaderIconWidth}px
                  </span>
                </div>
                <input 
                  type="range"
                  min={20}
                  max={48}
                  step={2}
                  value={pwaConfig.columnHeaderIconWidth}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    updateField('columnHeaderIconWidth', v);
                    updateField('columnHeaderIconHeight', v);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Column Outer Width:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {pwaConfig.columnCardWidthPercent}%
                  </span>
                </div>
                <input 
                  type="range"
                  min={85}
                  max={100}
                  step={1}
                  value={pwaConfig.columnCardWidthPercent}
                  onChange={(e) => updateField('columnCardWidthPercent', Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Job Title Font Size:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{pwaConfig.cardTitleFontSize}px</span>
                </div>
                <input 
                  type="range"
                  min={12}
                  max={18}
                  step={0.5}
                  value={pwaConfig.cardTitleFontSize}
                  onChange={(e) => updateField('cardTitleFontSize', Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Date &amp; Meta Font Size:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{pwaConfig.cardMetaFontSize}px</span>
                </div>
                <input 
                  type="range"
                  min={9}
                  max={13}
                  step={0.5}
                  value={pwaConfig.cardMetaFontSize}
                  onChange={(e) => updateField('cardMetaFontSize', Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Mobile Device Simulator (5 cols) */}
        <div className="lg:col-span-5 sticky top-4">
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border-4 border-slate-800 shadow-2xl space-y-4">
            
            {/* Phone Top Notch & Status */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="font-bold font-mono">09:41</span>
              <div className="w-18 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Live Preview Label & Tab Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Live Mobile PWA Viewport
                </span>
              </div>
              
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setActivePreviewSample('latest')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activePreviewSample === 'latest' ? 'bg-rose-500 text-white' : 'text-slate-400'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => setActivePreviewSample('results')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activePreviewSample === 'results' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Result
                </button>
                <button
                  onClick={() => setActivePreviewSample('admit')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activePreviewSample === 'admit' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Admit
                </button>
              </div>
            </div>

            {/* Dimension Indicators Badge */}
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-sky-300 flex flex-wrap items-center justify-between gap-1">
              <span>Card: {pwaConfig.cardCustomMaxWidth > 0 ? `${pwaConfig.cardCustomMaxWidth}px` : `${pwaConfig.cardWidthPercent}%`}</span>
              <span>Min-H: {sampleMinHeight ? `${sampleMinHeight}px` : 'Auto'}</span>
              <span>Icon: {pwaConfig.iconContainerWidth}x{pwaConfig.iconContainerHeight}px</span>
              <span>SVG: {pwaConfig.iconGraphicSize}px</span>
            </div>

            {/* Mobile Screen Area */}
            <div className="bg-slate-950 rounded-2xl p-2 sm:p-3 border border-slate-800 space-y-3 overflow-hidden">
              
              {/* Column Card Container in Mobile PWA */}
              <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-all"
                style={{
                  width: `${pwaConfig.columnCardWidthPercent}%`,
                  borderRadius: `${pwaConfig.columnBorderRadius}px`,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                {/* Column Header */}
                <div className="bg-gradient-to-r from-[#8c1328] via-[#a81934] to-[#670d1e] px-3 py-2 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="rounded-lg bg-white/20 flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        width: `${pwaConfig.columnHeaderIconWidth}px`,
                        height: `${pwaConfig.columnHeaderIconHeight}px`
                      }}
                    >
                      <CategoryIcon 
                        icon={
                          activePreviewSample === 'latest' ? '💼' :
                          activePreviewSample === 'results' ? '🏆' : '📄'
                        } 
                        className="object-contain shrink-0" 
                      />
                    </span>
                    <h4 className="font-black text-xs sm:text-sm tracking-tight truncate">
                      {activePreviewSample === 'latest' ? 'Latest Online Form' :
                       activePreviewSample === 'results' ? 'Latest Results' : 'Admit Card'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                    3 Updates
                  </span>
                </div>

                {/* Simulated Job Cards in List */}
                <div className="p-1.5 space-y-1.5 bg-slate-50 dark:bg-slate-950">
                  
                  {/* Sample Card 1 */}
                  <div 
                    className="pwa-job-card-item bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                    style={{
                      width: pwaConfig.cardCustomMaxWidth > 0 ? `${pwaConfig.cardCustomMaxWidth}px` : `${pwaConfig.cardWidthPercent}%`,
                      maxWidth: '100%',
                      minHeight: sampleMinHeight ? `${sampleMinHeight}px` : undefined,
                      paddingTop: `${pwaConfig.cardPaddingY}px`,
                      paddingBottom: `${pwaConfig.cardPaddingY}px`,
                      paddingLeft: `${pwaConfig.cardPaddingX}px`,
                      paddingRight: `${pwaConfig.cardPaddingX}px`,
                      borderRadius: `${pwaConfig.cardBorderRadius}px`,
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {pwaConfig.showCardIcon && (
                        <div 
                          className={`pwa-job-card-icon-box shrink-0 flex items-center justify-center transition-all ${getIconContainerStyleClass()} ${getIconRadiusClass()}`}
                          style={{
                            width: `${pwaConfig.iconContainerWidth}px`,
                            height: `${pwaConfig.iconContainerHeight}px`,
                            minWidth: `${pwaConfig.iconContainerWidth}px`,
                            minHeight: `${pwaConfig.iconContainerHeight}px`
                          }}
                        >
                          <span 
                            className="pwa-job-card-icon-svg flex items-center justify-center object-contain"
                            style={{
                              fontSize: `${pwaConfig.iconGraphicSize}px`,
                              width: `${pwaConfig.iconGraphicSize}px`,
                              height: `${pwaConfig.iconGraphicSize}px`
                            }}
                          >
                            💼
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-400 text-slate-950">
                            NEW
                          </span>
                          <span 
                            className="font-bold text-slate-500 dark:text-slate-400"
                            style={{ fontSize: `${pwaConfig.cardMetaFontSize}px` }}
                          >
                            📅 14 Mar 2026
                          </span>
                        </div>
                        <h5 
                          className="font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight"
                          style={{ fontSize: `${pwaConfig.cardTitleFontSize}px` }}
                        >
                          SSC Combined Graduate Level (CGL) 2026 Tier-1 Online Form
                        </h5>
                      </div>
                    </div>

                    <span className="ml-2 text-slate-400 group-hover:text-amber-500 text-xs shrink-0">
                      →
                    </span>
                  </div>

                  {/* Sample Card 2 */}
                  <div 
                    className="pwa-job-card-item bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                    style={{
                      width: pwaConfig.cardCustomMaxWidth > 0 ? `${pwaConfig.cardCustomMaxWidth}px` : `${pwaConfig.cardWidthPercent}%`,
                      maxWidth: '100%',
                      minHeight: sampleMinHeight ? `${sampleMinHeight}px` : undefined,
                      paddingTop: `${pwaConfig.cardPaddingY}px`,
                      paddingBottom: `${pwaConfig.cardPaddingY}px`,
                      paddingLeft: `${pwaConfig.cardPaddingX}px`,
                      paddingRight: `${pwaConfig.cardPaddingX}px`,
                      borderRadius: `${pwaConfig.cardBorderRadius}px`,
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {pwaConfig.showCardIcon && (
                        <div 
                          className={`pwa-job-card-icon-box shrink-0 flex items-center justify-center transition-all ${getIconContainerStyleClass()} ${getIconRadiusClass()}`}
                          style={{
                            width: `${pwaConfig.iconContainerWidth}px`,
                            height: `${pwaConfig.iconContainerHeight}px`,
                            minWidth: `${pwaConfig.iconContainerWidth}px`,
                            minHeight: `${pwaConfig.iconContainerHeight}px`
                          }}
                        >
                          <span 
                            className="pwa-job-card-icon-svg flex items-center justify-center object-contain"
                            style={{
                              fontSize: `${pwaConfig.iconGraphicSize}px`,
                              width: `${pwaConfig.iconGraphicSize}px`,
                              height: `${pwaConfig.iconGraphicSize}px`
                            }}
                          >
                            🏆
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-rose-500 text-white">
                            EXPIRING
                          </span>
                          <span 
                            className="font-bold text-slate-500 dark:text-slate-400"
                            style={{ fontSize: `${pwaConfig.cardMetaFontSize}px` }}
                          >
                            📅 13 Mar 2026
                          </span>
                        </div>
                        <h5 
                          className="font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight"
                          style={{ fontSize: `${pwaConfig.cardTitleFontSize}px` }}
                        >
                          UPSC Civil Services CSE 2026 Pre Exam Cutoff &amp; Marks
                        </h5>
                      </div>
                    </div>

                    <span className="ml-2 text-slate-400 group-hover:text-amber-500 text-xs shrink-0">
                      →
                    </span>
                  </div>

                  {/* Sample Card 3 */}
                  <div 
                    className="pwa-job-card-item bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                    style={{
                      width: pwaConfig.cardCustomMaxWidth > 0 ? `${pwaConfig.cardCustomMaxWidth}px` : `${pwaConfig.cardWidthPercent}%`,
                      maxWidth: '100%',
                      minHeight: sampleMinHeight ? `${sampleMinHeight}px` : undefined,
                      paddingTop: `${pwaConfig.cardPaddingY}px`,
                      paddingBottom: `${pwaConfig.cardPaddingY}px`,
                      paddingLeft: `${pwaConfig.cardPaddingX}px`,
                      paddingRight: `${pwaConfig.cardPaddingX}px`,
                      borderRadius: `${pwaConfig.cardBorderRadius}px`,
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {pwaConfig.showCardIcon && (
                        <div 
                          className={`pwa-job-card-icon-box shrink-0 flex items-center justify-center transition-all ${getIconContainerStyleClass()} ${getIconRadiusClass()}`}
                          style={{
                            width: `${pwaConfig.iconContainerWidth}px`,
                            height: `${pwaConfig.iconContainerHeight}px`,
                            minWidth: `${pwaConfig.iconContainerWidth}px`,
                            minHeight: `${pwaConfig.iconContainerHeight}px`
                          }}
                        >
                          <span 
                            className="pwa-job-card-icon-svg flex items-center justify-center object-contain"
                            style={{
                              fontSize: `${pwaConfig.iconGraphicSize}px`,
                              width: `${pwaConfig.iconGraphicSize}px`,
                              height: `${pwaConfig.iconGraphicSize}px`
                            }}
                          >
                            📄
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span 
                            className="font-bold text-slate-500 dark:text-slate-400"
                            style={{ fontSize: `${pwaConfig.cardMetaFontSize}px` }}
                          >
                            📅 12 Mar 2026
                          </span>
                        </div>
                        <h5 
                          className="font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight"
                          style={{ fontSize: `${pwaConfig.cardTitleFontSize}px` }}
                        >
                          Railway RRB ALP Stage-1 Hall Ticket / Admit Card Released
                        </h5>
                      </div>
                    </div>

                    <span className="ml-2 text-slate-400 group-hover:text-amber-500 text-xs shrink-0">
                      →
                    </span>
                  </div>

                </div>
              </div>

            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Changes reflect instantly in the mobile preview and apply across all Mobile PWA views when saved.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
