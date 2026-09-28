import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  AlertCircle, 
  Info, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock,
  Type,
  X
} from 'lucide-react';
import { defaultDynamicPages } from '../data/defaultPages';
import { subscribeToDynamicPages } from '../services/firestoreService';
import { DynamicPageItem } from '../types';

interface InfoModalProps {
  pageId: string;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ pageId: initialPageId, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>(initialPageId || 'privacy');
  const [copied, setCopied] = useState(false);
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

  useEffect(() => {
    const unsub = subscribeToDynamicPages((cloudPages) => {
      if (cloudPages && Object.keys(cloudPages).length > 0) {
        setPages(prev => ({ ...defaultDynamicPages, ...prev, ...cloudPages }));
      }
    });
    return () => unsub();
  }, []);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTabIcon = (id: string) => {
    switch (id) {
      case 'privacy': return Lock;
      case 'disclaimer': return AlertCircle;
      case 'terms': return FileText;
      case 'about': return Info;
      case 'contact': return Phone;
      default: return Type;
    }
  };

  const activePageData = pages[activeTab] || defaultDynamicPages[activeTab] || {
    id: activeTab,
    title: activeTab.toUpperCase(),
    subtitle: 'GovtBharat Legal & Info Page',
    content: '<p class="text-slate-500 dark:text-slate-400">Content loading or empty.</p>'
  };

  // Standard tab order first, then any custom pages
  const coreTabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'disclaimer', label: 'Disclaimer (Non-Govt)' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact & Grievance' },
  ];

  const customTabs = (Object.values(pages) as DynamicPageItem[])
    .filter(p => !['privacy', 'disclaimer', 'terms', 'about', 'contact'].includes(p.id))
    .map(p => ({ id: p.id, label: p.title }));

  const allTabs = [...coreTabs, ...customTabs];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/85 backdrop-blur-md transition-opacity duration-300 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white backdrop-blur-2xl w-full max-w-3xl rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden border-2 border-amber-500/60 my-6 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 shrink-0 gap-2.5 transition-colors">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-amber-600 dark:text-amber-400 truncate">
                GovtBharat Official Policies &amp; Compliance
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">Google AdSense &amp; Legal Guidelines (2026)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 p-2 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex items-center space-x-1.5 p-2 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold transition-colors">
          {allTabs.map(tab => {
            const Icon = getTabIcon(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed info-modal-theme-wrapper">
          {activePageData && (
            <div className="space-y-4 animate-in fade-in">
              {activePageData.subtitle && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-white mb-0.5">{activePageData.title}</strong>
                    {activePageData.subtitle}
                  </div>
                </div>
              )}

              {/* Dynamic HTML / Rich Content */}
              <div 
                className="space-y-3 leading-relaxed info-rich-content"
                dangerouslySetInnerHTML={{ __html: activePageData.content || '<p>No content provided.</p>' }}
              />
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 shrink-0 transition-colors">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>GovtBharat Official Portal 2026 • Realtime CMS Active</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-5 rounded-xl transition-all text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
