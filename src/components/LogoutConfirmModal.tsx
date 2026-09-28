import React from 'react';
import { X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
      {/* Dark Transparent Backdrop */}
      <div 
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" 
      />

      {/* Ultra-compact Transparent Glass Modal matching GovtBharat Logo theme */}
      <div className="relative w-full max-w-[270px] bg-slate-950/80 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden z-10 p-4 text-center animate-in zoom-in-95 duration-150">
        
        {/* Top Gold Gradient Bar Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-amber-400 rounded-md transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Title matching GovtBharat typography */}
        <div className="mt-1 mb-3">
          <p className="text-xs font-black text-white tracking-tight">
            Confirm <span className="text-amber-400">Logout?</span>
          </p>
        </div>

        {/* Minimal Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 font-semibold py-1.5 px-3 rounded-xl text-xs transition-all cursor-pointer active:scale-95"
          >
            ❌ No
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 hover:text-amber-200 border border-amber-400/50 font-bold py-1.5 px-3 rounded-xl text-xs transition-all shadow-sm shadow-amber-500/10 cursor-pointer active:scale-95"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
