import { LogoManager } from "./LogoManager";
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, BarChart3, Megaphone, Settings, Database, 
  Users, Download, Upload, RefreshCw, Trash2, CheckCircle2, 
  Send, AlertTriangle, X, Plus, Activity, UserPlus, KeyRound, 
  Eye, EyeOff, Lock, Unlock, Check, MoreVertical, SlidersHorizontal, Menu, Package,
  Share2, Zap, ChevronRight, Search, ChevronDown, LayoutGrid, Wifi, WifiOff, Globe,
  Bell, BellOff
} from 'lucide-react';
import { JobAlert, EmployeeUser, EmployeePermissions, SocialLinkItem, SuperAdminTabType, SyncLogEntry } from '../types';
import { SUPER_ADMIN_MODULES, SuperAdminModuleConfig } from '../config/superAdminConfig';
import { VersionControlTab } from './VersionControlTab';
import { NpmSystemContent } from './NpmSystemModal';
import { AutoFeedContent } from './AutoFeedContent';
import { AdminApprovalsContent } from './AdminApprovalsContent';
import { SocialLinksManager } from './SocialLinksManager';
import { EarningsTab } from './EarningsTab';
import { ThemeColorCustomizerTab } from './ThemeColorCustomizerTab';
import { ColumnEditorTab } from './ColumnEditorTab';
import { SeoEditorTab } from './SeoEditorTab';
import { CategorySeoEditorTab } from './CategorySeoEditorTab';
import { SitemapGeneratorTab } from './SitemapGeneratorTab';
import { WebsiteControlTab } from './WebsiteControlTab';
import { JobsManagerTab } from './JobsManagerTab';
import { MobileAppButtonsManagerTab } from './MobileAppButtonsManagerTab';
import { TrendingBannersManagerTab } from './TrendingBannersManagerTab';
import { PagesManagerTab, ApiAnalyticsTab, ActivityLogsTab, HelpdeskTab, AutoBroadcasterTab, AdsManagerTab, EmailNotificationsTab } from './NewAdminTabs';
import { AdminStudentDocuments } from './AdminStudentDocuments';
import { LinkHealthCheckerTab } from './LinkHealthCheckerTab';
import { DomainEditorModal } from './DomainEditorModal';
import { PopularCategoriesAndTrafficAnalytics } from './PopularCategoriesAndTrafficAnalytics';
import { getDomainName } from '../utils/domain';
import { DEFAULT_MOBILE_TABS_CONFIG } from '../data/mobileTabsData';
import { MobileTabsConfig } from '../types';
import { safeSaveJobsToLocalStorage } from '../utils/jobStorage';
import { 
  saveEmployeeToFirestore, 
  deleteEmployeeFromFirestore, 
  subscribeToSubscribers, 
  getSubscribersFromFirestore,
  saveSubscriberToFirestore, 
  deleteSubscriberFromFirestore, 
  bulkSaveJobsToFirestore,
  SubscriberRecord,
  getSuperAdminCredentials,
  updateSuperAdminCredentials,
  subscribeToDeletedSubscribers,
  saveDeletedSubscriberToFirestore,
  deleteDeletedSubscriberFromFirestore
} from '../services/firestoreService';

interface SuperAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobAlert[];
  setJobs: React.Dispatch<React.SetStateAction<JobAlert[]>>;
  employees: EmployeeUser[];
  setEmployees: React.Dispatch<React.SetStateAction<EmployeeUser[]>>;
  deletedEmployeeLogs?: Array<{ id: string; name: string; username: string; deletedAt: string; deletedBy: string; }>;
  setDeletedEmployeeLogs?: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; username: string; deletedAt: string; deletedBy: string; }>>>;
  marqueeText: string;
  setMarqueeText: (text: string) => void;
  onOpenAddJob: () => void;
  onSaveJob?: (job: JobAlert) => Promise<void> | void;
  onBulkSaveJobs?: (jobs: JobAlert[]) => Promise<void> | void;
  onResetDatabase: () => void;
  onToast: (msg: string) => void;
  onOpenNpmSystem?: () => void;
  socialLinks?: SocialLinkItem[];
  setSocialLinks?: (links: SocialLinkItem[]) => void;
  onSaveSocialLinks?: (links: SocialLinkItem[]) => Promise<void>;
  initialTab?: SuperAdminTabType;
  initialColumnId?: string;
  isAutoSyncActive?: boolean;
  consecutiveSyncErrors?: number;
  setIsAutoSyncActive?: (active: boolean) => void;
  syncLogs?: SyncLogEntry[];
  siteLogo?: string;
  setSiteLogo?: (logo: string) => void;
  onEditJob?: (id: string, e: React.MouseEvent) => void;
  onDeleteJob?: (id: string, e: React.MouseEvent) => void;
  mobileTabsConfig?: MobileTabsConfig;
  onSaveMobileTabsConfig?: (newConfig: MobileTabsConfig) => Promise<void> | void;
}

export const SuperAdminDashboardModal: React.FC<SuperAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  jobs,
  setJobs,
  employees,
  setEmployees,
  deletedEmployeeLogs = [],
  setDeletedEmployeeLogs,
  marqueeText,
  setMarqueeText,
  onOpenAddJob,
  onSaveJob,
  onBulkSaveJobs,
  onResetDatabase,
  onToast,
  onOpenNpmSystem,
  socialLinks,
  setSocialLinks,
  onSaveSocialLinks,
  initialTab = 'analytics',
  initialColumnId,
  isAutoSyncActive = true,
  consecutiveSyncErrors = 0,
  setIsAutoSyncActive = () => {},
  syncLogs = [],
  siteLogo,
  setSiteLogo,
  onEditJob,
  onDeleteJob,
  mobileTabsConfig = DEFAULT_MOBILE_TABS_CONFIG,
  onSaveMobileTabsConfig = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<SuperAdminTabType>(initialTab);
  const [show3DotMenu, setShow3DotMenu] = useState(false);
  const [threeDotSearch, setThreeDotSearch] = useState('');
  const [showPanelDropdownModal, setShowPanelDropdownModal] = useState(false);
  const [panelDropdownSearch, setPanelDropdownSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    core: true,
    content: true,
    users: false,
    system: false,
    tools: false
  });
  const threeDotRef = useRef<HTMLDivElement>(null);
  const defaultSocialLinks: SocialLinkItem[] = [
    { id: '1', platform: 'telegram', title: 'Telegram Channel', url: 'https://t.me/govtbharatofficial', icon: 'send', enabled: true },
    { id: '2', platform: 'whatsapp', title: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/...', icon: 'message-circle', enabled: true },
    { id: '3', platform: 'youtube', title: 'YouTube Channel', url: 'https://youtube.com/...', icon: 'video', enabled: true }
  ];
  const [localSocialLinks, setLocalSocialLinks] = useState<SocialLinkItem[]>(socialLinks && socialLinks.length > 0 ? socialLinks : defaultSocialLinks);

  // Auto-expand category containing active tab
  useEffect(() => {
    const activeCat = SUPER_ADMIN_MODULES.find(m => m.id === activeTab)?.category;
    if (activeCat) {
      setOpenCategories({ [activeCat]: true });
    }
  }, [activeTab]);

  // Close 3-dot dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (threeDotRef.current && !threeDotRef.current.contains(event.target as Node)) {
        setShow3DotMenu(false);
      }
    };
    if (show3DotMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show3DotMenu]);

  useEffect(() => {
    if (socialLinks && socialLinks.length > 0) {
      setLocalSocialLinks(socialLinks);
    }
  }, [socialLinks]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const [tickerInput, setTickerInput] = useState(marqueeText);
  const [siteTitle, setSiteTitle] = useState('GovtBharat');
  const [appName, setAppName] = useState('GovtBharat Result');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Fetch site config
  useEffect(() => {
    fetch('/api/v1/site-config')
      .then(res => res.json())
      .then(data => {
        if (data.siteConfig) {
          setSiteTitle(data.siteConfig.siteTitle || 'GovtBharat');
          setMaintenanceMode(!!data.siteConfig.maintenanceMode);
          setAppName(data.siteConfig.appName || 'GovtBharat Result');
          setAppVersion(data.siteConfig.appVersion || '1.0.0');
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/v1/update-site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteTitle, maintenanceMode, appName, appVersion })
      });
      if (res.ok) {
        onToast('Portal configuration saved successfully!');
      } else {
        onToast('Failed to save configuration');
      }
    } catch (e) {
      onToast('Error saving configuration');
    }
    setIsSavingConfig(false);
  };

  const handlePushAppUpdate = async () => {
    const newVersion = appVersion.split('.').map((v, i) => i === 2 ? parseInt(v) + 1 : v).join('.');
    setAppVersion(newVersion);
    try {
      const res = await fetch('/api/v1/update-site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteTitle, maintenanceMode, appName, appVersion: newVersion })
      });
      if (res.ok) {
        onToast(`App Update Pushed! New Version: ${newVersion}. Users will be prompted to update.`);
      }
    } catch (e) {
      onToast('Error pushing update');
    }
  };

  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState('');
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);

  const filteredSubscribers = subscribers.filter(sub => {
    const q = subscriberSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const email = (sub.email || '').toLowerCase();
    const name = (sub.name || '').toLowerCase();
    const phone = (sub.phone || '').toLowerCase();
    const category = (sub.category || '').toLowerCase();
    const notes = (sub.notes || sub.message || '').toLowerCase();
    return email.includes(q) || name.includes(q) || phone.includes(q) || category.includes(q) || notes.includes(q);
  });

  useEffect(() => {
    let liveList: SubscriberRecord[] = [];
    let serverList: SubscriberRecord[] = [];

    const mergeSubscribers = (listA: SubscriberRecord[], listB: SubscriberRecord[]) => {
      const map = new Map<string, SubscriberRecord>();
      listA.forEach(s => {
        const email = (s.email || '').toLowerCase().trim();
        if (email) map.set(email, s);
      });
      listB.forEach(s => {
        const email = (s.email || '').toLowerCase().trim();
        if (email) {
          const existing = map.get(email);
          if (existing) {
            map.set(email, {
              ...existing,
              ...s,
              name: s.name || existing.name,
              phone: s.phone || existing.phone,
              notes: s.notes || existing.notes || (s as any).message || (existing as any).message,
              createdAt: existing.createdAt || s.createdAt,
              date: existing.date || s.date,
              source: existing.source || s.source
            });
          } else {
            map.set(email, s);
          }
        }
      });
      return Array.from(map.values()).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
        return timeB - timeA;
      });
    };

    const updateCombined = () => {
      const merged = mergeSubscribers(liveList, serverList);
      if (merged.length > 0) {
        setSubscribers(merged);
      }
    };

    // 1. Listen to Firestore real-time updates directly
    const unsub = subscribeToSubscribers((liveSubs) => {
      if (Array.isArray(liveSubs)) {
        liveList = liveSubs;
        updateCombined();
        if (serverList.length === 0 && liveSubs.length > 0) {
          setSubscribers(liveSubs);
        }
      }
    });

    // 2. Also fetch from Server API to guarantee website subscribers are merged
    fetch('/api/v1/subscribers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.subscribers)) {
          serverList = data.subscribers;
          updateCombined();
        }
      })
      .catch(err => console.warn('Fetch server subscribers error:', err));

    // 3. Fallback direct Firestore snapshot fetch on mount
    getSubscribersFromFirestore().then(fsSubs => {
      if (Array.isArray(fsSubs) && fsSubs.length > 0) {
        liveList = fsSubs;
        updateCombined();
      }
    }).catch(() => {});

    // 4. Clean up localStorage sample emails if present
    try {
      const stored = JSON.parse(localStorage.getItem('GovtBharat_subscribers') || '[]');
      if (Array.isArray(stored)) {
        const filtered = stored.filter(e => typeof e === 'string' && !e.includes('@example.com') && e !== 'rahul.kumar@gmail.com' && e !== 'priya.singh@yahoo.com' && e !== 'amit.sharma@outlook.com');
        localStorage.setItem('GovtBharat_subscribers', JSON.stringify(filtered));
      }
    } catch (e) {}

    return () => {
      unsub();
    };
  }, []);

  const [deletedSubscribers, setDeletedSubscribers] = useState<SubscriberRecord[]>([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [isRefreshingSubscribers, setIsRefreshingSubscribers] = useState(false);

  useEffect(() => {
    const unsubDel = subscribeToDeletedSubscribers((liveSubs) => {
      if (Array.isArray(liveSubs)) {
        const sorted = [...liveSubs].sort((a, b) => {
          const delA = (a as any).deletedAt || '';
          const delB = (b as any).deletedAt || '';
          return delB.localeCompare(delA);
        });
        setDeletedSubscribers(sorted);
      }
    });

    return () => {
      unsubDel();
    };
  }, []);

  const handleRefreshSubscribers = async () => {
    setIsRefreshingSubscribers(true);
    try {
      const [fsSubs, serverRes] = await Promise.allSettled([
        getSubscribersFromFirestore(),
        fetch('/api/v1/subscribers').then(r => r.json())
      ]);

      const listA: SubscriberRecord[] = fsSubs.status === 'fulfilled' && Array.isArray(fsSubs.value) ? fsSubs.value : [];
      const listB: SubscriberRecord[] = serverRes.status === 'fulfilled' && serverRes.value?.success && Array.isArray(serverRes.value.subscribers) ? serverRes.value.subscribers : [];

      const map = new Map<string, SubscriberRecord>();
      listA.forEach(s => {
        const email = (s.email || '').toLowerCase().trim();
        if (email) map.set(email, s);
      });
      listB.forEach(s => {
        const email = (s.email || '').toLowerCase().trim();
        if (email) {
          const existing = map.get(email);
          if (existing) {
            map.set(email, { ...existing, ...s });
          } else {
            map.set(email, s);
          }
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
        return timeB - timeA;
      });

      setSubscribers(merged);
      onToast(`Refreshed! Found ${merged.length} active subscriber${merged.length === 1 ? '' : 's'}.`);
    } catch (err) {
      onToast('Subscribers feed updated.');
    } finally {
      setIsRefreshingSubscribers(false);
    }
  };

  const handleRestoreSubscriber = async (sub: SubscriberRecord) => {
    setDeletedSubscribers(prev => prev.filter(s => s.id !== sub.id));
    setSubscribers(prev => [sub, ...prev]);

    try {
      await deleteDeletedSubscriberFromFirestore(sub.id);
      await saveSubscriberToFirestore(sub);
    } catch (err) {}

    onToast(`Subscriber "${sub.email}" restored successfully!`);
  };

  const handlePermanentDeleteSubscriber = async (sub: SubscriberRecord) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${sub.email}"? This action cannot be undone.`)) return;

    setDeletedSubscribers(prev => prev.filter(s => s.id !== sub.id));

    try {
      await deleteDeletedSubscriberFromFirestore(sub.id);
    } catch (err) {}

    onToast(`Subscriber permanently deleted!`);
  };

  const handleClearRecycleBin = async () => {
    if (deletedSubscribers.length === 0) {
      onToast('Recycle Bin is already empty!');
      return;
    }
    if (!window.confirm('Are you sure you want to permanently delete ALL subscribers in the Recycle Bin? This action is irreversible.')) return;

    const previousDeleted = [...deletedSubscribers];
    setDeletedSubscribers([]);

    try {
      for (const sub of previousDeleted) {
        await deleteDeletedSubscriberFromFirestore(sub.id);
      }
    } catch (err) {}

    onToast('Recycle Bin cleared successfully!');
  };

  const [newSubEmail, setNewSubEmail] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Super Admin Credentials state
  const [superAdminUser, setSuperAdminUser] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('GovtBharat_superadmin_user') || 'Vikaspatelaoc') : 'Vikaspatelaoc'
  );
  const [superAdminPass, setSuperAdminPass] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('GovtBharat_superadmin_pass') || 'JTY@67YVP') : 'JTY@67YVP'
  );
  const [showSuperPassInDash, setShowSuperPassInDash] = useState(false);

  // Synchronize dashboard credentials display with actual Firestore values on open
  useEffect(() => {
    if (isOpen) {
      getSuperAdminCredentials().then(creds => {
        if (creds) {
          setSuperAdminUser(creds.username);
          setSuperAdminPass(creds.password);
          if (typeof window !== 'undefined') {
            localStorage.setItem('GovtBharat_superadmin_user', creds.username);
            localStorage.setItem('GovtBharat_superadmin_pass', creds.password);
          }
        }
      }).catch(err => {
        console.error("Error fetching super admin credentials in dashboard:", err);
      });
    }
  }, [isOpen]);

  const handleSaveSuperCredentials = async () => {
    if (!superAdminUser.trim() || !superAdminPass.trim()) {
      onToast('⚠️ Username and Password cannot be empty.');
      return;
    }
    if (superAdminPass.trim().length < 6) {
      onToast('⚠️ Password must be at least 6 characters.');
      return;
    }
    try {
      await updateSuperAdminCredentials(superAdminUser.trim(), superAdminPass.trim());
      localStorage.setItem('GovtBharat_superadmin_user', superAdminUser.trim());
      localStorage.setItem('GovtBharat_superadmin_pass', superAdminPass.trim());
      onToast('👑 Super Admin ID and Password updated globally across all devices!');
    } catch (err: any) {
      onToast('❌ Failed to update credentials globally: ' + (err.message || err));
    }
  };

  const handleResetSuperCredentials = async () => {
    if (window.confirm('Reset Super Admin credentials globally to default (Vikaspatelaoc / JTY@67YVP)?')) {
      try {
        await updateSuperAdminCredentials('Vikaspatelaoc', 'JTY@67YVP');
        localStorage.removeItem('GovtBharat_superadmin_user');
        localStorage.removeItem('GovtBharat_superadmin_pass');
        setSuperAdminUser('Vikaspatelaoc');
        setSuperAdminPass('JTY@67YVP');
        onToast('✅ Super Admin credentials reset globally.');
      } catch (err: any) {
        onToast('❌ Failed to reset credentials globally: ' + (err.message || err));
      }
    }
  };

  // Employee creation state
  const [showCreateEmpModal, setShowCreateEmpModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [showCreateEmpPassword, setShowCreateEmpPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [editingEmpPermissionsId, setEditingEmpPermissionsId] = useState<string | null>(null);

  const [empPermissions, setEmpPermissions] = useState<EmployeePermissions>({
    canAddJob: true,
    canEditJob: true,
    canDeleteJob: false,
    canEditTicker: true,
    canExportDatabase: false,
    canSendBroadcast: false,
    canViewAnalytics: true,
  });

  if (!isOpen) return null;

  // Analytics calculation
  const totalJobs = jobs.length;
  const categoryCounts = {
    'latest-jobs': jobs.filter(j => j.category === 'latest-jobs').length,
    'admit-cards': jobs.filter(j => j.category === 'admit-cards').length,
    'results': jobs.filter(j => j.category === 'results').length,
    'answer-key': jobs.filter(j => j.category === 'answer-key').length,
    'syllabus': jobs.filter(j => j.category === 'syllabus').length,
    'admission': jobs.filter(j => j.category === 'admission').length,
  };
  const newJobsCount = jobs.filter(j => j.isNew).length;

  const handleUpdateMarquee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput.trim()) {
      setMarqueeText(tickerInput.trim());
      try {
        await fetch('/api/v1/marquee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ marqueeText: tickerInput.trim() })
        });
      } catch (err) {}
      onToast('Live Marquee Ticker saved to server database!');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GovtBharat_Jobs_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast('Database exported as JSON backup!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        try {
          const parsedJobs = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsedJobs)) {
            setJobs(parsedJobs);
            safeSaveJobsToLocalStorage(parsedJobs);
            try {
              await bulkSaveJobsToFirestore(parsedJobs);
            } catch (err) {}
            try {
              await fetch('/api/v1/sarkari-posts/bulk-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobs: parsedJobs })
              });
            } catch (err) {}
            onToast('Database imported and saved to server & Firestore successfully!');
          } else {
            alert('Invalid JSON structure! Expected array of jobs.');
          }
        } catch (err) {
          alert('Failed to parse JSON file!');
        }
      };
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newSubEmail.trim().toLowerCase();
    if (cleanEmail && cleanEmail.includes('@')) {
      const newSub: SubscriberRecord = {
        id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        email: cleanEmail,
        category: 'All Updates',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        source: 'superadmin',
        muted: false
      };
      setSubscribers(prev => [newSub, ...prev.filter(s => s.email.toLowerCase() !== cleanEmail)]);
      setNewSubEmail('');
      try {
        await saveSubscriberToFirestore(newSub);
      } catch (err) {}
      onToast('New subscriber added to alert list & synced across cloud & server!');
    }
  };

  const handleDeleteSubscriber = async (subId: string) => {
    const targetSub = subscribers.find(s => s.id === subId);
    if (!targetSub) return;
    
    // Optimistic UI update
    setSubscribers(prev => prev.filter(s => s.id !== subId));
    setDeletedSubscribers(prev => [targetSub, ...prev.filter(s => s.id !== subId)]);

    try {
      await deleteSubscriberFromFirestore(subId);
      await saveDeletedSubscriberToFirestore(targetSub);
    } catch (err) {}

    try {
      if (targetSub?.email) {
        const stored = JSON.parse(localStorage.getItem('GovtBharat_subscribers') || '[]');
        if (Array.isArray(stored)) {
          const filtered = stored.filter(e => e !== targetSub.email);
          localStorage.setItem('GovtBharat_subscribers', JSON.stringify(filtered));
        }
      }
    } catch (e) {}

    onToast('Subscriber moved to Recycle Bin!');
  };

  const handleBulkDeleteSubscribers = async () => {
    if (selectedSubIds.length === 0) return;
    const confirmMessage = `Are you sure you want to move the ${selectedSubIds.length} selected subscriber(s) to the Recycle Bin?`;
    if (!window.confirm(confirmMessage)) return;

    const targets = subscribers.filter(s => selectedSubIds.includes(s.id));
    if (targets.length === 0) return;

    // Optimistic UI updates
    setSubscribers(prev => prev.filter(s => !selectedSubIds.includes(s.id)));
    setDeletedSubscribers(prev => [...targets, ...prev.filter(s => !selectedSubIds.includes(s.id))]);
    setSelectedSubIds([]);

    for (const targetSub of targets) {
      try {
        await deleteSubscriberFromFirestore(targetSub.id);
        await saveDeletedSubscriberToFirestore(targetSub);
      } catch (err) {}

      try {
        if (targetSub.email) {
          const stored = JSON.parse(localStorage.getItem('GovtBharat_subscribers') || '[]');
          if (Array.isArray(stored)) {
            const updated = stored.filter((s: any) => s !== targetSub.email);
            localStorage.setItem('GovtBharat_subscribers', JSON.stringify(updated));
          }
        }
      } catch (e) {}
    }

    onToast(`${targets.length} subscriber(s) moved to Recycle Bin!`);
  };

  const handleToggleMuteSubscriber = async (sub: SubscriberRecord) => {
    const isCurrentlyMuted = Boolean(sub.muted);
    const updatedSub = { ...sub, muted: !isCurrentlyMuted };
    
    // Optimistic UI update
    setSubscribers(prev => prev.map(s => s.id === sub.id ? updatedSub : s));

    try {
      await saveSubscriberToFirestore(updatedSub);
      onToast(`Notifications ${updatedSub.muted ? 'muted 🔇' : 'unmuted 🔔'} for ${sub.email}!`);
    } catch (err) {
      setSubscribers(prev => prev.map(s => s.id === sub.id ? sub : s));
      onToast('Failed to change mute status!');
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastSubject && broadcastMessage) {
      setBroadcastSent(true);
      setTimeout(() => {
        setBroadcastSent(false);
        setBroadcastSubject('');
        setBroadcastMessage('');
        onToast(`Email Alert broadcast sent to ${subscribers.length} subscribers!`);
      }, 1200);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empUsername.trim() || !empPassword.trim()) {
      alert('Please enter Employee Name, Username, and Password.');
      return;
    }

    if (employees.some(e => e.username.toLowerCase() === empUsername.trim().toLowerCase())) {
      alert('Username already exists! Choose a different username.');
      return;
    }

    const newEmp: EmployeeUser = {
      id: `emp-${Date.now()}`,
      name: empName.trim(),
      username: empUsername.trim(),
      password: empPassword.trim(),
      role: 'employee',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'active',
      permissions: { ...empPermissions }
    };

    const updatedEmployees = [newEmp, ...employees];
    setEmployees(updatedEmployees);
    localStorage.setItem('GovtBharat_employees', JSON.stringify(updatedEmployees));

    try {
      await saveEmployeeToFirestore(newEmp);
    } catch (err) {
      console.warn('Firestore employee save error:', err);
    }

    fetch('/api/v1/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees: updatedEmployees })
    }).catch(() => {});

    setEmpName('');
    setEmpUsername('');
    setEmpPassword('');
    setShowCreateEmpModal(false);
    onToast(`Employee Login ID created for ${newEmp.name} and saved to database!`);
  };

  const toggleEmployeeStatus = async (empId: string) => {
    let changedEmp: EmployeeUser | null = null;
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        const newStatus = emp.status === 'active' ? 'suspended' : 'active';
        changedEmp = { ...emp, status: newStatus as 'active' | 'suspended' };
        return changedEmp;
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('GovtBharat_employees', JSON.stringify(updated));

    if (changedEmp) {
      try {
        await saveEmployeeToFirestore(changedEmp);
      } catch (err) {}
    }

    fetch('/api/v1/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees: updated })
    }).catch(() => {});
    onToast(`Employee status updated and saved!`);
  };

  const deleteEmployee = async (empId: string, empName: string) => {
    const targetEmp = employees.find(e => e.id === empId);
    const updated = employees.filter(e => e.id !== empId);
    setEmployees(updated);
    localStorage.setItem('GovtBharat_employees', JSON.stringify(updated));



    // Record deletion log
    const newLog = {
      id: `del-log-${Date.now()}`,
      name: targetEmp ? targetEmp.name : empName,
      username: targetEmp ? targetEmp.username : empId,
      deletedAt: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      deletedBy: 'Super Admin'
    };
    if (setDeletedEmployeeLogs) {
      setDeletedEmployeeLogs(prev => {
        const nextLogs = [newLog, ...prev];
        localStorage.setItem('GovtBharat_deleted_employee_logs', JSON.stringify(nextLogs));
        return nextLogs;
      });
    }

    try {
      await deleteEmployeeFromFirestore(empId);
    } catch (err) {
      console.warn('Firestore employee delete error:', err);
    }

    fetch('/api/v1/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees: updated })
    }).catch(() => {});
    onToast(`Employee ID for ${empName} permanently deleted & recorded in Deletion Audit Log!`);
  };

  const togglePermissionForEmployee = async (empId: string, permKey: keyof EmployeePermissions) => {
    let changedEmp: EmployeeUser | null = null;
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        const updatedPerms = { ...emp.permissions, [permKey]: !emp.permissions[permKey] };
        changedEmp = { ...emp, permissions: updatedPerms };
        return changedEmp;
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('GovtBharat_employees', JSON.stringify(updated));

    if (changedEmp) {
      try {
        await saveEmployeeToFirestore(changedEmp);
      } catch (err) {}
    }

    fetch('/api/v1/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employees: updated })
    }).catch(() => {});
    onToast(`Permissions updated & saved to server!`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 w-full flex-1 rounded-2xl shadow-2xl border-2 border-amber-500/50 flex flex-col overflow-hidden animate-in fade-in duration-200 min-h-0 sm:min-h-[500px] h-full">
        
        {/* Top Official India Tricolor Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-white to-emerald-600 shrink-0" />

        {/* Modal Top Header - Official Ashoka Navy Blue Govt Theme */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-amber-500/40 flex items-center justify-center font-bold shadow-inner text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">Super Admin Control Center</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span>🏛️ SUPER ROLE</span>
                </span>
                {consecutiveSyncErrors > 0 && (
                  <span className="bg-rose-500 animate-pulse text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    <span>SYNC OFFLINE ({consecutiveSyncErrors} ERRORS)</span>
                  </span>
                )}
                {isAutoSyncActive && consecutiveSyncErrors === 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>SYNC ONLINE</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 font-medium hidden sm:block">Official Portal Management • Database Operations • Live Settings & Broadcasts</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Domain Name Edit Button */}
            <button
              onClick={() => setShowDomainModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black px-3 py-1.5 rounded-xl text-xs shadow-md transition-all cursor-pointer border border-emerald-400/40"
              title="Edit Domain Name Across All Portal Tabs"
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Edit Domain:</span>
              <span className="font-mono bg-slate-950/60 px-1.5 py-0.5 rounded text-amber-300 text-[11px]">{getDomainName()}</span>
            </button>

            {/* Dropdown Logo Link Button to View Full Panel Box */}
            <button
              onClick={() => {
                setPanelDropdownSearch('');
                setShowPanelDropdownModal(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer border border-amber-300 hover:scale-[1.02]"
              title="Click to view all 14 panels in full box view"
            >
              <LayoutGrid className="w-4 h-4 text-slate-950" />
              <span className="font-extrabold">14 Panels Dropdown</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => { onClose(); onOpenAddJob(); }}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-800 to-indigo-900 text-amber-300 border border-amber-500/40 hover:from-blue-700 hover:to-indigo-800 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Job
            </button>

            {/* 3-Dot Super Admin Options Dropdown Menu */}
            <div className="relative" ref={threeDotRef}>
              <button
                onClick={() => {
                  setShow3DotMenu(!show3DotMenu);
                  setThreeDotSearch('');
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer border flex items-center justify-center shadow-md ${
                  show3DotMenu 
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-amber-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border-amber-500/40'
                }`}
                title="Super Admin All Options (3 Dots)"
                aria-expanded={show3DotMenu}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {show3DotMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] overflow-hidden">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-amber-400 text-slate-950 font-black">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider">Super Admin Options</div>
                        <div className="text-[10px] text-amber-300/80 font-medium">Direct Links to All Management Panels</div>
                      </div>
                    </div>
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {SUPER_ADMIN_MODULES.length} PANELS
                    </span>
                  </div>

                  {/* Search Filter */}
                  <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={threeDotSearch}
                        onChange={(e) => setThreeDotSearch(e.target.value)}
                        placeholder="Search all admin panels..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        autoFocus
                      />
                      {threeDotSearch && (
                        <button 
                          onClick={() => setThreeDotSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Modules List (Auto-linked from SUPER_ADMIN_MODULES) */}
                  <div className="p-2 space-y-1 overflow-y-auto max-h-[46vh] custom-scrollbar">
                    {threeDotSearch ? (
                      SUPER_ADMIN_MODULES.filter(m => 
                        !threeDotSearch || 
                        m.label.toLowerCase().includes(threeDotSearch.toLowerCase()) ||
                        m.shortLabel.toLowerCase().includes(threeDotSearch.toLowerCase()) ||
                        m.description.toLowerCase().includes(threeDotSearch.toLowerCase()) ||
                        m.categoryLabel.toLowerCase().includes(threeDotSearch.toLowerCase())
                      ).map((mod) => {
                        const IconComponent = mod.icon;
                        const isActive = activeTab === mod.id;
                        const badgeVal = mod.badge?.({
                          jobsCount: jobs.length,
                          subscribersCount: subscribers.length,
                          employeesCount: employees.length,
                          socialCount: localSocialLinks.filter(l => l.enabled).length,
                          syncActive: isAutoSyncActive
                        });

                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveTab(mod.id);
                              setShow3DotMenu(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between group border ${
                              isActive
                                ? 'bg-blue-950/90 border-amber-400/90 shadow-md text-amber-300 scale-[1.01]'
                                : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border-slate-800/80 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                              <div className={`p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${
                                isActive ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-800 text-amber-400 group-hover:bg-slate-700'
                              }`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-extrabold truncate ${isActive ? 'text-amber-300' : 'text-white'}`}>
                                    {mod.label}
                                  </span>
                                  {mod.tag && (
                                    <span className="bg-amber-400/20 text-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                      {mod.tag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-normal line-clamp-1 group-hover:text-slate-300 transition-colors">
                                  {mod.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              {badgeVal && (
                                <span className="bg-slate-800 border border-slate-700 text-amber-300 text-[9px] px-2 py-0.5 rounded-full font-black">
                                  {badgeVal}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                                isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                              }`} />
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      Object.entries(
                        SUPER_ADMIN_MODULES.reduce((acc, mod) => {
                          if (!acc[mod.category]) acc[mod.category] = { label: mod.categoryLabel, items: [] };
                          acc[mod.category].items.push(mod);
                          return acc;
                        }, {} as Record<string, { label: string, items: typeof SUPER_ADMIN_MODULES }>)
                      ).map(([category, { label, items }]) => {
                        const isOpen = openCategories[category];
                        return (
                          <div key={category} className="flex flex-col gap-1 mb-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCategories(prev => ({ [category]: !prev[category] }));
                              }}
                              className="flex items-center justify-between px-2 py-2 text-[10px] font-black text-slate-400 hover:text-slate-200 uppercase tracking-wider transition-colors cursor-pointer group bg-slate-900/50 hover:bg-slate-800/50 rounded-lg"
                            >
                              <span>{label}</span>
                              <div className="p-0.5 rounded bg-slate-800 group-hover:bg-slate-700 transition-colors">
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                              </div>
                            </button>
                            {isOpen && (
                              <div className="flex flex-col gap-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                {items.map((mod) => {
                                  const IconComponent = mod.icon;
                                  const isActive = activeTab === mod.id;
                                  const badgeVal = mod.badge?.({
                                    jobsCount: jobs.length,
                                    subscribersCount: subscribers.length,
                                    employeesCount: employees.length,
                                    socialCount: localSocialLinks.filter(l => l.enabled).length,
                                    syncActive: isAutoSyncActive
                                  });

                                  return (
                                    <button
                                      key={mod.id}
                                      onClick={() => {
                                        setActiveTab(mod.id);
                                        setShow3DotMenu(false);
                                      }}
                                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between group border ${
                                        isActive
                                          ? 'bg-blue-950/90 border-amber-400/90 shadow-md text-amber-300 scale-[1.01]'
                                          : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border-slate-800/80 hover:border-slate-700 hover:text-white'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        <div className={`p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${
                                          isActive ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-800 text-amber-400 group-hover:bg-slate-700'
                                        }`}>
                                          <IconComponent className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`font-extrabold truncate ${isActive ? 'text-amber-300' : 'text-white'}`}>
                                              {mod.label}
                                            </span>
                                            {mod.tag && (
                                              <span className="bg-amber-400/20 text-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                                                {mod.tag}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-normal line-clamp-1 group-hover:text-slate-300 transition-colors">
                                            {mod.description}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-1.5 shrink-0">
                                        {badgeVal && (
                                          <span className="bg-slate-800 border border-slate-700 text-amber-300 text-[9px] px-2 py-0.5 rounded-full font-black">
                                            {badgeVal}
                                          </span>
                                        )}
                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                                          isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                                        }`} />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Quick Operations Action Tray */}
                  <div className="p-2.5 bg-slate-950 border-t border-slate-800 shrink-0 space-y-1.5">
                    <div className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-wider">
                      Quick Shortcut Actions
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setShow3DotMenu(false);
                          onClose();
                          onOpenAddJob();
                        }}
                        className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Add New Job</span>
                      </button>

                      <button
                        onClick={() => {
                          setShow3DotMenu(false);
                          handleExportJSON();
                        }}
                        className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">Export JSON</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setShow3DotMenu(false);
                        if (confirm('Are you sure you want to reset database to default sample data?')) {
                          onResetDatabase();
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Reset Database to Default</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Left Navigation Sidebar (Dynamically rendered from SUPER_ADMIN_MODULES) */}
          <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-2.5 sm:p-3.5 flex flex-col gap-1.5 shrink-0 z-20 custom-scrollbar overflow-hidden md:overflow-y-auto">
            
            {/* TOP DROPDOWN LOGO / LINK BUTTON TO VIEW FULL BOX */}
            <div className="p-2.5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-xl border-2 border-amber-500/60 shadow-lg shrink-0 mb-1 sticky top-0 z-10">
              <button
                type="button"
                onClick={() => {
                  setPanelDropdownSearch('');
                  setShowPanelDropdownModal(true);
                }}
                className="w-full text-left flex items-center justify-between gap-2 cursor-pointer group"
                title="Click to view all panels"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <span>SUPER ADMIN</span>
                      <span className="bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded text-[8px] border border-amber-400/30">
                        {SUPER_ADMIN_MODULES.length} PANELS
                      </span>
                    </div>
                    <div className="text-xs font-black text-white truncate flex items-center gap-1">
                      <span className="truncate">{SUPER_ADMIN_MODULES.find(m => m.id === activeTab)?.label || 'All Panels'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 shadow group-hover:bg-amber-300 transition-colors">
                  <span>MENU</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
                </div>
              </button>
            </div>

            <div className="hidden md:flex flex-col gap-1">
              {Object.entries(
                SUPER_ADMIN_MODULES.reduce((acc, mod) => {
                  if (!acc[mod.category]) acc[mod.category] = { label: mod.categoryLabel, items: [] };
                  acc[mod.category].items.push(mod);
                  return acc;
                }, {} as Record<string, { label: string, items: typeof SUPER_ADMIN_MODULES }>)
              ).map(([category, { label, items }]) => {
                const isOpen = openCategories[category];
                return (
                  <div key={category} className="flex flex-col gap-1">
                    <button
                      onClick={() => setOpenCategories(prev => ({ [category]: !prev[category] }))}
                      className="flex items-center justify-between px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                    >
                      <span>{label}</span>
                      <div className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors">
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-1 fade-in duration-200 mb-2">
                        {items.map((mod) => {
                          const IconComp = mod.icon;
                          const isActive = activeTab === mod.id;
                          const badgeVal = mod.badge?.({
                            jobsCount: jobs.length,
                            subscribersCount: subscribers.length,
                            employeesCount: employees.length,
                            socialCount: localSocialLinks.filter(l => l.enabled).length,
                            syncActive: isAutoSyncActive
                          });

                          return (
                            <button
                              key={mod.id}
                              onClick={() => setActiveTab(mod.id)}
                              className={`flex items-center justify-between space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer group ${
                                isActive
                                  ? 'bg-blue-950 text-amber-300 shadow-md border border-amber-500/50 scale-[1.01]'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-transparent'
                              }`}
                              title={mod.description}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <IconComp className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                  isActive ? 'text-amber-400' : 'text-slate-500 dark:text-slate-400'
                                }`} />
                                <span className="text-xs font-bold leading-tight break-words">{mod.label}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {badgeVal !== undefined && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                                    isActive 
                                      ? 'bg-amber-400 text-slate-950' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {badgeVal}
                                  </span>
                                )}
                                <ChevronRight className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-amber-400 opacity-100 translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 -translate-x-1'}`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-auto hidden md:block pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Activity className="w-3.5 h-3.5" /> System Live & Active
              </div>
              <p>Logged as: <strong>SuperAdmin</strong></p>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-slate-900">
            
            {/* TAB 1: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-red-600" /> System & Portal Overview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time statistics of published job notifications and category distribution.</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Active Jobs</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalJobs}</div>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40">
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">New Badges</span>
                    <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{newJobsCount}</div>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Alert Users</span>
                    <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">{subscribers.length}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Server Health</span>
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">100%</div>
                  </div>
                </div>

                {/* Category Distribution Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4">
                  <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-3">
                    Category Wise Job Distribution
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Latest Jobs</span>
                      <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">{categoryCounts['latest-jobs']}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Admit Cards</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">{categoryCounts['admit-cards']}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Exam Results</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">{categoryCounts['results']}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Answer Key</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">{categoryCounts['answer-key']}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Syllabus PDF</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">{categoryCounts['syllabus']}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Admission</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">{categoryCounts['admission']}</span>
                    </div>
                  </div>
                </div>

                {/* Most Popular Job Categories & High-Traffic Links Radar (Content Prioritization) */}
                <PopularCategoriesAndTrafficAnalytics
                  jobs={jobs}
                  onSelectCategory={(cat) => {
                    setActiveTab('jobsManager');
                  }}
                  onToast={onToast}
                />

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Super Admin Privilege Active</h5>
                    <p className="mt-0.5">As Super Admin, you have authority to edit live news tickers, add or delete entries, export JSON database dumps, and control portal parameters.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MASTER WEBSITE CONTROL & CUSTOMIZER */}
            {activeTab === 'websiteControl' && (
              <WebsiteControlTab 
                onToast={onToast} 
                siteLogo={siteLogo}
                setSiteLogo={setSiteLogo}
              />
            )}

            {/* TAB: MOBILE APP TABS, BUTTONS & TOOLS */}
            {activeTab === 'mobileTabs' && (
              <MobileAppButtonsManagerTab
                config={mobileTabsConfig}
                onSave={onSaveMobileTabsConfig}
                onToast={onToast}
                initialSubTab="categories"
              />
            )}

            {/* TAB: MOBILE PWA JOB CARDS & ICONS SIZING */}
            {activeTab === 'mobileCardSizing' && (
              <MobileAppButtonsManagerTab
                config={mobileTabsConfig}
                onSave={onSaveMobileTabsConfig}
                onToast={onToast}
                initialSubTab="cardSizing"
              />
            )}

            {/* TAB: TRENDING BANNERS & SLIDER CUSTOMIZER */}
            {activeTab === 'bannersManager' && (
              <TrendingBannersManagerTab
                config={mobileTabsConfig}
                onSave={onSaveMobileTabsConfig}
                onToast={onToast}
                jobs={jobs}
              />
            )}

            {/* TAB: JOBS MANAGER & BULK DELETE */}
            {activeTab === 'jobsManager' && (
              <JobsManagerTab
                jobs={jobs}
                setJobs={setJobs}
                onToast={onToast}
                onEditJob={onEditJob || ((id, e) => {})}
                onDeleteJob={onDeleteJob || ((id, e) => {})}
              />
            )}
            {activeTab === 'earnings' && (
              <EarningsTab onToast={onToast} />
            )}

            {/* TAB 2: MARQUEE TICKER EDITOR */}
            {activeTab === 'marquee' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-red-600" /> Live News Marquee Ticker Editor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update the scrolling news ticker at the top of the website instantly for all visitors.</p>
                </div>

                <form onSubmit={handleUpdateMarquee} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      Marquee Text Content (Separate multiple notices with | symbol)
                    </label>
                    <textarea
                      rows={4}
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                      placeholder="e.g. 🔥 UP Police Constable Result Declared! | 🚀 SSC CGL Form Active"
                    />
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Live Preview</span>
                    <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-amber-300 border border-amber-500/30 text-xs font-semibold py-2 px-3 rounded-lg overflow-hidden whitespace-nowrap">
                      🔥 {tickerInput}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save & Publish Live Ticker
                  </button>
                </form>
              </div>
            )}

            {/* TAB: THEME & COLOR CUSTOMIZER */}
            {activeTab === 'colors' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <ThemeColorCustomizerTab 
                  onToast={onToast} 
                  siteLogo={siteLogo}
                  appName={appName}
                />
              </div>
            )}

            {/* TAB: COLUMN TEXT & TITLE CUSTOMIZER */}
            {activeTab === 'columns' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <ColumnEditorTab onToast={onToast} initialColumnId={initialColumnId} />
              </div>
            )}

            {/* TAB: HOMEPAGE GLOBAL SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SeoEditorTab onShowToast={onToast} />
              </div>
            )}

            {/* TAB: CATEGORY SEO & META TAGS MANAGER */}
            {activeTab === 'categorySeo' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <CategorySeoEditorTab onShowToast={onToast} />
              </div>
            )}

            {/* TAB: SITEMAP GENERATOR */}
            {activeTab === 'sitemap' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SitemapGeneratorTab jobs={jobs} onToast={onToast} />
              </div>
            )}

            {/* TAB: SOCIAL MEDIA & CHANNELS */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SocialLinksManager
                  socialLinks={localSocialLinks}
                  setSocialLinks={(newLinks) => {
                    setLocalSocialLinks(newLinks);
                    if (setSocialLinks) setSocialLinks(newLinks);
                  }}
                  onSaveToFirestore={async (newLinks) => {
                    if (onSaveSocialLinks) {
                      await onSaveSocialLinks(newLinks);
                    }
                  }}
                  onToast={onToast}
                />
              </div>
            )}

            {/* TAB: VERSION CONTROL */}

            {activeTab === 'versions' && (
              <VersionControlTab
                jobs={jobs}
                setJobs={setJobs}
                employees={employees}
                marqueeText={marqueeText}
                setMarqueeText={setMarqueeText}
                onToast={onToast}
              />
            )}

            {/* TAB 3: SITE CONFIG */}
            {activeTab === 'site' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-red-600" /> Portal Configurations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customize main portal branding and operational modes.</p>
                </div>

                <div className="space-y-4 text-xs font-semibold pb-6">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 mb-1">Portal Name / Branding Title (Website)</label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 dark:text-slate-200 mb-1">Mobile App Name (PWA)</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 dark:text-slate-200 mb-1">App Version</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={appVersion}
                          className="w-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2.5 text-slate-500 cursor-not-allowed focus:outline-none"
                        />
                        <button
                          onClick={handlePushAppUpdate}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap transition-colors"
                        >
                          Push Update
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
                  >
                    {isSavingConfig ? 'Saving...' : 'Save All Configurations'}
                  </button>

                  {setSiteLogo && (
                    <LogoManager 
                      currentLogo={siteLogo || "/logo.png"} 
                      onUpdateLogo={(base64) => {
                        setSiteLogo(base64);
                        onToast('Global logo updated successfully!');
                      }}
                      onToast={onToast}
                    />
                  )}

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Maintenance Mode</h4>
                        <p className="text-[11px] text-slate-500 font-normal">Show maintenance notification banner to public visitors.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => {
                          setMaintenanceMode(e.target.checked);
                          onToast(`Maintenance Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                        }}
                        className="w-5 h-5 text-red-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Super Admin Credentials & Login Key Management Card */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-amber-500/40 rounded-xl space-y-3.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <KeyRound className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            Super Admin Login ID & Password
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                              Master Access
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-400">Update the username and password used to login to Super Admin portal.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 text-[11px] font-bold mb-1">Super Admin Username</label>
                        <input
                          type="text"
                          value={superAdminUser}
                          onChange={(e) => setSuperAdminUser(e.target.value)}
                          placeholder="e.g. Vikaspatelaoc"
                          className="w-full border border-slate-700 bg-slate-950/80 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 text-[11px] font-bold mb-1">Super Admin Password</label>
                        <div className="relative">
                          <input
                            type={showSuperPassInDash ? 'text' : 'password'}
                            value={superAdminPass}
                            onChange={(e) => setSuperAdminPass(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full border border-slate-700 bg-slate-950/80 rounded-lg p-2 pr-9 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSuperPassInDash(!showSuperPassInDash)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                            title={showSuperPassInDash ? "Hide password" : "Show password"}
                          >
                            {showSuperPassInDash ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleSaveSuperCredentials}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Update Super Admin ID</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onToast('Site configurations saved successfully!')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Save Portal Settings
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: DATABASE & BACKUP */}
            {activeTab === 'database' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-600" /> Database & Backup Controls
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Export backups, restore previous database dumps, or reset to original dataset.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                      <Download className="w-4 h-4 text-emerald-600" /> Export JSON Backup
                    </div>
                    <p className="text-[11px] text-slate-500">Download a complete JSON file containing all active job records, dates, fees, and official links.</p>
                    <button
                      onClick={handleExportJSON}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download JSON Backup
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                      <Upload className="w-4 h-4 text-indigo-600" /> Import JSON Database
                    </div>
                    <p className="text-[11px] text-slate-500">Restore or load job database from a previously saved JSON file.</p>
                    <label className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Upload & Restore JSON
                      <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Reset & Wipe */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs">
                    <Trash2 className="w-4 h-4 text-rose-600" /> Reset Database to Factory Defaults
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    Caution: This will restore the portal to initial mock government job entries.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={onResetDatabase}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset to Default Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-600" /> Registered Email Alert Subscribers
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage email subscribers and send broadcast email notifications.</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleRefreshSubscribers}
                      disabled={isRefreshingSubscribers}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-sm border border-slate-200/50 dark:border-slate-700"
                      title="Refresh Subscribers List"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSubscribers ? 'animate-spin' : ''}`} />
                      {isRefreshingSubscribers ? 'Refreshing...' : 'Refresh'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRecycleBin(!showRecycleBin)}
                      className={`inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-sm border ${
                        showRecycleBin 
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' 
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-slate-700'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Recycle Bin ({deletedSubscribers.length})
                    </button>
                  </div>
                </div>

                {/* RECYCLE BIN DRAWER/SECTION */}
                {showRecycleBin && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recycle Bin (Deleted Subscribers)</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Items here can be restored back to active list or deleted permanently.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearRecycleBin}
                        disabled={deletedSubscribers.length === 0}
                        className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        Empty Bin
                      </button>
                    </div>

                    {deletedSubscribers.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/40">
                        Recycle Bin is empty. No deleted subscribers found.
                      </div>
                    ) : (
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <div className="overflow-x-auto max-h-80">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                                <th className="p-3">Subscriber Email</th>
                                <th className="p-3">Candidate Name</th>
                                <th className="p-3">WhatsApp / Mobile</th>
                                <th className="p-3">Information / Query</th>
                                <th className="p-3">Category Interest</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                              {deletedSubscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{sub.email}</td>
                                  <td className="p-3">{sub.name || <span className="text-slate-400 italic">N/A</span>}</td>
                                  <td className="p-3 font-mono">{sub.phone || <span className="text-slate-400 italic">N/A</span>}</td>
                                  <td className="p-3 max-w-xs truncate" title={sub.notes || sub.message}>{sub.notes || sub.message || <span className="text-slate-400 italic">None</span>}</td>
                                  <td className="p-3">
                                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                      {sub.category || 'All Updates'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreSubscriber(sub)}
                                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePermanentDeleteSubscriber(sub)}
                                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold hover:underline cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Search & Add row */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search subscribers by name, email, phone or notes..."
                      value={subscriberSearchQuery}
                      onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                    {subscriberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSubscriberSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px] font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Add subscriber inline */}
                  <form onSubmit={handleAddSubscriber} className="flex gap-2 shrink-0">
                    <input
                      type="email"
                      required
                      placeholder="Add subscriber email manually..."
                      value={newSubEmail}
                      onChange={(e) => setNewSubEmail(e.target.value)}
                      className="w-56 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shrink-0 cursor-pointer shadow-sm"
                    >
                      + Add Email
                    </button>
                  </form>
                </div>

                {/* Bulk Actions Panel */}
                {selectedSubIds.length > 0 && (
                  <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-xl p-3 animate-in fade-in slide-in-from-top duration-200">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                      <p className="text-xs font-bold text-red-950 dark:text-red-300">
                        {selectedSubIds.length} subscriber(s) selected
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSubIds([])}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Deselect All
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDeleteSubscribers}
                        className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Move Selected to Recycle Bin
                      </button>
                    </div>
                  </div>
                )}

                {/* Subscriber List Table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={filteredSubscribers.length > 0 && filteredSubscribers.every(s => selectedSubIds.includes(s.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newIds = Array.from(new Set([...selectedSubIds, ...filteredSubscribers.map(s => s.id)]));
                                setSelectedSubIds(newIds);
                              } else {
                                const filteredIds = filteredSubscribers.map(s => s.id);
                                setSelectedSubIds(selectedSubIds.filter(id => !filteredIds.includes(id)));
                              }
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5"
                          />
                        </th>
                        <th className="p-3">Subscriber Email</th>
                        <th className="p-3">Candidate Name</th>
                        <th className="p-3">WhatsApp / Mobile</th>
                        <th className="p-3">Information / Query</th>
                        <th className="p-3">Category Interest</th>
                        <th className="p-3">Subscribed Date</th>
                        <th className="p-3 text-center">Notifications</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {filteredSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                              <Users className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2 opacity-50" />
                              <div className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                {subscriberSearchQuery ? 'No Matching Subscribers Found' : 'No Registered Subscribers'}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                {subscriberSearchQuery 
                                  ? 'No registered subscribers match your search filter criteria. Try adjusting your keywords.' 
                                  : 'Candidates who subscribe on the portal will appear here in real time, along with their custom information and queries.'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredSubscribers.map((sub) => (
                          <tr key={sub.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${selectedSubIds.includes(sub.id) ? 'bg-red-50/30 dark:bg-red-950/5' : ''}`}>
                            <td className="p-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedSubIds.includes(sub.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSubIds([...selectedSubIds, sub.id]);
                                  } else {
                                    setSelectedSubIds(selectedSubIds.filter(id => id !== sub.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5"
                              />
                            </td>
                            <td className="p-3 font-semibold">{sub.email}</td>
                            <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{sub.name || <span className="text-slate-400 italic">N/A</span>}</td>
                            <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{sub.phone || <span className="text-slate-400 italic">N/A</span>}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={sub.notes || sub.message || ''}>
                              {sub.notes || sub.message || <span className="text-slate-400 italic">None</span>}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{sub.category}</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{sub.date}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleMuteSubscriber(sub)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  sub.muted
                                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-200'
                                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-200'
                                }`}
                                title={sub.muted ? 'Unmute notifications' : 'Mute notifications'}
                              >
                                {sub.muted ? (
                                  <>
                                    <BellOff className="w-3 h-3" />
                                    Muted
                                  </>
                                ) : (
                                  <>
                                    <Bell className="w-3 h-3" />
                                    Active
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="text-rose-600 hover:text-rose-800 dark:text-rose-400 font-bold text-[11px] cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Broadcast Form */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-red-600" /> Send Email Alert Broadcast
                  </h4>
                  <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Email Subject (e.g. 🔥 New UP Police Admit Card Released)"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                    />
                    <textarea
                      required
                      rows={2}
                      placeholder="Type broadcast message details..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="submit"
                      disabled={broadcastSent}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> {broadcastSent ? 'Sending Broadcast...' : 'Send Broadcast to All Subscribers'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 6: EMPLOYEES & ACCESS CONTROL */}
            {activeTab === 'employees' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-amber-500" /> Employee Login IDs & Custom Access Rights
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Create multiple logins for staff/employees and explicitly choose what features they can access or modify.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateEmpModal(!showCreateEmpModal)}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> {showCreateEmpModal ? 'Cancel Creation' : 'Create New Employee ID'}
                  </button>
                </div>

                {/* Create Employee ID Form Modal / Expander */}
                {showCreateEmpModal && (
                  <form onSubmit={handleCreateEmployee} className="p-4 bg-slate-50 dark:bg-slate-800/80 border-2 border-red-500/30 rounded-2xl space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-red-600" /> Generate Employee ID Credentials
                      </h4>
                      <span className="text-[11px] text-slate-500 font-normal">Super Admin Authority</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Employee Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={empName}
                          onChange={e => setEmpName(e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Login Username *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ramesh_data"
                          value={empUsername}
                          onChange={e => setEmpUsername(e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Login Password *</label>
                        <div className="relative">
                          <input
                            type={showCreateEmpPassword ? "text" : "password"}
                            required
                            placeholder="e.g. Pass123#"
                            value={empPassword}
                            onChange={e => setEmpPassword(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2.5 pr-10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCreateEmpPassword(!showCreateEmpPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
                            title={showCreateEmpPassword ? "Hide password" : "Show password"}
                          >
                            {showCreateEmpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions Selector Box */}
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <label className="block font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                        🛡️ Select Feature Access & Rights (Kya Kya Access Dena Hai)
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canAddJob}
                            onChange={e => setEmpPermissions({ ...empPermissions, canAddJob: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">➕ Add New Jobs</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canEditJob}
                            onChange={e => setEmpPermissions({ ...empPermissions, canEditJob: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">✏️ Edit Existing Jobs</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canDeleteJob}
                            onChange={e => setEmpPermissions({ ...empPermissions, canDeleteJob: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">🗑️ Delete Job Entries</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canEditTicker}
                            onChange={e => setEmpPermissions({ ...empPermissions, canEditTicker: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">📢 Marquee News Ticker</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canExportDatabase}
                            onChange={e => setEmpPermissions({ ...empPermissions, canExportDatabase: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">💾 Database Export/Backup</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canSendBroadcast}
                            onChange={e => setEmpPermissions({ ...empPermissions, canSendBroadcast: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">✉️ Broadcast Email Alerts</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={empPermissions.canViewAnalytics}
                            onChange={e => setEmpPermissions({ ...empPermissions, canViewAnalytics: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">📊 View Portal Analytics</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCreateEmpModal(false)}
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Save & Issue Employee ID
                      </button>
                    </div>
                  </form>
                )}

                {/* Employee Account List */}
                {employees.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                    <UserPlus className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Employee IDs Created Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      Click the "Create New Employee ID" button above to generate custom logins for your team members.
                    </p>
                    <button
                      onClick={() => setShowCreateEmpModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow"
                    >
                      + Create First Employee ID
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                      <span>Active Staff Login Accounts ({employees.length})</span>
                      <span>Click permissions below to toggle access instantly</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {employees.map(emp => {
                        const isPassShown = !!showPasswords[emp.id];
                        return (
                          <div
                            key={emp.id}
                            className={`p-4 rounded-xl border transition-all ${
                              emp.status === 'suspended'
                                ? 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-75'
                                : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-150 dark:border-slate-700/60">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-inner shrink-0">
                                  {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{emp.name}</h4>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                      emp.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    }`}>
                                      {emp.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 font-mono">
                                    <span>User: <strong className="text-slate-800 dark:text-slate-200 font-bold">{emp.username}</strong></span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      Pass: <strong className="text-slate-800 dark:text-slate-200 font-bold">{isPassShown ? emp.password : '••••••••'}</strong>
                                      <button
                                        onClick={() => setShowPasswords({ ...showPasswords, [emp.id]: !isPassShown })}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
                                        title={isPassShown ? 'Hide Password' : 'Show Password'}
                                      >
                                        {isPassShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => toggleEmployeeStatus(emp.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    emp.status === 'active'
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50'
                                  }`}
                                >
                                  {emp.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                  <span>{emp.status === 'active' ? 'Suspend ID' : 'Activate ID'}</span>
                                </button>

                                <button
                                  onClick={() => deleteEmployee(emp.id, emp.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Granular Permissions Badges / Toggles */}
                            <div className="pt-3">
                              <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block mb-2">
                                Allowed Privileges (Click badge to toggle ON / OFF):
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-xs">
                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canAddJob')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canAddJob
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canAddJob ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>Add Jobs</span>
                                </button>

                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canEditJob')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canEditJob
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canEditJob ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>Edit Jobs</span>
                                </button>

                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canDeleteJob')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canDeleteJob
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canDeleteJob ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>Delete Jobs</span>
                                </button>

                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canEditTicker')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canEditTicker
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canEditTicker ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>News Ticker</span>
                                </button>

                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canExportDatabase')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canExportDatabase
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canExportDatabase ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>Database Export</span>
                                </button>

                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canSendBroadcast')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canSendBroadcast
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canSendBroadcast ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>Email Broadcast</span>
                                </button>

                                <button
                                  onClick={() => togglePermissionForEmployee(emp.id, 'canViewAnalytics')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    emp.permissions.canViewAnalytics
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                                  }`}
                                >
                                  {emp.permissions.canViewAnalytics ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                                  <span>Analytics</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Deleted Employee Audit Logs Section */}
                <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Deleted Employee Audit Logs ({deletedEmployeeLogs.length})
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Permanent audit trail of revoked employee login accounts. Blacklisted from reappearing on devices.
                        </p>
                      </div>
                    </div>
                    {deletedEmployeeLogs.length > 0 && (
                      <button
                        onClick={() => {
                          if (setDeletedEmployeeLogs) setDeletedEmployeeLogs([]);
                          localStorage.removeItem('GovtBharat_deleted_employee_logs');
                          onToast('Deleted employee audit logs cleared!');
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        Clear Logs
                      </button>
                    )}
                  </div>

                  {deletedEmployeeLogs.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                      No deletion logs recorded yet. Deleted employees will appear here permanently.
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Employee Name</th>
                            <th className="p-2.5">Username</th>
                            <th className="p-2.5">Deleted At</th>
                            <th className="p-2.5">Deleted By</th>
                            <th className="p-2.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {deletedEmployeeLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">{log.name}</td>
                              <td className="p-2.5">{log.username}</td>
                              <td className="p-2.5 text-slate-500">{log.deletedAt}</td>
                              <td className="p-2.5 text-amber-600 dark:text-amber-400 font-bold">{log.deletedBy}</td>
                              <td className="p-2.5 text-right">
                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold uppercase">
                                  Revoked
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: NPM SYSTEM */}
            {activeTab === 'npm' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <NpmSystemContent />
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AdminApprovalsContent 
                  jobs={jobs}
                  onUpdateJob={async (j) => {
                     if (onSaveJob) await onSaveJob(j);
                     else setJobs(prev => prev.map(old => old.id === j.id ? j : old));
                  }}
                  onDeleteJob={async (id) => {
                     if (onDeleteJob) await onDeleteJob(id, {} as any);
                     else setJobs(prev => prev.filter(j => j.id !== id));
                  }}
                  onToast={onToast}
                  onPushJob={async (job) => {
                    if (onSaveJob) await onSaveJob(job);
                  }}
                  onBulkPushJobs={async (bulkJobs) => {
                    if (onBulkSaveJobs) await onBulkSaveJobs(bulkJobs);
                  }}
                />
              </div>
            )}
            
            {/* TAB 8: AUTO-FILL & SCRAPER REST API */}
            {activeTab === 'autofeed' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AutoFeedContent
                  onPushJob={async (newJob) => {
                    if (onSaveJob) {
                      await onSaveJob(newJob);
                    } else {
                      setJobs(prev => [newJob, ...prev.filter(j => j.id !== newJob.id)]);
                    }
                    onToast(`🚀 Auto-Filled to Portal: ${newJob.title}`);
                  }}
                  onBulkPushJobs={async (newJobs) => {
                    if (onBulkSaveJobs) {
                      await onBulkSaveJobs(newJobs);
                    } else if (onSaveJob) {
                      for (const j of newJobs) {
                        await onSaveJob(j);
                      }
                    } else {
                      setJobs(prev => [...newJobs, ...prev.filter(p => !newJobs.some(j => j.id === p.id))]);
                    }
                    onToast(`🎉 Published ${newJobs.length} Alerts to Database across all devices!`);
                  }}
                  onToast={onToast}
                  isAutoSyncActive={isAutoSyncActive}
                  setIsAutoSyncActive={setIsAutoSyncActive}
                  syncLogs={syncLogs}
                />
              </div>
            )}

            {/* NEW EXTENSION TABS */}
            {activeTab === 'pages' && (
              <div className="animate-in fade-in duration-200">
                <PagesManagerTab onToast={onToast} />
              </div>
            )}
            
            {activeTab === 'apiIntegrations' && (
              <div className="animate-in fade-in duration-200">
                <ApiAnalyticsTab onToast={onToast} />
              </div>
            )}

            {activeTab === 'activityLogs' && (
              <div className="animate-in fade-in duration-200">
                <ActivityLogsTab />
              </div>
            )}

            {activeTab === 'helpdesk' && (
              <div className="animate-in fade-in duration-200">
                <HelpdeskTab onToast={onToast} />
              </div>
            )}

            {activeTab === 'autoBroadcast' && (
              <div className="animate-in fade-in duration-200">
                <AutoBroadcasterTab onToast={onToast} />
              </div>
            )}

            {activeTab === 'adsManager' && (
              <div className="animate-in fade-in duration-200">
                <AdsManagerTab onToast={onToast} />
              </div>
            )}

            {activeTab === 'emailNotifications' && (
              <div className="animate-in fade-in duration-200">
                <EmailNotificationsTab
                  subscribers={subscribers}
                  jobs={jobs}
                  onToast={onToast}
                />
              </div>
            )}

            {activeTab === 'documentCenter' && (
              <div className="animate-in fade-in duration-200">
                <AdminStudentDocuments />
              </div>
            )}
            {activeTab === 'linkHealth' && (
              <div className="animate-in fade-in duration-200">
                <LinkHealthCheckerTab jobs={jobs} setJobs={setJobs} onToast={onToast} onSaveJob={onSaveJob} />
              </div>
            )}

          </div>
        </div>

        {/* FULL PANEL BOX DROPDOWN OVERLAY MODAL */}
        {showPanelDropdownModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-4 ring-amber-500/20">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">Super Admin All Panels Menu</h3>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        14 FULL BOXES
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/80">
                      किसी भी पैनल पर क्लिक करके तुरंत उस सेक्शन में जाएँ (Click any box to switch panel)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPanelDropdownModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input Box */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 shrink-0">
                <div className="relative max-w-md mx-auto">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={panelDropdownSearch}
                    onChange={(e) => setPanelDropdownSearch(e.target.value)}
                    placeholder="Search panels by name, category or description..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
                    autoFocus
                  />
                  {panelDropdownSearch && (
                    <button
                      onClick={() => setPanelDropdownSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of All 14 Panels (Full Box View) */}
              <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {SUPER_ADMIN_MODULES.filter(mod => 
                    !panelDropdownSearch ||
                    mod.label.toLowerCase().includes(panelDropdownSearch.toLowerCase()) ||
                    mod.shortLabel.toLowerCase().includes(panelDropdownSearch.toLowerCase()) ||
                    mod.description.toLowerCase().includes(panelDropdownSearch.toLowerCase()) ||
                    mod.categoryLabel.toLowerCase().includes(panelDropdownSearch.toLowerCase())
                  ).map((mod) => {
                    const IconComp = mod.icon;
                    const isActive = activeTab === mod.id;
                    const badgeVal = mod.badge?.({
                      jobsCount: jobs.length,
                      subscribersCount: subscribers.length,
                      employeesCount: employees.length,
                      socialCount: localSocialLinks.filter(l => l.enabled).length,
                      syncActive: isAutoSyncActive
                    });

                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          setActiveTab(mod.id);
                          setShowPanelDropdownModal(false);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 border-amber-400 shadow-xl ring-2 ring-amber-400/40 scale-[1.01]'
                            : 'bg-slate-950/80 border-slate-800 hover:border-amber-400/60 hover:bg-slate-800/90'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2.5">
                              <div className={`p-2.5 rounded-xl border ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                                  : 'bg-slate-900 text-amber-400 border-slate-700 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors'
                              }`}>
                                <IconComp className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {mod.categoryLabel}
                              </span>
                            </div>

                            {mod.tag && (
                              <span className="bg-amber-400/20 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded uppercase border border-amber-400/30">
                                {mod.tag}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                            {mod.label}
                          </h4>

                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-normal leading-relaxed">
                            {mod.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          {badgeVal ? (
                            <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                              {badgeVal}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold uppercase">
                              READY
                            </span>
                          )}

                          <span className={`text-[11px] font-bold flex items-center gap-1 transition-transform group-hover:translate-x-1 ${
                            isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'
                          }`}>
                            {isActive ? '● Active Panel' : 'Open Box →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Domain Name Editor Modal */}
        <DomainEditorModal
          isOpen={showDomainModal}
          onClose={() => setShowDomainModal(false)}
          onToast={onToast}
        />

      </div>
  );
};
