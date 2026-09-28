import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Compass, 
  Footprints, 
  Layers, 
  Image as ImageIcon, 
  FileText, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Upload, 
  Download, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  History, 
  AlertTriangle, 
  Sliders, 
  CheckCircle2, 
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Copy,
  CheckCheck,
  Globe,
  Bell,
  Search,
  Briefcase,
  HelpCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { 
  WebsiteControlConfig, 
  DEFAULT_WEBSITE_CONTROL_CONFIG, 
  DEFAULT_WEBSITE_SECTIONS,
  GLOBAL_THEME_PRESETS, 
  AVAILABLE_GOOGLE_FONTS, 
  STANDARD_JOB_LINK_FONT_SIZE,
  STANDARD_JOB_LINK_FONT_SIZE_MOBILE,
  STANDARD_JOB_LINK_FONT_WEIGHT,
  STANDARD_JOB_LINK_LINE_HEIGHT,
  loadWebsiteControlConfig, 
  saveWebsiteControlConfig, 
  applyWebsiteControlToDOM,
  CustomNavLinkItem,
  WebsiteSectionItem,
  WebsiteVersionSnapshot
} from '../utils/websiteControlConfig';
import { 
  saveWebsiteControlConfigToFirestore, 
  subscribeToWebsiteControlConfig 
} from '../services/firestoreService';

interface WebsiteControlTabProps {
  onToast: (msg: string) => void;
  siteLogo?: string;
  setSiteLogo?: (logo: string) => void;
}

export const WebsiteControlTab: React.FC<WebsiteControlTabProps> = ({ 
  onToast,
  siteLogo,
  setSiteLogo
}) => {
  const [config, setConfig] = useState<WebsiteControlConfig>(loadWebsiteControlConfig());
  const [savedConfig, setSavedConfig] = useState<WebsiteControlConfig>(loadWebsiteControlConfig());
  const [activeSubTab, setActiveSubTab] = useState<
    'theme' | 'typography' | 'header' | 'footer' | 'sections' | 'layout' | 'media' | 'content' | 'seo' | 'preview' | 'versions'
  >('theme');
  
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewThemeMode, setPreviewThemeMode] = useState<'light' | 'dark'>('light');
  const [showResetModal, setShowResetModal] = useState(false);
  const [versionLabelInput, setVersionLabelInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [jobLinkPreviewCategory, setJobLinkPreviewCategory] = useState<'all' | 'results' | 'admit' | 'latest' | 'syllabus'>('all');
  const [jobLinkPreviewDevice, setJobLinkPreviewDevice] = useState<'desktop' | 'mobile' | 'split'>('desktop');
  const [jobLinkPreviewLayout, setJobLinkPreviewLayout] = useState<'multi-column' | 'single-list'>('multi-column');

  // Subscribe to real-time Cloud updates from Firestore
  useEffect(() => {
    const unsub = subscribeToWebsiteControlConfig((cloudConfig) => {
      if (cloudConfig && typeof cloudConfig === 'object') {
        const merged = { ...DEFAULT_WEBSITE_CONTROL_CONFIG, ...cloudConfig };
        setSavedConfig(merged);
        // Only update local working state if no pending edits
        if (!hasUnsavedChanges) {
          setConfig(merged);
          applyWebsiteControlToDOM(merged);
        }
      }
    });
    return () => unsub();
  }, [hasUnsavedChanges]);

  // Initial load
  useEffect(() => {
    applyWebsiteControlToDOM(config);
  }, []);

  const handleUpdate = (updater: (prev: WebsiteControlConfig) => WebsiteControlConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      setHasUnsavedChanges(true);
      applyWebsiteControlToDOM(next);
      return next;
    });
  };

  const handleSaveDraft = () => {
    saveWebsiteControlConfig(config);
    setHasUnsavedChanges(false);
    onToast('💾 Website customization draft saved locally!');
  };

  const handlePublishToCloud = async () => {
    setIsPublishing(true);
    try {
      // 1. Create a version snapshot
      const now = new Date();
      const snapshot: WebsiteVersionSnapshot = {
        id: `v-${Date.now()}`,
        timestamp: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        author: 'Super Admin',
        label: versionLabelInput.trim() || `Published on ${now.toLocaleDateString()}`,
        configSnapshot: { ...config }
      };

      const updatedHistory = [snapshot, ...(config.versionHistory || [])].slice(0, 15);
      const configToSave: WebsiteControlConfig = {
        ...config,
        versionHistory: updatedHistory,
        lastUpdated: now.toISOString(),
        lastUpdatedBy: 'Super Admin'
      };

      // 2. Persist locally and in Firestore
      saveWebsiteControlConfig(configToSave);
      await saveWebsiteControlConfigToFirestore(configToSave);

      // Sync logo if changed
      if (config.header?.logoUrl && setSiteLogo && config.header.logoUrl !== siteLogo) {
        setSiteLogo(config.header.logoUrl);
      }

      setConfig(configToSave);
      setSavedConfig(configToSave);
      setHasUnsavedChanges(false);
      setVersionLabelInput('');
      onToast('🚀 Published successfully! All changes are live across the portal.');
    } catch (err: any) {
      console.error('Publish error:', err);
      onToast(`❌ Failed to publish: ${err?.message || 'Network error'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardChanges = () => {
    setConfig(savedConfig);
    applyWebsiteControlToDOM(savedConfig);
    setHasUnsavedChanges(false);
    onToast('↩️ Discarded unsaved changes. Restored last published version.');
  };

  const handleResetToDefault = async () => {
    setShowResetModal(false);
    setConfig(DEFAULT_WEBSITE_CONTROL_CONFIG);
    saveWebsiteControlConfig(DEFAULT_WEBSITE_CONTROL_CONFIG);
    await saveWebsiteControlConfigToFirestore(DEFAULT_WEBSITE_CONTROL_CONFIG);
    applyWebsiteControlToDOM(DEFAULT_WEBSITE_CONTROL_CONFIG);
    setHasUnsavedChanges(false);
    onToast('🔄 Reset entire website design and layout to factory default settings.');
  };

  const handleApplyPreset = (preset: typeof GLOBAL_THEME_PRESETS[0]) => {
    handleUpdate(prev => ({
      ...prev,
      colors: { ...preset.colors },
      typography: preset.typography ? { ...prev.typography, ...preset.typography } : prev.typography
    }));
    onToast(`🎨 Applied theme preset: "${preset.name}"!`);
  };

  const handleRestoreVersion = (snapshot: WebsiteVersionSnapshot) => {
    if (window.confirm(`Restore website configuration from snapshot "${snapshot.label}" (${snapshot.timestamp})?`)) {
      const restored = { ...snapshot.configSnapshot };
      setConfig(restored);
      applyWebsiteControlToDOM(restored);
      setHasUnsavedChanges(true);
      onToast(`📦 Restored version "${snapshot.label}". Click 'Publish Live' to apply to all users.`);
    }
  };

  const handleCopyColor = (val: string, keyName: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
    onToast(`Copied ${val} to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions & Unsaved Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <SlidersHorizontal className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">Website Control & Customizer</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                MASTER ENGINE
              </span>
              {hasUnsavedChanges && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  ● Unsaved Edits
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Control colors, layout, fonts, header, footer, banners & content with 100% zero-code configuration.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleDiscardChanges}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              Discard Changes
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 rounded-xl text-xs font-bold transition-all border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          <button
            onClick={handlePublishToCloud}
            disabled={isPublishing}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Publish Live Changes
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all border border-slate-800 cursor-pointer"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Category Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 scrollbar-thin">
        {[
          { id: 'theme', label: 'Theme & Colors', icon: Palette },
          { id: 'typography', label: 'Fonts & Typography', icon: Type },
          { id: 'header', label: 'Header & Nav', icon: Compass },
          { id: 'footer', label: 'Footer & Contact', icon: Footprints },
          { id: 'sections', label: 'Sections Manager', icon: Layers },
          { id: 'layout', label: 'Grid & Layout', icon: Layout },
          { id: 'media', label: 'Images & Media', icon: ImageIcon },
          { id: 'content', label: 'Content & Texts', icon: FileText },
          { id: 'seo', label: 'SEO Config', icon: Search },
          { id: 'preview', label: 'Live Simulator', icon: Monitor },
          { id: 'versions', label: 'Version History', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: THEME & COLORS */}
      {activeSubTab === 'theme' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Preset Themes Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                1-Click Global Preset Themes
              </h3>
              <span className="text-xs text-slate-500">Instant complete portal makeover</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GLOBAL_THEME_PRESETS.map(preset => {
                // Check if current colors match this preset's primary signature colors
                const isActivePreset = 
                  config.colors.primaryColor === preset.colors.primaryColor &&
                  config.colors.headerColor === preset.colors.headerColor;
                  
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3.5 rounded-xl border ${isActivePreset ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/50'} cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-xs ${isActivePreset ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white group-hover:text-indigo-400'}`}>
                        {preset.name}
                        {isActivePreset && <CheckCircle2 className="w-3.5 h-3.5 inline-block ml-2 text-indigo-500" />}
                      </span>
                      <div className="flex gap-1">
                        {preset.previewColors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-tight ${isActivePreset ? 'text-indigo-600/70 dark:text-indigo-400/70' : 'text-slate-500 dark:text-slate-400'}`}>
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Color Pickers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              Granular Color Customizer (Every Visible Element)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { label: 'Primary Brand Color', key: 'primaryColor', desc: 'Main buttons, badges & active states' },
                { label: 'Secondary Accent Color', key: 'secondaryColor', desc: 'Highlights, stars & alert banners' },
                { label: 'Header Background', key: 'headerColor', desc: 'Top navigation bar canvas' },
                { label: 'Header Text Color', key: 'headerTextColor', desc: 'Top navigation links and title text' },
                { label: 'Footer Background', key: 'footerColor', desc: 'Bottom portal footer bar' },
                { label: 'Footer Text Color', key: 'footerTextColor', desc: 'Footer links and copyright text' },
                { label: 'Button Background', key: 'buttonColor', desc: 'Primary CTA and submit buttons' },
                { label: 'Button Hover Background', key: 'buttonHoverColor', desc: 'Hover state for action buttons' },
                { label: 'Button Text Color', key: 'buttonTextColor', desc: 'Label inside primary buttons' },
                { label: 'Light Mode Background', key: 'backgroundColorLight', desc: 'Portal canvas in day mode' },
                { label: 'Dark Mode Background', key: 'backgroundColorDark', desc: 'Portal canvas in night mode' },
                { label: 'Light Mode Card Canvas', key: 'cardColorLight', desc: 'Job cards and containers (Light)' },
                { label: 'Dark Mode Card Canvas', key: 'cardColorDark', desc: 'Job cards and containers (Dark)' },
                { label: 'Light Mode Text Color', key: 'textColorLight', desc: 'Standard body text in day mode' },
                { label: 'Dark Mode Text Color', key: 'textColorDark', desc: 'Standard body text in night mode' },
                { label: 'Heading Text (Light)', key: 'headingColorLight', desc: 'H1, H2, titles in day mode' },
                { label: 'Heading Text (Dark)', key: 'headingColorDark', desc: 'H1, H2, titles in night mode' },
                { label: 'Light Mode Border Color', key: 'borderColorLight', desc: 'Card and divider borders (Light)' },
                { label: 'Dark Mode Border Color', key: 'borderColorDark', desc: 'Card and divider borders (Dark)' },
                { label: 'Hyperlink Color', key: 'linkColor', desc: 'Clickable URLs and text links' },
                { label: 'Active State Color', key: 'activeStateColor', desc: 'Selected filters and active tabs' },
                { label: 'Success Notification', key: 'successColor', desc: 'Verified, approved, active badges' },
                { label: 'Warning Notification', key: 'warningColor', desc: 'Pending, expiring, attention badges' },
                { label: 'Error / Urgent Notification', key: 'errorColor', desc: 'Expired, urgent, hot tags' }
              ].map(item => {
                const colorVal = (config.colors as any)[item.key] || '#000000';
                return (
                  <div key={item.key} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</label>
                      <button
                        onClick={() => handleCopyColor(colorVal, item.key)}
                        className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                        title="Copy Hex"
                      >
                        {copiedKey === item.key ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{colorVal}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorVal}
                        onChange={(e) => handleUpdate(prev => ({
                          ...prev,
                          colors: { ...prev.colors, [item.key]: e.target.value }
                        }))}
                        className="w-10 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={colorVal}
                        onChange={(e) => handleUpdate(prev => ({
                          ...prev,
                          colors: { ...prev.colors, [item.key]: e.target.value }
                        }))}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FONTS & TYPOGRAPHY */}
      {activeSubTab === 'typography' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-500" />
              Global Font Families & Typography Scaling
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Body Font */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Main Body Font Family (Google Fonts)
                </label>
                <select
                  value={config.typography?.fontFamily || 'Plus Jakarta Sans'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, fontFamily: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  {AVAILABLE_GOOGLE_FONTS.map(f => (
                    <option key={f.name} value={f.name}>{f.name} — {f.category}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">Applied across all cards, lists, paragraphs and menus.</p>
              </div>

              {/* Heading Font */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Headings Font Family (H1, H2, Column Titles)
                </label>
                <select
                  value={config.typography?.headingFontFamily || config.typography?.fontFamily || 'Plus Jakarta Sans'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, headingFontFamily: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  {AVAILABLE_GOOGLE_FONTS.map(f => (
                    <option key={f.name} value={f.name}>{f.name} — {f.category}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">Gives distinctive identity to main section titles & headers.</p>
              </div>

              {/* Font Size Scaling */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Base Font Scaling Ratio
                  </label>
                  <span className="text-xs font-black text-indigo-500">{config.typography?.fontSizeScale || 100}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="120"
                  step="5"
                  value={config.typography?.fontSizeScale || 100}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, fontSizeScale: Number(e.target.value) }
                  }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>85% (Compact)</span>
                  <span>100% (Standard)</span>
                  <span>120% (High Readability)</span>
                </div>
              </div>

              {/* Line Height & Letter Spacing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Line Height</label>
                  <select
                    value={config.typography?.lineHeight || '1.6'}
                    onChange={(e) => handleUpdate(prev => ({
                      ...prev,
                      typography: { ...prev.typography, lineHeight: e.target.value }
                    }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="1.4">1.4 (Compact)</option>
                    <option value="1.5">1.5 (Standard)</option>
                    <option value="1.6">1.6 (Relaxed)</option>
                    <option value="1.75">1.75 (Spacious)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Letter Spacing</label>
                  <select
                    value={config.typography?.letterSpacing || '-0.01em'}
                    onChange={(e) => handleUpdate(prev => ({
                      ...prev,
                      typography: { ...prev.typography, letterSpacing: e.target.value }
                    }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="-0.02em">-0.02em (Tight)</option>
                    <option value="-0.01em">-0.01em (Modern)</option>
                    <option value="0px">0px (Normal)</option>
                    <option value="0.03em">+0.03em (Wide)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Typography Preview Canvas */}
            <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Typography Specimen</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Sarkari Naukri 2026: Official Recruitment & Admit Cards
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Candidates can check the latest examination notifications, eligibility criteria, age limits, syllabus pattern, and answer key updates in real-time.
              </p>
            </div>
          </div>

          {/* DEDICATED JOB LINKS FONT TEXT SIZE CONTROLLER WITH REAL-TIME PREVIEW */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-amber-500/40 dark:border-amber-400/30 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Job Links Font Text Size Control
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        सभी जॉब लिंक्स
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Set custom font text size for all job titles and links across Result, Admit Card, Latest Jobs, Syllabus, and all categories.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Indicator & Reset Button */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Real-Time Live Preview Active</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdate(prev => ({
                      ...prev,
                      typography: {
                        ...prev.typography,
                        jobLinkFontSize: STANDARD_JOB_LINK_FONT_SIZE,
                        jobLinkFontSizeMobile: STANDARD_JOB_LINK_FONT_SIZE_MOBILE,
                        jobLinkFontWeight: STANDARD_JOB_LINK_FONT_WEIGHT,
                        jobLinkLineHeight: STANDARD_JOB_LINK_LINE_HEIGHT
                      }
                    }));
                    onToast('🎯 Job Links Font Size reset to Standard (Desktop: 14.5px, Mobile: 13px, Medium-Bold: 600)!');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 active:scale-95"
                  title="Reset all job links font size to standard default values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>🎯 Standard Size (14.5px / 13px)</span>
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>⚡ Quick Size Presets (त्वरित साइज चुनें):</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Current: <strong className="text-amber-600 dark:text-amber-400 font-bold">{config.typography?.jobLinkFontSize || 14.5}px</strong> Desktop / <strong className="text-amber-600 dark:text-amber-400 font-bold">{config.typography?.jobLinkFontSizeMobile || 13}px</strong> Mobile
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Compact', desktop: 13, mobile: 12, desc: 'Small / Dense', isStandard: false },
                  { label: 'Standard (Default)', desktop: 14.5, mobile: 13, desc: 'Clean & Balanced', isStandard: true },
                  { label: 'Medium', desktop: 16, mobile: 14.5, desc: 'Clear & Crisp', isStandard: false },
                  { label: 'Large', desktop: 17.5, mobile: 15.5, desc: 'Bold & Prominent', isStandard: false },
                  { label: 'Extra Large', desktop: 19, mobile: 16.5, desc: 'Maximum Size', isStandard: false },
                ].map((preset) => {
                  const isCurrent = (config.typography?.jobLinkFontSize || 14.5) === preset.desktop;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        handleUpdate(prev => ({
                          ...prev,
                          typography: {
                            ...prev.typography,
                            jobLinkFontSize: preset.desktop,
                            jobLinkFontSizeMobile: preset.mobile
                          }
                        }));
                        onToast(`✨ Set Job Links font size to ${preset.label} (${preset.desktop}px)!`);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate">{preset.label}</span>
                        {preset.isStandard && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-black">STD</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{preset.desktop}px / {preset.mobile}px</span>
                        <span>{preset.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine Tuning Sliders with Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {/* Desktop Font Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Desktop / Tablet Job Links Font Size</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = config.typography?.jobLinkFontSize || 16;
                        if (cur > 12) {
                          handleUpdate(prev => ({
                            ...prev,
                            typography: { ...prev.typography, jobLinkFontSize: Math.max(12, cur - 0.5) }
                          }));
                        }
                      }}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"
                      title="Decrease font size by 0.5px"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono font-black text-xs min-w-[48px] text-center">
                      {config.typography?.jobLinkFontSize || 16}px
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = config.typography?.jobLinkFontSize || 16;
                        if (cur < 26) {
                          handleUpdate(prev => ({
                            ...prev,
                            typography: { ...prev.typography, jobLinkFontSize: Math.min(26, cur + 0.5) }
                          }));
                        }
                      }}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"
                      title="Increase font size by 0.5px"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="12"
                  max="26"
                  step="0.5"
                  value={config.typography?.jobLinkFontSize || 16}
                  onInput={(e: any) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, jobLinkFontSize: Number(e.target.value) }
                  }))}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, jobLinkFontSize: Number(e.target.value) }
                  }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>12px (Small)</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">16px (Standard Default)</span>
                  <span>26px (Large)</span>
                </div>
              </div>

              {/* Mobile Phone Font Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Mobile Phones Job Links Font Size</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = config.typography?.jobLinkFontSizeMobile || 15;
                        if (cur > 12) {
                          handleUpdate(prev => ({
                            ...prev,
                            typography: { ...prev.typography, jobLinkFontSizeMobile: Math.max(12, cur - 0.5) }
                          }));
                        }
                      }}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                      title="Decrease mobile font size by 0.5px"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs min-w-[48px] text-center">
                      {config.typography?.jobLinkFontSizeMobile || 15}px
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = config.typography?.jobLinkFontSizeMobile || 15;
                        if (cur < 22) {
                          handleUpdate(prev => ({
                            ...prev,
                            typography: { ...prev.typography, jobLinkFontSizeMobile: Math.min(22, cur + 0.5) }
                          }));
                        }
                      }}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                      title="Increase mobile font size by 0.5px"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="12"
                  max="22"
                  step="0.5"
                  value={config.typography?.jobLinkFontSizeMobile || 15}
                  onInput={(e: any) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, jobLinkFontSizeMobile: Number(e.target.value) }
                  }))}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, jobLinkFontSizeMobile: Number(e.target.value) }
                  }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>12px (Small)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">15px (Standard Default)</span>
                  <span>22px (Large)</span>
                </div>
              </div>

              {/* Font Weight Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Font Weight (फॉन्ट की मोटाई / Boldness)
                </label>
                <select
                  value={config.typography?.jobLinkFontWeight || '700'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, jobLinkFontWeight: e.target.value as any }
                  }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="500">Medium (500) — Normal Readability</option>
                  <option value="600">Semi-Bold (600) — High Clarity</option>
                  <option value="700">Bold (700) — Standard Default Official</option>
                  <option value="800">Extra Bold (800) — Ultra Prominent</option>
                </select>
              </div>

              {/* Line Height Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Line Height / Spacing (लाइनों के बीच की दूरी)
                </label>
                <select
                  value={config.typography?.jobLinkLineHeight || '1.45'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    typography: { ...prev.typography, jobLinkLineHeight: e.target.value }
                  }))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="1.3">1.3 — Compact Lines</option>
                  <option value="1.45">1.45 — Standard Default Spacing</option>
                  <option value="1.6">1.6 — Relaxed Spacing</option>
                  <option value="1.75">1.75 — Spacious Lines</option>
                </select>
              </div>
            </div>

            {/* REAL-TIME MULTI-VIEW INTERACTIVE JOB LIST PREVIEW */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Real-Time Live Job List Specimen Preview
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                    Live Reactive
                  </span>
                </div>

                {/* Device and Layout Switcher Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Device Simulation Selector */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setJobLinkPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        jobLinkPreviewDevice === 'desktop'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      title="Preview with Desktop Font Size"
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop ({config.typography?.jobLinkFontSize || 16}px)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setJobLinkPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        jobLinkPreviewDevice === 'mobile'
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      title="Preview with Mobile Phone Font Size"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile ({config.typography?.jobLinkFontSizeMobile || 15}px)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setJobLinkPreviewDevice('split')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        jobLinkPreviewDevice === 'split'
                          ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      title="Side-by-side comparison"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Split Compare</span>
                    </button>
                  </div>

                  {/* Column Layout Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setJobLinkPreviewLayout('multi-column')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        jobLinkPreviewLayout === 'multi-column'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Columns Grid (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setJobLinkPreviewLayout('single-list')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        jobLinkPreviewLayout === 'single-list'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Focus List
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Live Render Container */}
              {jobLinkPreviewDevice === 'split' ? (
                /* Split Comparison: Desktop vs Mobile side-by-side */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Desktop Preview Card */}
                  <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-3.5 bg-slate-50/70 dark:bg-slate-950/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-950">
                      <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5" /> Desktop Render ({config.typography?.jobLinkFontSize || 16}px)
                      </span>
                      <span className="text-[10px] text-slate-400">Standard: 16px</span>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      <div className="py-2.5 px-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            style={{
                              fontSize: `${config.typography?.jobLinkFontSize || 16}px`,
                              fontWeight: config.typography?.jobLinkFontWeight || '700',
                              lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                            }}
                            className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                          >
                            SSC Combined Graduate Level CGL 2026 Tier-I Final Result & Cutoff
                          </span>
                          <span className="bg-red-500 text-white text-[8px] font-black px-1 py-[1.5px] rounded-sm shrink-0">NEW</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500">
                          <span>📅 12/08/2026</span>
                          <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300">All India</span>
                        </div>
                      </div>

                      <div className="py-2.5 px-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            style={{
                              fontSize: `${config.typography?.jobLinkFontSize || 16}px`,
                              fontWeight: config.typography?.jobLinkFontWeight || '700',
                              lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                            }}
                            className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                          >
                            UPSC Civil Services IAS / IPS Preliminary Examination Admit Card
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500">
                          <span>📅 11/08/2026</span>
                          <span className="text-rose-600 font-bold">Exam Date: 28/08/2026</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Preview Card */}
                  <div className="border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3.5 bg-slate-50/70 dark:bg-slate-950/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-950">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" /> Mobile Render ({config.typography?.jobLinkFontSizeMobile || 15}px)
                      </span>
                      <span className="text-[10px] text-slate-400">Standard: 15px</span>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      <div className="py-2.5 px-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            style={{
                              fontSize: `${config.typography?.jobLinkFontSizeMobile || 15}px`,
                              fontWeight: config.typography?.jobLinkFontWeight || '700',
                              lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                            }}
                            className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                          >
                            SSC Combined Graduate Level CGL 2026 Tier-I Final Result & Cutoff
                          </span>
                          <span className="bg-red-500 text-white text-[8px] font-black px-1 py-[1.5px] rounded-sm shrink-0">NEW</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>📅 12/08/2026</span>
                          <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300">All India</span>
                        </div>
                      </div>

                      <div className="py-2.5 px-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            style={{
                              fontSize: `${config.typography?.jobLinkFontSizeMobile || 15}px`,
                              fontWeight: config.typography?.jobLinkFontWeight || '700',
                              lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                            }}
                            className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                          >
                            UPSC Civil Services IAS / IPS Preliminary Examination Admit Card
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>📅 11/08/2026</span>
                          <span className="text-rose-600 font-bold">Exam Date: 28/08/2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : jobLinkPreviewLayout === 'multi-column' ? (
                /* Multi-Column 3-Box Portal Replica Preview */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Column 1: Results */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-3 py-2 text-white flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🏆</span>
                        <span className="text-xs font-black uppercase tracking-wider">Result</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                    </div>

                    <div className="p-2.5 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {[
                        { title: 'SSC CGL 2026 Tier-I Examination Result Declared', date: '12/08/2026', tag: 'Central', isNew: true },
                        { title: 'UP Police Constable 60,244 Post Result & Cut Off Marks', date: '10/08/2026', tag: 'UP', isNew: false },
                        { title: 'Railway RRB ALP Stage-I Result & Score Card Released', date: '08/08/2026', tag: 'Railways', isNew: false }
                      ].map((item, idx) => (
                        <div key={idx} className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all">
                          <div className="flex items-start justify-between gap-1.5">
                            <span
                              style={{
                                fontSize: `${jobLinkPreviewDevice === 'mobile' ? (config.typography?.jobLinkFontSizeMobile || 15) : (config.typography?.jobLinkFontSize || 16)}px`,
                                fontWeight: config.typography?.jobLinkFontWeight || '700',
                                lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                              }}
                              className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                            >
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="bg-red-500 text-white text-[8px] font-black px-1 py-[1.5px] rounded-sm uppercase shrink-0">NEW</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                            <span>📅 {item.date}</span>
                            <span className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">{item.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Admit Card */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-2 text-white flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🎫</span>
                        <span className="text-xs font-black uppercase tracking-wider">Admit Card</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">HOT</span>
                    </div>

                    <div className="p-2.5 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {[
                        { title: 'NTA NEET UG 2026 City Intimation Slip & Admit Card', date: '11/08/2026', tag: 'All India', isNew: true },
                        { title: 'CTET July 2026 Pre Admit Card / Exam Center City Details', date: '09/08/2026', tag: 'CBSE', isNew: false },
                        { title: 'SBI PO 2026 Mains Examination Call Letter Download', date: '07/08/2026', tag: 'Banking', isNew: false }
                      ].map((item, idx) => (
                        <div key={idx} className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all">
                          <div className="flex items-start justify-between gap-1.5">
                            <span
                              style={{
                                fontSize: `${jobLinkPreviewDevice === 'mobile' ? (config.typography?.jobLinkFontSizeMobile || 15) : (config.typography?.jobLinkFontSize || 16)}px`,
                                fontWeight: config.typography?.jobLinkFontWeight || '700',
                                lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                              }}
                              className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                            >
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="bg-red-500 text-white text-[8px] font-black px-1 py-[1.5px] rounded-sm uppercase shrink-0">NEW</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                            <span>📅 {item.date}</span>
                            <span className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">{item.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Latest Jobs */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-3 py-2 text-white flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💼</span>
                        <span className="text-xs font-black uppercase tracking-wider">Latest Jobs</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
                    </div>

                    <div className="p-2.5 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {[
                        { title: 'SSC CHSL 10+2 Online Form 2026 Apply for 3,712 Posts', date: '12/08/2026', tag: '10+2', isNew: true },
                        { title: 'IBPS PO / MT XIV Recruitment 2026 Online Application', date: '10/08/2026', tag: 'Graduate', isNew: false },
                        { title: 'Indian Army Agniveer Rally 2026 Online Form Notification', date: '08/08/2026', tag: 'Defence', isNew: false }
                      ].map((item, idx) => (
                        <div key={idx} className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all">
                          <div className="flex items-start justify-between gap-1.5">
                            <span
                              style={{
                                fontSize: `${jobLinkPreviewDevice === 'mobile' ? (config.typography?.jobLinkFontSizeMobile || 15) : (config.typography?.jobLinkFontSize || 16)}px`,
                                fontWeight: config.typography?.jobLinkFontWeight || '700',
                                lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                              }}
                              className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                            >
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="bg-red-500 text-white text-[8px] font-black px-1 py-[1.5px] rounded-sm uppercase shrink-0">NEW</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                            <span>📅 {item.date}</span>
                            <span className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">{item.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Focus Single List View */
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/80 divide-y divide-slate-200 dark:divide-slate-800/80">
                  {[
                    { title: 'SSC Combined Graduate Level CGL 2026 Online Application Form Released', date: '12/08/2026', tag: 'All India', last: '25/08/2026', isNew: true },
                    { title: 'UPSC Civil Services Examination IAS / IPS 2026 Pre Admit Card Download', date: '11/08/2026', tag: 'Central', last: 'Exam: 28/08/2026', isNew: false },
                    { title: 'Railway RRB Non-Technical Popular Categories NTPC 2026 Recruitment', date: '09/08/2026', tag: 'Railways', last: '30/08/2026', isNew: false },
                    { title: 'NTA UGC NET December 2026 Online Application Registration Open', date: '07/08/2026', tag: 'NTA', last: '15/09/2026', isNew: false }
                  ].map((job, idx) => (
                    <div key={idx} className="py-2.5 px-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <span 
                          style={{
                            fontSize: `${jobLinkPreviewDevice === 'mobile' ? (config.typography?.jobLinkFontSizeMobile || 15) : (config.typography?.jobLinkFontSize || 16)}px`,
                            fontWeight: config.typography?.jobLinkFontWeight || '700',
                            lineHeight: config.typography?.jobLinkLineHeight || '1.45'
                          }}
                          className="text-slate-900 dark:text-slate-100 font-bold hover:text-amber-600 transition-colors flex-1"
                        >
                          {job.title}
                        </span>
                        {job.isNew && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500">
                        <span>📅 {job.date}</span>
                        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300">{job.tag}</span>
                        <span>{job.last}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: HEADER & NAVIGATION */}
      {activeSubTab === 'header' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              Header, Navbar & Logo Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Portal Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Portal Brand Name</label>
                <input
                  type="text"
                  value={config.header?.portalTitle || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, portalTitle: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. GovtBharat  Naukri"
                />
              </div>

              {/* Portal Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Brand Tagline</label>
                <input
                  type="text"
                  value={config.header?.portalTagline || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, portalTagline: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. Fast Sarkari Results & Job Alerts"
                />
              </div>

              {/* Domain Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Domain Name</label>
                <input
                  type="text"
                  value={config.header?.domainName || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, domainName: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. GovtBharat.com"
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Logo Image URL</label>
                <input
                  type="text"
                  value={config.header?.logoUrl || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, logoUrl: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  placeholder="/logo.png or https://..."
                />
              </div>

              {/* Logo Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Logo Size</label>
                  <span className="text-xs font-black text-indigo-500">{config.header?.logoSize || 36}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="64"
                  value={config.header?.logoSize || 36}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, logoSize: Number(e.target.value) }
                  }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Header Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Header Height</label>
                  <span className="text-xs font-black text-indigo-500">{config.header?.headerHeight || 64}px</span>
                </div>
                <input
                  type="range"
                  min="52"
                  max="96"
                  value={config.header?.headerHeight || 64}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, headerHeight: Number(e.target.value) }
                  }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Sticky Header Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Sticky Header (Fixed on Scroll)</span>
                  <span className="text-[10px] text-slate-400">Keeps navbar visible at top while scrolling</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.header?.stickyHeader ?? true}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    header: { ...prev.header, stickyHeader: e.target.checked }
                  }))}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Nav Links Manager */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Menu Items & Navigation Links
                </h4>
                <button
                  onClick={() => handleUpdate(prev => ({
                    ...prev,
                    header: {
                      ...prev.header,
                      customNavLinks: [
                        ...(prev.header?.customNavLinks || []),
                        { id: `nl-${Date.now()}`, label: 'New Link', url: '#', enabled: true }
                      ]
                    }
                  }))}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Menu Item
                </button>
              </div>

              <div className="space-y-2">
                {(config.header?.customNavLinks || []).map((link, idx) => (
                  <div key={link.id} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(e) => handleUpdate(prev => {
                        const updated = [...(prev.header?.customNavLinks || [])];
                        updated[idx] = { ...updated[idx], enabled: e.target.checked };
                        return { ...prev, header: { ...prev.header, customNavLinks: updated } };
                      })}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdate(prev => {
                        const updated = [...(prev.header?.customNavLinks || [])];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        return { ...prev, header: { ...prev.header, customNavLinks: updated } };
                      })}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-bold"
                      placeholder="Link Label"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => handleUpdate(prev => {
                        const updated = [...(prev.header?.customNavLinks || [])];
                        updated[idx] = { ...updated[idx], url: e.target.value };
                        return { ...prev, header: { ...prev.header, customNavLinks: updated } };
                      })}
                      className="w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono"
                      placeholder="#url or https://"
                    />
                    <button
                      onClick={() => handleUpdate(prev => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          customNavLinks: prev.header?.customNavLinks?.filter((_, i) => i !== idx)
                        }
                      }))}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove Menu Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FOOTER & CONTACT */}
      {activeSubTab === 'footer' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Footprints className="w-4 h-4 text-indigo-500" />
              Footer, Copyright, Disclaimer & Contact Info
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Footer Logo Title</label>
                <input
                  type="text"
                  value={config.footer?.footerTitle || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    footer: { ...prev.footer, footerTitle: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Official Contact Email</label>
                <input
                  type="email"
                  value={config.footer?.contactEmail || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    footer: { ...prev.footer, contactEmail: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Official Helpline Phone</label>
                <input
                  type="text"
                  value={config.footer?.contactPhone || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    footer: { ...prev.footer, contactPhone: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Copyright Statement</label>
                <input
                  type="text"
                  value={config.footer?.copyrightText || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    footer: { ...prev.footer, copyrightText: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Footer Short Description</label>
                <textarea
                  rows={2}
                  value={config.footer?.footerDescription || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    footer: { ...prev.footer, footerDescription: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Legal Disclaimer (Non-Govt Notice)</label>
                <textarea
                  rows={2}
                  value={config.footer?.disclaimerText || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    footer: { ...prev.footer, disclaimerText: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: SECTIONS MANAGER & REORDER */}
      {activeSubTab === 'sections' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Homepage Sections Manager (Hide/Show & Reorder)
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle sections on/off, change sequence, background and spacing without touching source code.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(config.sections || DEFAULT_WEBSITE_SECTIONS).map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    sec.enabled 
                      ? 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800' 
                      : 'bg-slate-100/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {sec.name}
                        {sec.enabled ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded">
                            HIDDEN
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{sec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Padding selector */}
                    <select
                      value={sec.paddingY}
                      onChange={(e) => handleUpdate(prev => {
                        const updated = [...(prev.sections || [])];
                        updated[idx] = { ...updated[idx], paddingY: e.target.value as any };
                        return { ...prev, sections: updated };
                      })}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <option value="none">Padding: None</option>
                      <option value="sm">Padding: Small</option>
                      <option value="md">Padding: Medium</option>
                      <option value="lg">Padding: Large</option>
                    </select>

                    {/* Move Up/Down */}
                    <button
                      disabled={idx === 0}
                      onClick={() => handleUpdate(prev => {
                        const updated = [...(prev.sections || [])];
                        const temp = updated[idx];
                        updated[idx] = updated[idx - 1];
                        updated[idx - 1] = temp;
                        return { ...prev, sections: updated };
                      })}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      disabled={idx === (config.sections || []).length - 1}
                      onClick={() => handleUpdate(prev => {
                        const updated = [...(prev.sections || [])];
                        const temp = updated[idx];
                        updated[idx] = updated[idx + 1];
                        updated[idx + 1] = temp;
                        return { ...prev, sections: updated };
                      })}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Toggle Show/Hide */}
                    <button
                      onClick={() => handleUpdate(prev => {
                        const updated = [...(prev.sections || [])];
                        updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                        return { ...prev, sections: updated };
                      })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        sec.enabled 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}
                    >
                      {sec.enabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {sec.enabled ? 'Hide Section' : 'Show Section'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: LAYOUT & GRID */}
      {activeSubTab === 'layout' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-500" />
              Grid Spacing, Border Radius & Container Dimensions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Max Container Width */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Container Max Width</label>
                <select
                  value={config.layout?.containerMaxWidth || '1440px'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    layout: { ...prev.layout, containerMaxWidth: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="1280px">1280px (Standard Compact)</option>
                  <option value="1440px">1440px (Default Wide)</option>
                  <option value="1600px">1600px (Ultra Wide HD)</option>
                  <option value="100%">100% (Full Bleed Fluid)</option>
                </select>
              </div>

              {/* Card Corner Radius */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Card Border Radius (Corners)</label>
                <select
                  value={config.layout?.cardBorderRadius || 'xl'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    layout: { ...prev.layout, cardBorderRadius: e.target.value as any }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="none">Square (0px)</option>
                  <option value="sm">Subtle (4px)</option>
                  <option value="md">Rounded (8px)</option>
                  <option value="lg">Soft Rounded (12px)</option>
                  <option value="xl">Modern Curved (16px)</option>
                  <option value="2xl">Extra Curved (24px)</option>
                </select>
              </div>

              {/* Card Shadow Depth */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Card Elevation (Drop Shadow)</label>
                <select
                  value={config.layout?.cardShadow || 'sm'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    layout: { ...prev.layout, cardShadow: e.target.value as any }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="none">Flat (No Shadow)</option>
                  <option value="sm">Subtle Elevation (Light)</option>
                  <option value="md">Medium Depth</option>
                  <option value="lg">Floating High Shadow</option>
                </select>
              </div>

              {/* Mobile Column Layout */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Mobile Column Layout</label>
                <select
                  value={config.layout?.mobileColumnLayout || '1-col'}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    layout: { ...prev.layout, mobileColumnLayout: e.target.value as any }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="1-col">1 Column (Default Mobile)</option>
                  <option value="2-col">2 Columns (Compact Grid)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: IMAGES & MEDIA */}
      {activeSubTab === 'media' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              Banner Images, Promotional Cards & Favicon
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Hero Banner Manager */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hero Header Banner</h4>
                  <input
                    type="checkbox"
                    checked={config.media?.showHeroBanner ?? false}
                    onChange={(e) => handleUpdate(prev => ({
                      ...prev,
                      media: { ...prev.media, showHeroBanner: e.target.checked }
                    }))}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={config.media?.heroBannerUrl || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    media: { ...prev.media, heroBannerUrl: e.target.value }
                  }))}
                  placeholder="https://image-url.jpg"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
                {config.media?.heroBannerUrl && (
                  <div className="h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={config.media.heroBannerUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Promotional Banner */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Promotional Sponsor Card</h4>
                  <input
                    type="checkbox"
                    checked={config.media?.showPromoBanner ?? false}
                    onChange={(e) => handleUpdate(prev => ({
                      ...prev,
                      media: { ...prev.media, showPromoBanner: e.target.checked }
                    }))}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={config.media?.promotionalBannerUrl || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    media: { ...prev.media, promotionalBannerUrl: e.target.value }
                  }))}
                  placeholder="Banner Image URL"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
                <input
                  type="text"
                  value={config.media?.promotionalBannerLink || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    media: { ...prev.media, promotionalBannerLink: e.target.value }
                  }))}
                  placeholder="Click Destination Link"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: CONTENT & TEXTS */}
      {activeSubTab === 'content' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Visible Website Headings, Subtitles & Button Labels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Homepage Headline Title</label>
                <input
                  type="text"
                  value={config.content?.heroWelcomeTitle || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    content: { ...prev.content, heroWelcomeTitle: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Homepage Subtitle / Description</label>
                <input
                  type="text"
                  value={config.content?.heroWelcomeSubtitle || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    content: { ...prev.content, heroWelcomeSubtitle: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Search Box Placeholder</label>
                <input
                  type="text"
                  value={config.content?.searchPlaceholder || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    content: { ...prev.content, searchPlaceholder: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Call-To-Action Button Label</label>
                <input
                  type="text"
                  value={config.content?.ctaButtonText || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    content: { ...prev.content, ctaButtonText: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB SEO: SEO CONFIG */}
      {activeSubTab === 'seo' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" /> SEO & Meta Tags
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure how your website appears on Google Search and social media sharing. These tags dynamically update your site's metadata.
            </p>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Meta Title (SEO Title)</label>
                <input
                  type="text"
                  value={config.seo?.metaTitle || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    seo: { ...prev.seo!, metaTitle: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. GovtBharat - Latest Sarkari Naukri"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Meta Description</label>
                <textarea
                  rows={3}
                  value={config.seo?.metaDescription || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    seo: { ...prev.seo!, metaDescription: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  placeholder="A short description of your website for search engines..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Meta Keywords</label>
                <input
                  type="text"
                  value={config.seo?.metaKeywords || ''}
                  onChange={(e) => handleUpdate(prev => ({
                    ...prev,
                    seo: { ...prev.seo!, metaKeywords: e.target.value }
                  }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  placeholder="e.g. Sarkari Naukri, Govt Jobs, SSC (comma separated)"
                />
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Google Search Preview</span>
              <div className="bg-white dark:bg-[#202124] p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-[11px] text-[#202124] dark:text-[#dadce0] truncate mb-1">https://yourwebsite.com</div>
                <div className="text-[16px] text-[#1a0dab] dark:text-[#8ab4f8] font-medium truncate mb-1 leading-tight hover:underline cursor-pointer">
                  {config.seo?.metaTitle || 'Your Website Title'}
                </div>
                <div className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-snug">
                  {config.seo?.metaDescription || 'Your website description will appear here in Google search results...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 9: LIVE PREVIEW & DEVICE SIMULATOR */}
      {activeSubTab === 'preview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Interactive Live Device Simulator
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'tablet' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" /> Tablet
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                {/* Day/Night toggle */}
                <button
                  onClick={() => setPreviewThemeMode(prev => prev === 'light' ? 'dark' : 'light')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {previewThemeMode === 'light' ? '☀️ Light Preview' : '🌙 Dark Preview'}
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div className="flex justify-center p-4 bg-slate-200 dark:bg-slate-950 rounded-2xl overflow-x-auto">
              <div 
                className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-white ${
                  previewThemeMode === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
                } ${
                  previewDevice === 'desktop' ? 'w-full max-w-5xl' : previewDevice === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                }`}
                style={{
                  fontFamily: config.typography?.fontFamily || 'Plus Jakarta Sans',
                  backgroundColor: previewThemeMode === 'dark' ? config.colors.backgroundColorDark : config.colors.backgroundColorLight
                }}
              >
                {/* Mock Header */}
                <div 
                  className="p-3.5 flex items-center justify-between border-b shadow-xs"
                  style={{
                    backgroundColor: config.colors.headerColor,
                    color: config.colors.headerTextColor
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="rounded-full bg-white/20 flex items-center justify-center font-bold text-xs"
                      style={{ width: config.header?.logoSize || 32, height: config.header?.logoSize || 32 }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="font-black text-xs tracking-tight">{config.header?.portalTitle}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold opacity-90">
                    {(config.header?.customNavLinks || []).slice(0, 4).map(l => (
                      <span key={l.id}>{l.label}</span>
                    ))}
                  </div>
                </div>

                {/* Mock Marquee */}
                <div 
                  className="px-3 py-1.5 text-[11px] font-bold flex items-center gap-2"
                  style={{
                    backgroundColor: config.colors.secondaryColor,
                    color: '#ffffff'
                  }}
                >
                  <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[9px]">FLASH</span>
                  <span className="truncate">{config.content?.marqueeHeadline}</span>
                </div>

                {/* Mock Content */}
                <div className="p-5 space-y-4">
                  <div className="text-center space-y-1 py-3">
                    <h1 
                      className="text-base sm:text-lg font-black tracking-tight"
                      style={{
                        fontFamily: config.typography?.headingFontFamily || config.typography?.fontFamily,
                        color: previewThemeMode === 'dark' ? config.colors.headingColorDark : config.colors.headingColorLight
                      }}
                    >
                      {config.content?.heroWelcomeTitle}
                    </h1>
                    <p className="text-[11px] opacity-75">{config.content?.heroWelcomeSubtitle}</p>
                  </div>

                  {/* Mock Columns */}
                  <div className={`grid gap-3 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {['Results 2026', 'Admit Cards', 'Latest Jobs'].map((colTitle, i) => (
                      <div 
                        key={i} 
                        className="p-3 border space-y-2 transition-all"
                        style={{
                          backgroundColor: previewThemeMode === 'dark' ? config.colors.cardColorDark : config.colors.cardColorLight,
                          borderColor: previewThemeMode === 'dark' ? config.colors.borderColorDark : config.colors.borderColorLight,
                          borderRadius: config.layout?.cardBorderRadius === 'none' ? '0px' : '12px'
                        }}
                      >
                        <div 
                          className="px-2.5 py-1 text-[11px] font-black rounded-md text-white text-center"
                          style={{ backgroundColor: i === 0 ? config.colors.primaryColor : i === 1 ? config.colors.secondaryColor : '#10b981' }}
                        >
                          {colTitle}
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <p className="font-semibold truncate">RRB Technician Recruitment Online Form</p>
                          <p className="font-semibold truncate">SSC CGL Tier 1 Answer Key Released</p>
                          <p className="font-semibold truncate">UPSC CSE Prelims Cut-Off Score</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mock Button */}
                  <div className="text-center pt-2">
                    <button
                      className="px-5 py-2 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                      style={{
                        backgroundColor: config.colors.buttonColor,
                        color: config.colors.buttonTextColor
                      }}
                    >
                      {config.content?.ctaButtonText}
                    </button>
                  </div>
                </div>

                {/* Mock Footer */}
                <div 
                  className="p-4 border-t text-[11px] text-center space-y-1"
                  style={{
                    backgroundColor: config.colors.footerColor,
                    color: config.colors.footerTextColor
                  }}
                >
                  <p className="font-bold">{config.footer?.footerTitle}</p>
                  <p className="text-[10px] opacity-75">{config.footer?.copyrightText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 10: VERSION HISTORY */}
      {activeSubTab === 'versions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  Website Snapshot & Version Rollback History
                </h3>
                <p className="text-xs text-slate-500">
                  Every publish automatically records a restore point. Rollback anytime with 1-click.
                </p>
              </div>
            </div>

            {(!config.versionHistory || config.versionHistory.length === 0) ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <History className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No previous version snapshots recorded yet.</p>
                <p className="text-[11px] text-slate-500">Click &quot;Publish Live Changes&quot; to create your first recorded version.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {config.versionHistory.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {v.label}
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                          {v.timestamp}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">Saved by: {v.author}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(v)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore Version
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP FOR FACTORY RESET */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Reset Entire Website to Default?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will reset all custom colors, fonts, layout spacings, custom header links, and sections back to factory settings.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefault}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
