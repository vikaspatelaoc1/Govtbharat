import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { subscribeToAppVersionRelease } from '../services/firestoreService';

export interface UpdatePromptProps {
  pwaInstallUrl?: string;
}

export function UpdatePrompt({ pwaInstallUrl: propInstallUrl }: UpdatePromptProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState('2.6.0');
  const [appName, setAppName] = useState('FastARC');
  const [configInstallUrl, setConfigInstallUrl] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Capture native PWA install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Immediate manual & test event listeners (from Admin Version Control tab)
    const handleTriggerEvent = (e: any) => {
      const ver = e.detail?.version || newVersion || '2.6.0';
      setNewVersion(ver);
      if (e.detail?.pwaInstallUrl) setConfigInstallUrl(e.detail.pwaInstallUrl);
      setShowUpdate(true);
    };

    window.addEventListener('fastarc:check-updates', handleTriggerEvent);
    window.addEventListener('fastarc_trigger_update_prompt', handleTriggerEvent);
    window.addEventListener('fastarc:test-update-prompt', handleTriggerEvent);

    // 3. Check URL query flag for instant testing/preview (?update=1 or ?test_update=true)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('update') === 'true' || params.get('update') === '1' || params.get('test_update') === 'true') {
        setShowUpdate(true);
      }
    }

    // 4. Check server configuration endpoint
    const checkServerConfig = async () => {
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

          const serverVersion = data.siteConfig.appVersion || '2.6.0';
          setNewVersion(serverVersion);

          const installedVersion = 
            localStorage.getItem('fastarc_installed_app_version') || 
            localStorage.getItem('fastarc_app_version');
          const skippedVersion = sessionStorage.getItem('fastarc_update_skipped');

          // If no version recorded or server version is newer, and not skipped in this session
          if (!installedVersion || (installedVersion !== serverVersion && skippedVersion !== serverVersion)) {
            setShowUpdate(true);
          }
        }
      } catch (err) {
        console.warn('App version check notice:', err);
      }
    };

    checkServerConfig();

    // 5. Real-time Firestore app version release subscription
    const unsubscribeFirestore = subscribeToAppVersionRelease((release) => {
      if (release && release.version) {
        setNewVersion(release.version);
        if (release.downloadUrl) {
          setConfigInstallUrl(release.downloadUrl);
        }

        const installedVersion = 
          localStorage.getItem('fastarc_installed_app_version') || 
          localStorage.getItem('fastarc_app_version');
        const skippedVersion = sessionStorage.getItem('fastarc_update_skipped');

        if (release.forceUpdate || !installedVersion || (installedVersion !== release.version && skippedVersion !== release.version)) {
          setShowUpdate(true);
        }
      }
    });

    const interval = setInterval(checkServerConfig, 3 * 60 * 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('fastarc:check-updates', handleTriggerEvent);
      window.removeEventListener('fastarc_trigger_update_prompt', handleTriggerEvent);
      window.removeEventListener('fastarc:test-update-prompt', handleTriggerEvent);
      clearInterval(interval);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const effectiveInstallUrl = 
    propInstallUrl || 
    configInstallUrl || 
    (typeof window !== 'undefined' ? `${window.location.origin}/?mode=app&source=pwa` : '/?mode=app&source=pwa');

  const handleUpdateNow = (e?: React.MouseEvent) => {
    // Record version as installed
    if (newVersion) {
      localStorage.setItem('fastarc_installed_app_version', newVersion);
      localStorage.setItem('fastarc_app_version', newVersion);
    }
    sessionStorage.removeItem('fastarc_update_skipped');

    // Invalidate service worker cache to pull newest bundle
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
        console.warn('PWA prompt invocation:', err);
      }
    }

    setShowUpdate(false);

    // If external install URL or special app mode, navigate appropriately
    if (effectiveInstallUrl && !effectiveInstallUrl.startsWith('javascript:')) {
      if (effectiveInstallUrl.startsWith('http') || effectiveInstallUrl.startsWith('/')) {
        window.location.href = effectiveInstallUrl;
      }
    }
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
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      {/* Compact High-Contrast Modal Window */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-slate-950 border-2 border-amber-500/80 rounded-3xl shadow-2xl shadow-black/95 p-5 sm:p-6 text-center overflow-hidden ring-4 ring-amber-500/20 animate-in zoom-in-95 duration-200">
        
        {/* Top Gold Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* High-Contrast Icon Badge */}
        <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          <Sparkles className="w-7 h-7 animate-pulse text-amber-400" />
        </div>

        {/* Version Pill */}
        <div className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 mb-2 shadow-sm">
          {newVersion ? `v${newVersion} Ready` : 'Update Available'}
        </div>

        {/* Title & Body */}
        <h3 id="update-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
          Update {appName}
        </h3>
        <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1.5 mb-5 px-1">
          A new version is available with the latest government jobs, fast results, and performance upgrades.
        </p>

        {/* Exactly Two Buttons: 'Skip' and 'Update Now' */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 px-3 bg-slate-800/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Skip
          </button>

          <a
            href={effectiveInstallUrl}
            onClick={handleUpdateNow}
            className="w-full py-3 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Update Now
          </a>
        </div>
      </div>
    </div>
  );
}
