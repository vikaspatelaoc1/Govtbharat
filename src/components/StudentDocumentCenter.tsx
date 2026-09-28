import { StudentDocumentDetail } from './StudentDocumentDetail';
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, FileText, CheckCircle, ExternalLink, Download, ArrowRight, BookOpen, GraduationCap, Building2, CreditCard } from 'lucide-react';
import { StudentDocument, DOCUMENT_CATEGORIES, AppToolItem } from '../types';
import { getStudentDocuments } from '../services/firestoreService';
import { ToolDetailModal } from './ToolDetailModal';
import { DEFAULT_MOBILE_TABS_CONFIG } from '../data/mobileTabsData';

export const StudentDocumentCenter: React.FC = () => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<StudentDocument | null>(null);

  // States for Tool Interactive Modals
  const [selectedTool, setSelectedTool] = useState<AppToolItem | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  const handleOpenTool = (toolName: string) => {
    const tools = DEFAULT_MOBILE_TABS_CONFIG.tools;
    let targetToolId = '';
    
    switch (toolName) {
      case 'Resize Photo to 50KB':
      case 'Compress Signature':
      case 'Convert JPG/PNG':
        targetToolId = 'image-resizer';
        break;
      case 'Passport Size Photo Maker':
        targetToolId = 'remove-bg';
        break;
      case 'Merge PDF Files':
      case 'Split PDF Pages':
      case 'Compress PDF Size':
      case 'Image to PDF Converter':
        targetToolId = 'pdf-portal';
        break;
      case 'Resume / CV Builder':
        targetToolId = 'marital-biodata';
        break;
      case 'Document Checklist':
        targetToolId = 'pdf-portal'; // Re-use PDF portal as guidance or custom document specs
        break;
      case 'Typing Speed Test':
        targetToolId = 'typing-speed-test';
        break;
      case 'DigiLocker Access':
        window.open('https://www.digilocker.gov.in/', '_blank');
        return;
      default:
        break;
    }
    
    if (targetToolId) {
      const found = tools.find(t => t.id === targetToolId);
      if (found) {
        setSelectedTool(found);
        setIsToolModalOpen(true);
      }
    }
  };

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);
      try {
        const docs = await getStudentDocuments();
        setDocuments(docs.filter(d => d.isActive));
      } catch (err) {
        console.error('Error loading student documents:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, []);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const featuredDocs = documents.filter(d => d.isFeatured);
  const popularDocs = documents.filter(d => d.isPopular);

  return selectedDoc ? (
    <StudentDocumentDetail document={selectedDoc} onBack={() => setSelectedDoc(null)} />
  ) : (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 rounded-3xl p-8 sm:p-12 mb-10 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/50 text-indigo-100 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <GraduationCap className="w-4 h-4" /> GovtBharat Student Utility Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
            All Your Documents & Certificates <span className="text-amber-400">in One Place</span>
          </h1>
          <p className="text-indigo-100 text-lg sm:text-xl mb-8 font-medium max-w-2xl mx-auto">
            Find, verify, and access official download links for your education, government, and exam documents instantly.
          </p>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents... (e.g., Aadhaar, Marksheet, Caste Certificate)"
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white text-slate-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/50 border-0 text-lg font-medium"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="mb-10 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-3 min-w-max">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
              selectedCategory === 'all' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Categories
          </button>
          {DOCUMENT_CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
                selectedCategory === cat.id 
                  ? 'bg-indigo-600 text-white border border-indigo-600' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-medium">Loading documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No documents found</h3>
          <p className="text-slate-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group flex flex-col h-full cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {doc.icon || '📄'}
                </div>
                {doc.isPopular && (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {doc.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                {doc.shortDescription}
              </p>
              
              <div className="mt-auto space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {doc.officialWebsite && (
                  <a onClick={(e) => e.stopPropagation()} href={doc.officialWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-700">
                    <ExternalLink className="w-4 h-4" /> Official Website
                  </a>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {doc.applyUrl && (
                    <a onClick={(e) => e.stopPropagation()} href={doc.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-semibold transition-colors border border-indigo-200 dark:border-indigo-800/50">
                      <ArrowRight className="w-3.5 h-3.5" /> Apply Now
                    </a>
                  )}
                  {doc.downloadUrl && (
                    <a onClick={(e) => e.stopPropagation()} href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-colors border border-emerald-200 dark:border-emerald-800/50">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                  {doc.verificationUrl && (
                    <a onClick={(e) => e.stopPropagation()} href={doc.verificationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-semibold transition-colors border border-blue-200 dark:border-blue-800/50">
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* Student Utility Tools Section */}
      <div className="mt-16 mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <span className="text-3xl">🛠️</span> Student Document Tools
        </h2>
        
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-4 pb-4 -mx-4 px-4 snap-x">
          {/* Photo Tools */}
          <div className="w-[300px] shrink-0 snap-start bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 p-6 rounded-3xl border border-fuchsia-100 dark:border-fuchsia-900/50">
            <h3 className="text-lg font-bold text-fuchsia-900 dark:text-fuchsia-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📸</span> Photo & Signature
            </h3>
            <ul className="space-y-3">
              {['Resize Photo to 50KB', 'Compress Signature', 'Passport Size Photo Maker', 'Convert JPG/PNG'].map((tool, i) => (
                <li key={i}>
                  <button 
                    onClick={() => handleOpenTool(tool)}
                    className="w-full text-left px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-fuchsia-500 hover:text-white dark:hover:bg-fuchsia-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm flex justify-between items-center group cursor-pointer"
                  >
                    {tool} <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-fuchsia-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* PDF Tools */}
          <div className="w-[300px] shrink-0 snap-start bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/50">
            <h3 className="text-lg font-bold text-rose-900 dark:text-rose-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📑</span> PDF Utilities
            </h3>
            <ul className="space-y-3">
              {['Merge PDF Files', 'Split PDF Pages', 'Compress PDF Size', 'Image to PDF Converter'].map((tool, i) => (
                <li key={i}>
                  <button 
                    onClick={() => handleOpenTool(tool)}
                    className="w-full text-left px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm flex justify-between items-center group cursor-pointer"
                  >
                    {tool} <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Tools */}
          <div className="w-[300px] shrink-0 snap-start bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/50">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">💼</span> Career & Exam Tools
            </h3>
            <ul className="space-y-3">
              {['Resume / CV Builder', 'Document Checklist', 'DigiLocker Access', 'Typing Speed Test'].map((tool, i) => (
                <li key={i}>
                  <button 
                    onClick={() => handleOpenTool(tool)}
                    className="w-full text-left px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm flex justify-between items-center group cursor-pointer"
                  >
                    {tool} <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-16 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-center max-w-3xl mx-auto">
        <h4 className="text-amber-800 dark:text-amber-500 font-bold mb-2 flex items-center justify-center gap-2">
          <span className="text-xl">⚠️</span> Important Disclaimer
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
          GovtBharat is an information platform and not an official government portal. We provide verified official links for your convenience. For any official application, download, or verification, always refer to the respective government, board, or university website.
        </p>
      </div>

      {/* Interactive Tool Details Modal */}
      <ToolDetailModal 
        tool={selectedTool}
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
      />

    </div>
  );
};
