import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export interface UpdatePromptProps {
  pwaInstallUrl?: string;
}

export function UpdatePrompt({ pwaInstallUrl: propInstallUrl }: UpdatePromptProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [appName, setAppName] = useState('FastARC');
  const [configInstallUrl, setConfigInstallUrl] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event if available
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Allow manual/testing trigger via window event
    const handleCustomTrigger = (e: any) => {
      if (e.detail?.version) setNewVersion(e.detail.version);
      if (e.detail?.pwaInstallUrl) setConfigInstallUrl(e.detail.pwaInstallUrl);
      setShowUpdate(true);
    };
    window.addEventListener('fastarc_trigger_update_prompt', handleCustomTrigger);

    // Check for version updates from site-config
    const checkUpdate = async () => {
      try {
        const res = await fetch('/api/v1/site-config');
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.siteConfig) {
          if (data.siteConfig.appName) {
            setAppName(data.siteConfig.appName);
          }
          if (data.siteConfig.pwaInstallUrl) {
            setConfigInstallUrl(data.siteConfig.pwaInstallUrl);
          }

          const serverVersion = data.siteConfig.appVersion;
          if (serverVersion) {
            const currentVersion = localStorage.getItem('fastarc_app_version');
            const skippedVersion = sessionStorage.getItem('fastarc_update_skipped');

            if (!currentVersion) {
              // Initial load - register current baseline version
              localStorage.setItem('fastarc_app_version', serverVersion);
            } else if (currentVersion !== serverVersion && skippedVersion !== serverVersion) {
              // New version available and user hasn't skipped it in this session
              setNewVersion(serverVersion);
              setShowUpdate(true);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to check app version', err);
      }
    };

    checkUpdate();
    const interval = setInterval(checkUpdate, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('fastarc_trigger_update_prompt', handleCustomTrigger);
      clearInterval(interval);
    };
  }, []);

  const effectiveInstallUrl = 
    propInstallUrl || 
    configInstallUrl || 
    (typeof window !== 'undefined' ? `${window.location.origin}/?mode=app&source=pwa` : '/?mode=app&source=pwa');

  const handleUpdateNow = () => {
    if (newVersion) {
      localStorage.setItem('fastarc_app_version', newVersion);
    }
    sessionStorage.removeItem('fastarc_update_skipped');

    // Invalidate service worker cache to ensure freshest bundle
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }

    // Trigger native PWA install prompt if available
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
      } catch (err) {
        console.warn('PWA install prompt invocation:', err);
      }
    }

    setShowUpdate(false);
  };

  const handleSkip = () => {
    if (newVersion) {
      sessionStorage.setItem('fastarc_update_skipped', newVersion);
    } else {
      sessionStorage.setItem('fastarc_update_skipped', 'true');
    }
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* High-Contrast Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Compact High-Contrast Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-modal-title"
        className="relative w-full max-w-[340px] sm:max-w-[370px] bg-slate-950 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 p-5 sm:p-6 text-center overflow-hidden z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Top Gold Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* High-Contrast Icon Badge */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        {/* Version Badge */}
        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 mb-2">
          {newVersion ? `Version ${newVersion}` : 'New Update'}
        </div>

        {/* Title & Body */}
        <h3 id="update-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
          Update {appName}
        </h3>
        <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1.5 mb-5">
          A new version is available with the latest government jobs, fast results, and performance upgrades.
        </p>

        {/* Exactly Two Buttons: 'Skip' and 'Update Now' */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 text-center focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            Skip
          </button>

          <a
            href={effectiveInstallUrl}
            onClick={handleUpdateNow}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Update Now
          </a>
        </div>
      </div>
    </div>
  );
}
