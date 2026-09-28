import React, { useState, useEffect } from 'react';
import { 
  Type, Save, Plus, Trash2, Eye, Code, RefreshCw, CheckCircle2, 
  AlertCircle, Shield, FileText, Info, Phone, ExternalLink,
  Bold, Heading, List, Link as LinkIcon, Sparkles, Check, Copy
} from 'lucide-react';
import { DynamicPageItem } from '../types';
import { defaultDynamicPages } from '../data/defaultPages';
import { subscribeToDynamicPages, saveDynamicPagesToFirestore } from '../services/firestoreService';

interface PagesManagerTabProps {
  onToast?: (msg: string) => void;
  onPreviewPage?: (pageId: string) => void;
}

export const PagesManagerTab: React.FC<PagesManagerTabProps> = ({ onToast, onPreviewPage }) => {
  const [pages, setPages] = useState<Record<string, DynamicPageItem>>(() => {
    try {
      const saved = localStorage.getItem('GovtBharat_dynamic_pages');
      if (saved) {
        return { ...defaultDynamicPages, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return defaultDynamicPages;
  });

  const [activePageId, setActivePageId] = useState<string>('about');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToDynamicPages((cloudPages) => {
      if (cloudPages && Object.keys(cloudPages).length > 0) {
        setPages(prev => {
          const merged = { ...defaultDynamicPages, ...prev, ...cloudPages };
          localStorage.setItem('GovtBharat_dynamic_pages', JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const currentPage: DynamicPageItem = pages[activePageId] || defaultDynamicPages[activePageId] || {
    id: activePageId,
    title: 'Untitled Page',
    content: '<p>Content goes here...</p>',
    isPublished: true,
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  const handleUpdateField = (field: keyof DynamicPageItem, value: any) => {
    setPages(prev => ({
      ...prev,
      [activePageId]: {
        ...prev[activePageId],
        id: activePageId,
        [field]: value,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    }));
    setSaveSuccess(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('GovtBharat_dynamic_pages', JSON.stringify(pages));
      await saveDynamicPagesToFirestore(pages);
      setIsSaving(false);
      setSaveSuccess(true);
      if (onToast) {
        onToast(`"${currentPage.title}" and CMS pages saved & synced successfully!`);
      }
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (error) {
      console.error('Error saving dynamic pages:', error);
      setIsSaving(false);
      if (onToast) {
        onToast('Failed to save to cloud database, saved locally.');
      }
    }
  };

  const handleResetToDefault = () => {
    if (defaultDynamicPages[activePageId]) {
      if (window.confirm(`Are you sure you want to restore the official default template for "${currentPage.title}"?`)) {
        setPages(prev => ({
          ...prev,
          [activePageId]: { ...defaultDynamicPages[activePageId] }
        }));
        setSaveSuccess(false);
        if (onToast) onToast(`Restored default template for ${currentPage.title}`);
      }
    } else {
      alert('No default template found for custom page.');
    }
  };

  const handleCreateNewPage = () => {
    if (!newPageTitle.trim()) {
      alert('Please enter a page title');
      return;
    }
    const slug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') || newPageTitle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    
    if (pages[slug]) {
      alert('A page with this identifier already exists!');
      return;
    }

    const newPage: DynamicPageItem = {
      id: slug,
      title: newPageTitle.trim(),
      subtitle: 'Custom Dynamic Page',
      content: `<div class="space-y-4">
  <h2 class="text-lg font-bold text-white">${newPageTitle.trim()}</h2>
  <p class="text-sm text-slate-300">Welcome to the ${newPageTitle.trim()} page. Enter your customized announcement or legal guidelines here.</p>
</div>`,
      lastUpdated: new Date().toISOString().split('T')[0],
      isPublished: true
    };

    setPages(prev => ({ ...prev, [slug]: newPage }));
    setActivePageId(slug);
    setShowAddModal(false);
    setNewPageTitle('');
    setNewPageSlug('');
    if (onToast) onToast(`Created new page: "${newPage.title}"`);
  };

  const handleDeletePage = (pageId: string) => {
    if (defaultDynamicPages[pageId]) {
      alert('System core legal pages (About, Privacy, Terms, Disclaimer, Contact) cannot be deleted. You can edit their contents instead.');
      return;
    }
    if (window.confirm(`Delete page "${pages[pageId]?.title || pageId}" permanently?`)) {
      setPages(prev => {
        const copy = { ...prev };
        delete copy[pageId];
        return copy;
      });
      setActivePageId('about');
      if (onToast) onToast('Page deleted successfully');
    }
  };

  // Helper to insert snippets into textarea
  const insertSnippet = (snippet: string) => {
    const textarea = document.getElementById('cms-content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = currentPage.content || '';
    const updated = current.substring(0, start) + snippet + current.substring(end);
    handleUpdateField('content', updated);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  const getPageIcon = (id: string) => {
    switch (id) {
      case 'about': return Info;
      case 'privacy': return Shield;
      case 'terms': return FileText;
      case 'disclaimer': return AlertCircle;
      case 'contact': return Phone;
      default: return Type;
    }
  };

  const characterCount = (currentPage.content || '').length;
  const wordCount = (currentPage.content || '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Dynamic Pages & CMS Manager
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Live Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Edit legal policies, AdSense notices, and custom informational pages in real-time
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-violet-500" />
              <span>Add Custom Page</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Pages List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Managed Pages ({Object.keys(pages).length})
              </span>
            </div>

            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {(Object.values(pages) as DynamicPageItem[]).map((p) => {
                const IconComp = getPageIcon(p.id);
                const isActive = activePageId === p.id;
                const isCore = Boolean(defaultDynamicPages[p.id]);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePageId(p.id);
                      setSaveSuccess(false);
                    }}
                    className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700/60 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-violet-900 dark:text-violet-200 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                            {p.title || p.id}
                          </h4>
                          {isCore && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          /{p.id} • {p.lastUpdated || '2026'}
                        </p>
                      </div>
                    </div>

                    {!isCore && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(p.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete custom page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Template Restorer */}
            {defaultDynamicPages[activePageId] && (
              <button
                onClick={handleResetToDefault}
                className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <RefreshCw className="w-3 h-3 text-amber-500" />
                <span>Reset to AdSense Standard Template</span>
              </button>
            )}
          </div>

          {/* Right Column: Editor & Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Meta and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Editing:</span>
                <span className="text-xs font-black text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">
                  {currentPage.title} ({currentPage.id})
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'editor'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 text-violet-500" />
                  <span>Editor (HTML/Text)</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {/* Inputs: Page Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Page Title (Heading)
                </label>
                <input
                  type="text"
                  value={currentPage.title || ''}
                  onChange={(e) => handleUpdateField('title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="e.g. Privacy Policy"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Subtitle / Badge Note
                </label>
                <input
                  type="text"
                  value={currentPage.subtitle || ''}
                  onChange={(e) => handleUpdateField('subtitle', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  placeholder="e.g. Google AdSense & Legal Compliant"
                />
              </div>
            </div>

            {/* Formatting Toolbar (Only in Editor Mode) */}
            {viewMode === 'editor' && (
              <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 px-1 uppercase">Insert:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet('<h3 class="text-base font-black text-white">Section Heading</h3>\n')}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Heading className="w-3 h-3 text-violet-500" /> Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('<p class="text-xs sm:text-sm text-slate-300">Your paragraph text goes here...</p>\n')}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Type className="w-3 h-3 text-blue-500" /> Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('<strong>Important Bold Text</strong>')}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Bold className="w-3 h-3 text-amber-500" /> Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('<ul class="list-disc pl-5 space-y-1 text-slate-300 text-xs">\n  <li>First point</li>\n  <li>Second point</li>\n</ul>\n')}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <List className="w-3 h-3 text-emerald-500" /> Bullet List
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('<div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">\n  <strong>Notice:</strong> Important announcement or advice here.\n</div>\n')}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" /> Alert Box
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-amber-400 underline font-semibold">Click Here</a>')}
                  className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-sky-500" /> Link
                </button>
              </div>
            )}

            {/* Main Content Area */}
            {viewMode === 'editor' ? (
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Page Content (HTML & Markdown Support)
                </label>
                <textarea
                  id="cms-content-editor"
                  value={currentPage.content || ''}
                  onChange={(e) => handleUpdateField('content', e.target.value)}
                  className="w-full h-80 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 outline-none leading-relaxed resize-y"
                  placeholder="Enter HTML or text content here..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>{wordCount} words | {characterCount} characters</span>
                  <span>Auto-renders with responsive design in popup modal</span>
                </div>
              </div>
            ) : (
              /* Live Preview Mode */
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live Preview Container
                </label>
                <div className="h-80 overflow-y-auto bg-slate-900 text-white p-5 rounded-xl border-2 border-amber-500/40 shadow-inner space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base sm:text-lg font-black text-amber-400">
                      {currentPage.title}
                    </h2>
                    {currentPage.subtitle && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{currentPage.subtitle}</p>
                    )}
                  </div>
                  
                  {/* Dynamic HTML Content Injection */}
                  <div 
                    className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3"
                    dangerouslySetInnerHTML={{ __html: currentPage.content || '<p class="text-slate-500 italic">No content written yet.</p>' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-500" />
              Add Custom Dynamic Page
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Refund Policy or Advertise With Us"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Page Identifier (Slug URL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. refund-policy"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPage}
                className="px-4 py-2 rounded-xl text-xs font-black bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
