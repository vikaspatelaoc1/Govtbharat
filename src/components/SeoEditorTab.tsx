import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  FileCode
} from 'lucide-react';
import { 
  GlobalSeoConfig, 
  loadGlobalSeoConfig, 
  saveGlobalSeoConfig, 
  DEFAULT_GLOBAL_SEO, 
  resetDefaultSeo 
} from '../utils/seo';

interface SeoEditorTabProps {
  onShowToast?: (msg: string) => void;
}

export const SeoEditorTab: React.FC<SeoEditorTabProps> = ({ onShowToast }) => {
  const [seoConfig, setSeoConfig] = useState<GlobalSeoConfig>(loadGlobalSeoConfig());
  const [isSaved, setIsSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'google' | 'social'>('google');

  useEffect(() => {
    setSeoConfig(loadGlobalSeoConfig());
  }, []);

  const handleSave = () => {
    saveGlobalSeoConfig(seoConfig);
    resetDefaultSeo('home');
    setIsSaved(true);
    if (onShowToast) {
      onShowToast('🚀 Global SEO Settings Saved & Injected into Live Document Head!');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset Homepage SEO tags to default system values?')) {
      setSeoConfig(DEFAULT_GLOBAL_SEO);
      saveGlobalSeoConfig(DEFAULT_GLOBAL_SEO);
      resetDefaultSeo('home');
      if (onShowToast) {
        onShowToast('🔄 Reset Global SEO to Default System Preset');
      }
    }
  };

  const titleLength = seoConfig.siteTitle.length;
  const descLength = seoConfig.metaDescription.length;

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-wide">Homepage Global SEO & Meta Manager</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Google Indexing
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customize meta tags, Google Search Console snippets & OpenGraph social cards in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all border border-slate-700/80 cursor-pointer"
            title="Reset to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all border border-emerald-400/30 cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved & Injected!' : 'Save & Inject Live SEO'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Editable SEO Fields */}
        <div className="lg:col-span-7 space-y-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Core Search Meta Fields</span>
            </h3>
            <span className="text-[11px] text-slate-400">Updates &lt;head&gt; tags instantly</span>
          </div>

          {/* 1. Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                <span>1. Meta Title (&lt;title&gt;)</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                titleLength >= 50 && titleLength <= 65
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {titleLength} / 60 chars (Recommended: 50-60)
              </span>
            </div>
            <input
              type="text"
              value={seoConfig.siteTitle}
              onChange={(e) => setSeoConfig({ ...seoConfig, siteTitle: e.target.value })}
              placeholder="e.g. GovtBharat | Latest Online Form & Admit Card 2026"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-400">
              This is the main title displayed on Google Search results and browser tabs.
            </p>
          </div>

          {/* 2. Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                <span>2. Meta Description</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                descLength >= 120 && descLength <= 160
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {descLength} / 160 chars (Recommended: 130-160)
              </span>
            </div>
            <textarea
              rows={3}
              value={seoConfig.metaDescription}
              onChange={(e) => setSeoConfig({ ...seoConfig, metaDescription: e.target.value })}
              placeholder="Provide a compelling snippet summarizing your portal for search engines..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 transition-all font-medium resize-none"
            />
            <p className="text-[11px] text-slate-400">
              Summarizes portal content under your title link on Google. Include top keywords like Sarkari Result, Govt Jobs.
            </p>
          </div>

          {/* 3. Meta Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
              <span>3. Target Keywords (Comma Separated)</span>
            </label>
            <input
              type="text"
              value={seoConfig.metaKeywords}
              onChange={(e) => setSeoConfig({ ...seoConfig, metaKeywords: e.target.value })}
              placeholder="Sarkari Result, Govt Jobs 2026, Admit Card, Answer Key, GovtBharat"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition-all font-medium"
            />
            <p className="text-[11px] text-slate-400">
              Key search terms separated by commas for search engines and category tagging.
            </p>
          </div>

          {/* 4. Publisher / Author Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">
                Author / Publisher Name
              </label>
              <input
                type="text"
                value={seoConfig.authorName}
                onChange={(e) => setSeoConfig({ ...seoConfig, authorName: e.target.value })}
                placeholder="GovtBharat Portal Team"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">
                Robots Directive
              </label>
              <select
                value={seoConfig.robotsDirective}
                onChange={(e) => setSeoConfig({ ...seoConfig, robotsDirective: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
                  index, follow (Allow All Crawlers - Recommended)
                </option>
                <option value="index, nofollow">index, nofollow (Index Page, Skip Internal Links)</option>
                <option value="noindex, follow">noindex, follow (Hide Page, Follow Links)</option>
                <option value="noindex, nofollow">noindex, nofollow (Block Crawlers Completely)</option>
              </select>
            </div>
          </div>

          {/* 5. OpenGraph Social Share Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1">
              <span>OG Social Card Image URL</span>
            </label>
            <input
              type="text"
              value={seoConfig.ogImageUrl}
              onChange={(e) => setSeoConfig({ ...seoConfig, ogImageUrl: e.target.value })}
              placeholder="/logo.png or https://example.com/banner.png"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <p className="text-[11px] text-slate-400">
              Banner or logo image shown when users share your portal link on WhatsApp, Telegram, or Twitter.
            </p>
          </div>

        </div>

        {/* Right Col: Real-time Live Preview Panel */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-slate-200">Live Search Snippet Preview</h3>
              </div>

              {/* Toggle Mode */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setPreviewMode('google')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    previewMode === 'google'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Google
                </button>
                <button
                  onClick={() => setPreviewMode('social')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    previewMode === 'social'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Social Card
                </button>
              </div>
            </div>

            {/* Google Search Snippet Card */}
            {previewMode === 'google' ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 font-sans shadow-md">
                
                {/* Header domain line */}
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-black text-white">
                    F
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-slate-800 dark:text-slate-200 leading-none">
                      GovtBharat
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      https://{getDomainNameLowercase()} › govt-result
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline line-clamp-2 cursor-pointer leading-tight">
                  {seoConfig.siteTitle || 'GovtBharat'}
                </h4>

                {/* Snippet Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {seoConfig.metaDescription || 'GovtBharat Government Jobs Portal...'}
                </p>
              </div>
            ) : (
              /* Social Media Share Card (WhatsApp / Telegram / Twitter) */
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <div className="h-28 bg-slate-900 border-b border-slate-800 flex items-center justify-center p-2 relative">
                  <img 
                    src={seoConfig.ogImageUrl || '/logo.png'} 
                    alt="OG Social Share" 
                    className="max-h-full max-w-full object-contain rounded" 
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                  />
                  <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                    OG:IMAGE
                  </span>
                </div>
                <div className="p-3 space-y-1 bg-slate-900/60">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                    {getDomainName()}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {seoConfig.siteTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {seoConfig.metaDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Quick SEO Advice Box */}
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Google Search Optimization Tips</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 pl-5 list-disc">
                <li>Include primary keywords like <strong>Sarkari Result</strong> and <strong>Govt Jobs 2026</strong> in the title.</li>
                <li>Keep titles between <strong>50–60 characters</strong> so they don't get truncated by Google.</li>
                <li>Write descriptions between <strong>130–160 characters</strong> to maximize click-through rates.</li>
              </ul>
            </div>

            {/* XML Sitemap quick link */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>Live Dynamic Sitemap:</span>
              </div>
              <a 
                href="/sitemap.xml" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-all text-[11px]"
              >
                /sitemap.xml ↗
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
