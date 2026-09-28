import { getDomainName, getDomainNameLowercase } from '../utils/domain';
import React, { useState, useEffect } from 'react';
import { Printer, Bell, Check, Mail, Share2, Link as LinkIcon, ExternalLink, FileText, Globe, Copy, CheckCheck, DollarSign } from 'lucide-react';
import { JobAlert } from '../types';
import { saveSubscriberToFirestore, SubscriberRecord } from '../services/firestoreService';
import { openInDefaultBrowser, isStandaloneApp } from '../utils/urlUtils';

interface JobDetailModalProps {
  job: JobAlert | null;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose }) => {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  useEffect(() => {
    if (!job) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  const formatAgeLimit = (age: any): string => {
    if (!age) return '-';
    if (typeof age === 'string') return age;
    if (typeof age === 'object') {
      const parts: string[] = [];
      if (age.min) parts.push(`Min: ${age.min} Yrs`);
      if (age.max) parts.push(`Max: ${age.max} Yrs`);
      if (age.asOn) parts.push(`(as on ${age.asOn})`);
      if (age.relaxation) parts.push(`Relaxation: ${age.relaxation}`);
      if (age.details) parts.push(age.details);
      return parts.length > 0 ? parts.join(' | ') : '-';
    }
    return String(age);
  };

  const normalizeJobLink = (rawUrl?: string, fallbackQuery?: string): string => {
    if (!rawUrl || !rawUrl.trim() || rawUrl.trim() === '#') {
      if (fallbackQuery) {
        return `https://www.google.com/search?q=${encodeURIComponent(fallbackQuery)}`;
      }
      return 'https://www.google.com';
    }
    const clean = rawUrl.trim();
    if (/^https?:\/\//i.test(clean)) {
      return clean;
    }
    return `https://${clean}`;
  };

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 2500);
    } catch {
      // Fallback
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 2500);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail && trimmedEmail.includes('@')) {
      const categoryLabel = job.category.replace('-', ' ');
      const newSub: SubscriberRecord = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: trimmedEmail.toLowerCase(),
        category: categoryLabel.toUpperCase(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        source: typeof window !== 'undefined' ? window.location.hostname : 'job_detail_modal',
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

  const getJobUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('jobId', job.id);
    return url.toString();
  };

  const handleShare = async () => {
    const shareData = {
      title: job.title,
      text: `Check out this job opportunity: ${job.title} on GovtBharat\n\n`,
      url: getJobUrl(),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}${shareData.url}`);
        alert('Job details copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=850,height=900');
      
      const printHtml = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Print - ${job.title}</title>
            <style>
              @page {
                size: A4;
                margin: 12mm;
              }
              * {
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                color: #0f172a;
                background-color: #ffffff;
                margin: 0;
                padding: 15px;
                font-size: 13px;
                line-height: 1.5;
              }
              .header-logo {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 3px solid #dc2626;
                padding-bottom: 12px;
                margin-bottom: 20px;
              }
              .logo-title {
                font-size: 24px;
                font-weight: 900;
                color: #0f172a;
                margin: 0;
                letter-spacing: -0.5px;
              }
              .logo-title span {
                color: #dc2626;
              }
              .subtitle {
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .job-header {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-left: 5px solid #dc2626;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .category-badge {
                display: inline-block;
                background: #dc2626;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                padding: 3px 10px;
                border-radius: 4px;
                text-transform: uppercase;
                margin-bottom: 8px;
              }
              .job-title {
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 8px 0;
              }
              .meta-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                font-size: 12px;
                color: #475569;
              }
              .section-box {
                margin-bottom: 20px;
              }
              .section-title {
                font-size: 14px;
                font-weight: 800;
                color: #0f172a;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 6px;
                margin-bottom: 10px;
              }
              .info-text {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 12px 15px;
                border-radius: 6px;
                color: #334155;
                font-size: 13px;
                line-height: 1.6;
              }
              .grid-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .grid-table td {
                width: 50%;
                padding: 12px 15px;
                border: 1px solid #cbd5e1;
                vertical-align: top;
                border-radius: 6px;
              }
              .dates-header {
                color: #9f1239;
                font-weight: 800;
                font-size: 13px;
                margin-bottom: 8px;
              }
              .fees-header {
                color: #3730a3;
                font-weight: 800;
                font-size: 13px;
                margin-bottom: 8px;
              }
              .detail-list {
                margin: 0;
                padding: 0;
                list-style: none;
              }
              .detail-list li {
                margin-bottom: 5px;
                font-size: 12px;
              }
              .link-box {
                background: #f1f5f9;
                border: 1px solid #cbd5e1;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 10px;
              }
              .link-url {
                font-family: monospace;
                font-size: 12px;
                color: #2563eb;
                word-break: break-all;
              }
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 11px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <div class="header-logo">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #000; border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <img src="/logo.png" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div>
                  <h1 class="logo-title">Govt<span style="color: #f59e0b;">Bharat</span></h1>
                  <div class="subtitle">Jobs Portal • Official Job Notice</div>
                </div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b;">
                <div>Printed: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div>Portal: {getDomainName()}</div>
              </div>
            </div>

            <div class="job-header">
              <span class="category-badge" style="background: #f59e0b; color: #000; font-weight: 900;">${job.category.replace('-', ' ')}</span>
              <h2 class="job-title">${job.title}</h2>
              <div class="meta-grid">
                <div><strong>State/Region:</strong> ${job.state || 'Central / All India'}</div>
                <div><strong>Published Date:</strong> ${job.postDate}</div>
                <div><strong>Job ID:</strong> #${job.id}</div>
              </div>
            </div>

            <div class="section-box">
              <div class="section-title">📋 Short Information / Overview</div>
              <div class="info-text">
                ${job.shortInfo || 'No additional summary details provided.'}
              </div>
            </div>

            <table class="grid-table">
              <tr>
                <td style="background-color: #fff1f2;">
                  <div class="dates-header">📅 Important Dates</div>
                  <ul class="detail-list">
                    <li><strong>Application Start Date:</strong> ${job.dates?.start || 'N/A'}</li>
                    <li><strong>Last Date to Apply:</strong> ${job.dates?.last || 'N/A'}</li>
                  </ul>
                </td>
                <td style="background-color: #eef2ff;">
                  <div class="fees-header">💳 Application Fee</div>
                  <ul class="detail-list">
                    <li><strong>General / OBC / EWS:</strong> ${job.fees?.general || 'N/A'}</li>
                    <li><strong>SC / ST / PH:</strong> ${job.fees?.scSt || 'N/A'}</li>
                  </ul>
                </td>
              </tr>
              ${(job.ageLimit || job.eligibility) ? `
              <tr>
                <td style="background-color: #f0fdf4;">
                  <div class="dates-header" style="color: #166534;">⏳ Age Limit Info</div>
                  <div style="font-size: 12px; font-weight: 600;">${formatAgeLimit(job.ageLimit)}</div>
                </td>
                <td style="background-color: #fefce8;">
                  <div class="fees-header" style="color: #854d0e;">🎓 Eligibility Criteria</div>
                  <div style="font-size: 12px; font-weight: 600;">${job.eligibility || 'N/A'}</div>
                </td>
              </tr>
              ` : ''}
              ${(job.payScale || job.salary) ? `
              <tr>
                <td colspan="2" style="background-color: #f0fdf4; border-top: 1px solid #cbd5e1; padding: 10px;">
                  <div class="dates-header" style="color: #047857; margin-bottom: 4px;">💰 Pay Scale / Salary Information</div>
                  <div style="font-size: 12px; font-weight: 600; color: #065f46; line-height: 1.5;">${job.payScale || job.salary}</div>
                </td>
              </tr>
              ` : ''}
            </table>

            <div class="section-box">
              <div class="section-title">🔗 Official Useful Links</div>
              <div class="link-box">
                <strong>Online Application / Download Link:</strong>
                <div class="link-url">${job.links?.apply || 'N/A'}</div>
              </div>
              <div class="link-box">
                <strong>Official Website URL:</strong>
                <div class="link-url">${job.links?.official || 'N/A'}</div>
              </div>
            </div>

            <div class="footer">
              {getDomainName()} — Verified Govt Job Updates & Exam Notices<br/>
              <em>Please verify all details with official government notifications before applying.</em>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    try { window.close(); } catch(e) {}
                  }, 500);
                }, 300);
              };
            </script>
          </body>
        </html>
      `;

      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        id="printable-job-detail"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-950/90 text-slate-900 dark:text-white backdrop-blur-2xl w-full max-w-4xl rounded-2xl border-2 border-amber-500/30 dark:border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.1)] dark:shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden animate-[scaleUp_0.25s_ease-out] my-auto max-h-[92vh]"
      >
        <div className="bg-slate-50 dark:bg-slate-950/90 border-b border-amber-200 dark:border-amber-500/40 p-3.5 sm:p-5 flex items-center justify-between gap-2.5 sm:gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-white dark:bg-black border-2 border-amber-400 dark:border-amber-500/80 shadow-sm dark:shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="/logo.png" 
                alt="GovtBharat Logo" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/d/1IE6MQ8EUwyKmGeXnpLTXx7d5HBLJiKb4";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/50 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 inline-block">
                {job.category.replace('-', ' ')}
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight break-words-safe line-clamp-2 sm:line-clamp-none">{job.title}</h3>
              <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400/80 font-bold mt-0.5">Published on: {job.postDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden shrink-0">
            <button 
              onClick={handleShare} 
              title="Share Job"
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-slate-950 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-400 border border-amber-300 dark:border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button 
              onClick={handlePrint} 
              title="Print Job Notice"
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-slate-950 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-400 border border-amber-300 dark:border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button 
              onClick={onClose} 
              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white hover:bg-amber-100 dark:hover:bg-amber-500/20 w-8 h-8 rounded-full flex items-center justify-center text-2xl leading-none transition-all cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
        
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh] space-y-5 text-sm text-slate-700 dark:text-slate-200">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-amber-500/30 rounded-xl p-4 shadow-sm dark:shadow-inner">
            <h4 className="font-extrabold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">📋 Short Information:</h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {job.shortInfo || 'No extra info provided.'}
            </p>
          </div>
          
          <div className="border border-slate-200 dark:border-amber-500/30 rounded-xl overflow-hidden shadow-sm dark:shadow-md bg-white dark:bg-slate-950/70">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 dark:border-amber-500/30 flex flex-col sm:flex-row">
                  <td className="w-full sm:w-1/2 p-4 bg-red-50/50 dark:bg-slate-950/70 sm:border-r border-slate-200 dark:border-amber-500/30 align-top">
                    <h4 className="font-black text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      📅 Important Dates
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <li><strong className="text-slate-900 dark:text-white">Start:</strong> {job.dates?.start || '-'}</li>
                      <li><strong className="text-slate-900 dark:text-white">Last Date:</strong> {job.dates?.last || '-'}</li>
                    </ul>
                  </td>
                  <td className="w-full sm:w-1/2 p-4 bg-indigo-50/50 dark:bg-slate-900/60 align-top border-t sm:border-t-0 border-slate-200 dark:border-amber-500/30">
                    <h4 className="font-black text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      💳 Application Fee
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <li><strong className="text-slate-900 dark:text-white">Gen / OBC:</strong> {job.fees?.general || '-'}</li>
                      <li><strong className="text-slate-900 dark:text-white">SC / ST:</strong> {job.fees?.scSt || '-'}</li>
                    </ul>
                  </td>
                </tr>
                {(job.ageLimit || job.eligibility) && (
                  <tr className="flex flex-col sm:flex-row border-t border-slate-200 dark:border-amber-500/30">
                    <td className="w-full sm:w-1/2 p-4 bg-green-50/50 dark:bg-slate-950/70 sm:border-r border-slate-200 dark:border-amber-500/30 align-top">
                      <h4 className="font-black text-amber-700 dark:text-amber-400 mb-1.5 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        ⏳ Age Limit Info
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{formatAgeLimit(job.ageLimit)}</p>
                    </td>
                    <td className="w-full sm:w-1/2 p-4 bg-yellow-50/50 dark:bg-slate-900/60 align-top border-t sm:border-t-0 border-slate-200 dark:border-amber-500/30">
                      <h4 className="font-black text-amber-700 dark:text-amber-300 mb-1.5 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        🎓 Eligibility Criteria
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{job.eligibility || '-'}</p>
                    </td>
                  </tr>
                )}
                {(job.payScale || job.salary) && (
                  <tr className="flex flex-col sm:flex-row border-t border-slate-200 dark:border-amber-500/30">
                    <td colSpan={2} className="w-full p-4 bg-emerald-50/60 dark:bg-emerald-950/30 align-top">
                      <h4 className="font-black text-emerald-800 dark:text-emerald-400 mb-1.5 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Pay Scale / Salary Information</span>
                      </h4>
                      <p className="text-xs text-slate-800 dark:text-emerald-100 font-semibold leading-relaxed">
                        {job.payScale || job.salary}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-amber-500/40 rounded-xl p-4 transition-all print:hidden backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0 font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Notify me by email for <span className="capitalize text-amber-600 dark:text-amber-400 font-bold">{job.category.replace('-', ' ')}</span> alerts
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Get real-time email alerts when new {job.category.replace('-', ' ')} updates are published.
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={notifyEnabled} 
                  onChange={(e) => {
                    setNotifyEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setSubscriptionStatus(null);
                    }
                  }} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {notifyEnabled && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-amber-500/30 animate-[fadeIn_0.2s_ease-in]">
                {subscriptionStatus ? (
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-lg border border-amber-200 dark:border-amber-500/40">
                    <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{subscriptionStatus}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400/70" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-amber-500/40 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs transition-all shrink-0 active:scale-95 shadow-md cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* DIRECT USEFUL LINKS SECTION */}
          <div className="border-t border-slate-200 dark:border-amber-500/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <span>🔗</span> Important Direct Web Links & Online Portal
              </h4>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                100% Verified Govt Links
              </span>
            </div>

            <div className="space-y-3">
              {/* 1. Apply Online Link */}
              {(() => {
                const applyUrl = normalizeJobLink(job.links?.apply, `${job.title} Apply Online Portal`);
                const isCustom = !!job.links?.apply && job.links.apply !== '#';
                return (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-slate-900/90 border border-amber-300 dark:border-amber-500/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                            Apply Online / Direct Registration Form
                          </h5>
                          {isCustom ? (
                            <span className="text-[9px] bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">Direct</span>
                          ) : (
                            <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-semibold">Portal Search</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                          {applyUrl}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(applyUrl, 'apply')}
                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        title="Copy Apply URL"
                      >
                        {copiedLinkType === 'apply' ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden xs:inline">{copiedLinkType === 'apply' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={applyUrl} 
                        target="_blank"
                        rel="noopener noreferrer external"
                        onClick={(e) => {
                          if (isStandaloneApp()) {
                            e.preventDefault();
                            openInDefaultBrowser(applyUrl, e);
                          }
                        }}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-4 py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 text-center"
                        title="Open Apply Online in default browser"
                      >
                        <span>Click Here</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Download Official Notification PDF */}
              {(() => {
                const notifUrl = normalizeJobLink(job.links?.notification || job.links?.official, `${job.title} Official Notification PDF`);
                return (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold border border-red-200 dark:border-red-900/50">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                          Download Official Notification (PDF / Notice)
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                          {notifUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(notifUrl, 'notification')}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        title="Copy Notification URL"
                      >
                        {copiedLinkType === 'notification' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden xs:inline">{copiedLinkType === 'notification' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={notifUrl} 
                        target="_blank"
                        rel="noopener noreferrer external"
                        onClick={(e) => {
                          if (isStandaloneApp()) {
                            e.preventDefault();
                            openInDefaultBrowser(notifUrl, e);
                          }
                        }}
                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 text-center"
                        title="Download Notification in default browser"
                      >
                        <span>Download PDF</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Official Board Website */}
              {(() => {
                const officialUrl = normalizeJobLink(job.links?.official, `${job.title} Official Website`);
                return (
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold border border-blue-200 dark:border-blue-900/50">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                          Official Board / Commission Website
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                          {officialUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(officialUrl, 'official')}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        title="Copy Official Website URL"
                      >
                        {copiedLinkType === 'official' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden xs:inline">{copiedLinkType === 'official' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={officialUrl} 
                        target="_blank"
                        rel="noopener noreferrer external"
                        onClick={(e) => {
                          if (isStandaloneApp()) {
                            e.preventDefault();
                            openInDefaultBrowser(officialUrl, e);
                          }
                        }}
                        className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-900 text-amber-300 border border-amber-500/40 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 text-center"
                        title="Visit Official Website in default browser"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-950/90 border-t border-slate-200 dark:border-amber-500/40 p-4 flex justify-between items-center flex-wrap gap-2 print:hidden backdrop-blur-md">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-300 dark:border-amber-500/40 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm dark:shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleShare}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-300 dark:border-amber-500/40 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm dark:shadow-md active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="bg-slate-200 dark:bg-amber-500/20 hover:bg-slate-300 dark:hover:bg-amber-500/30 text-slate-800 dark:text-amber-300 border border-slate-300 dark:border-amber-500/40 font-black px-5 py-2 rounded-lg text-xs transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

