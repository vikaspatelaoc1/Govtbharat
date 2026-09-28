import { getDomainName, getDomainNameLowercase, DOMAIN_CHANGE_EVENT } from '../utils/domain';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, Bell, Check, Mail, Share2, ExternalLink, FileText, Globe, 
  Copy, CheckCheck, ArrowLeft, Calendar, DollarSign, Clock, GraduationCap, 
  Building2, Users, FileCheck, CheckCircle2, ChevronRight, ShieldCheck, 
  Sparkles, AlertCircle, ArrowUp, Send, Eye, Download, Search, Info
} from 'lucide-react';
import { JobAlert, SocialLinkItem, SuperAdminTabType } from '../types';
import { Header } from './Header';
import { enrichJobDetails, formatLongDate, cleanOfficialUrl } from '../utils/jobEnricher';
import { getCategoryWiseJobLinks } from '../utils/sarkariLinks';
import { SafeExternalLink } from './SafeExternalLink';
import { openJobInNewTab, getJobDetailUrl } from '../utils/jobUrl';
import { openInDefaultBrowser, isStandaloneApp } from '../utils/urlUtils';
import { updateJobDetailSeo } from '../utils/seo';
import { saveSubscriberToFirestore, SubscriberRecord } from '../services/firestoreService';
import { OfficialSocialLogo } from './SocialIcons';

interface JobDetailsPageProps {
  job: JobAlert | null;
  allJobs: JobAlert[];
  isApplication?: boolean;
  onBackToHome: () => void;
  onSelectJob?: (jobId: string) => void;
  siteLogo?: string;
  socialLinks?: SocialLinkItem[];
  isDarkMode: boolean;
  themeMode?: 'light' | 'dark' | 'system';
  onSetThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
  onToggleDarkMode: () => void;
  onAdminLoginClick: () => void;
  isLoggedIn: boolean;
  isSuperAdmin?: boolean;
  employeeName?: string;
  onOpenSuperAdminModal?: (tab?: SuperAdminTabType) => void;
  onOpenNpmSystem?: () => void;
  onLogout: () => void;
  onInfoClick: (pageId: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenSubscribeModal?: () => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({
  job: rawJob,
  allJobs,
  isApplication = false,
  onBackToHome,
  onSelectJob,
  siteLogo = "/logo.png",
  socialLinks = [],
  isDarkMode,
  themeMode = 'system',
  onSetThemeMode,
  onToggleDarkMode,
  onAdminLoginClick,
  isLoggedIn,
  isSuperAdmin,
  employeeName,
  onOpenSuperAdminModal,
  onOpenNpmSystem,
  onLogout,
  onInfoClick,
  onSelectCategory,
  onOpenSubscribeModal
}) => {
  // Always enrich job details so NO field is missing or broken
  const job = useMemo(() => {
    if (!rawJob) return null;
    return enrichJobDetails(rawJob);
  }, [rawJob]);

  // Guaranteed category-wise official working links matching Sarkari Result & Sarkari Naukri portals
  const categoryWiseLinks = useMemo(() => {
    if (!job) return [];
    return getCategoryWiseJobLinks(job);
  }, [job]);

  const applyLink = useMemo(() => {
    return categoryWiseLinks.find(l => l.type === 'apply')?.actionUrl || job?.links?.apply || 'https://www.india.gov.in';
  }, [categoryWiseLinks, job]);

  const notificationLink = useMemo(() => {
    return categoryWiseLinks.find(l => l.type === 'notification')?.actionUrl || job?.links?.notification || 'https://www.india.gov.in';
  }, [categoryWiseLinks, job]);

  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string>(getDomainName);

  useEffect(() => {
    const handleDomainChange = () => {
      setCurrentDomain(getDomainName());
    };
    window.addEventListener(DOMAIN_CHANGE_EVENT, handleDomainChange);
    window.addEventListener('storage', handleDomainChange);
    return () => {
      window.removeEventListener(DOMAIN_CHANGE_EVENT, handleDomainChange);
      window.removeEventListener('storage', handleDomainChange);
    };
  }, []);

  // Update SEO Title & Meta tags dynamically
  useEffect(() => {
    if (job) {
      updateJobDetailSeo(job);
      window.scrollTo(0, 0);
    }
  }, [job]);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 2500);
    } catch {
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 2500);
    }
  };

  const handleShare = async () => {
    if (!job) return;
    const url = getJobDetailUrl(job);
    const shareData = {
      title: `${job.title} - GovtBharat`,
      text: `${job.title}\nCheck full details, eligibility, dates & apply online:\n`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Share error:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}${shareData.url}`);
        setCopiedLinkType('page');
        setTimeout(() => setCopiedLinkType(null), 2500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail && trimmedEmail.includes('@')) {
      const categoryLabel = job.category.replace('-', ' ');
      const newSub: SubscriberRecord = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: trimmedEmail.toLowerCase(),
        category: categoryLabel.toUpperCase(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        source: typeof window !== 'undefined' ? window.location.hostname : 'job_details_page',
        muted: false
      };

      try {
        await saveSubscriberToFirestore(newSub);
      } catch (err) {
        console.warn('Firestore subscriber save error:', err);
      }

      try {
        await fetch('/api/v1/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSub)
        });
      } catch (err) {
        console.warn('Server subscriber save error:', err);
      }

      setSubscriptionStatus(`Subscribed! You will receive email alerts for ${categoryLabel} updates.`);
      setEmailInput('');
    }
  };

  // Related jobs
  const relatedJobs = useMemo(() => {
    if (!job || !allJobs) return [];
    return allJobs
      .filter(j => j.id !== job.id && (j.category === job.category || j.state === job.state))
      .slice(0, 8);
  }, [job, allJobs]);

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <div 
          className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <Header 
            themeMode={themeMode}
            onSetThemeMode={onSetThemeMode}
            onToggleDarkMode={onToggleDarkMode}
            isDarkMode={isDarkMode}
            onAdminLoginClick={onAdminLoginClick}
            isLoggedIn={isLoggedIn}
            isSuperAdmin={isSuperAdmin}
            employeeName={employeeName}
            onOpenSuperAdminModal={onOpenSuperAdminModal}
            onOpenNpmSystem={onOpenNpmSystem}
            onLogout={onLogout}
            onInfoClick={onInfoClick}
            activeTab="latest-jobs"
            onTabChange={(tab) => {
              onSelectCategory(tab);
              onBackToHome();
            }}
            socialLinks={socialLinks}
            siteLogo={siteLogo}
          />
        </div>
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">Job Alert Not Found</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              The requested recruitment notice might have been removed, updated, or the link is expired.
            </p>
            <button
              onClick={onBackToHome}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Latest Jobs</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  const categoryLabel = job.category.replace('-', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans print:bg-white print:text-black">
      {/* 1. Standard GovtBharat Full-width Responsive Header */}
      <div 
        className="print:hidden sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <Header 
          themeMode={themeMode}
          onSetThemeMode={onSetThemeMode}
          onToggleDarkMode={onToggleDarkMode}
          isDarkMode={isDarkMode}
          onAdminLoginClick={onAdminLoginClick}
          isLoggedIn={isLoggedIn}
          isSuperAdmin={isSuperAdmin}
          employeeName={employeeName}
          onOpenSuperAdminModal={onOpenSuperAdminModal}
          onOpenNpmSystem={onOpenNpmSystem}
          onLogout={onLogout}
          onInfoClick={onInfoClick}
          activeTab={job.category}
          onTabChange={(tab) => {
            onSelectCategory(tab);
            onBackToHome();
          }}
          socialLinks={socialLinks}
          siteLogo={siteLogo}
        />
      </div>

      {/* 2. Top Breadcrumbs & Utility Bar */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs print:hidden">
        <div className="w-full px-3 sm:px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <button 
              onClick={onBackToHome}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              onClick={() => {
                onSelectCategory(job.category);
                onBackToHome();
              }}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors capitalize cursor-pointer font-bold text-amber-600 dark:text-amber-400"
            >
              {job.category.replace('-', ' ')}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
              {job.title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share on Social Media or Copy Link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-700/50 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLinkType === 'page' ? 'Link Copied!' : 'Share Job'}</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Official Page Format"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Main Content Container */}
      <main className="flex-1 w-full px-3 sm:px-4 md:px-6 py-6 md:py-8 space-y-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
        
        {/* SARKARI RESULT OFFICIAL FORMATTED JOB POSTING CARD */}
        <article className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden print:border-none print:shadow-none">
          
          {/* Top Header Section (Matching Sarkari Result Screenshot style) */}
          <div className="p-4 sm:p-6 text-center border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/90 dark:to-slate-900">
            {/* Organization / Department Highlight */}
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#d91e63] dark:text-[#f472b6] tracking-tight uppercase mb-2">
              {job.orgName}
            </h2>

            {/* Main Job Title in Forest Green / Emerald */}
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#059669] dark:text-[#34d399] leading-tight max-w-4xl mx-auto mb-2">
              {job.title}
            </h1>

            {/* Sub-heading Notification Line */}
            <p className="text-sm sm:text-base font-bold text-[#c026d3] dark:text-[#e879f9] mb-3">
              {job.postName || job.title} : Short Details of Notification
            </p>

            {/* GovtBharat Official Branding Stamp in Sarkari Red */}
            <div className="inline-block py-1 px-4 rounded-md my-1 font-black text-sm sm:text-base text-[#dc2626] dark:text-[#f87171] uppercase tracking-wider">
              GovtBharat RESULT OFFICIAL
              <div className="text-xs sm:text-sm font-extrabold tracking-widest text-[#b91c1c] dark:text-[#ef4444]">
                {currentDomain.toUpperCase()}
              </div>
            </div>

            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] sm:text-xs">
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md font-bold border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>State/Region: <strong>{job.state}</strong></span>
              </span>

              {job.advtNo && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                  Advt No: <strong>{job.advtNo}</strong>
                </span>
              )}

              {job.totalVacancies && (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-md font-extrabold border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Total Vacancies: <strong>{job.totalVacancies}</strong></span>
                </span>
              )}

              <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2.5 py-1 rounded-md font-bold border border-rose-200 dark:border-rose-800/60">
                Status: <strong>{job.status || 'Application Open'}</strong>
              </span>

              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Last Updated: <strong>{job.lastUpdated}</strong>
              </span>
            </div>

            {/* Quick Hero Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 print:hidden">
              <a
                href={applyLink}
                target="_blank"
                rel="noopener noreferrer external"
                onClick={(e) => {
                  if (isStandaloneApp()) {
                    e.preventDefault();
                    openInDefaultBrowser(applyLink, e);
                  }
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Online Direct</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href={notificationLink}
                target="_blank"
                rel="noopener noreferrer external"
                onClick={(e) => {
                  if (isStandaloneApp()) {
                    e.preventDefault();
                    openInDefaultBrowser(notificationLink, e);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Notification</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            
            {/* 4. Short Description / Brief Info */}
            {job.shortInfo && (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                <h3 className="font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-xs mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Short Information :</span>
                </h3>
                <p>{job.shortInfo}</p>
              </div>
            )}

            {/* 5. Sarkari Result 2-Column Table: Important Dates & Application Fee */}
            <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-slate-300 dark:divide-slate-700">
                
                {/* Left Column: Important Dates */}
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-900">
                  <h3 className="text-center font-black text-base sm:text-lg text-[#059669] dark:text-[#34d399] pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Important Dates</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">• Application Begin :</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{job.dates?.start || 'Active Now'}</strong>
                    </li>
                    <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-[#dc2626] dark:text-[#f87171]">• Last Date for Apply Online :</span>
                      <strong className="text-[#dc2626] dark:text-[#f87171] font-black">{job.dates?.last || 'Notify Soon'}</strong>
                    </li>
                    <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">• Last Date Pay Exam Fee :</span>
                      <strong className="text-slate-900 dark:text-white">{job.dates?.feeLast || job.dates?.last || 'As per Schedule'}</strong>
                    </li>
                    {job.dates?.correctionDate && (
                      <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">• Correction Date :</span>
                        <strong className="text-slate-900 dark:text-white">{job.dates.correctionDate}</strong>
                      </li>
                    )}
                    {job.dates?.examDate && (
                      <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">• Exam Date :</span>
                        <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{job.dates.examDate}</strong>
                      </li>
                    )}
                    {job.dates?.admitCardDate && (
                      <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">• Admit Card Available :</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{job.dates.admitCardDate}</strong>
                      </li>
                    )}
                    {job.dates?.answerKeyDate && (
                      <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">• Answer Key Released :</span>
                        <strong className="text-purple-600 dark:text-purple-400 font-bold">{job.dates.answerKeyDate}</strong>
                      </li>
                    )}
                    {job.dates?.resultDate && (
                      <li className="flex items-start justify-between gap-2 py-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">• Result Declared :</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-black">{job.dates.resultDate}</strong>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Right Column: Application Fee */}
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-900">
                  <h3 className="text-center font-black text-base sm:text-lg text-[#059669] dark:text-[#34d399] pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Application Fee</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">• General / OBC / EWS :</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{job.fees?.general || '₹100/-'}</strong>
                    </li>
                    <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">• SC / ST / PwD (PH) :</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{job.fees?.scSt || '₹0/- (Exempted)'}</strong>
                    </li>
                    {job.fees?.female && (
                      <li className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">• All Category Female :</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{job.fees.female}</strong>
                      </li>
                    )}
                    <li className="py-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 mt-2">
                      <strong className="text-slate-900 dark:text-slate-200 font-bold block mb-1">💳 Payment Mode :</strong>
                      {job.fees?.paymentMode || 'Pay the Exam Fee Through Online Mode (Debit Card / Credit Card / Net Banking / UPI / E-Challan).'}
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* 6. Age Limit Section */}
            {job.ageLimit && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-center font-black text-base sm:text-lg text-[#d91e63] dark:text-[#f472b6] mb-3 uppercase tracking-wider flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{job.postName || job.title} : Age Limit Details</span>
                </h3>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1.5 max-w-3xl mx-auto">
                  {typeof job.ageLimit === 'string' ? (
                    <p className="font-semibold leading-relaxed text-center sm:text-left">{job.ageLimit}</p>
                  ) : (
                    <ul className="space-y-1.5 list-disc list-inside">
                      {job.ageLimit.min && <li>Minimum Age : <strong>{job.ageLimit.min} Years</strong></li>}
                      {job.ageLimit.max && <li>Maximum Age : <strong>{job.ageLimit.max} Years</strong></li>}
                      {job.ageLimit.asOn && <li>Age as on : <strong>{job.ageLimit.asOn}</strong></li>}
                      {job.ageLimit.relaxation && <li>Age Relaxation : <strong>{job.ageLimit.relaxation}</strong></li>}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* 7. Eligibility Criteria */}
            {job.eligibility && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-center font-black text-base sm:text-lg text-[#059669] dark:text-[#34d399] mb-3 uppercase tracking-wider flex items-center justify-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Educational Qualification & Eligibility Criteria</span>
                </h3>
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-w-3xl mx-auto space-y-2">
                  <p className="font-semibold">{job.eligibility}</p>
                  {job.qualifications && job.qualifications.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {job.qualifications.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* 8. Post-Wise Vacancy / Category Breakdown Table (Matching Screenshot) */}
            {job.postWiseVacancies && job.postWiseVacancies.length > 0 && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#059669] dark:bg-emerald-800 text-white font-black text-center py-2.5 px-4 text-xs sm:text-sm uppercase tracking-wider">
                  Vacancy Details : Total {job.totalVacancies || 'Multiple'} Posts
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[420px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-extrabold border-b border-slate-300 dark:border-slate-700">
                        <th className="p-3 border-r border-slate-300 dark:border-slate-700">Post Name</th>
                        <th className="p-3 border-r border-slate-300 dark:border-slate-700 text-center">Total Post</th>
                        <th className="p-3">Eligibility Criteria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {job.postWiseVacancies.map((pv, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700">
                            {pv.postName}
                          </td>
                          <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-center border-r border-slate-300 dark:border-slate-700">
                            {pv.total || '-'}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">
                            {pv.eligibility || job.eligibility || 'As per Official Notification'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Category-Wise Vacancy Reservation Breakdown Table */}
            {job.postWiseVacancies && job.postWiseVacancies.length > 0 && job.postWiseVacancies.some(pv => pv.general !== undefined) && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#1d4ed8] dark:bg-blue-800 text-white font-black text-center py-2.5 px-4 text-xs sm:text-sm uppercase tracking-wider">
                  Category-Wise Vacancy Reservation Details
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-center text-xs sm:text-sm border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-extrabold border-b border-slate-300 dark:border-slate-700">
                        <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700">Post Name</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">UR (Gen)</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">EWS</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">OBC</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">SC</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">ST</th>
                        <th className="p-2.5 font-black text-emerald-600 dark:text-emerald-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {job.postWiseVacancies.map((pv, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 text-left font-bold text-slate-900 dark:text-slate-100 border-r border-slate-300 dark:border-slate-700">
                            {pv.postName}
                          </td>
                          <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 font-semibold">{pv.general ?? '-'}</td>
                          <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 font-semibold">{pv.ews ?? '-'}</td>
                          <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 font-semibold">{pv.obc ?? '-'}</td>
                          <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 font-semibold">{pv.sc ?? '-'}</td>
                          <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 font-semibold">{pv.st ?? '-'}</td>
                          <td className="p-2.5 font-extrabold text-emerald-600 dark:text-emerald-400">{pv.total ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 9. Subjects Available Table (If UGC NET / Academic Job - Matching Screenshot 2 & 3) */}
            {job.subjects && job.subjects.length > 0 && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#d91e63] dark:bg-pink-800 text-white font-black text-center py-2.5 px-4 text-xs sm:text-sm uppercase tracking-wider">
                  Subject Available & Code List
                </div>
                <div className="overflow-x-auto max-h-96 custom-scrollbar">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[440px]">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold border-b border-slate-300 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-center w-16">S No.</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">Subject Name</th>
                        <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-center w-16">S No.</th>
                        <th className="p-2.5">Subject Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {Array.from({ length: Math.ceil(job.subjects.length / 2) }).map((_, rIdx) => {
                        const s1 = job.subjects![rIdx];
                        const s2 = job.subjects![rIdx + Math.ceil(job.subjects!.length / 2)];
                        return (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-center font-bold border-r border-slate-300 dark:border-slate-700 text-slate-500">
                              {s1 ? s1.sno : ''}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-300 dark:border-slate-700">
                              {s1 ? s1.name : ''}
                            </td>
                            <td className="p-2.5 text-center font-bold border-r border-slate-300 dark:border-slate-700 text-slate-500">
                              {s2 ? s2.sno : ''}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                              {s2 ? s2.name : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 10. Selection Process & Salary / Pay Scale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.selectionProcess && job.selectionProcess.length > 0 && (
                <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm">
                  <h3 className="font-black text-sm sm:text-base text-indigo-600 dark:text-indigo-400 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span>Selection Process</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {job.selectionProcess.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">✔</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(job.payScale || job.salary) && (
                <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm">
                  <h3 className="font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Pay Scale / Salary Information</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {job.payScale || job.salary}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    * Plus DA, HRA, Transport Allowance, Medical Benefits as admissible under Govt Rules.
                  </p>
                </div>
              )}
            </div>

            {/* 11. How to Apply Step-by-Step Instructions */}
            {job.howToApply && job.howToApply.length > 0 && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-center font-black text-base sm:text-lg text-[#059669] dark:text-[#34d399] mb-3 uppercase tracking-wider flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>How to Fill {job.postName || job.title} Online Form</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 list-disc list-inside leading-relaxed max-w-4xl mx-auto">
                  {job.howToApply.map((step, idx) => (
                    <li key={idx} className="pl-1">{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 12. Required Documents Checklist */}
            {job.importantDocuments && job.importantDocuments.length > 0 && (
              <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="font-black text-sm sm:text-base text-[#d91e63] dark:text-[#f472b6] mb-3 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Important Documents to Keep Ready</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {job.importantDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 13. SARKARI RESULT "SOME USEFUL IMPORTANT LINKS" TABLE (Matching Screenshot) */}
            <div id="important-links" className="border-2 border-slate-400 dark:border-slate-600 rounded-xl overflow-hidden shadow-md">
              <div className="bg-[#059669] dark:bg-emerald-800 text-white font-black text-center py-3 px-4 text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2">
                <span>Some Useful Important Links</span>
              </div>

              <div className="divide-y-2 divide-slate-300 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {categoryWiseLinks.map((row) => (
                  <div 
                    key={row.id} 
                    className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-300 dark:divide-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Left Column: Category Title (e.g. APPLY ONLINE, DOWNLOAD NOTIFICATION, etc.) */}
                    <div className={`p-3.5 sm:p-4 font-black ${row.colorClass || 'text-[#d91e63] dark:text-[#f472b6]'} text-xs sm:text-sm uppercase flex flex-wrap items-center justify-between gap-1.5`}>
                      <a
                        href={row.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer external"
                        onClick={(e) => {
                          if (isStandaloneApp()) {
                            e.preventDefault();
                            openInDefaultBrowser(row.actionUrl, e);
                          }
                        }}
                        className="hover:underline flex items-center gap-1.5 cursor-pointer text-inherit"
                        title={`Click to open ${row.categoryTitle} in default browser`}
                      >
                        <span>{row.categoryTitle}</span>
                      </a>

                      {row.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700 normal-case ml-2 shrink-0">
                          {row.badge}
                        </span>
                      )}
                    </div>

                    {/* Right Column: Action Links (e.g. Click Here | Server II) */}
                    <div className="p-3.5 sm:p-4 font-extrabold text-[#1d4ed8] dark:text-[#60a5fa] text-xs sm:text-sm flex items-center justify-start gap-3 flex-wrap">
                      <a
                        href={row.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer external"
                        onClick={(e) => {
                          if (isStandaloneApp()) {
                            e.preventDefault();
                            openInDefaultBrowser(row.actionUrl, e);
                          }
                        }}
                        className={`hover:underline flex items-center gap-1.5 cursor-pointer ${!row.isExternal ? 'text-amber-600 dark:text-amber-400' : ''}`}
                        title="Open page in default browser"
                      >
                        <span>{row.actionText}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                      </a>

                      {row.server2Url && (
                        <>
                          <span className="text-slate-400 font-normal">|</span>
                          <a
                            href={row.server2Url}
                            target="_blank"
                            rel="noopener noreferrer external"
                            onClick={(e) => {
                              if (isStandaloneApp()) {
                                e.preventDefault();
                                openInDefaultBrowser(row.server2Url!, e);
                              }
                            }}
                            className="hover:underline flex items-center gap-1.5 cursor-pointer"
                            title="Open Server II in default browser"
                          >
                            <span>{row.server2Text || 'Server II'}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 14. Real-time Email Notification Alert Box */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 transition-all print:hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      Get Free Email Alerts for <span className="text-amber-600 dark:text-amber-400 capitalize">{job.category.replace('-', ' ')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Never miss an exam date, admit card release, or result notification.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={notifyEnabled} 
                    onChange={(e) => {
                      setNotifyEnabled(e.target.checked);
                      if (!e.target.checked) setSubscriptionStatus(null);
                    }} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {notifyEnabled && (
                <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/60">
                  {subscriptionStatus ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{subscriptionStatus}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="Enter your email address"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* 15. Source Verification & Disclaimer */}
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 p-4 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p><strong>Official Source :</strong> {job.officialSource || job.orgName} Portal.</p>
              <p><strong>Disclaimer :</strong> GovtBharat is an educational information portal. While all details are verified against official recruitment notices, candidates are advised to verify details on the official commission website before applying.</p>
            </div>

          </div>
        </article>

        {/* 16. Dynamic Related Jobs Section */}
        {relatedJobs.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm print:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Related {job.category.replace('-', ' ').toUpperCase()} Updates</span>
              </h3>
              <button
                onClick={() => {
                  onSelectCategory(job.category);
                  onBackToHome();
                }}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {relatedJobs.map((rj) => (
                <div
                  key={rj.id}
                  onClick={() => {
                    if (onSelectJob) {
                      onSelectJob(rj.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      openJobInNewTab(rj);
                    }
                  }}
                  className="p-3 bg-slate-50 hover:bg-amber-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded uppercase inline-block mb-1.5">
                      {rj.category.replace('-', ' ')}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {rj.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                    <span>📅 {rj.postDate}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Back to Top"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer print:hidden"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* 17. Standard Full-width GovtBharat Footer (Hidden on Mobile/PWA Job Details, unchanged on Desktop) */}
      {!isApplication && (
        <footer className="hidden md:block custom-footer-override relative bg-slate-900 pt-0 pb-8 mt-12 transition-colors duration-300 print:hidden overflow-hidden">
        {/* Tricolor Border Line matching image (Saffron -> White -> Green) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38] shadow-sm mb-4 sm:mb-5" />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
            <div className="space-y-3.5">
              {onOpenSubscribeModal && (
                <button
                  onClick={onOpenSubscribeModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-indigo-800 text-amber-300 text-sm sm:text-[15px] font-black px-4.5 py-2.5 rounded-xl shadow-md shadow-blue-950/80 border border-amber-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                  title="Click to subscribe for email notifications of all new job posts"
                >
                  <Bell className="w-4.5 h-4.5 fill-current text-amber-400 animate-bounce group-hover:rotate-12 transition-transform" />
                  <span>Subscribe</span>
                </button>
              )}

              <a 
                href="#" 
                className="flex items-center space-x-3 group cursor-pointer" 
                onClick={(e) => {
                  e.preventDefault();
                  onBackToHome();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="GovtBharat Portal - Back to Home"
              >
                <div className="w-13 h-13 sm:w-15 sm:h-15 lg:w-16 lg:h-16 rounded-full p-0.5 bg-black border-2 border-amber-500 shadow-md flex items-center justify-center overflow-hidden shrink-0 transform group-hover:scale-105 transition-transform duration-200">
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
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                    Govt<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300">Bharat</span>
                  </h4>
                  <p className="text-xs sm:text-[13px] text-amber-400 font-extrabold tracking-wider uppercase mt-1">Jobs Portal</p>
                </div>
              </a>

              <p className="text-slate-300 text-sm sm:text-[14.5px] leading-relaxed">
                GovtBharat Portal offers lightning-fast notification updates for Central & State Government examinations, admit cards, answer keys, results, and curriculum PDF patterns.
              </p>
            </div>
            <div>
              <h5 className="font-black text-white mb-4 text-sm sm:text-[15px] uppercase tracking-wider">Job Portals</h5>
              <ul className="space-y-3.5 text-sm sm:text-[14.5px] text-slate-300">
                <li>
                  <button 
                    onClick={() => { onSelectCategory('results'); onBackToHome(); }} 
                    className="hover:text-amber-400 text-left transition-colors cursor-pointer font-medium"
                  >
                    Results Alerts
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { onSelectCategory('admit-cards'); onBackToHome(); }} 
                    className="hover:text-amber-400 text-left transition-colors cursor-pointer font-medium"
                  >
                    Admit Card Alerts
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { onSelectCategory('latest-jobs'); onBackToHome(); }} 
                    className="hover:text-amber-400 text-left transition-colors cursor-pointer font-medium"
                  >
                    Latest Sarkari Jobs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { onSelectCategory('admission'); onBackToHome(); }} 
                    className="hover:text-amber-400 text-left transition-colors cursor-pointer font-medium"
                  >
                    Admission Updates
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-white mb-4 text-sm sm:text-[15px] uppercase tracking-wider">Policy & Information</h5>
              <ul className="space-y-3.5 text-sm sm:text-[14.5px] text-slate-300">
                <li>
                  <button 
                    onClick={() => onInfoClick('privacy')} 
                    className="hover:text-amber-400 text-left transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <span>Privacy Policy</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-black px-1.5 py-0.5 rounded">AdSense</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onInfoClick('disclaimer')} 
                    className="hover:text-amber-400 text-left transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <span>Disclaimer (Non-Govt)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onInfoClick('terms')} 
                    className="hover:text-amber-400 text-left transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <span>Terms & Conditions</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onInfoClick('about')} 
                    className="hover:text-amber-400 text-left transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <span>About Us & Editorial Team</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onInfoClick('contact')} 
                    className="hover:text-amber-400 text-left transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <span>Contact Us & Grievance</span>
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-amber-500 mb-4 text-sm sm:text-[15px] uppercase tracking-wider flex items-center justify-between">
                <span>Disclaimer</span>
                <button 
                  onClick={() => onInfoClick('disclaimer')}
                  className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Read Policy →
                </button>
              </h5>
              <p className="text-sm sm:text-[14px] text-slate-300 leading-relaxed font-normal">
                GovtBharat is an independent career news aggregator. We are NOT associated with UPSC, SSC, NTA, or any government agency. Always cross-verify exam details on official commission platforms before submitting application fees.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; 2026 {getDomainName()} - GovtBharat. All Rights Reserved.</p>
            <div className="flex items-center gap-3">
              {socialLinks.filter(l => l.enabled).map(item => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-slate-300 hover:text-white"
                  title={item.title}
                >
                  <OfficialSocialLogo platform={item.platform} className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
};
