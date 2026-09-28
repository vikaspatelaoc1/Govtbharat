import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Check, 
  RotateCcw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react';
import { 
  getDomainName, 
  updateDomainNameAcrossPortal, 
  resetDomainNameToDefault,
  DOMAIN_CHANGE_EVENT 
} from '../utils/domain';

interface DomainEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (message: string) => void;
}

const COMMON_EXTENSIONS = ['.info', '.com', '.in', '.org', '.net', '.live', '.edu.in', '.gov.in'];

const QUICK_PRESETS = [
  'GovtBharat.com',
  'GovtBharat.in',
  'GovtBharat.info',
  'GovtBharat.org',
  'GovtResult.info',
  'SarkariBharat.com'
];

export const DomainEditorModal: React.FC<DomainEditorModalProps> = ({ isOpen, onClose, onToast }) => {
  const [domainInput, setDomainInput] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDomainInput(getDomainName());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = domainInput.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    
    if (!clean) {
      if (onToast) onToast('⚠️ Please enter a valid domain name text.');
      return;
    }

    const success = updateDomainNameAcrossPortal(clean);
    if (success) {
      setSavedSuccess(true);
      if (onToast) onToast(`🌐 Domain name updated to "${clean}" across all portal tabs!`);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } else {
      if (onToast) onToast('❌ Failed to update domain name.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset domain name back to default "GovtBharat.com"?')) {
      const def = resetDomainNameToDefault();
      setDomainInput(def);
      if (onToast) onToast(`🔄 Domain reset to default: ${def}`);
    }
  };

  const handleAppendExtension = (ext: string) => {
    let clean = domainInput.trim();
    // Strip existing extension if matches standard
    const lastDotIndex = clean.lastIndexOf('.');
    if (lastDotIndex > 0) {
      clean = clean.substring(0, lastDotIndex);
    }
    setDomainInput(`${clean}${ext}`);
  };

  const cleanDisplayDomain = domainInput.trim() || 'GovtBharat.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 px-5 py-4 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <Globe className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Super Admin Domain Name Manager
                </h3>
                <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Global
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-medium">
                Change website domain text across all tabs, headers, cards & watermark stamps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-grow">
          {/* Main Input Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enter Domain Name Text <span className="text-amber-400">*</span>
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. GovtBharat.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border-2 border-amber-500/50 focus:border-amber-400 rounded-xl text-white font-extrabold text-base sm:text-lg placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 tracking-wide transition-all"
                autoFocus
              />
            </div>

            {/* Quick Extension Selector */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Extension Picker:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_EXTENSIONS.map((ext) => (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => handleAppendExtension(ext)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400/60 border border-slate-700 text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer"
                  >
                    {ext}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-1">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">Popular Domain Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDomainInput(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      domainInput === preset 
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-xs' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Previews Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Live Previews Across Portal Components</span>
              </div>
              <span className="text-[11px] text-slate-400">Format remains 100% exact</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Preview 1: Hero Orange Pill Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  1. Homepage Hero Pill Badge
                </span>
                <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full tracking-wide shadow-md">
                  {cleanDisplayDomain}
                </div>
              </div>

              {/* Preview 2: Official Sarkari Red Watermark & Stamp */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  2. Post Header & Stamp
                </span>
                <div className="inline-block py-1 px-4 rounded-md font-black text-sm text-[#dc2626] uppercase tracking-wider leading-tight">
                  GovtBharat RESULT OFFICIAL
                  <div className="text-xs font-extrabold tracking-widest text-[#b91c1c] mt-0.5">
                    {cleanDisplayDomain.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Preview 3: Footer Copyright Notice */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 md:col-span-2 text-center">
                <span className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-wider">
                  3. Footer & SEO Meta Title
                </span>
                <p className="text-xs text-slate-300 font-medium truncate">
                  © 2026 <strong className="text-amber-400">{cleanDisplayDomain}</strong> - GovtBharat. All Rights Reserved.
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  https://{cleanDisplayDomain.toLowerCase()} › Sarkari-Job-Updates
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 flex items-start gap-2.5 text-blue-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Super Admin Authority:</strong>
              When saved, this text updates in real-time across Home, Job Details, Modal, SEO tags, Social Share, and Watermarks without altering any design layout or formatting.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 hover:scale-[1.02]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Domain Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-slate-950" />
                  <span>Save Domain Name Everywhere</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
