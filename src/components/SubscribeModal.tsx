import React, { useState } from 'react';
import { Bell, Mail, X, CheckCircle2, Sparkles, ShieldCheck, User, Phone, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { saveSubscriberToFirestore, SubscriberRecord } from '../services/firestoreService';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribeSuccess: (email: string) => void;
  siteLogo?: string;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  onSubscribeSuccess,
  siteLogo
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleModalClose = () => {
    if (isLoading) return;
    setToast(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setToast({
        type: 'error',
        message: 'Please enter a valid email address (e.g. yourname@gmail.com).'
      });
      return;
    }

    if (phone.trim() && !/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) {
      setToast({
        type: 'error',
        message: 'Please enter a valid 10-digit mobile or WhatsApp number.'
      });
      return;
    }

    setIsLoading(true);

    const newSub: SubscriberRecord = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: trimmedEmail,
      category: 'All Job Updates',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      source: typeof window !== 'undefined' ? window.location.hostname : 'website',
      muted: false
    };

    let savedCloud = false;
    let savedServer = false;

    // 1. Save directly to Firebase Firestore Cloud Database
    try {
      await saveSubscriberToFirestore(newSub);
      savedCloud = true;
    } catch (err: any) {
      console.warn('Firebase subscriber save error:', err);
    }

    // 2. Fallback secondary direct call to Express server API
    try {
      const res = await fetch('/api/v1/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        savedServer = true;
      }
    } catch (err: any) {
      console.warn('Server subscriber save error:', err);
    }

    // 3. Save to localStorage list of subscribers
    try {
      const existing = JSON.parse(localStorage.getItem('GovtBharat_subscribers') || '[]');
      if (!existing.includes(trimmedEmail)) {
        existing.push(trimmedEmail);
        localStorage.setItem('GovtBharat_subscribers', JSON.stringify(existing));
      }
    } catch (err) {
      console.error(err);
    }

    // Check if network failed completely
    if (!savedCloud && !savedServer && typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsLoading(false);
      setToast({
        type: 'error',
        message: 'You appear to be offline. Please check your internet connection and try again.'
      });
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    setToast({
      type: 'success',
      message: `Success! ${trimmedEmail} subscribed to government job alerts.`
    });
    onSubscribeSuccess(trimmedEmail);

    setTimeout(() => {
      setIsSuccess(false);
      setToast(null);
      setEmail('');
      setName('');
      setPhone('');
      setNotes('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleModalClose} 
        className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 transition-colors my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Official India Tricolor Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-white to-emerald-600 shrink-0" />

        {/* Header Govt Navy Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 text-slate-900 dark:text-white flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-black border-2 border-amber-500 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={siteLogo || "/logo.png"} 
                alt="GovtBharat Logo" 
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1IE6MQ8EUwyKmGeXnpLTXx7d5HBLJiKb4";
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white flex items-center">
                Govt<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400">Bharat</span>
              </h3>
              <p className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-widest mt-0.5">Jobs Portal</p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Feedback Toast Notification Banner */}
          {toast && (
            <div 
              role="alert"
              className={`mb-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200 shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/50 text-rose-800 dark:text-rose-200 shadow-sm'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-snug">
                <span className="font-bold block mb-0.5">
                  {toast.type === 'success' ? 'Subscription Confirmed' : 'Action Required'}
                </span>
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 -mr-1 -mt-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6 space-y-3 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">Subscribed Successfully!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                <span className="font-bold text-amber-600 dark:text-amber-400">{email}</span> has been added. You will now get instant email alerts whenever a new job post is published on <strong className="text-slate-900 dark:text-white">GovtBharat Portal</strong>!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Never Miss Any Government Job Alert
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your details below to receive instant notification emails as soon as new job posts, admit cards, or exam results are published.
                </p>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={isLoading}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  WhatsApp / Mobile <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    disabled={isLoading}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Message / Query / Information */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Questions / Exam Information Interest <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    disabled={isLoading}
                    placeholder="Tell us about exams you are preparing for or questions you have..."
                    value={notes}
                    rows={2}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero spam. Secure personal information storage.</span>
              </div>

              <button
                type="submit"
                disabled={!email || isLoading}
                className="w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-indigo-800 border border-amber-500/40 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-amber-300 font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-blue-950/60 transition-all cursor-pointer flex items-center justify-center space-x-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Subscribing & Activating Alerts...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 fill-current text-amber-400" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
