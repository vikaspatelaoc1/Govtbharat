import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Check, 
  Download, 
  Upload, 
  Sliders, 
  Layers, 
  Eye, 
  RefreshCw,
  Copy,
  CheckCheck,
  Zap,
  Wand2,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { 
  ThemeColorConfig, 
  DEFAULT_THEME_COLORS, 
  THEME_PRESETS, 
  PRIMARY_ACCENT_PRESETS,
  AccentPreset,
  loadThemeColors, 
  saveThemeColors, 
  applyThemeColorsToDOM,
  hexToRgb
} from '../utils/themeColors';
import { saveThemeColorsToFirestore } from '../services/firestoreService';

interface ThemeColorCustomizerTabProps {
  onToast: (msg: string) => void;
  siteLogo?: string;
  appName?: string;
}

export const ThemeColorCustomizerTab: React.FC<ThemeColorCustomizerTabProps> = ({ onToast, siteLogo, appName }) => {
  const [colors, setColors] = useState<ThemeColorConfig>(loadThemeColors());
  const [selectedPreset, setSelectedPreset] = useState<string>('default-cyber');
  const [selectedAccentId, setSelectedAccentId] = useState<string>(() => {
    const current = loadThemeColors().primaryAccent || '#f59e0b';
    const found = PRIMARY_ACCENT_PRESETS.find(p => p.color.toLowerCase() === current.toLowerCase());
    return found ? found.id : 'custom';
  });
  const [activeSubSection, setActiveSubSection] = useState<'accent' | 'presets' | 'header' | 'marquee' | 'categories' | 'buttons' | 'footer'>('accent');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    // Initial DOM application
    applyThemeColorsToDOM(colors);
  }, []);

  const handleColorChange = (key: keyof ThemeColorConfig, value: string) => {
    const updated = { ...colors, [key]: value };
    
    // If updating primary accent, check if matches preset or is custom
    if (key === 'primaryAccent') {
      const match = PRIMARY_ACCENT_PRESETS.find(p => p.color.toLowerCase() === value.toLowerCase());
      if (match) {
        setSelectedAccentId(match.id);
        updated.primaryAccentName = match.name;
        updated.primaryAccentHover = match.hoverColor;
        updated.primaryAccentLight = match.lightColor;
      } else {
        setSelectedAccentId('custom');
        updated.primaryAccentName = 'Custom Accent';
      }
    }

    setColors(updated);
    // Live update DOM for real-time instant feedback
    applyThemeColorsToDOM(updated);
  };

  const handleApplyAccentPreset = (accent: AccentPreset) => {
    setSelectedAccentId(accent.id);
    const updated: ThemeColorConfig = {
      ...colors,
      primaryAccent: accent.color,
      primaryAccentHover: accent.hoverColor,
      primaryAccentLight: accent.lightColor,
      primaryAccentName: accent.name,
      // Auto-harmonize header accent for unified brand look
      headerAccent: accent.color
    };
    setColors(updated);
    saveThemeColors(updated);
    saveThemeColorsToFirestore(updated).catch(console.error);
    onToast(`🌟 Primary Accent updated to "${accent.name}" across the entire portal!`);
  };

  const handleHarmonizeEntireSite = () => {
    const currentAccent = colors.primaryAccent || '#f59e0b';
    const currentHover = colors.primaryAccentHover || '#d97706';
    const currentLight = colors.primaryAccentLight || '#fef3c7';

    const harmonized: ThemeColorConfig = {
      ...colors,
      headerAccent: currentAccent,
      searchBorderColor: currentAccent,
      primaryButtonBg: currentAccent,
      newBadgeBg: currentAccent
    };

    setColors(harmonized);
    saveThemeColors(harmonized);
    saveThemeColorsToFirestore(harmonized).catch(console.error);
    onToast(`✨ Harmonized Header, Buttons, Badges, and Search borders with "${colors.primaryAccentName || currentAccent}"!`);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setColors(preset.colors);
      const match = PRIMARY_ACCENT_PRESETS.find(p => p.color.toLowerCase() === (preset.colors.primaryAccent || '').toLowerCase());
      if (match) {
        setSelectedAccentId(match.id);
      }
      saveThemeColors(preset.colors);
      saveThemeColorsToFirestore(preset.colors).catch(console.error);
      onToast(`🎨 Applied theme preset: "${preset.name}"!`);
    }
  };

  const handleSaveAll = () => {
    saveThemeColors(colors);
    saveThemeColorsToFirestore(colors).catch(console.error);
    onToast('✅ All custom colors saved and applied across the entire portal!');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all portal colors and accents to original defaults?')) {
      setColors(DEFAULT_THEME_COLORS);
      setSelectedPreset('default-cyber');
      setSelectedAccentId('amber');
      saveThemeColors(DEFAULT_THEME_COLORS);
      saveThemeColorsToFirestore(DEFAULT_THEME_COLORS).catch(console.error);
      onToast('🔄 Reset all colors to default theme (Amber Gold accent).');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(colors, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GovtBharat-theme-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('📁 Theme configuration exported as JSON file.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && typeof imported === 'object' && (imported.headerBg || imported.primaryAccent)) {
          const merged = { ...DEFAULT_THEME_COLORS, ...imported };
          setColors(merged);
          saveThemeColors(merged);
          saveThemeColorsToFirestore(merged).catch(console.error);
          onToast('🎉 Custom theme JSON successfully imported and applied!');
        } else {
          onToast('⚠️ Invalid theme JSON file format.');
        }
      } catch (err) {
        onToast('❌ Failed to parse theme JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyHex = (key: string, hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    onToast(`📋 Copied: ${hex}`);
  };

  const renderColorInput = (
    label: string, 
    key: keyof ThemeColorConfig, 
    description?: string
  ) => {
    const val = colors[key] as string || '#000000';
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5 hover:border-slate-700 transition-all shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <label className="text-xs font-bold text-slate-200 block">{label}</label>
            {description && <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => handleCopyHex(key, val)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            title="Copy HEX code"
          >
            {copiedKey === key ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          {/* HTML5 Color Picker swatch */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-600 shadow-inner shrink-0 cursor-pointer group">
            <input
              type="color"
              value={val}
              onChange={(e) => handleColorChange(key, e.target.value)}
              className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer border-0 p-0"
              title="Click to open color picker"
            />
            <div 
              className="w-full h-full pointer-events-none rounded-lg"
              style={{ backgroundColor: val }}
            />
          </div>

          {/* Hex Input text */}
          <div className="flex-1">
            <input
              type="text"
              value={val}
              onChange={(e) => handleColorChange(key, e.target.value)}
              placeholder="#000000"
              className="w-full uppercase font-mono text-xs font-bold bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    );
  };

  const activeAccentHex = colors.primaryAccent || '#f59e0b';
  const activeAccentName = colors.primaryAccentName || 'Amber Gold';

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl border flex items-center justify-center shadow-lg transition-colors"
            style={{ 
              backgroundColor: `${activeAccentHex}25`, 
              borderColor: `${activeAccentHex}60`,
              color: activeAccentHex 
            }}
          >
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Super Admin Live Theme & Accent Customizer</h3>
              <span 
                className="text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide flex items-center gap-1"
                style={{ 
                  backgroundColor: `${activeAccentHex}20`, 
                  borderColor: `${activeAccentHex}50`,
                  color: activeAccentHex 
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeAccentHex }} />
                Accent: {activeAccentName}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customize primary accent colors (e.g., change the default Amber), category cards, and full-site branding with instant real-time sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-xl text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-lg hover:brightness-110"
            style={{ backgroundColor: activeAccentHex }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>

      {/* Sub-section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        {[
          { id: 'accent', label: '🌟 Primary Accent (Amber & Colors)', icon: Sparkles },
          { id: 'presets', label: '🎨 1-Click Theme Palettes', icon: Wand2 },
          { id: 'header', label: '👑 Header & Brand', icon: Sliders },
          { id: 'marquee', label: '📢 Flash Marquee', icon: Sliders },
          { id: 'categories', label: '📂 Category Boxes', icon: Layers },
          { id: 'buttons', label: '🔘 Buttons & Badges', icon: SlidersHorizontal },
          { id: 'footer', label: '⚓ Footer & Base', icon: Sliders },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubSection(tab.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubSection === tab.id
                ? 'text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            style={{
              backgroundColor: activeSubSection === tab.id ? activeAccentHex : undefined
            }}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 0. PRIMARY ACCENT COLOR CUSTOMIZER (E.G. AMBER DEFAULT) */}
      {activeSubSection === 'accent' && (
        <div className="space-y-5">
          {/* Active Accent Spotlight Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center shadow-lg shrink-0"
                style={{ 
                  backgroundColor: activeAccentHex,
                  borderColor: '#ffffff30'
                }}
              >
                <Flame className="w-7 h-7 text-white drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">Current Primary Accent: {activeAccentName}</h4>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-200 border border-slate-800">
                    {activeAccentHex}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This primary color accents the brand logo, highlights, interactive buttons, active rings, and notice badges across GovtBharat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
              <button
                type="button"
                onClick={handleHarmonizeEntireSite}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm hover:border-slate-500"
                title="Synchronize header accent, search highlight, and action buttons with this accent color"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Harmonize Full Site</span>
              </button>
            </div>
          </div>

          {/* 10 One-Click Accent Palettes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1-Click Primary Accent Presets</span>
              </h4>
              <span className="text-[11px] text-slate-400">Click any color to switch the entire portal accent instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {PRIMARY_ACCENT_PRESETS.map((preset) => {
                const isSelected = selectedAccentId === preset.id || activeAccentHex.toLowerCase() === preset.color.toLowerCase();
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyAccentPreset(preset)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-slate-850 shadow-lg ring-2'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                    style={{
                      borderColor: isSelected ? preset.color : undefined,
                      boxShadow: isSelected ? `0 0 15px ${preset.color}30` : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full shadow border border-black/30 shrink-0 transform group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                      </div>
                      {isSelected && (
                        <span 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shadow"
                          style={{ backgroundColor: preset.color }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                      {preset.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="font-mono text-[10px] font-bold text-slate-300">{preset.color}</span>
                      {preset.badge && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {preset.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Accent Fine-Tuning */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Custom Accent Shade Fine-Tuning</h4>
                <p className="text-[11px] text-slate-400">Pick any custom HEX color and adjust hover tones and light badge tints.</p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Advanced Control
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {renderColorInput('Primary Accent Color', 'primaryAccent', 'Core accent color (Default: #f59e0b Amber)')}
              {renderColorInput('Accent Hover State Tone', 'primaryAccentHover', 'Darker shade for active & hover buttons')}
              {renderColorInput('Accent Light Tint / Background', 'primaryAccentLight', 'Lighter background for tag badges')}
            </div>
          </div>
        </div>
      )}

      {/* 1. PRESET THEMES */}
      {activeSubSection === 'presets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Choose a Ready-Made Theme Palette</span>
            </h4>
            <span className="text-[11px] text-slate-400">Click any preset to instantly apply full website palette</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {THEME_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-850 border-pink-500 shadow-xl ring-2 ring-pink-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {preset.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-pink-500 text-white shadow-sm shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Color Swatch Preview Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {preset.previewColors.map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-md shadow-sm border border-black/30"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. HEADER & BRAND CUSTOMIZER */}
      {activeSubSection === 'header' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Header Bar & Brand Colors</h4>
            <p className="text-[11px] text-slate-400">Controls top navigation background, title text and glowing brand sparkle colors.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {renderColorInput('Header Background Color', 'headerBg', 'Top main navigation bar background')}
            {renderColorInput('Header Title & Text Color', 'headerText', 'Logo text, nav items and portal title')}
            {renderColorInput('Brand Sparkle & Accent', 'headerAccent', 'GovtBharat sparkle glow and highlighting')}
          </div>
        </div>
      )}

      {/* 3. MARQUEE TICKER CUSTOMIZER */}
      {activeSubSection === 'marquee' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Breaking News Flash Ticker Colors</h4>
            <p className="text-[11px] text-slate-400">Controls the flashing marquee strip at the top of the portal.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {renderColorInput('Marquee Strip Background', 'marqueeBg', 'Background color of ticker strip')}
            {renderColorInput('Marquee Scrolling Text', 'marqueeText', 'Color of scrolling news headline text')}
            {renderColorInput('FLASH NEWS Badge Background', 'marqueeBadgeBg', 'Background of left badge button')}
            {renderColorInput('FLASH NEWS Badge Text', 'marqueeBadgeText', 'Text color inside flash badge')}
          </div>
        </div>
      )}

      {/* 4. CATEGORY QUICK CARDS CUSTOMIZER */}
      {activeSubSection === 'categories' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Category Boxes & Header Column Colors</h4>
            <p className="text-[11px] text-slate-400">Customize the 6 individual portal section box colors.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {renderColorInput('💼 Latest Jobs Box Theme', 'latestJobsColor', 'Primary color for Latest Jobs section')}
            {renderColorInput('🎫 Admit Cards Box Theme', 'admitCardColor', 'Primary color for Admit Cards section')}
            {renderColorInput('🏆 Results Box Theme', 'resultsColor', 'Primary color for Results section')}
            {renderColorInput('🔑 Answer Key Box Theme', 'answerKeyColor', 'Primary color for Answer Key section')}
            {renderColorInput('📖 Syllabus Box Theme', 'syllabusColor', 'Primary color for Syllabus section')}
            {renderColorInput('🎓 Admission Box Theme', 'admissionColor', 'Primary color for Admission section')}
          </div>
        </div>
      )}

      {/* 5. BUTTONS & BADGES CUSTOMIZER */}
      {activeSubSection === 'buttons' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Action Buttons & Alert Badges</h4>
            <p className="text-[11px] text-slate-400">Controls "Apply Online", search focus borders and blinking "NEW" alert tags.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {renderColorInput('Primary Action Button Background', 'primaryButtonBg', 'Background of Apply & Submit buttons')}
            {renderColorInput('Primary Action Button Text', 'primaryButtonText', 'Text color inside primary buttons')}
            {renderColorInput('Search Focus Highlight Border', 'searchBorderColor', 'Active glowing search bar border')}
            {renderColorInput('🔥 "NEW" Tag Badge Background', 'newBadgeBg', 'Blinking tag next to latest posts')}
            {renderColorInput('🔥 "NEW" Tag Badge Text', 'newBadgeText', 'Text color inside new tag')}
          </div>
        </div>
      )}

      {/* 6. FOOTER & BASE ACCENTS CUSTOMIZER */}
      {activeSubSection === 'footer' && (
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Footer & Bottom Bar Colors</h4>
            <p className="text-[11px] text-slate-400">Customize the bottom legal links, disclaimer and copyright bar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {renderColorInput('Footer Background Color', 'footerBg', 'Bottom container background')}
            {renderColorInput('Footer Text & Links Color', 'footerText', 'Disclaimer text and quick links')}
            {renderColorInput('Footer Border Accent', 'footerBorder', 'Top dividing border line')}
          </div>
        </div>
      )}

      {/* LIVE MINI PORTAL PREVIEW */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Interactive Live Simulation Preview</span>
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              Accent: {activeAccentHex}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
              ● Live Synchronized
            </span>
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900 text-xs">
          {/* Simulated Header */}
          <div 
            className="p-3 flex items-center justify-between border-b transition-colors"
            style={{ backgroundColor: colors.headerBg, color: colors.headerText, borderColor: colors.footerBorder }}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              <div 
                className="w-7 h-7 rounded-full p-0.5 bg-black border-2 flex items-center justify-center overflow-hidden shrink-0"
                style={{ borderColor: activeAccentHex }}
              >
                {siteLogo ? (
                  <img src={siteLogo} alt="Site Logo" className="w-full h-full object-contain rounded-full" />
                ) : (
                  <span className="text-[10px] font-black" style={{ color: activeAccentHex }}>FA</span>
                )}
              </div>
              <span className="text-white" style={{ color: colors.headerText }}>
                {appName ? appName : <>Govt<span style={{ color: activeAccentHex }}>Bharat</span></>}
              </span>
              {!appName && <span className="text-[9px] uppercase tracking-widest font-extrabold" style={{ color: activeAccentHex }}>Govt Jobs</span>}
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="px-2.5 py-1 rounded text-[10px] font-bold shadow" 
                style={{ backgroundColor: colors.primaryButtonBg || activeAccentHex, color: colors.primaryButtonText }}
              >
                Apply Online
              </span>
            </div>
          </div>

          {/* Simulated Marquee */}
          <div 
            className="px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold transition-colors"
            style={{ backgroundColor: colors.marqueeBg, color: colors.marqueeText }}
          >
            <span 
              className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0"
              style={{ backgroundColor: colors.marqueeBadgeBg, color: colors.marqueeBadgeText }}
            >
              FLASH NEWS
            </span>
            <span className="truncate">🔴 SSC CGL 2026 Online Application Form Released • Direct Apply Link Active!</span>
          </div>

          {/* Simulated Cards Grid */}
          <div className="p-3 grid grid-cols-3 gap-2 bg-slate-950/60">
            <div className="p-2 rounded-lg border text-center" style={{ borderColor: colors.latestJobsColor, backgroundColor: `${colors.latestJobsColor}15` }}>
              <span className="text-[10px] font-bold block" style={{ color: colors.latestJobsColor }}>💼 Latest Jobs</span>
              <span className="text-[9px] text-slate-400">120 Active</span>
            </div>
            <div className="p-2 rounded-lg border text-center" style={{ borderColor: colors.admitCardColor, backgroundColor: `${colors.admitCardColor}15` }}>
              <span className="text-[10px] font-bold block" style={{ color: colors.admitCardColor }}>🎫 Admit Card</span>
              <span className="text-[9px] text-slate-400">45 Active</span>
            </div>
            <div className="p-2 rounded-lg border text-center" style={{ borderColor: colors.resultsColor, backgroundColor: `${colors.resultsColor}15` }}>
              <span className="text-[10px] font-bold block" style={{ color: colors.resultsColor }}>🏆 Results</span>
              <span className="text-[9px] text-slate-400">38 Released</span>
            </div>
          </div>

          {/* Simulated Footer */}
          <div 
            className="p-2 text-center text-[10px] border-t transition-colors"
            style={{ backgroundColor: colors.footerBg, color: colors.footerText, borderColor: colors.footerBorder }}
          >
            © 2026 GovtBharat.com • All Government Job Alerts & Notifications
          </div>
        </div>
      </div>

      {/* IMPORT & EXPORT THEME TOOLS */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div>
          <h5 className="font-bold text-white">Backup & Restore Color Themes</h5>
          <p className="text-[11px] text-slate-400">Export your custom palette as JSON or import from an external file.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
