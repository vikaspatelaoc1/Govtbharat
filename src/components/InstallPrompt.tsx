import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [appName, setAppName] = useState('GovtBharat');

  useEffect(() => {
    // Fetch appName from config
    fetch('/api/v1/site-config')
      .then(res => res.json())
      .then(data => {
        if (data.siteConfig?.appName) {
          setAppName(data.siteConfig.appName);
        }
      })
      .catch(console.warn);

    // Check if the user is on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if it's already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent Chrome 67+ from showing the auto-prompt
      setDeferredPrompt(e); // Stash the event so it can be triggered later.
      setIsInstallable(true);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
        try {
          localStorage.setItem('GovtBharat_app_view', 'app');
          window.dispatchEvent(new CustomEvent('GovtBharat_toggle_app_mode', { detail: { mode: 'app' } }));
        } catch (e) {}
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-4 w-full">
        <img src="/logo.png" alt="GovtBharat App Icon" className="w-12 h-12 rounded-xl object-contain bg-black p-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Install {appName} App</h4>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-snug">
            {isIOS ? 'Tap Share and select "Add to Home Screen" to install.' : 'Get the app on your home screen for a better experience.'}
          </p>
        </div>
        <button 
          onClick={() => setShowPrompt(false)} 
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0 self-start sm:self-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {!isIOS && isInstallable && (
        <button 
          onClick={handleInstallClick}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-black rounded-xl uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Install Now
        </button>
      )}
      
      {isIOS && (
        <div className="w-full sm:w-auto px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
          <Share className="w-4 h-4" /> Add to Home Screen
        </div>
      )}
    </div>
  );
}
