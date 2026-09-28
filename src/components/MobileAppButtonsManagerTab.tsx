import React, { useState } from 'react';
import { 
  Save, RefreshCw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  Trash2, Plus, Check, Eye, EyeOff, Palette, Move, 
  Sliders, Sparkles, AlertCircle, Smartphone, HelpCircle, Maximize2, Layers
} from 'lucide-react';
import { MobileTabsConfig, AppToolItem, AppCategoryButton, JobAlert } from '../types';
import { DEFAULT_MOBILE_TABS_CONFIG, DEFAULT_TRENDING_BANNERS } from '../data/mobileTabsData';
import { MobilePwaCardSizingTab } from './MobilePwaCardSizingTab';
import { TrendingBannersManagerTab } from './TrendingBannersManagerTab';

interface MobileAppButtonsManagerTabProps {
  config: MobileTabsConfig;
  onSave: (newConfig: MobileTabsConfig) => Promise<void> | void;
  onToast: (msg: string) => void;
  jobs?: JobAlert[];
  initialSubTab?: 'categories' | 'tools' | 'banners' | 'cardSizing';
}

export const MobileAppButtonsManagerTab: React.FC<MobileAppButtonsManagerTabProps> = ({
  config,
  onSave,
  onToast,
  jobs = [],
  initialSubTab = 'categories'
}) => {
  const [currentConfig, setCurrentConfig] = useState<MobileTabsConfig>(config);
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'tools' | 'banners' | 'cardSizing'>(initialSubTab);
  const [isSaving, setIsSaving] = useState(false);

  // Reorder Tools
  const moveTool = (index: number, direction: 'left' | 'right') => {
    const newTools = [...currentConfig.tools];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTools.length) return;

    const temp = newTools[index];
    newTools[index] = newTools[targetIndex];
    newTools[targetIndex] = temp;

    // re-assign order
    newTools.forEach((t, i) => { t.order = i + 1; });
    setCurrentConfig({ ...currentConfig, tools: newTools });
  };

  // Reorder Category Buttons
  const moveCategory = (index: number, direction: 'left' | 'right') => {
    const newCats = [...currentConfig.categoryButtons];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    newCats.forEach((c, i) => { c.order = i + 1; });
    setCurrentConfig({ ...currentConfig, categoryButtons: newCats });
  };

  // Update Category field
  const updateCategory = (id: string, field: keyof AppCategoryButton, val: any) => {
    setCurrentConfig({
      ...currentConfig,
      categoryButtons: currentConfig.categoryButtons.map(c => c.id === id ? { ...c, [field]: val } : c)
    });
  };

  // Update Tool field
  const updateTool = (id: string, field: keyof AppToolItem, val: any) => {
    setCurrentConfig({
      ...currentConfig,
      tools: currentConfig.tools.map(t => t.id === id ? { ...t, [field]: val } : t)
    });
  };

  // Add new Category button
  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newBtn: AppCategoryButton = {
      id: newId,
      label: 'New Exam',
      color: '#8c1328',
      textColor: '#ffffff',
      filterKey: 'New Exam',
      enabled: true,
      order: currentConfig.categoryButtons.length + 1
    };
    setCurrentConfig({
      ...currentConfig,
      categoryButtons: [...currentConfig.categoryButtons, newBtn]
    });
    onToast('Added new Category Button. Set color & title below!');
  };

  // Add new Tool
  const handleAddTool = () => {
    const newId = `tool-${Date.now()}`;
    const newTool: AppToolItem = {
      id: newId,
      title: 'NEW GOVT TOOL',
      subtitle: 'Online tool for govt candidates',
      badge: 'NEW',
      badgeColor: 'bg-emerald-500 text-slate-950',
      icon: 'image-resizer',
      gradient: 'from-[#8c1328] via-[#a81934] to-[#670d1e]',
      accentColor: '#8c1328',
      enabled: true,
      order: currentConfig.tools.length + 1,
      description: 'Useful tool for government exam applicants.',
      howToUse: ['Step 1: Open tool', 'Step 2: Follow instructions'],
      features: ['100% Free', 'Instant download']
    };
    setCurrentConfig({
      ...currentConfig,
      tools: [...currentConfig.tools, newTool]
    });
    onToast('Added new Tool card!');
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentConfig);
      onToast('✓ Mobile App Tabs & Colors saved successfully!');
    } catch (e) {
      onToast('Error saving mobile tabs');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset
  const handleReset = () => {
    if (window.confirm('Reset all mobile tabs & colors back to GovtBharat brand defaults?')) {
      setCurrentConfig(DEFAULT_MOBILE_TABS_CONFIG);
      onToast('Reset to brand defaults. Click Save to persist.');
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#8c1328] via-[#a81934] to-[#670d1e] text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Mobile App Tabs, Buttons &amp; Tools Manager
            </h2>
            <p className="text-xs text-rose-100">
              Customize button colors, movement order (left/right), titles &amp; tools for mobile app view
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 rounded-xl transition-all cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Sub tabs: Category Wise Updates vs Tools vs Trending Banners vs Mobile PWA Card Sizing */}
      <div className="flex flex-wrap items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'categories'
              ? 'bg-white dark:bg-slate-800 text-[#8c1328] dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Categories ({currentConfig.categoryButtons.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tools')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'tools'
              ? 'bg-white dark:bg-slate-800 text-[#8c1328] dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Tools ({currentConfig.tools.length})
        </button>
        <button
          onClick={() => setActiveSubTab('banners')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'banners'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-400/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Trending Banners ({(currentConfig.banners || DEFAULT_TRENDING_BANNERS).length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('cardSizing')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'cardSizing'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-sky-400/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-500" />
          <span>PWA Card Sizing</span>
        </button>
      </div>

      {/* 1. CATEGORY BUTTONS MANAGER */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-wide">
                Category Wise Update Buttons Order &amp; Color
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Move buttons left or right, change background color or text, and toggle active status.
              </p>
            </div>
            <button
              onClick={handleAddCategory}
              className="px-3 py-1.5 bg-[#8c1328] hover:bg-[#a61935] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Button
            </button>
          </div>

          {/* Live Mobile View Strip Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Live Horizontal Strip Preview (Scrolls on Mobile):
            </span>
            <div className="overflow-x-auto no-scrollbar py-2">
              <div className="flex items-center gap-2.5 min-w-max">
                {currentConfig.categoryButtons.filter(c => c.enabled).map((cat) => (
                  <div
                    key={cat.id}
                    style={{ backgroundColor: cat.color, color: cat.textColor }}
                    className="px-4 py-2.5 rounded-xl font-black text-xs shadow-sm flex items-center justify-center min-w-[90px] border border-white/10"
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* List of category items with order controls and color pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentConfig.categoryButtons.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) => updateCategory(cat.id, 'label', e.target.value)}
                      className="px-2.5 py-1 text-xs font-black rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  {/* Move Left / Right Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveCategory(idx, 'left')}
                      disabled={idx === 0}
                      title="Move Left"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveCategory(idx, 'right')}
                      disabled={idx === currentConfig.categoryButtons.length - 1}
                      title="Move Right"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateCategory(cat.id, 'enabled', !cat.enabled)}
                      className={`p-1.5 rounded-lg ${cat.enabled ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'} cursor-pointer`}
                      title={cat.enabled ? 'Visible' : 'Hidden'}
                    >
                      {cat.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete button "${cat.label}"?`)) {
                          setCurrentConfig({
                            ...currentConfig,
                            categoryButtons: currentConfig.categoryButtons.filter(c => c.id !== cat.id)
                          });
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Color Chooser */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-semibold">BG Color:</span>
                    <input
                      type="color"
                      value={cat.color}
                      onChange={(e) => updateCategory(cat.id, 'color', e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={cat.color}
                      onChange={(e) => updateCategory(cat.id, 'color', e.target.value)}
                      className="w-20 px-2 py-0.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  {/* Preset quick colors */}
                  <div className="flex items-center space-x-1.5">
                    {['#8c1328', '#16a34a', '#15803d', '#7c3aed', '#0284c7', '#d97706', '#c026d3'].map((presetCol) => (
                      <button
                        key={presetCol}
                        onClick={() => updateCategory(cat.id, 'color', presetCol)}
                        style={{ backgroundColor: presetCol }}
                        className="w-4 h-4 rounded-full border border-white/40 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                        title={presetCol}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TOOLS SECTION MANAGER */}
      {activeSubTab === 'tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-wide">
                Tools Section Cards &amp; Gradient Colors
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reorder tool cards (move up/down or left/right), edit title, badge, and description.
              </p>
            </div>
            <button
              onClick={handleAddTool}
              className="px-3 py-1.5 bg-[#8c1328] hover:bg-[#a61935] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tool Card
            </button>
          </div>

          <div className="space-y-3">
            {currentConfig.tools.map((t, idx) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={t.title}
                      onChange={(e) => updateTool(t.id, 'title', e.target.value)}
                      className="px-3 py-1 font-black text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-48 sm:w-64"
                    />
                    <input
                      type="text"
                      value={t.badge || ''}
                      placeholder="Badge"
                      onChange={(e) => updateTool(t.id, 'badge', e.target.value)}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-24"
                    />
                  </div>

                  {/* Movement controls */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => moveTool(idx, 'left')}
                      disabled={idx === 0}
                      title="Move Up / Left"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveTool(idx, 'right')}
                      disabled={idx === currentConfig.tools.length - 1}
                      title="Move Down / Right"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateTool(t.id, 'enabled', !t.enabled)}
                      className={`p-1.5 rounded-lg ${t.enabled ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'} cursor-pointer`}
                    >
                      {t.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete tool "${t.title}"?`)) {
                          setCurrentConfig({
                            ...currentConfig,
                            tools: currentConfig.tools.filter(item => item.id !== t.id)
                          });
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Subtitle / Description:
                  </label>
                  <input
                    type="text"
                    value={t.subtitle}
                    onChange={(e) => updateTool(t.id, 'subtitle', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                {/* Gradient Picker */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 font-semibold">Theme Gradient Preset:</span>
                  {[
                    { label: 'GovtBharat Crimson', grad: 'from-[#8c1328] via-[#a81934] to-[#670d1e]' },
                    { label: 'Deep Slate Navy', grad: 'from-[#0B1120] via-[#162238] to-[#0f172a]' },
                    { label: 'Royal Amber Gold', grad: 'from-[#b45309] via-[#d97706] to-[#78350f]' },
                    { label: 'Forest Green', grad: 'from-[#064e3b] via-[#047857] to-[#022c22]' },
                    { label: 'Electric Indigo', grad: 'from-[#1e1b4b] via-[#312e81] to-[#0f172a]' },
                    { label: 'Crimson Red', grad: 'from-[#991b1b] via-[#b91c1c] to-[#7f1d1d]' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => updateTool(t.id, 'gradient', preset.grad)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        t.gradient === preset.grad
                          ? 'border-[#8c1328] dark:border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-[#8c1328] dark:text-rose-400 ring-1 ring-[#8c1328]'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TRENDING BANNERS & SLIDER CUSTOMIZER */}
      {activeSubTab === 'banners' && (
        <TrendingBannersManagerTab
          config={currentConfig}
          onSave={onSave}
          onToast={onToast}
          jobs={jobs}
        />
      )}

      {/* 4. MOBILE PWA JOB CARDS & ICONS SIZING */}
      {activeSubTab === 'cardSizing' && (
        <MobilePwaCardSizingTab
          config={currentConfig}
          onSave={onSave}
          onToast={onToast}
        />
      )}
    </div>
  );
};
