import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Share2, 
  Info, 
  FileCode, 
  Layers, 
  Zap, 
  Copy, 
  Download, 
  Upload, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  Table,
  LayoutGrid,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Tag,
  ImageIcon,
  RefreshCw,
  HelpCircle,
  Smartphone,
  Monitor
} from 'lucide-react';
import { 
  CategorySeoItem, 
  CategorySeoConfigMap, 
  DEFAULT_CATEGORY_SEO, 
  loadCategorySeoConfig, 
  saveCategorySeoConfig, 
  updateCategorySeo 
} from '../utils/seo';

interface CategorySeoEditorTabProps {
  onShowToast?: (msg: string) => void;
}

const CATEGORY_ORDER: Array<{ id: string; name: string; hindiName: string; color: string }> = [
  { id: 'latest-jobs', name: 'Latest Jobs', hindiName: 'सरकारी नौकरी', color: 'from-blue-600 to-indigo-600' },
  { id: 'admit-cards', name: 'Admit Card', hindiName: 'प्रवेश पत्र', color: 'from-amber-500 to-orange-600' },
  { id: 'results', name: 'Results', hindiName: 'परीक्षा परिणाम', color: 'from-emerald-600 to-teal-600' },
  { id: 'answer-key', name: 'Answer Key', hindiName: 'उत्तर कुंजी', color: 'from-pink-600 to-rose-600' },
  { id: 'syllabus', name: 'Syllabus', hindiName: 'पाठ्यक्रम', color: 'from-purple-600 to-violet-600' },
  { id: 'admission', name: 'Admission', hindiName: 'प्रवेश', color: 'from-cyan-600 to-blue-600' },
  { id: 'documents', name: 'Certificate & Documents', hindiName: 'प्रमाण पत्र व सेवाएं', color: 'from-teal-600 to-emerald-700' },
  { id: 'important', name: 'Important Links', hindiName: 'आवश्यक सूचना', color: 'from-rose-600 to-red-700' }
];

export const CategorySeoEditorTab: React.FC<CategorySeoEditorTabProps> = ({ onShowToast }) => {
  const [categoriesSeo, setCategoriesSeo] = useState<CategorySeoConfigMap>(loadCategorySeoConfig());
  const [selectedCatId, setSelectedCatId] = useState<string>('latest-jobs');
  const [viewMode, setViewMode] = useState<'inspector' | 'matrix'>('inspector');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = useState<'google' | 'social'>('google');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkKeywordInput, setBulkKeywordInput] = useState('');
  const [bulkOgImageInput, setBulkOgImageInput] = useState('');
  const [bulkRobotsInput, setBulkRobotsInput] = useState('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  const [bulkTitlePattern, setBulkTitlePattern] = useState('{name} 2026 - Latest Notifications & Online Form | GovtBharat');
  const [bulkDescPattern, setBulkDescPattern] = useState('Explore latest {name} 2026 notifications, exam dates, eligibility criteria, admit cards and direct apply links on GovtBharat.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCategoriesSeo(loadCategorySeoConfig());
  }, []);

  const activeCategory: CategorySeoItem = categoriesSeo[selectedCatId] || DEFAULT_CATEGORY_SEO[selectedCatId] || {
    id: selectedCatId,
    name: selectedCatId,
    hindiName: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '/logo.png',
    ogType: 'collection',
    robotsDirective: 'index, follow, max-image-preview:large',
    schemaType: 'CollectionPage'
  };

  const handleUpdateCategoryField = (catId: string, field: keyof CategorySeoItem, value: any) => {
    setCategoriesSeo(prev => {
      const current = prev[catId] || DEFAULT_CATEGORY_SEO[catId] || {
        id: catId,
        name: catId,
        hindiName: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImageUrl: '/logo.png',
        ogType: 'collection',
        robotsDirective: 'index, follow, max-image-preview:large',
        schemaType: 'CollectionPage'
      };
      return {
        ...prev,
        [catId]: {
          ...current,
          [field]: value,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  };

  const handleSaveAll = () => {
    saveCategorySeoConfig(categoriesSeo);
    updateCategorySeo(selectedCatId);
    setIsSaved(true);
    if (onShowToast) {
      onShowToast('🚀 Category SEO Meta Tags Saved & Injected into Live Head for All 8 Categories!');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetCurrent = () => {
    if (window.confirm(`Reset SEO tags for "${activeCategory.name}" to standard default preset?`)) {
      const defaultItem = DEFAULT_CATEGORY_SEO[selectedCatId];
      if (defaultItem) {
        setCategoriesSeo(prev => ({
          ...prev,
          [selectedCatId]: { ...defaultItem }
        }));
        if (onShowToast) {
          onShowToast(`🔄 Reset "${activeCategory.name}" to default SEO preset`);
        }
      }
    }
  };

  const handleResetAllToDefault = () => {
    if (window.confirm('Are you sure you want to RESET ALL 8 Job Categories to default SEO, Meta descriptions, and OG tags?')) {
      setCategoriesSeo(DEFAULT_CATEGORY_SEO);
      saveCategorySeoConfig(DEFAULT_CATEGORY_SEO);
      updateCategorySeo(selectedCatId);
      if (onShowToast) {
        onShowToast('🔄 All 8 Categories Reset to System Default SEO Presets');
      }
    }
  };

  const handleCopyCurrentToAll = () => {
    if (window.confirm(`Copy base Keywords, Robots directive, and OG Image from "${activeCategory.name}" to ALL other categories?`)) {
      setCategoriesSeo(prev => {
        const updated = { ...prev };
        CATEGORY_ORDER.forEach(cat => {
          const item = updated[cat.id] || DEFAULT_CATEGORY_SEO[cat.id];
          updated[cat.id] = {
            ...item,
            metaKeywords: item.metaKeywords ? `${item.metaKeywords}, ${activeCategory.metaKeywords}`.split(',').map(s => s.trim()).filter((v, i, a) => v && a.indexOf(v) === i).join(', ') : activeCategory.metaKeywords,
            ogImageUrl: activeCategory.ogImageUrl,
            robotsDirective: activeCategory.robotsDirective,
            ogType: activeCategory.ogType
          };
        });
        return updated;
      });
      if (onShowToast) {
        onShowToast(`📋 Copied shared attributes from "${activeCategory.name}" across all categories!`);
      }
    }
  };

  const handleApplyBulkTemplate = () => {
    setCategoriesSeo(prev => {
      const updated = { ...prev };
      CATEGORY_ORDER.forEach(cat => {
        const current = updated[cat.id] || DEFAULT_CATEGORY_SEO[cat.id];
        const title = bulkTitlePattern
          .replace(/\{name\}/gi, cat.name)
          .replace(/\{hindiName\}/gi, cat.hindiName);
        const desc = bulkDescPattern
          .replace(/\{name\}/gi, cat.name)
          .replace(/\{hindiName\}/gi, cat.hindiName);
        
        let newKeywords = current.metaKeywords;
        if (bulkKeywordInput.trim()) {
          const appended = `${current.metaKeywords}, ${bulkKeywordInput.trim()}`
            .split(',')
            .map(s => s.trim())
            .filter((v, i, a) => v && a.indexOf(v) === i)
            .join(', ');
          newKeywords = appended;
        }

        updated[cat.id] = {
          ...current,
          metaTitle: title,
          metaDescription: desc,
          ogTitle: title,
          ogDescription: desc,
          metaKeywords: newKeywords,
          ogImageUrl: bulkOgImageInput.trim() || current.ogImageUrl,
          robotsDirective: bulkRobotsInput || current.robotsDirective,
          lastUpdated: new Date().toISOString()
        };
      });
      return updated;
    });

    setShowBulkModal(false);
    if (onShowToast) {
      onShowToast('⚡ Bulk SEO Template Applied across all 8 Categories!');
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categoriesSeo, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GovtBharat_category_seo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onShowToast) {
      onShowToast('📥 Exported Category SEO JSON file');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            setCategoriesSeo(parsed);
            saveCategorySeoConfig(parsed);
            if (onShowToast) {
              onShowToast('📤 Successfully imported and applied Category SEO JSON!');
            }
          }
        } catch (err) {
          alert('Invalid JSON file format. Please check your backup file.');
        }
      };
    }
  };

  const filteredCategories = CATEGORY_ORDER.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.hindiName.includes(searchQuery) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const titleLen = activeCategory.metaTitle?.length || 0;
  const descLen = activeCategory.metaDescription?.length || 0;

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* 1. Header Banner & Action Dock */}
      <div className="bg-gradient-to-r from-teal-950/90 via-slate-900 to-indigo-950/90 border border-teal-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-400">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-wide">Category SEO & Meta Tags Manager</h2>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Bulk Indexing
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Bulk customize Meta Descriptions, Title, Target Keywords & OpenGraph social cards for each of the 8 job categories.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold rounded-xl border border-indigo-500/40 transition-all cursor-pointer shadow-md"
            title="Bulk Template Generator"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Bulk Apply</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Export Backup JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJson} 
            accept=".json" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Import Backup JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleResetAllToDefault}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Reset All 8 Categories"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset All</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-900/30 hover:shadow-teal-900/50 transition-all border border-teal-400/30 cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-teal-200" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'All Saved & Injected!' : 'Save & Inject Live SEO'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Toolbar: View Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories (e.g. jobs, admit...)"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setViewMode('inspector')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'inspector'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Category Inspector</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Bulk Matrix Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Selector Quick-Pills Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {CATEGORY_ORDER.map(cat => {
          const isSelected = selectedCatId === cat.id;
          const config = categoriesSeo[cat.id] || DEFAULT_CATEGORY_SEO[cat.id];
          const hasDesc = config?.metaDescription && config.metaDescription.trim().length > 30;
          const hasKeywords = config?.metaKeywords && config.metaKeywords.trim().length > 10;
          const isHealthy = hasDesc && hasKeywords;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-teal-950/70 border-teal-400 text-white shadow-md shadow-teal-950/40 ring-1 ring-teal-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-400 truncate">
                  {cat.hindiName}
                </span>
                <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <span className="text-xs font-black truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {viewMode === 'inspector' ? (
        /* ================= INSPECTOR MODE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Category SEO Editor Form */}
          <div className="lg:col-span-7 space-y-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs">
                  {activeCategory.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <span>{activeCategory.name} SEO Configuration</span>
                    <span className="text-[11px] text-teal-400 font-medium">({activeCategory.hindiName})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Canonical Path: /?tab={activeCategory.id}</p>
                </div>
              </div>

              {/* Quick Actions on this category */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCurrentToAll}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
                  title="Copy Keywords & OG Image to All 8 Categories"
                >
                  <Copy className="w-3 h-3 text-indigo-400" />
                  <span>Copy to All</span>
                </button>
                <button
                  onClick={handleResetCurrent}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition-all cursor-pointer"
                  title="Reset this Category to Default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field 1: Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                  <span>1. Meta Title (&lt;title&gt;)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  titleLen >= 45 && titleLen <= 65
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {titleLen} / 60 chars (Recommended: 50-60)
                </span>
              </div>
              <input
                type="text"
                value={activeCategory.metaTitle || ''}
                onChange={(e) => handleUpdateCategoryField(selectedCatId, 'metaTitle', e.target.value)}
                placeholder={`e.g. ${activeCategory.name} 2026 - Apply Online for 50,000+ Vacancies | GovtBharat`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Shown as the main blue headline in Google search results when candidates search for this section.
              </p>
            </div>

            {/* Field 2: Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                  <span>2. Meta Description</span>
                  <span className="text-rose-400">*</span>
                </label>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  descLen >= 120 && descLen <= 165
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {descLen} / 160 chars (Recommended: 130-160)
                </span>
              </div>
              <textarea
                rows={3}
                value={activeCategory.metaDescription || ''}
                onChange={(e) => handleUpdateCategoryField(selectedCatId, 'metaDescription', e.target.value)}
                placeholder={`Provide high-CTR summary snippet for ${activeCategory.name}...`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 transition-all font-medium resize-none"
              />
              <p className="text-[11px] text-slate-400">
                Summarizes this category under the search title on Google, Bing, and Search Console.
              </p>
            </div>

            {/* Field 3: Target Meta Keywords */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-teal-400" />
                  <span>3. Target Keywords (Comma Separated)</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {(activeCategory.metaKeywords || '').split(',').filter(Boolean).length} Keywords
                </span>
              </div>
              <input
                type="text"
                value={activeCategory.metaKeywords || ''}
                onChange={(e) => handleUpdateCategoryField(selectedCatId, 'metaKeywords', e.target.value)}
                placeholder={`Sarkari ${activeCategory.name}, ${activeCategory.name} 2026, GovtBharat, Online Form`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-medium"
              />
              
              {/* Keyword Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(activeCategory.metaKeywords || '').split(',').map((kw, idx) => {
                  const clean = kw.trim();
                  if (!clean) return null;
                  return (
                    <span key={idx} className="bg-slate-950 text-teal-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <span>{clean}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Field 4: OpenGraph Social Tags Section */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-teal-300">
                <Share2 className="w-4 h-4" />
                <span>Open Graph (OG) & Social Card Tags</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">og:title (Social Share Title)</label>
                  <input
                    type="text"
                    value={activeCategory.ogTitle || ''}
                    onChange={(e) => handleUpdateCategoryField(selectedCatId, 'ogTitle', e.target.value)}
                    placeholder={activeCategory.metaTitle || 'Social Title'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">og:image (Banner / Logo URL)</label>
                  <input
                    type="text"
                    value={activeCategory.ogImageUrl || ''}
                    onChange={(e) => handleUpdateCategoryField(selectedCatId, 'ogImageUrl', e.target.value)}
                    placeholder="/logo.png or https://example.com/banner.jpg"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">og:description (WhatsApp / Telegram Snippet)</label>
                <textarea
                  rows={2}
                  value={activeCategory.ogDescription || ''}
                  onChange={(e) => handleUpdateCategoryField(selectedCatId, 'ogDescription', e.target.value)}
                  placeholder={activeCategory.metaDescription || 'Social snippet text'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Robots Directive</label>
                  <select
                    value={activeCategory.robotsDirective || 'index, follow, max-image-preview:large'}
                    onChange={(e) => handleUpdateCategoryField(selectedCatId, 'robotsDirective', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">index, follow (Allow All Crawlers)</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="noindex, nofollow">noindex, nofollow (Block)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Schema.org Type</label>
                  <select
                    value={activeCategory.schemaType || 'CollectionPage'}
                    onChange={(e) => handleUpdateCategoryField(selectedCatId, 'schemaType', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="CollectionPage">CollectionPage (Job Directory)</option>
                    <option value="ItemList">ItemList (List of Notices)</option>
                    <option value="WebPage">WebPage (Standard Page)</option>
                    <option value="JobPosting">JobPosting</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Live Preview Panel */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-extrabold text-slate-200">Real-Time SERP Preview</h3>
                </div>

                {/* Device & Mode Toggles */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setPreviewTab('google')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      previewTab === 'google' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Google
                  </button>
                  <button
                    onClick={() => setPreviewTab('social')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      previewTab === 'social' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Social Card
                  </button>
                </div>
              </div>

              {previewTab === 'google' ? (
                /* Google Search Card */
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 font-sans shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center text-[9px] font-black text-white">
                        F
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-800 dark:text-slate-200 leading-none">
                          GovtBharat › {activeCategory.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          https://{getDomainNameLowercase()} › ?tab={activeCategory.id}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-slate-400">
                      <button 
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1 rounded ${previewDevice === 'desktop' ? 'text-teal-400 bg-slate-800' : ''}`}
                        title="Desktop View"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1 rounded ${previewDevice === 'mobile' ? 'text-teal-400 bg-slate-800' : ''}`}
                        title="Mobile View"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className={`font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-tight ${
                    previewDevice === 'mobile' ? 'text-sm line-clamp-3' : 'text-base line-clamp-2'
                  }`}>
                    {activeCategory.metaTitle || `${activeCategory.name} 2026 - GovtBharat`}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {activeCategory.metaDescription || `Find all latest updates for ${activeCategory.name} 2026 on GovtBharat.`}
                  </p>
                </div>
              ) : (
                /* Social Media Share Card */
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                  <div className="h-32 bg-slate-900 border-b border-slate-800 flex items-center justify-center p-2 relative">
                    <img 
                      src={activeCategory.ogImageUrl || '/logo.png'} 
                      alt="OG Preview" 
                      className="max-h-full max-w-full object-contain rounded"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                    />
                    <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30">
                      OG:{activeCategory.ogType?.toUpperCase() || 'COLLECTION'}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1 bg-slate-900/60">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                      {getDomainName()} › {activeCategory.id}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {activeCategory.ogTitle || activeCategory.metaTitle || activeCategory.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {activeCategory.ogDescription || activeCategory.metaDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* SEO Checklist Tips */}
              <div className="bg-teal-950/30 border border-teal-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Category SEO Best Practices</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 pl-5 list-disc">
                  <li><strong>Unique Meta Titles:</strong> Ensure "{activeCategory.name}" is positioned within the first 35 characters.</li>
                  <li><strong>Search Intent:</strong> Use verbs like <em>"Download Hall Ticket"</em> for Admit Cards, and <em>"Check Score Card"</em> for Results.</li>
                  <li><strong>Instant Live Injection:</strong> Changes are dynamically attached to browser head on category click without reload!</li>
                </ul>
              </div>

              {/* JSON-LD Schema preview badge */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <FileCode className="w-4 h-4 text-teal-400" />
                  <span>Google Schema: <strong>{activeCategory.schemaType || 'CollectionPage'}</strong></span>
                </div>
                <span className="bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  Active in Live Head
                </span>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* ================= BULK MATRIX SPREADSHEET TABLE MODE ================= */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Table className="w-4 h-4 text-teal-400" />
                <span>All 8 Categories Bulk Matrix Editor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Directly edit Meta Title, Meta Description, Keywords & OG Images in a single view.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved!' : 'Save All'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px] font-bold">
                  <th className="py-2.5 px-3 w-40">Category</th>
                  <th className="py-2.5 px-3 min-w-[280px]">Meta Title (50-60 chars)</th>
                  <th className="py-2.5 px-3 min-w-[340px]">Meta Description (130-160 chars)</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Keywords (Comma separated)</th>
                  <th className="py-2.5 px-3 min-w-[180px]">OG Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCategories.map(cat => {
                  const item = categoriesSeo[cat.id] || DEFAULT_CATEGORY_SEO[cat.id];
                  const titleL = item?.metaTitle?.length || 0;
                  const descL = item?.metaDescription?.length || 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-800/40 transition-all">
                      {/* Name */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-teal-400">{cat.hindiName}</span>
                        <div className="text-[9px] text-slate-500 mt-1">/?tab={cat.id}</div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3 align-top space-y-1">
                        <input
                          type="text"
                          value={item?.metaTitle || ''}
                          onChange={(e) => handleUpdateCategoryField(cat.id, 'metaTitle', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className={titleL >= 45 && titleL <= 65 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {titleL} chars
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 align-top space-y-1">
                        <textarea
                          rows={2}
                          value={item?.metaDescription || ''}
                          onChange={(e) => handleUpdateCategoryField(cat.id, 'metaDescription', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg p-2 text-xs text-white font-medium resize-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className={descL >= 120 && descL <= 165 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                            {descL} chars
                          </span>
                        </div>
                      </td>

                      {/* Keywords */}
                      <td className="py-3 px-3 align-top">
                        <input
                          type="text"
                          value={item?.metaKeywords || ''}
                          onChange={(e) => handleUpdateCategoryField(cat.id, 'metaKeywords', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </td>

                      {/* OG Image */}
                      <td className="py-3 px-3 align-top">
                        <input
                          type="text"
                          value={item?.ogImageUrl || ''}
                          onChange={(e) => handleUpdateCategoryField(cat.id, 'ogImageUrl', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg px-2 py-1.5 text-xs text-white"
                          placeholder="/logo.png"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. BULK TEMPLATE GENERATOR MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Bulk SEO Template Apply</h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Apply a synchronized template formula across all 8 categories. Use placeholder <code>&#123;name&#125;</code> and <code>&#123;hindiName&#125;</code>.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Meta Title Template</label>
                <input
                  type="text"
                  value={bulkTitlePattern}
                  onChange={(e) => setBulkTitlePattern(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Meta Description Template</label>
                <textarea
                  rows={2}
                  value={bulkDescPattern}
                  onChange={(e) => setBulkDescPattern(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">Append Common Keywords (Optional)</label>
                <input
                  type="text"
                  value={bulkKeywordInput}
                  onChange={(e) => setBulkKeywordInput(e.target.value)}
                  placeholder="GovtBharat, Sarkari Result 2026, Govt Jobs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Universal OG Image URL</label>
                  <input
                    type="text"
                    value={bulkOgImageInput}
                    onChange={(e) => setBulkOgImageInput(e.target.value)}
                    placeholder="/logo.png"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">Robots Directive</label>
                  <select
                    value={bulkRobotsInput}
                    onChange={(e) => setBulkRobotsInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">index, follow (Recommended)</option>
                    <option value="noindex, follow">noindex, follow</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBulkTemplate}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Apply to All 8 Categories
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
