import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowUpRight, CheckCircle2, Trash2, 
  RefreshCw, Search, Filter, ExternalLink, Calendar,
  Eye, CheckSquare, Sparkles, Layers, SlidersHorizontal, AlertCircle
} from 'lucide-react';
import { StagingJob, BackendPipelineConfig, JobAlert } from '../types';
import { 
  subscribeToStagingJobs, 
  promoteStagingJobToLive, 
  promoteAllStagingJobsToLive, 
  deleteStagingJobFromFirestore, 
  clearAllStagingJobsFromFirestore,
  subscribeToBackendPipelineConfig,
  saveBackendPipelineConfig
} from '../services/firestoreService';

interface BackendStagingQueueProps {
  onToast: (msg: string) => void;
  onPromoteLiveSuccess?: (job: JobAlert) => void;
  onBulkPromoteSuccess?: (jobs: JobAlert[]) => void;
}

export const BackendStagingQueue: React.FC<BackendStagingQueueProps> = ({
  onToast,
  onPromoteLiveSuccess,
  onBulkPromoteSuccess
}) => {
  const [stagingJobs, setStagingJobs] = useState<StagingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPromoting, setIsPromoting] = useState(false);
  
  // Pipeline settings
  const [pipelineConfig, setPipelineConfig] = useState<BackendPipelineConfig>({
    autoPromoteEnabled: false,
    webhookSecret: 'GovtBharat_BACKEND_SECRET_KEY_12345',
    totalIngestedCount: 0
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // 1. Subscribe to Firestore staging_jobs in real-time
  useEffect(() => {
    setIsLoading(true);
    const unsubscribeStaging = subscribeToStagingJobs((jobs) => {
      setStagingJobs(jobs);
      setIsLoading(false);
    }, (err) => {
      console.warn('Firestore staging subscriber warning:', err);
      // Fallback: try fetching from server endpoint
      fetch('/api/v1/jobs/staging')
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.stagingJobs)) {
            setStagingJobs(data.stagingJobs);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    });

    const unsubscribeConfig = subscribeToBackendPipelineConfig((config) => {
      if (config) {
        setPipelineConfig(prev => ({ ...prev, ...config }));
      }
    });

    return () => {
      if (typeof unsubscribeStaging === 'function') unsubscribeStaging();
      if (typeof unsubscribeConfig === 'function') unsubscribeConfig();
    };
  }, []);

  // Filtered list
  const filteredJobs = stagingJobs.filter(job => {
    const matchesSearch = !searchQuery || 
      (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.shortInfo && job.shortInfo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.sourceName && job.sourceName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const matchesSource = sourceFilter === 'all' || (job.sourceType || 'auto_scraper') === sourceFilter;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const uniqueSources = Array.from(new Set(stagingJobs.map(j => j.sourceType || 'auto_scraper')));

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredJobs.map(j => j.stagingId || j.id)));
    }
  };

  // Promote single job
  const handlePromoteSingle = async (job: StagingJob) => {
    const id = job.stagingId || job.id;
    try {
      // 1. Promote in Firestore directly
      await promoteStagingJobToLive(job);

      // 2. Also notify server backend if online
      fetch(`/api/v1/jobs/staging/${id}/promote`, { method: 'POST' }).catch(() => {});

      onToast(`🚀 Promoted to Live Portal: "${job.title.substring(0, 30)}..."`);
      if (onPromoteLiveSuccess) {
        onPromoteLiveSuccess({
          ...job,
          id: id.startsWith('stage-') ? `job-${id.replace('stage-', '')}` : id,
          isNew: true
        });
      }
    } catch (err: any) {
      onToast(`❌ Failed to promote: ${err.message || 'Unknown error'}`);
    }
  };

  // Bulk promote selected
  const handleBulkPromoteSelected = async () => {
    const toPromote = stagingJobs.filter(j => selectedIds.has(j.stagingId || j.id));
    if (toPromote.length === 0) {
      onToast('⚠️ Please select at least one staging item.');
      return;
    }

    setIsPromoting(true);
    try {
      const count = await promoteAllStagingJobsToLive(toPromote);
      fetch('/api/v1/jobs/staging/promote-all', { method: 'POST' }).catch(() => {});

      setSelectedIds(new Set());
      onToast(`🎉 Successfully published ${count || toPromote.length} notices from Staging to Live!`);
      if (onBulkPromoteSuccess) {
        onBulkPromoteSuccess(toPromote.map(j => ({
          ...j,
          id: (j.stagingId || j.id).startsWith('stage-') ? `job-${(j.stagingId || j.id).replace('stage-', '')}` : (j.stagingId || j.id),
          isNew: true
        })));
      }
    } catch (err: any) {
      onToast(`❌ Bulk promote failed: ${err.message || 'Error'}`);
    } finally {
      setIsPromoting(false);
    }
  };

  // Promote ALL in staging
  const handlePromoteAll = async () => {
    if (stagingJobs.length === 0) {
      onToast('⚠️ No staging notices to publish.');
      return;
    }
    if (!window.confirm(`Are you sure you want to approve and publish all ${stagingJobs.length} staging notices to the live portal?`)) {
      return;
    }

    setIsPromoting(true);
    try {
      const count = await promoteAllStagingJobsToLive(stagingJobs);
      fetch('/api/v1/jobs/staging/promote-all', { method: 'POST' }).catch(() => {});
      setSelectedIds(new Set());
      onToast(`🎉 All ${count || stagingJobs.length} staging notices are now Live on the portal!`);
    } catch (err: any) {
      onToast(`❌ Error publishing all: ${err.message || 'Unknown'}`);
    } finally {
      setIsPromoting(false);
    }
  };

  // Discard single
  const handleDiscardSingle = async (job: StagingJob) => {
    const id = job.stagingId || job.id;
    try {
      await deleteStagingJobFromFirestore(id);
      fetch(`/api/v1/jobs/staging/${id}`, { method: 'DELETE' }).catch(() => {});
      onToast(`🗑️ Staging notice removed`);
    } catch (err: any) {
      onToast(`❌ Discard failed: ${err.message}`);
    }
  };

  // Clear all
  const handleClearAllStaging = async () => {
    if (stagingJobs.length === 0) return;
    if (!window.confirm(`Permanently clear all ${stagingJobs.length} staging notices?`)) return;

    try {
      await clearAllStagingJobsFromFirestore();
      fetch('/api/v1/jobs/staging', { method: 'DELETE' }).catch(() => {});
      setSelectedIds(new Set());
      onToast('🧹 Staging queue cleared.');
    } catch (err: any) {
      onToast(`❌ Clear failed: ${err.message}`);
    }
  };

  // Toggle Auto-Promote
  const handleToggleAutoPromote = async () => {
    const newStatus = !pipelineConfig.autoPromoteEnabled;
    setIsSavingConfig(true);
    try {
      await saveBackendPipelineConfig({ autoPromoteEnabled: newStatus });
      setPipelineConfig(prev => ({ ...prev, autoPromoteEnabled: newStatus }));
      fetch('/api/v1/backend-pipeline/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoPromoteEnabled: newStatus })
      }).catch(() => {});
      onToast(newStatus ? '⚡ Auto-Promote ENABLED: New feeds will automatically go live!' : '🛡️ Safe Mode ENABLED: New feeds will wait in Staging for your approval!');
    } catch (err: any) {
      onToast(`Failed to update setting: ${err.message}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 animate-in fade-in duration-200">
      
      {/* Overview & Auto-Promote Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-xl text-white shadow-lg shadow-amber-950/40 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Backend Staging &amp; Ingestion Queue
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Firebase Isolated
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {stagingJobs.length} In Queue
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                New scraped jobs and GitHub Backend feeds are saved directly to Firebase <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">staging_jobs</code> first.
                This keeps the live public data completely protected from accidental refreshes or changes in AI Studio.
              </p>
            </div>
          </div>

          {/* Pipeline Auto-Promote Mode Switch */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 shrink-0 w-full lg:w-auto">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Auto-Promote to Live:</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  pipelineConfig.autoPromoteEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {pipelineConfig.autoPromoteEnabled ? 'AUTO LIVE' : 'STAGING ONLY (SAFE)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {pipelineConfig.autoPromoteEnabled 
                  ? 'Incoming jobs go live immediately.' 
                  : 'Jobs wait here for Super Admin approval.'}
              </p>
            </div>
            
            <button
              onClick={handleToggleAutoPromote}
              disabled={isSavingConfig}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pipelineConfig.autoPromoteEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  pipelineConfig.autoPromoteEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Total Staged: {stagingJobs.length}</span>
            {selectedIds.size > 0 && (
              <span className="text-amber-400">({selectedIds.size} Selected)</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkPromoteSelected}
                disabled={isPromoting}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Promote Selected ({selectedIds.size})</span>
              </button>
            )}

            <button
              onClick={handlePromoteAll}
              disabled={isPromoting || stagingJobs.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish All to Live Portal</span>
            </button>

            {stagingJobs.length > 0 && (
              <button
                onClick={handleClearAllStaging}
                className="px-3 py-2 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Staging</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staging jobs by title or source..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="latest-jobs">Latest Jobs</option>
            <option value="admit-cards">Admit Cards</option>
            <option value="results">Results</option>
            <option value="answer-key">Answer Key</option>
            <option value="syllabus">Syllabus</option>
            <option value="admission">Admission</option>
            <option value="important">Important</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Select All Checkbox */}
          {filteredJobs.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{selectedIds.size === filteredJobs.length ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Staging List / Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading Staging Queue from Firebase Firestore...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Staging Queue is Clear!</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            All auto-fed posts have been promoted to the live portal. Any new posts from the Auto-Watcher, GitHub Actions Scraper, or Webhook will safely appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const id = job.stagingId || job.id;
            const isSelected = selectedIds.has(id);

            return (
              <div
                key={id}
                className={`bg-white dark:bg-slate-900 border transition-all rounded-2xl p-4 shadow-sm hover:shadow-md ${
                  isSelected 
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(id)}
                      className="w-4 h-4 mt-1 accent-amber-600 rounded cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                          {job.category || 'latest-jobs'}
                        </span>
                        
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{job.sourceType || 'auto_scraper'}</span>
                        </span>

                        {job.sourceName && (
                          <span className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                            Source: {job.sourceName}
                          </span>
                        )}

                        {job.ingestedAt && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(job.ingestedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {job.title}
                      </h4>

                      {job.shortInfo && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {job.shortInfo}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                        {job.dates?.last && (
                          <span>Last Date: <strong className="text-rose-600 dark:text-rose-400 font-bold">{job.dates.last}</strong></span>
                        )}
                        {job.fees?.general && (
                          <span>Fee: <strong className="text-slate-700 dark:text-slate-300 font-bold">{job.fees.general}</strong></span>
                        )}
                        {job.links?.apply && (
                          <a
                            href={job.links.apply}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handlePromoteSingle(job)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Promote to Live</span>
                    </button>

                    <button
                      onClick={() => handleDiscardSingle(job)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                      title="Discard Staging Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
