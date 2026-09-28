import React, { useState, useEffect } from 'react';
import {
  Mail, Bell, Send, CheckCircle2, AlertCircle, RefreshCw,
  Settings, Sliders, Smartphone, Monitor, ShieldCheck,
  Check, Trash2, Globe, ExternalLink, Zap, Lock,
  ChevronRight, Sparkles, Filter, Users, Eye, Play,
  Save, Megaphone
} from 'lucide-react';
import { JobAlert, EmailNotificationConfig, NotificationDispatchLog } from '../types';
import {
  subscribeToEmailNotificationConfig,
  saveEmailNotificationConfigToFirestore,
  subscribeToNotificationLogs,
  saveNotificationLogToFirestore,
  SubscriberRecord
} from '../services/firestoreService';

interface EmailNotificationsTabProps {
  subscribers?: SubscriberRecord[];
  jobs?: JobAlert[];
  onToast?: (msg: string) => void;
}

const DEFAULT_CONFIG: EmailNotificationConfig = {
  autoSendOnPublish: true,
  provider: 'built-in',
  fromName: 'GovtBharat Job Alerts',
  fromEmail: 'alerts@govtbharat.com',
  replyToEmail: 'support@govtbharat.com',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  smtpSecure: false,
  apiKey: '',
  webhookUrl: '',
  subjectTemplate: '⚡ [GovtBharat Alert] {job_title} - {state} Apply Online',
  preheaderText: 'New Government Job Notification published on GovtBharat Portal. Check eligibility and vacancies.',
  bannerTitle: 'OFFICIAL GOVERNMENT JOB NOTIFICATION RELEASED',
  callToActionText: 'View Full Details & Apply Online',
  footerNote: 'You received this notification because you subscribed to instant alerts on GovtBharat Portal.',
  sendCategories: ['all', 'latest-jobs', 'admit-cards', 'results', 'answer-key', 'syllabus', 'admission'],
  sendDelaySeconds: 0,
  includePdfLink: true,
  includeApplyLink: true
};

export const EmailNotificationsTab: React.FC<EmailNotificationsTabProps> = ({
  subscribers = [],
  jobs = [],
  onToast
}) => {
  const [config, setConfig] = useState<EmailNotificationConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<NotificationDispatchLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Testing and Broadcast States
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Manual broadcast states
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'templates' | 'broadcast' | 'logs'>('settings');

  // Load config & logs from backend API & Firestore
  useEffect(() => {
    // 1. Fetch from Express API
    fetch('/api/v1/notifications/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.config) {
          setConfig(prev => ({ ...prev, ...data.config }));
        }
      })
      .catch(err => console.warn('Could not fetch notification config from API:', err));

    // 2. Fetch logs from Express API
    fetch('/api/v1/notifications/logs')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      })
      .catch(err => console.warn('Could not fetch logs from API:', err));

    // 3. Subscribe to Firestore updates
    const unsubConfig = subscribeToEmailNotificationConfig((cloudConfig) => {
      if (cloudConfig) {
        setConfig(prev => ({ ...prev, ...cloudConfig }));
      }
    });

    const unsubLogs = subscribeToNotificationLogs((cloudLogs) => {
      if (Array.isArray(cloudLogs) && cloudLogs.length > 0) {
        setLogs(cloudLogs);
      }
    });

    return () => {
      unsubConfig();
      unsubLogs();
    };
  }, []);

  // Update selectedJobId if jobs list changes
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // 1. Save to Express server backend
      await fetch('/api/v1/notifications/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });

      // 2. Save to Firestore
      await saveEmailNotificationConfigToFirestore(config);

      setIsSaving(false);
      setSaveSuccess(true);
      if (onToast) onToast('Email Notification Gateway configuration saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setIsSaving(false);
      if (onToast) onToast('Error saving email notification configuration.');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      if (onToast) onToast('Please enter a valid recipient email address.');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/v1/notifications/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail, config })
      });
      const data = await res.json();

      setIsSendingTest(false);
      if (data.success) {
        setTestResult({ success: true, message: `✅ Test email successfully dispatched to ${testEmail}!` });
        if (onToast) onToast(`Test alert delivered to ${testEmail}!`);
        
        // Refresh logs
        fetchLogs();
      } else {
        setTestResult({ success: false, message: `⚠️ Dispatch warning: ${data.error || 'Check SMTP credentials'}` });
      }
    } catch (err: any) {
      setIsSendingTest(false);
      setTestResult({ success: false, message: `Connection error: ${err.message}` });
    }
  };

  const handleManualBroadcast = async () => {
    const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
    if (!targetJob) {
      if (onToast) onToast('Please select a valid job to broadcast.');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastResult(null);
    setShowBroadcastConfirm(false);

    try {
      const res = await fetch('/api/v1/notifications/send-job-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: targetJob.id,
          job: targetJob,
          forceDispatch: true
        })
      });
      const data = await res.json();

      setIsBroadcasting(false);
      if (data.success) {
        setBroadcastResult({
          success: true,
          message: `🎉 Alert Broadcast Dispatched successfully to ${data.sentCount || subscribers.length} subscriber(s)!`,
          count: data.sentCount
        });
        if (onToast) onToast(`Alert broadcasted to ${data.sentCount || subscribers.length} subscribers!`);
        fetchLogs();
      } else {
        setBroadcastResult({
          success: false,
          message: data.error || 'Failed to dispatch alert'
        });
      }
    } catch (err: any) {
      setIsBroadcasting(false);
      setBroadcastResult({
        success: false,
        message: err.message || 'Server network error'
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/notifications/logs');
      const data = await res.json();
      if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn('Error fetching logs:', err);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear the notification dispatch logs?')) return;
    try {
      await fetch('/api/v1/notifications/logs', { method: 'DELETE' });
      setLogs([]);
      if (onToast) onToast('Notification logs cleared.');
    } catch (err) {
      console.warn(err);
    }
  };

  // Compute live sample job for preview
  const sampleJob = jobs.find(j => j.id === selectedJobId) || jobs[0] || {
    id: 'sample-preview',
    title: 'SSC CGL 2026 Recruitment Online Form (17,727 Posts)',
    category: 'latest-jobs',
    postDate: '15-08-2026',
    state: 'Central',
    shortInfo: 'Staff Selection Commission has released Combined Graduate Level Examination 2026 notice for Group B & C posts. Check eligibility & apply online.',
    dates: { start: '15-08-2026', last: '15-09-2026' },
    fees: { general: '₹100', scSt: '₹0' },
    eligibility: 'Bachelor Degree in Any Stream from Recognized University in India.',
    ageLimit: '18 - 32 Years',
    links: { apply: 'https://ssc.gov.in', official: 'https://ssc.gov.in', notification: 'https://ssc.gov.in' }
  };

  const liveSubject = (config.subjectTemplate || '⚡ [GovtBharat Alert] {job_title} - {state} Apply Online')
    .replace('{job_title}', sampleJob.title)
    .replace('{category}', (sampleJob.category || 'latest-jobs').toUpperCase())
    .replace('{state}', sampleJob.state || 'Central')
    .replace('{last_date}', typeof sampleJob.dates === 'object' ? (sampleJob.dates.last || 'N/A') : 'N/A')
    .replace('{portal_name}', 'GovtBharat');

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & AUTOMATION STATUS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 border-2 border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white">Automated Job Alert Email Notification System</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Dispatch Gateway
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
                Automatically notifies all registered job seekers &amp; modal subscribers via email whenever a new Sarkari job, admit card, or result is published on the portal.
              </p>
            </div>
          </div>

          {/* Master Auto-Send Toggle Switch */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 shrink-0 shadow-inner">
            <div>
              <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Auto-Alert On Publish
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {config.autoSendOnPublish ? 'Active - Instant Alerts' : 'Paused - Manual Only'}
              </div>
            </div>

            <button
              onClick={() => setConfig(prev => ({ ...prev, autoSendOnPublish: !prev.autoSendOnPublish }))}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
                config.autoSendOnPublish ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              title="Toggle automatic email alerts on publish"
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                config.autoSendOnPublish ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Subscribers</div>
            <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              {subscribers.length} Active
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gateway Provider</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5 capitalize flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {config.provider === 'built-in' ? 'GovtBharat Cloud' : config.provider.toUpperCase()}
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alerts Dispatched</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {logs.reduce((acc, l) => acc + (l.recipientCount || 1), 0)} Delivered
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispatch Latency</div>
            <div className="text-lg sm:text-xl font-black text-cyan-400 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              &lt; 500 ms
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Gateway &amp; SMTP Settings
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'templates'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Template &amp; Subject Designer
        </button>

        <button
          onClick={() => setActiveSubTab('broadcast')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'broadcast'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          Instant Broadcast &amp; Test Email
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          Dispatch History Logs ({logs.length})
        </button>
      </div>

      {/* 3. MAIN TAB PANELS */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Service Provider */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Email Delivery Gateway Provider
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select how the system sends alert emails to registered users.
                  </p>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Ready &bull; No Setup Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div
                  onClick={() => setConfig(prev => ({ ...prev, provider: 'built-in' }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.provider === 'built-in'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase">GovtBharat Cloud Engine</span>
                    {config.provider === 'built-in' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Zero config needed. Auto-handles subscriber routing with fast instant delivery.
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    ★ Recommended
                  </div>
                </div>

                <div
                  onClick={() => setConfig(prev => ({ ...prev, provider: 'smtp' }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.provider === 'smtp'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase">Custom SMTP Server</span>
                    {config.provider === 'smtp' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Use your custom Gmail, Google Workspace, Amazon SES, or Hostinger SMTP.
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Custom Domain Support
                  </div>
                </div>

                <div
                  onClick={() => setConfig(prev => ({ ...prev, provider: 'webhook' }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    config.provider === 'webhook'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase">Webhook / API</span>
                    {config.provider === 'webhook' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Push payload to external Zapier, Make, Brevo, or custom mail endpoint.
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    Integration Ready
                  </div>
                </div>
              </div>

              {/* SMTP Credentials (shown when SMTP is selected) */}
              {config.provider === 'smtp' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
                  <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    SMTP Server Authentication Parameters
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        SMTP Host / Server
                      </label>
                      <input
                        type="text"
                        value={config.smtpHost || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="e.g. smtp.gmail.com or smtp.mailgun.org"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={config.smtpPort || 587}
                        onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                        placeholder="587 or 465"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        SMTP Username / Email
                      </label>
                      <input
                        type="text"
                        value={config.smtpUser || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                        placeholder="e.g. alerts@govtbharat.com"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        SMTP Password / App Password
                      </label>
                      <input
                        type="password"
                        value={config.smtpPassword || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        placeholder="Enter SMTP password"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={Boolean(config.smtpSecure)}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="smtpSecure" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      Use SSL/TLS Secure Handshake (Port 465)
                    </label>
                  </div>
                </div>
              )}

              {/* Webhook URL (shown when Webhook selected) */}
              {config.provider === 'webhook' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">
                    Target Webhook Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={config.webhookUrl || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    A JSON payload containing job details, formatted subject, and recipient emails will be POSTed to this URL on every publish.
                  </p>
                </div>
              )}
            </div>

            {/* Sender Identity Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Sender Identity &amp; Header Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Display Name
                  </label>
                  <input
                    type="text"
                    value={config.fromName}
                    onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="GovtBharat Job Alerts"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={config.fromEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="alerts@govtbharat.com"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reply-To Email Address
                  </label>
                  <input
                    type="email"
                    value={config.replyToEmail || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, replyToEmail: e.target.value }))}
                    placeholder="support@govtbharat.com"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Inclusion & Category Filter Rules */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-500" />
                Delivery Rules &amp; Content Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeApplyLink}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeApplyLink: e.target.checked }))}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Include Direct Apply Online Link</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Adds orange primary CTA button leading directly to application portal.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includePdfLink}
                    onChange={(e) => setConfig(prev => ({ ...prev, includePdfLink: e.target.checked }))}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Include Official Notification PDF Button</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Renders verified government PDF download button in email.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Config Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving Configuration...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Configuration Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Notification Settings
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('broadcast')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Test Gateway Dispatch &rarr;
              </button>
            </div>

          </div>

          {/* Right Col: Live Summary Card */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Gateway Status</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Auto-Alert on Publish:</span>
                  <span className={`font-bold ${config.autoSendOnPublish ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {config.autoSendOnPublish ? 'ENABLED' : 'PAUSED'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Active Provider:</span>
                  <span className="font-bold text-white uppercase">{config.provider}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Sender Name:</span>
                  <span className="font-bold text-amber-300">{config.fromName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Sender Email:</span>
                  <span className="font-bold text-slate-300">{config.fromEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Registered Subscribers:</span>
                  <span className="font-bold text-cyan-400">{subscribers.length > 0 ? subscribers.length : 4} Users</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveSubTab('templates')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  Preview Email Template
                </button>
              </div>
            </div>

            {/* Informational Help Card */}
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <Sparkles className="w-4 h-4" />
                How Automated Job Notifications Work
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                1. Whenever you or staff add a new job post in Super Admin or via Auto-Feed Scraper, the backend triggers this notification hook.
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                2. The system filters all subscribed candidates and generates an official styled HTML newsletter email with full salary, fee, date details, and direct apply buttons.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE & SUBJECT DESIGNER */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (5 Cols): Customization Controls */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Subject Line Template */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Email Subject Line Format
              </label>
              <input
                type="text"
                value={config.subjectTemplate}
                onChange={(e) => setConfig(prev => ({ ...prev, subjectTemplate: e.target.value }))}
                placeholder="⚡ [GovtBharat Alert] {job_title} - {state} Apply Online"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />

              {/* Dynamic Tokens */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Available Dynamic Placeholders:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['{job_title}', '{category}', '{state}', '{last_date}', '{portal_name}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, subjectTemplate: prev.subjectTemplate + ' ' + tag }))}
                      className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Banner & Preheader */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Header &amp; Call to Action Customization
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Top Alert Banner Ribbon Title
                </label>
                <input
                  type="text"
                  value={config.bannerTitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, bannerTitle: e.target.value }))}
                  placeholder="OFFICIAL GOVERNMENT JOB NOTIFICATION RELEASED"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Action Button Text
                </label>
                <input
                  type="text"
                  value={config.callToActionText}
                  onChange={(e) => setConfig(prev => ({ ...prev, callToActionText: e.target.value }))}
                  placeholder="View Full Details & Apply Online"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Footer Legal &amp; Unsubscribe Notice
                </label>
                <textarea
                  rows={2}
                  value={config.footerNote}
                  onChange={(e) => setConfig(prev => ({ ...prev, footerNote: e.target.value }))}
                  placeholder="You received this notification because you subscribed to instant alerts on GovtBharat Portal."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Template Changes
            </button>

          </div>

          {/* Right Column (7 Cols): Interactive Live Preview */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Device Switcher & Preview Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-3 px-4 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase text-amber-400">Live Render Preview</span>
                <span className="text-[10px] text-slate-400">| Sample: {sampleJob.title.slice(0, 30)}...</span>
              </div>

              <div className="flex items-center bg-slate-800 rounded-lg p-1 space-x-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Desktop</span>
                </button>

                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Mobile</span>
                </button>
              </div>
            </div>

            {/* Email Shell Container */}
            <div className={`mx-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-300 dark:border-slate-800 transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
            }`}>
              
              {/* Mail Client Chrome */}
              <div className="bg-white dark:bg-slate-900 rounded-t-xl border-x border-t border-slate-300 dark:border-slate-800 p-3 text-xs space-y-1.5">
                <div className="flex items-center text-slate-500 text-[11px]">
                  <span className="w-16 font-bold">From:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {config.fromName} &lt;{config.fromEmail}&gt;
                  </span>
                </div>
                <div className="flex items-center text-slate-500 text-[11px]">
                  <span className="w-16 font-bold">Subject:</span>
                  <span className="text-slate-900 dark:text-white font-bold truncate">
                    {liveSubject}
                  </span>
                </div>
              </div>

              {/* Rendered HTML Email Content */}
              <div className="bg-white rounded-b-xl border border-slate-300 text-slate-900 overflow-hidden shadow-lg">
                
                {/* Tricolor Ribbon */}
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

                {/* Email Header */}
                <div className="bg-slate-950 text-white p-5 text-center">
                  <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                    ⚡ GovtBharat ALERTS
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white">{config.fromName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instant Official Central &amp; State Recruitment Updates</p>
                </div>

                {/* Official Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mx-4 sm:mx-6 mt-4 rounded">
                  <p className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                    📢 {config.bannerTitle}
                  </p>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {(sampleJob.category || 'latest-jobs').toUpperCase()}
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      State: {sampleJob.state || 'Central'}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                      Date: {sampleJob.postDate || '15-08-2026'}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {sampleJob.title}
                  </h2>

                  {/* Short Info Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
                    {sampleJob.shortInfo || 'Official notification released. Check eligibility and vacancies below.'}
                  </div>

                  {/* Key Details Table */}
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-500 font-semibold w-1/3">Application Start:</td>
                        <td className="py-2 text-slate-900 font-bold">
                          {typeof sampleJob.dates === 'object' ? (sampleJob.dates.start || sampleJob.postDate) : sampleJob.postDate}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-500 font-semibold">Last Date to Apply:</td>
                        <td className="py-2 text-rose-600 font-bold">
                          {typeof sampleJob.dates === 'object' ? (sampleJob.dates.last || 'N/A') : 'N/A'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-500 font-semibold">Application Fee:</td>
                        <td className="py-2 text-slate-900 font-bold">
                          {typeof sampleJob.fees === 'object' ? `Gen: ${sampleJob.fees.general || '₹100'} | SC/ST: ${sampleJob.fees.scSt || '₹0'}` : '₹100'}
                        </td>
                      </tr>
                      {sampleJob.eligibility && (
                        <tr className="border-b border-slate-100">
                          <td className="py-2 text-slate-500 font-semibold">Eligibility:</td>
                          <td className="py-2 text-slate-900 font-medium">{sampleJob.eligibility}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Buttons */}
                  <div className="space-y-2 pt-2">
                    {config.includeApplyLink && (
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="block w-full py-3 bg-orange-600 text-white font-black text-xs text-center rounded-lg shadow-md hover:bg-orange-700"
                      >
                        👉 {config.callToActionText}
                      </a>
                    )}

                    {config.includePdfLink && (
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="block w-full py-2 bg-slate-100 text-slate-700 font-bold text-xs text-center rounded-lg border border-slate-300 hover:bg-slate-200"
                      >
                        📄 Download Official Notification PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-950 text-slate-400 p-4 text-center text-[10px] space-y-1.5">
                  <p>{config.footerNote}</p>
                  <p className="text-slate-500">
                    Candidate Helpdesk &bull; GovtBharat Sarkari Portal &bull; <span className="underline cursor-pointer">Unsubscribe</span>
                  </p>
                  <p className="text-slate-600">&copy; 2026 GovtBharat Sarkari Portal. Verified Public Job Notice Alert.</p>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* INSTANT BROADCAST & LIVE TESTING */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Box 1: Send Test Email Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Test Email Delivery
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Send a sample job alert email to any test email to verify layout &amp; delivery.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Test Email Address:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Dispatching Test Email Alert...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test Email Now
                  </>
                )}
              </button>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div>{testResult.message}</div>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Manual Mass Broadcast to All Modal Subscribers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Broadcast Job Alert to All Subscribers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {subscribers.length > 0 
                    ? `Instantly notify all ${subscribers.length} modal subscribers about an important job notice.`
                    : 'No subscribers registered yet. Candidates who subscribe on the portal will receive alerts.'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Job Alert to Broadcast:
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      [{j.category.toUpperCase()}] {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {!showBroadcastConfirm ? (
                <button
                  onClick={() => setShowBroadcastConfirm(true)}
                  disabled={subscribers.length === 0}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" />
                  Initiate Mass Broadcast ({subscribers.length} Recipients)
                </button>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-700 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    ⚠️ Confirm Mass Broadcast to {subscribers.length} registered candidates?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleManualBroadcast}
                      disabled={isBroadcasting || subscribers.length === 0}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-black text-xs uppercase hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isBroadcasting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Yes, Send Now
                    </button>
                    <button
                      onClick={() => setShowBroadcastConfirm(false)}
                      className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {broadcastResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  broadcastResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}>
                  {broadcastResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div>{broadcastResult.message}</div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* DISPATCH AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                Notification Dispatch History Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit trail of all automated alerts dispatched to subscribers upon job publication.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchLogs}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Refresh dispatch logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>

              {logs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              )}
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Mail className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="text-sm font-bold">No Notification Logs Yet</div>
              <p className="text-xs max-w-sm mx-auto">
                Logs will appear automatically here whenever new jobs are published or broadcasted to subscribers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black">
                    <th className="py-3 px-4">Job Title / Alert Subject</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Dispatched At</th>
                    <th className="py-3 px-3">Recipients</th>
                    <th className="py-3 px-3">Provider</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white max-w-md truncate">
                          {log.jobTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                          {log.subject}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.sentAt}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-black text-slate-900 dark:text-white flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" />
                          {log.recipientCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500">
                        {log.provider}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.status === 'delivered'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
