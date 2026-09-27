import React, { useState, useEffect } from 'react';
import { 
  Save, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Edit3, MonitorPlay, 
  Smartphone, Zap, Send, Plus, X, Sparkles, Check, Info, ShieldAlert, Radio
} from 'lucide-react';
import { JobAlert, EmployeeUser, AppVersionRelease } from '../types';
import { 
  saveBackupToFirestore, 
  getBackupFromFirestore, 
  subscribeToAppVersionRelease, 
  saveAppVersionReleaseToFirestore,
  DEFAULT_APP_VERSION_RELEASE 
} from '../services/firestoreService';

interface VersionControlTabProps {
  jobs: JobAlert[];
  setJobs: React.Dispatch<React.SetStateAction<JobAlert[]>>;
  employees: EmployeeUser[];
  marqueeText: string;
  setMarqueeText: (text: string) => void;
  onToast: (msg: string) => void;
}

export const VersionControlTab: React.FC<VersionControlTabProps> = ({
  jobs,
  setJobs,
  employees,
  marqueeText,
  setMarqueeText,
  onToast
}) => {
  const [editorMarquee, setEditorMarquee] = useState(marqueeText);
  const [hasBackup, setHasBackup] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // App Version Launch Release state
  const [liveRelease, setLiveRelease] = useState<AppVersionRelease>(DEFAULT_APP_VERSION_RELEASE);
  const [versionInput, setVersionInput] = useState(DEFAULT_APP_VERSION_RELEASE.version);
  const [buildInput, setBuildInput] = useState(DEFAULT_APP_VERSION_RELEASE.buildNumber ? String(DEFAULT_APP_VERSION_RELEASE.buildNumber) : '2026.09.19.1');
  const [titleInput, setTitleInput] = useState(DEFAULT_APP_VERSION_RELEASE.title);
  const [releaseNotes, setReleaseNotes] = useState<string[]>(DEFAULT_APP_VERSION_RELEASE.releaseNotes);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [forceUpdate, setForceUpdate] = useState(DEFAULT_APP_VERSION_RELEASE.forceUpdate);
  const [targetPlatform, setTargetPlatform] = useState<'all' | 'mobile_pwa' | 'web'>(DEFAULT_APP_VERSION_RELEASE.targetPlatform || 'all');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    // 1. Check local & Firestore backups
    const localBackup = localStorage.getItem('fastarc_website_backup');
    if (localBackup) setHasBackup(true);
    
    getBackupFromFirestore().then(backup => {
      if (backup) {
        setHasBackup(true);
        localStorage.setItem('fastarc_website_backup', JSON.stringify(backup));
      }
    });

    // 2. Subscribe to current live app release in Firestore
    const unsub = subscribeToAppVersionRelease((release) => {
      if (release) {
        setLiveRelease(release);
        setVersionInput(release.version);
        if (release.buildNumber) setBuildInput(String(release.buildNumber));
        if (release.title) setTitleInput(release.title);
        if (release.releaseNotes && release.releaseNotes.length > 0) {
          setReleaseNotes(release.releaseNotes);
        }
        setForceUpdate(release.forceUpdate || false);
        setTargetPlatform(release.targetPlatform || 'all');
      }
    });

    return () => unsub();
  }, []);

  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    setReleaseNotes(prev => [...prev, newNoteInput.trim()]);
    setNewNoteInput('');
  };

  const handleRemoveNote = (idx: number) => {
    setReleaseNotes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleIncrementVersion = (type: 'patch' | 'minor' | 'major') => {
    const parts = versionInput.replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
    while (parts.length < 3) parts.push(0);

    if (type === 'patch') parts[2] += 1;
    if (type === 'minor') { parts[1] += 1; parts[2] = 0; }
    if (type === 'major') { parts[0] += 1; parts[1] = 0; parts[2] = 0; }

    const nextVer = parts.join('.');
    setVersionInput(nextVer);
    setBuildInput(`${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}.${parts[2] || 1}`);
  };

  const handlePublishAppRelease = async () => {
    if (!versionInput.trim()) {
      onToast('Please provide a valid App Version (e.g. 2.5.0)');
      return;
    }
    if (!titleInput.trim()) {
      onToast('Please enter a Release Title');
      return;
    }

    setIsPublishing(true);
    try {
      const releaseData: AppVersionRelease = {
        version: versionInput.trim(),
        buildNumber: buildInput.trim() || String(Date.now()),
        title: titleInput.trim(),
        releaseNotes: releaseNotes.length > 0 ? releaseNotes : ['General improvements and bug fixes.'],
        forceUpdate,
        targetPlatform,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Super Admin',
        status: 'active',
        changelogText: releaseNotes.join('. ')
      };

      await saveAppVersionReleaseToFirestore(releaseData);
      setLiveRelease(releaseData);

      // Trigger local dispatch for test
      window.dispatchEvent(new CustomEvent('fastarc:check-updates'));

      onToast(`🚀 App Version v${releaseData.version} successfully launched! All installed mobile users will receive the update notification.`);
    } catch (err) {
      console.error(err);
      onToast('Failed to broadcast app update.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTestUpdatePrompt = () => {
    // Clear all update suppression keys so prompt is guaranteed to display
    localStorage.removeItem('fastarc_installed_app_version');
    localStorage.removeItem('fastarc_app_version');
    sessionStorage.removeItem('fastarc_update_skipped');
    window.dispatchEvent(new CustomEvent('fastarc:check-updates', { detail: { force: true, version: liveRelease?.version || '2.6.0' } }));
    window.dispatchEvent(new CustomEvent('fastarc_trigger_update_prompt', { detail: { force: true, version: liveRelease?.version || '2.6.0' } }));
    onToast('Testing update prompt! The notification modal is now visible on screen.');
  };

  const handleSaveConfig = () => {
    setMarqueeText(editorMarquee);
    onToast('Website configuration updated directly on server!');
  };

  const handleBackupWebsite = () => {
    const backupData = {
      jobs,
      marqueeText,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('fastarc_website_backup', JSON.stringify(backupData));
    saveBackupToFirestore(backupData).catch(console.error);
    setHasBackup(true);
    onToast('Old Website Version saved to backup folder successfully!');
  };

  const handleRestoreClick = () => {
    if (!hasBackup) {
      onToast('No old backup found!');
      return;
    }
    setShowConfirm(true);
  };

  const confirmRestore = () => {
    try {
      const backupStr = localStorage.getItem('fastarc_website_backup');
      if (backupStr) {
        const backupData = JSON.parse(backupStr);
        if (backupData.jobs) {
          setJobs(backupData.jobs);
        }
        if (backupData.marqueeText) {
          setMarqueeText(backupData.marqueeText);
          setEditorMarquee(backupData.marqueeText);
        }
        onToast('Old Website Version successfully restored!');
      }
    } catch (e) {
      onToast('Failed to restore backup.');
    }
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-amber-500" /> Mobile App Version & In-App Update Launch Control
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Jab bhi aap mobile application ka new feature ya version launch karte hain, sabhi installed mobile users ko instant in-app update notification show hoga.
        </p>
      </div>

      {/* 1. Live Active Version Status Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-500/40 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 shrink-0 shadow-inner">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Live Active App Version:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black">
                  v{liveRelease.version}
                </span>
                {liveRelease.forceUpdate && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                    Force Update Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-white mt-1">
                {liveRelease.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Released on: {new Date(liveRelease.releasedAt).toLocaleString()} • Build #{liveRelease.buildNumber || '2026.09'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleTestUpdatePrompt}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/40 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="Test the update notification UI"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Test Update Prompt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Launch New Mobile App Version Editor */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Launch / Publish New Version (नया वर्जन लाइव करें)
            </h4>
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            Push To All Mobile Apps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Version Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              New Version (e.g. 2.5.0)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
                placeholder="2.5.0"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-slate-400">Quick Increment:</span>
              <button
                type="button"
                onClick={() => handleIncrementVersion('patch')}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold cursor-pointer"
              >
                +Patch (0.0.1)
              </button>
              <button
                type="button"
                onClick={() => handleIncrementVersion('minor')}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold cursor-pointer"
              >
                +Minor (0.1.0)
              </button>
            </div>
          </div>

          {/* Build Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Build Number / Release ID
            </label>
            <input
              type="text"
              value={buildInput}
              onChange={(e) => setBuildInput(e.target.value)}
              placeholder="2026.09.19.1"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Device Audience
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value as any)}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Users (Mobile Apps & Web)</option>
              <option value="mobile_pwa">Installed Mobile PWA Apps Only</option>
              <option value="web">Web Browser Users Only</option>
            </select>
          </div>
        </div>

        {/* Release Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Release Title / Notification Heading (e.g. 🚀 Naye Features & Browser Launcher Launched!)
          </label>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="e.g. 🚀 New Features & Speed Improvements Update"
            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* What's New / Release Notes List */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            What's New Points / Nayi Khoobiyan (Users will see these bullet points in their update prompt)
          </label>
          
          <div className="space-y-2 mb-2.5">
            {releaseNotes.map((note, index) => (
              <div 
                key={index}
                className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{note}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveNote(index)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Remove note"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              placeholder="Type new feature note and click Add Note (e.g. New direct job PDF download button added)..."
              className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddNote}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
        </div>

        {/* Force Update Option */}
        <div className="flex items-center justify-between p-3.5 bg-amber-50/60 dark:bg-slate-800/60 rounded-xl border border-amber-200 dark:border-slate-700">
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Force / Mandatory Update (अनिवार्य अपडेट)</span>
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              When enabled, users must tap 'Update Now' to continue using the mobile app.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={forceUpdate}
              onChange={(e) => setForceUpdate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Big Launch Button */}
        <div className="pt-2">
          <button
            onClick={handlePublishAppRelease}
            disabled={isPublishing}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            <Send className={`w-5 h-5 ${isPublishing ? 'animate-bounce' : ''}`} />
            <span>{isPublishing ? 'Broadcasting Update to Mobile Users...' : '🚀 Launch & Broadcast New App Version (लाइव अपडेट भेजें)'}</span>
          </button>
        </div>
      </div>

      {/* 3. Live Marquee Editor */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-blue-500" /> Header Scrolling Marquee Text Editor
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Top Banner Marquee Text</label>
            <textarea
              value={editorMarquee}
              onChange={(e) => setEditorMarquee(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              placeholder="Enter the scrolling text for the top header..."
            />
          </div>

          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Marquee to Server
          </button>
        </div>
      </div>

      {/* 4. Website Backup & Version Restore */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-500" /> Website Snapshot & Backup Manager
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Save your current website state (code/database) to a secure folder, or switch back to an older version.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Current Live Website</h5>
              <p className="text-[10px] text-slate-500 mt-1">This is your live, actively running website code.</p>
            </div>
            <button
              onClick={handleBackupWebsite}
              className="w-full mt-2 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Save as Old Version Backup
            </button>
          </div>

          <div className="border border-amber-500/30 bg-amber-500/5 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Old Website Version</h5>
              <p className="text-[10px] text-slate-500 mt-1">
                {hasBackup ? "An old backup is available to restore." : "No backup found in folder."}
              </p>
            </div>
            <button
              onClick={handleRestoreClick}
              disabled={!hasBackup}
              className={`w-full mt-2 py-2 rounded-lg text-xs font-bold transition-all ${
                hasBackup 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              Switch to Old Website
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-bold">Final Confirmation</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to switch to the Old Website version? This action will replace your current live website data and configurations with the saved old code/data from the backup folder.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors cursor-pointer"
              >
                Yes, Switch Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
