import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, Download, FileText, Info, AlertTriangle, ShieldCheck, Clock, CreditCard, ChevronRight, Building2, GraduationCap } from 'lucide-react';
import { StudentDocument, DOCUMENT_CATEGORIES } from '../types';

interface Props {
  document: StudentDocument;
  onBack: () => void;
}

export const StudentDocumentDetail: React.FC<Props> = ({ document, onBack }) => {
  const categoryLabel = DOCUMENT_CATEGORIES.find(c => c.id === document.category)?.label || document.category;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update basic SEO dynamically (just title for now)
    const oldTitle = window.document.title;
    window.document.title = `${document.title} - GovtBharat Student Center`;
    return () => {
      window.document.title = oldTitle;
    };
  }, [document.title]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in slide-in-from-right-8 duration-300">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <button onClick={onBack} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Center
        </button>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="shrink-0">{categoryLabel}</span>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-slate-900 dark:text-white font-bold truncate">{document.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-32 h-32 text-indigo-500" />
            </div>
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
                {document.icon || '📄'}
              </div>
              <div>
                <div className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg mb-2">
                  {categoryLabel}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                  {document.title}
                </h1>
                {document.officialAuthority && (
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> {document.officialAuthority}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What is it?</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                {document.description || document.shortDescription}
              </p>
            </div>
          </div>

          {/* Action Buttons (Mobile visible, Desktop hidden) */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-3">
            {document.officialWebsite && (
              <a href={document.officialWebsite} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                <ExternalLink className="w-4 h-4" /> Official Website
              </a>
            )}
            {document.applyUrl && (
              <a href={document.applyUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20">
                <FileText className="w-4 h-4" /> Apply Now
              </a>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            
            {/* Required Documents */}
            {document.requiredDocuments && document.requiredDocuments.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Required Documents
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {document.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Process */}
            {document.applicationProcess && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" /> Application Process
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                  {document.applicationProcess.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* FAQ / Notes Section */}
          {document.importantNotes && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Important Notes
              </h3>
              <div className="text-sm text-amber-800 dark:text-amber-400/80 leading-relaxed whitespace-pre-line">
                {document.importantNotes}
              </div>
            </div>
          )}

        </div>
        
        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          
          {/* Action Card (Desktop) */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Official Links</h3>
            
            <div className="space-y-3">
              {document.officialWebsite && (
                <a href={document.officialWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 group">
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" /> 
                    Official Website
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              
              {document.applyUrl && (
                <a href={document.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold transition-all border border-indigo-200 dark:border-indigo-800/50 group">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" /> 
                    Apply Online
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-300 dark:text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {document.downloadUrl && (
                <a href={document.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold transition-all border border-emerald-200 dark:border-emerald-800/50 group">
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" /> 
                    Download
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-300 dark:text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {document.verificationUrl && (
                <a href={document.verificationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full p-3.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-bold transition-all border border-blue-200 dark:border-blue-800/50 group">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300" /> 
                    Verify Document
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-300 dark:text-blue-600 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              
              {!document.officialWebsite && !document.applyUrl && !document.downloadUrl && !document.verificationUrl && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-500">No official links currently available for this service.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Quick Information</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Application Fee</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{document.applicationFee || 'Not specified'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Processing Time</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{document.processingTime || 'Not specified'}</p>
                </div>
              </li>
              {document.eligibility && (
                <li className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Eligibility</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{document.eligibility}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
