import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Megaphone, DollarSign, Save, Activity, Share2, 
  Search, RefreshCw, Check, CheckCircle2, MessageSquare, Send
} from 'lucide-react';
import { 
  subscribeToApiConfig, saveApiConfigToFirestore, 
  subscribeToAdsConfig, saveAdsConfigToFirestore 
} from '../services/firestoreService';

export { PagesManagerTab } from './PagesManagerTab';
export { HelpdeskTab } from './HelpdeskTab';
export { EmailNotificationsTab } from './EmailNotificationsTab';

export const ApiAnalyticsTab = ({ onToast }: { onToast?: (msg: string) => void }) => {
  const [config, setConfig] = useState({
    ga4Id: '',
    telegramBotToken: '',
    facebookPixelId: '',
    clarityId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsub = subscribeToApiConfig((cloudConfig) => {
      if (cloudConfig) {
        setConfig(prev => ({ ...prev, ...cloudConfig }));
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveApiConfigToFirestore(config);
      setIsSaving(false);
      setSaveSuccess(true);
      if (onToast) onToast('API & Analytics configuration saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
      if (onToast) onToast('Failed to save API configuration to cloud.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              API Keys & Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure global tracking and external services</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
              saveSuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save API Keys'}</span>
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Google Analytics (GA4) Measurement ID</label>
            <p className="text-[11px] text-slate-500 mb-2">e.g. G-XXXXXXXXXX</p>
            <input 
              type="text" 
              value={config.ga4Id}
              onChange={(e) => setConfig({ ...config, ga4Id: e.target.value })}
              placeholder="G-1234567890" 
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Telegram Bot Token</label>
            <p className="text-[11px] text-slate-500 mb-2">Required for Auto-Broadcaster bot</p>
            <input 
              type="password" 
              value={config.telegramBotToken}
              onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value })}
              placeholder="1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ" 
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Facebook Pixel ID / Meta Tag</label>
            <input 
              type="text" 
              value={config.facebookPixelId}
              onChange={(e) => setConfig({ ...config, facebookPixelId: e.target.value })}
              placeholder="Optional Meta Pixel ID" 
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ActivityLogsTab = () => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [excludeSystem, setExcludeSystem] = useState(false);
  const [logs, setLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('GovtBharat_activity_audit_logs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) { /* ignore */ }
      }
    }
    return [
      { time: 'Today, 11:20 AM', user: 'vikas.admin', action: 'UPDATE_PAGES', detail: 'Dynamic Pages & CMS saved', ip: '192.168.1.1' },
      { time: 'Today, 10:42 AM', user: 'vikas.admin', action: 'CREATE_JOB', detail: 'SSC CGL 2026 Notification', ip: '192.168.1.1' },
      { time: 'Yesterday, 04:30 PM', user: 'vikas.admin', action: 'UPDATE_CONFIG', detail: 'Site Logo and Themes updated', ip: '192.168.1.1' },
      { time: 'Yesterday, 10:00 AM', user: 'vikas.admin', action: 'LOGIN', detail: 'Super Admin portal sign-in', ip: '192.168.1.1' },
    ];
  });

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.user.toLowerCase().includes(search.toLowerCase()) || 
      l.detail.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
      
    const matchesUser = selectedUser === 'ALL' || l.user === selectedUser;
    
    // Identifies automated, system, or unrecognized manual entries
    const isSystemOrBot = l.user.toLowerCase().includes('system') || 
                          l.user.toLowerCase().includes('bot') || 
                          l.user.toLowerCase().includes('auto');
    const matchesExclude = excludeSystem ? !isSystemOrBot : true;

    return matchesSearch && matchesUser && matchesExclude;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Audit & Staff Activity Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track employee modifications, CMS updates, and administrative sessions</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="ALL">All Users</option>
              {Array.from(new Set(logs.map(l => l.user))).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 mr-2">
              <input 
                type="checkbox" 
                checked={excludeSystem}
                onChange={(e) => setExcludeSystem(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-teal-500 focus:ring-teal-500 dark:bg-slate-900"
              />
              Exclude System/Bots
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..." 
                className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white w-56 outline-none focus:ring-2 focus:ring-teal-500" 
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Timestamp</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target / Detail</th>
                <th className="px-4 py-3 rounded-tr-xl">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{log.time}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                      log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      log.action.includes('DELETE') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.detail}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AutoBroadcasterTab = ({ onToast }: { onToast?: (msg: string) => void }) => {
  const [telegramChannel, setTelegramChannel] = useState('@GovtBharat_alerts');
  const [whatsappGroup, setWhatsappGroup] = useState('GovtBharat 2026');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              Social Auto-Broadcaster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Send instant vacancy updates to Telegram Channels & WhatsApp Community</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#0088cc] rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Telegram Channel Sync</h4>
                  <p className="text-[11px] text-slate-500">{telegramChannel}</p>
                </div>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={telegramChannel}
                  onChange={(e) => setTelegramChannel(e.target.value)}
                  placeholder="Channel handle e.g. @GovtBharat_jobs" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none" 
                />
                
                <div className="pt-2 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span>Auto-broadcast when New Govt Job is published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span>Auto-broadcast Admit Card & Result releases</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (onToast) onToast('Telegram Broadcaster configured and active!');
              }}
              className="w-full mt-5 py-2.5 bg-[#0088cc] text-white rounded-xl text-xs font-black hover:bg-[#0077b5] transition-colors shadow-md shadow-sky-500/20 cursor-pointer"
            >
              Update Telegram Broadcaster
            </button>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-5 rounded-2xl border border-green-100 dark:border-green-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">WhatsApp Channel / Group</h4>
                  <p className="text-[11px] text-slate-500">{whatsappGroup}</p>
                </div>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={whatsappGroup}
                  onChange={(e) => setWhatsappGroup(e.target.value)}
                  placeholder="Group Name / Invite link" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none" 
                />
                
                <div className="pt-2 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" className="rounded text-green-600" defaultChecked />
                    <span>Auto-push notifications to WhatsApp broadcast list</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" className="rounded text-green-600" defaultChecked />
                    <span>Instant Alert for Answer Keys & Syllabi</span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (onToast) onToast('WhatsApp Broadcaster configured and active!');
              }}
              className="w-full mt-5 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-black hover:bg-[#1ebd5b] transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Update WhatsApp Broadcaster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdsManagerTab = ({ onToast }: { onToast?: (msg: string) => void }) => {
  const [ads, setAds] = useState([
    { id: 'header', title: 'Global Header Ad (Leaderboard 728x90)', code: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXX" data-ad-slot="123456" data-ad-format="auto"></ins>', enabled: true },
    { id: 'middle', title: 'Home Page Middle Ad (Responsive Grid)', code: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXX" data-ad-slot="234567" data-ad-format="fluid"></ins>', enabled: true },
    { id: 'sidebar', title: 'Sidebar Fixed Ad (300x250 Medium Rectangle)', code: '', enabled: false },
    { id: 'bottom', title: 'Job Detail Page Bottom Ad (In-Article)', code: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXX" data-ad-slot="345678" data-ad-format="auto"></ins>', enabled: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAdsConfig((cloudAds) => {
      if (Array.isArray(cloudAds) && cloudAds.length > 0) {
        setAds(cloudAds);
      }
    });
    return () => unsub();
  }, []);

  const handleToggle = (index: number) => {
    setAds(prev => {
      const copy = [...prev];
      copy[index].enabled = !copy[index].enabled;
      return copy;
    });
    setSaveSuccess(false);
  };

  const handleCodeChange = (index: number, code: string) => {
    setAds(prev => {
      const copy = [...prev];
      copy[index].code = code;
      return copy;
    });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAdsConfigToFirestore(ads);
      setIsSaving(false);
      setSaveSuccess(true);
      if (onToast) onToast('Google AdSense slots configuration saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
      if (onToast) onToast('Failed to save AdSense config.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Advertisement & Google AdSense Manager
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage banner positions, AdSense slot snippets, and auto-ads</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
              saveSuccess ? 'bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Ad Config'}</span>
          </button>
        </div>

        <div className="space-y-5">
          {ads.map((ad, i) => (
            <div key={ad.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ad.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  {ad.title}
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={ad.enabled} 
                    onChange={() => handleToggle(i)} 
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                  <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-400">{ad.enabled ? 'Active' : 'Disabled'}</span>
                </label>
              </div>
              <textarea 
                value={ad.code}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                placeholder="Paste AdSense <ins> or HTML banner code here..." 
                className="w-full h-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
