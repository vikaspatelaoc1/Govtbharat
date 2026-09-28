import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  siteLogo?: string;
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  siteLogo = '/logo.png',
  onFinish,
  duration = 900
}) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasShown = sessionStorage.getItem('GovtBharat_splash_shown');
        if (hasShown === 'true') {
          return false;
        }
      } catch (e) { /* ignore */ }
    }
    return true;
  });

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('GovtBharat_splash_shown', 'true');
        } catch (e) { /* ignore */ }
      }
      onFinish?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden"
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />

          {/* Centered Circular Logo Container */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="relative flex flex-col items-center"
          >
            {/* Pulsing Outer Ring */}
            <div className="absolute inset-0 -m-3 rounded-full border-2 border-amber-500/30 animate-ping pointer-events-none opacity-40" />

            {/* Glowing Golden Circle Badge */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-black border-3 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.45)] flex items-center justify-center overflow-hidden">
              <img
                src={siteLogo}
                alt="GovtBharat Logo"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://lh3.googleusercontent.com/d/1IE6MQ8EUwyKmGeXnpLTXx7d5HBLJiKb4';
                }}
              />
            </div>

            {/* Portal Title & Tagline */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="text-center mt-4"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
                Fast
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300">
                  Arc
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-amber-400 font-extrabold tracking-widest uppercase mt-1">
                Jobs Portal
              </p>
            </motion.div>

            {/* Subtle Loading Dots */}
            <div className="flex items-center gap-1.5 mt-5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
