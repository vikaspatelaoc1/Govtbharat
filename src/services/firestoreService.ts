import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  getDocFromServer,
  writeBatch,
  disableNetwork,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { JobAlert, StagingJob, BackendPipelineConfig, EmployeeUser, SocialLinkItem, EmailNotificationConfig, NotificationDispatchLog, AppVersionRelease } from '../types';
import { defaultJobsDatabase, defaultSocialLinks } from '../data';
import { ThemeColorConfig } from '../utils/themeColors';


// Connection validation
// Circuit breaker to avoid flooding Firestore when daily write quota is reached
const getTodayDateKey = () => `quota_exceeded_${new Date().toISOString().slice(0, 10)}`;

let isClientFirestoreQuotaExceeded: boolean = (() => {
  try {
    return localStorage.getItem(getTodayDateKey()) === 'true';
  } catch {
    return false;
  }
})();

export function isFirestoreQuotaExceeded(): boolean {
  return isClientFirestoreQuotaExceeded;
}

export function handleFirestoreQuotaError(err: any, context?: string): boolean {
  const msg = err?.message || String(err);
  if (
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('quota') ||
    err?.code === 'resource-exhausted'
  ) {
    if (!isClientFirestoreQuotaExceeded) {
      isClientFirestoreQuotaExceeded = true;
      try {
        localStorage.setItem(getTodayDateKey(), 'true');
      } catch {}
      console.info(`[Firebase] Daily write quota reached (${context || 'operation'}). All writes safely redirected to local backend storage.`);
      
      // Removed disableNetwork(db) so that READS (onSnapshot) continue to work on Vercel
      // The console spam is handled by the console.error interceptor in main.tsx
    }
    return true;
  }
  return false;
}

export async function validateFirestoreConnection() {
  try {
    let timerId: any = null;
    const timeoutPromise = new Promise((resolve) => {
      timerId = setTimeout(() => resolve(null), 2500);
    });
    try {
      await Promise.race([
        getDocFromServer(doc(db, 'site_config', 'marquee')),
        timeoutPromise
      ]);
    } finally {
      if (timerId) clearTimeout(timerId);
    }
  } catch (error) {
    // Graceful offline fallback - Firestore automatically operates in offline cache mode
    console.info("Firestore connecting or operating in offline cache mode.");
  }
}

// 1. Jobs Realtime Sync
export function subscribeToJobs(
  onUpdate: (jobs: JobAlert[]) => void, 
  onError?: (err: any) => void
) {
  const jobsCol = collection(db, 'jobs');
  
  return onSnapshot(jobsCol, async (snapshot) => {
    try {
      const fetchedJobs: JobAlert[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as JobAlert;
        fetchedJobs.push({
          ...data,
          id: docSnap.id
        });
      });

      // Master catalog starting with defaultJobsDatabase, with Firestore documents overlaid as real-time source of updates
      const masterJobsMap = new Map<string, JobAlert>();
      const titleLookup = new Map<string, string>();

      // 1. Initialize with all standard official database catalog jobs
      defaultJobsDatabase.forEach((job) => {
        if (!job || !job.title) return;
        masterJobsMap.set(job.id, job);
        titleLookup.set(job.title.trim().toLowerCase(), job.id);
      });

      // 2. Overlay all real-time Firestore jobs (user additions, edits, scraper posts)
      fetchedJobs.forEach((job) => {
        if (!job || !job.title) return;
        if ((job as any).isDeleted || (job as any).deleted) {
          masterJobsMap.delete(job.id);
          return;
        }
        const normTitle = job.title.trim().toLowerCase();
        const existingId = titleLookup.get(normTitle);
        if (existingId && existingId !== job.id) {
          masterJobsMap.delete(existingId);
        }
        masterJobsMap.set(job.id, { ...(masterJobsMap.get(job.id) || {}), ...job });
        titleLookup.set(normTitle, job.id);
      });

      // Process dates for auto-flagging and expiration
      const now = new Date();
      const parseDateString = (dateStr?: string) => {
        if (!dateStr) return null;
        const match = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (match) {
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
        return null;
      };

      const finalUniqueJobs = Array.from(masterJobsMap.values()).map(job => {
        let isExpired = false;
        let isRecent = false;

        // Flag recent if posted within last 3 days
        if (job.postDate) {
          const postDate = parseDateString(job.postDate);
          if (postDate && !isNaN(postDate.getTime())) {
            const diffTime = now.getTime() - postDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays >= 0 && diffDays <= 3) {
              isRecent = true;
            }
          }
        }

        return {
          ...job,
          isExpired,
          isNew: isRecent || Boolean(job.isNew)
        };
      });

      onUpdate(finalUniqueJobs);
    } catch (err) {
      console.warn('Error handling jobs snapshot:', err);
      if (onError) onError(err);
      onUpdate(defaultJobsDatabase);
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToJobs');
    console.warn('Firestore jobs subscription fallback to catalog:', err?.message || err);
    if (onError) onError(err);
    onUpdate(defaultJobsDatabase);
  });
}

// Helper to sanitize data for Firestore (remove undefined, replace with safe defaults)
function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return '' as unknown as T;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item)) as unknown as T;
  }
  const cleanObj: any = {};
  for (const [key, value] of Object.entries(data as any)) {
    if (value !== undefined) {
      cleanObj[key] = cleanForFirestore(value);
    } else {
      cleanObj[key] = '';
    }
  }
  return cleanObj as T;
}

// 2. Save / Add Job (with Duplicate Prevention)
export async function saveJobToFirestore(job: JobAlert): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);
    const normTitle = job.title ? job.title.trim().toLowerCase() : '';

    let targetDocId = job.id;

    if (normTitle) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as JobAlert;
        if (data.title && data.title.trim().toLowerCase() === normTitle) {
          targetDocId = docSnap.id; // Overwrite existing document ID to prevent duplicates!
        }
      });
    }

    const sanitizedJob = cleanForFirestore({
      ...job,
      id: targetDocId,
      updatedAt: new Date().toISOString()
    });

    const jobRef = doc(db, 'jobs', targetDocId);
    await setDoc(jobRef, sanitizedJob, { merge: true });
  } catch (err: any) {
    if (!handleFirestoreQuotaError(err, 'saveJobToFirestore')) {
      console.warn('saveJobToFirestore warning:', err?.message || err);
    }
  }
}

// 3. Delete Job (Immediate & Permanent)
export async function deleteJobFromFirestore(jobId: string): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (err: any) {
    if (!handleFirestoreQuotaError(err, 'deleteJobFromFirestore')) {
      console.warn('deleteJobFromFirestore warning:', err?.message || err);
    }
  }
}

// 4. Reset Jobs to Default
export async function resetJobsInFirestore(): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);
    const batch = writeBatch(db);
    
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    defaultJobsDatabase.forEach((job) => {
      const jobDoc = doc(db, 'jobs', job.id);
      batch.set(jobDoc, job);
    });

    await batch.commit();
  } catch (err: any) {
    if (!handleFirestoreQuotaError(err, 'resetJobsInFirestore')) {
      console.warn('resetJobsInFirestore warning:', err?.message || err);
    }
  }
}

// 5. Bulk Save / Import Jobs (Deduplicated)
export async function bulkSaveJobsToFirestore(jobs: JobAlert[]): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);
    const batch = writeBatch(db);
    
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const seenTitles = new Set<string>();
    jobs.forEach((job) => {
      if (!job.title) return;
      const norm = job.title.trim().toLowerCase();
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        const jobDoc = doc(db, 'jobs', job.id);
        batch.set(jobDoc, job);
      }
    });

    await batch.commit();
  } catch (err: any) {
    if (!handleFirestoreQuotaError(err, 'bulkSaveJobsToFirestore')) {
      console.warn('bulkSaveJobsToFirestore warning:', err?.message || err);
    }
  }
}

// 5b. Append or update jobs without wiping existing database (for Scrapers & Live Ingestion - Deduplicated)
export async function appendJobsToFirestore(jobs: JobAlert[]): Promise<void> {
  if (!jobs || jobs.length === 0 || isClientFirestoreQuotaExceeded) return;

  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);

    const existingTitleMap = new Map<string, string>();
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as JobAlert;
      if (data.title) {
        existingTitleMap.set(data.title.trim().toLowerCase(), docSnap.id);
      }
    });

    const batchSeenTitles = new Set<string>();
    const itemsToSync: { targetDocId: string; job: JobAlert }[] = [];

    jobs.forEach((job) => {
      if (!job.title) return;
      const norm = job.title.trim().toLowerCase();
      if (batchSeenTitles.has(norm)) return; // Skip duplicates within the batch
      batchSeenTitles.add(norm);

      const targetDocId = existingTitleMap.get(norm) || job.id;
      itemsToSync.push({ targetDocId, job });
    });

    // Execute in chunks of 400 to stay well under Firestore 500 limit
    const CHUNK_SIZE = 400;
    for (let i = 0; i < itemsToSync.length; i += CHUNK_SIZE) {
      const chunk = itemsToSync.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach(({ targetDocId, job }) => {
        const jobDoc = doc(db, 'jobs', targetDocId);
        const sanitized = cleanForFirestore({
          ...job,
          id: targetDocId,
          updatedAt: new Date().toISOString()
        });
        batch.set(jobDoc, sanitized, { merge: true });
      });
      await batch.commit();
    }
  } catch (err: any) {
    if (!handleFirestoreQuotaError(err, 'appendJobsToFirestore')) {
      console.warn('appendJobsToFirestore warning:', err?.message || err);
    }
  }
}

// 5c. Fetch Live Jobs directly from Firestore (manual refresh / sync)
export async function getJobsFromFirestore(): Promise<JobAlert[]> {
  try {
    const jobsCol = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCol);
    const jobs: JobAlert[] = [];
    snapshot.forEach((docSnap) => {
      jobs.push({ id: docSnap.id, ...(docSnap.data() as JobAlert) });
    });
    return jobs.length > 0 ? jobs : defaultJobsDatabase;
  } catch (err: any) {
    console.warn('getJobsFromFirestore error:', err);
    return defaultJobsDatabase;
  }
}

// 5d. STAGING JOBS & BACKEND INGESTION PIPELINE (FIREBASE)
// Real-time listener for Staging / Ingestion Queue
export function subscribeToStagingJobs(
  onUpdate: (stagingJobs: StagingJob[]) => void,
  onError?: (err: any) => void
) {
  const stagingCol = collection(db, 'staging_jobs');
  return onSnapshot(stagingCol, (snapshot) => {
    try {
      const stagingJobs: StagingJob[] = [];
      snapshot.forEach((docSnap) => {
        stagingJobs.push({
          ...(docSnap.data() as StagingJob),
          id: docSnap.id,
          stagingId: docSnap.id
        });
      });
      // Sort newest ingested first
      stagingJobs.sort((a, b) => {
        const timeA = a.ingestedAt ? new Date(a.ingestedAt).getTime() : 0;
        const timeB = b.ingestedAt ? new Date(b.ingestedAt).getTime() : 0;
        return timeB - timeA;
      });
      onUpdate(stagingJobs);
    } catch (e) {
      console.warn('subscribeToStagingJobs parse error:', e);
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToStagingJobs');
    if (onError) onError(err);
  });
}

// Save single job to Staging collection
export async function saveStagingJobToFirestore(job: StagingJob): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const stagingId = job.stagingId || job.id || `stage-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const stagingDoc = doc(db, 'staging_jobs', stagingId);
    const cleaned = cleanForFirestore({
      ...job,
      id: stagingId,
      stagingId,
      ingestedAt: job.ingestedAt || new Date().toISOString(),
      reviewStatus: job.reviewStatus || 'pending'
    });
    await setDoc(stagingDoc, cleaned, { merge: true });
  } catch (err: any) {
    handleFirestoreQuotaError(err, 'saveStagingJobToFirestore');
  }
}

// Bulk save multiple incoming jobs to Staging
export async function bulkSaveStagingJobsToFirestore(jobs: StagingJob[]): Promise<void> {
  if (!jobs || jobs.length === 0 || isClientFirestoreQuotaExceeded) return;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
      const chunk = jobs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((job, idx) => {
        const stagingId = job.stagingId || job.id || `stage-${Date.now()}-${i + idx}-${Math.floor(Math.random()*1000)}`;
        const stagingDoc = doc(db, 'staging_jobs', stagingId);
        const cleaned = cleanForFirestore({
          ...job,
          id: stagingId,
          stagingId,
          ingestedAt: job.ingestedAt || new Date().toISOString(),
          reviewStatus: job.reviewStatus || 'pending'
        });
        batch.set(stagingDoc, cleaned, { merge: true });
      });
      await batch.commit();
    }
  } catch (err: any) {
    handleFirestoreQuotaError(err, 'bulkSaveStagingJobsToFirestore');
  }
}

// Promote a Staging Job to Main Live Jobs Collection (Deletes from staging & publishes live)
export async function promoteStagingJobToLive(stagingJob: StagingJob): Promise<void> {
  const id = stagingJob.stagingId || stagingJob.id;
  try {
    const res = await fetch(`/api/v1/jobs/staging/${id}/promote`, { method: "POST" });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to promote job on server");
    }
  } catch (err: any) {
    console.warn("Server promote error, trying client fallback:", err);
    if (!isClientFirestoreQuotaExceeded) {
      try {
        const liveJobId = stagingJob.id.startsWith("stage-") ? `job-${stagingJob.id.replace("stage-", "")}` : stagingJob.id;
        const liveDocRef = doc(db, "jobs", liveJobId);
        const stagingDocRef = doc(db, "staging_jobs", stagingJob.stagingId || stagingJob.id);
        const liveJobData = cleanForFirestore({
          ...stagingJob,
          id: liveJobId,
          isNew: true,
          lastUpdated: new Date().toISOString()
        });
        delete (liveJobData as any).stagingId;
        delete (liveJobData as any).reviewStatus;
        const batch = writeBatch(db);
        batch.set(liveDocRef, liveJobData, { merge: true });
        batch.delete(stagingDocRef);
        await batch.commit();
      } catch (clientErr: any) {
        handleFirestoreQuotaError(clientErr, "promoteStagingJobToLive");
        throw clientErr;
      }
    } else {
      throw err;
    }
  }
}

// Promote all Staging Jobs to Live
export async function promoteAllStagingJobsToLive(stagingJobs: StagingJob[]): Promise<number> {
  if (!stagingJobs || stagingJobs.length === 0) return 0;
  try {
    const res = await fetch("/api/v1/jobs/staging/promote-all", { method: "POST" });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to promote all jobs on server");
    }
    return data.count || stagingJobs.length;
  } catch (err: any) {
    console.warn("Server promote-all error, trying client fallback:", err);
    if (!isClientFirestoreQuotaExceeded) {
      let count = 0;
      try {
        const CHUNK_SIZE = 200;
        for (let i = 0; i < stagingJobs.length; i += CHUNK_SIZE) {
          const chunk = stagingJobs.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          chunk.forEach((stagingJob) => {
            const liveJobId = stagingJob.id.startsWith("stage-") ? `job-${stagingJob.id.replace("stage-", "")}` : stagingJob.id;
            const liveDocRef = doc(db, "jobs", liveJobId);
            const stagingDocRef = doc(db, "staging_jobs", stagingJob.stagingId || stagingJob.id);
            const liveJobData = cleanForFirestore({
              ...stagingJob,
              id: liveJobId,
              isNew: true,
              lastUpdated: new Date().toISOString()
            });
            delete (liveJobData as any).stagingId;
            delete (liveJobData as any).reviewStatus;
            batch.set(liveDocRef, liveJobData, { merge: true });
            batch.delete(stagingDocRef);
            count++;
          });
          await batch.commit();
        }
        return count;
      } catch (clientErr: any) {
        handleFirestoreQuotaError(clientErr, "promoteAllStagingJobsToLive");
        throw clientErr;
      }
    } else {
      throw err;
    }
  }
}

// Delete / Discard a Staging Job
export async function deleteStagingJobFromFirestore(stagingJobId: string): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const stagingDocRef = doc(db, 'staging_jobs', stagingJobId);
    await deleteDoc(stagingDocRef);
  } catch (err: any) {
    handleFirestoreQuotaError(err, 'deleteStagingJobFromFirestore');
  }
}

// Clear all Staging Jobs
export async function clearAllStagingJobsFromFirestore(): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const stagingCol = collection(db, 'staging_jobs');
    const snap = await getDocs(stagingCol);
    const batch = writeBatch(db);
    snap.forEach(d => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err: any) {
    handleFirestoreQuotaError(err, 'clearAllStagingJobsFromFirestore');
  }
}

// Backend Pipeline Config (Auto-Promote & Webhook settings)
export function subscribeToBackendPipelineConfig(onUpdate: (config: BackendPipelineConfig) => void) {
  const configRef = doc(db, 'site_config', 'backendPipeline');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as BackendPipelineConfig);
    } else {
      onUpdate({
        autoPromoteEnabled: false,
        webhookSecret: 'GovtBharat_BACKEND_SECRET_KEY_12345',
        totalIngestedCount: 0
      });
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToBackendPipelineConfig');
  });
}

export async function saveBackendPipelineConfig(config: Partial<BackendPipelineConfig>): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'backendPipeline');
    await setDoc(configRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    handleFirestoreQuotaError(err, 'saveBackendPipelineConfig');
  }
}

// 6. Marquee Ticker Sync
export function subscribeToMarquee(onUpdate: (text: string) => void) {
  const configRef = doc(db, 'site_config', 'marquee');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.marqueeText) {
        onUpdate(data.marqueeText);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToMarquee');
  });
}

export async function saveMarqueeToFirestore(text: string): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'marquee');
    await setDoc(configRef, {
      marqueeText: text,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveMarqueeToFirestore');
  }
}

// 6b. Auto-Sync Watcher State Sync
export function subscribeToAutoSync(onUpdate: (isActive: boolean) => void) {
  const configRef = doc(db, 'site_config', 'autoSync');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && typeof data.isActive === 'boolean') {
        onUpdate(data.isActive);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToAutoSync');
  });
}

export async function saveAutoSyncToFirestore(isActive: boolean): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'autoSync');
    await setDoc(configRef, {
      isActive,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveAutoSyncToFirestore');
  }
}

// 6c. Theme Colors State Sync
export function subscribeToThemeColors(onUpdate: (colors: ThemeColorConfig) => void) {
  const configRef = doc(db, 'site_config', 'theme_colors');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.colors) {
        onUpdate(data.colors as ThemeColorConfig);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToThemeColors');
  });
}

export async function saveThemeColorsToFirestore(colors: ThemeColorConfig): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'theme_colors');
    await setDoc(configRef, {
      colors,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveThemeColorsToFirestore');
  }
}

export interface EarningsConfig {
  adsensePubId: string;
  amazonTag: string;
  testbookPartnerId: string;
  bankName: string;
  accountEnding: string;
  payoutBankName: string;
  payoutAccountEnding: string;
  payoutBeneficiaryName: string;
  payoutThreshold: number;
  payoutNextDate: string;
  payoutMethod: string;
  payoutTaxStatus: string;
  payoutBalanceMode: 'auto' | 'custom';
  payoutCustomBalance: number;
  customEntries: Array<{
    id: string;
    source: string;
    description: string;
    date: string;
    amount: number;
    status: 'Completed' | 'Processing';
  }>;
}

// 6d. Earnings Config State Sync
export function subscribeToEarningsConfig(onUpdate: (config: EarningsConfig) => void) {
  const configRef = doc(db, 'site_config', 'earnings_config');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.config) {
        onUpdate(data.config as EarningsConfig);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToEarningsConfig');
  });
}

export async function saveEarningsConfigToFirestore(config: EarningsConfig): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'earnings_config');
    await setDoc(configRef, {
      config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveEarningsConfigToFirestore');
  }
}

// 6e. Website Backup Sync
export async function saveBackupToFirestore(backupData: any): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const backupRef = doc(db, 'site_config', 'website_backup');
    await setDoc(backupRef, {
      backup: JSON.stringify(backupData),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveBackupToFirestore');
  }
}

export async function getBackupFromFirestore(): Promise<any | null> {
  try {
    const backupRef = doc(db, 'site_config', 'website_backup');
    const snap = await getDoc(backupRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.backup) {
        try {
          return JSON.parse(data.backup);
        } catch (e) {
          return null;
        }
      }
    }
  } catch (err) {
    handleFirestoreQuotaError(err, 'getBackupFromFirestore');
  }
  return null;
}

// 7. Employees Sync
export function subscribeToEmployees(onUpdate: (employees: EmployeeUser[]) => void) {
  const empCol = collection(db, 'employees');
  return onSnapshot(empCol, (snapshot) => {
    if (snapshot.empty) {
      onUpdate([]);
      return;
    }
    const emps: EmployeeUser[] = [];
    snapshot.forEach((docSnap) => {
      emps.push({
        ...(docSnap.data() as EmployeeUser),
        id: docSnap.id
      });
    });
    onUpdate(emps);
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToEmployees');
    onUpdate([]);
  });
}

export async function saveEmployeeToFirestore(employee: EmployeeUser): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const empRef = doc(db, 'employees', employee.id);
    await setDoc(empRef, employee, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveEmployeeToFirestore');
  }
}

export async function deleteEmployeeFromFirestore(employeeId: string): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const empRef = doc(db, 'employees', employeeId);
    await deleteDoc(empRef);
  } catch (err) {
    handleFirestoreQuotaError(err, 'deleteEmployeeFromFirestore');
  }
}

// 8. Subscribers Sync
export interface SubscriberRecord {
  id: string;
  email: string;
  category: string;
  date: string;
  name?: string;
  phone?: string;
  notes?: string;
  createdAt?: string;
  source?: string;
  muted?: boolean;
  status?: string;
  [key: string]: any;
}

export function subscribeToSubscribers(onUpdate: (subs: SubscriberRecord[]) => void) {
  const subCol = collection(db, 'subscribers');

  return onSnapshot(subCol, (snapshot) => {
    try {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }

      const subs: SubscriberRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const email = (data.email || data.emailAddress || data.userEmail || '').trim();
        if (email) {
          subs.push({
            ...data,
            id: docSnap.id,
            email,
            name: data.name || '',
            phone: data.phone || '',
            category: data.category || 'All Job Updates',
            notes: data.notes || data.message || '',
            date: data.date || '',
            createdAt: data.createdAt || data.date || '',
            muted: Boolean(data.muted)
          });
        }
      });

      // Sort newest subscribers first
      subs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
        return timeB - timeA;
      });

      onUpdate(subs);
    } catch (err) {
      handleFirestoreQuotaError(err, 'subscribeToSubscribers snapshot');
      onUpdate([]);
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToSubscribers listener');
    onUpdate([]);
  });
}

// Direct fetch from Firestore for manual refresh
export async function getSubscribersFromFirestore(): Promise<SubscriberRecord[]> {
  try {
    const subCol = collection(db, 'subscribers');
    const snapshot = await getDocs(subCol);
    const subs: SubscriberRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const email = (data.email || data.emailAddress || '').trim();
      if (email) {
        subs.push({
          ...data,
          id: docSnap.id,
          email,
          name: data.name || '',
          phone: data.phone || '',
          category: data.category || 'All Job Updates',
          notes: data.notes || data.message || '',
          date: data.date || '',
          createdAt: data.createdAt || data.date || '',
          muted: Boolean(data.muted)
        });
      }
    });

    subs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });

    return subs;
  } catch (err) {
    console.warn('getSubscribersFromFirestore error:', err);
    return [];
  }
}

export async function saveSubscriberToFirestore(sub: SubscriberRecord): Promise<void> {
  const cleanEmail = (sub.email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    console.warn('⚠️ Invalid subscriber email:', sub.email);
    return;
  }

  const targetId = sub.id || `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const writePayload = cleanForFirestore({
    id: targetId,
    email: cleanEmail,
    name: (sub.name || '').trim(),
    phone: (sub.phone || '').trim(),
    category: sub.category || 'All Job Updates',
    notes: (sub.notes || (sub as any).message || '').trim(),
    date: sub.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: sub.createdAt || new Date().toISOString(),
    source: sub.source || (typeof window !== 'undefined' ? window.location.hostname : 'portal'),
    muted: Boolean(sub.muted)
  });

  console.log(`📡 [Firestore Write] Saving subscriber "${cleanEmail}" to "/subscribers/${targetId}"...`);

  // 1. Direct Firestore write
  try {
    const subRef = doc(db, 'subscribers', targetId);
    await setDoc(subRef, writePayload, { merge: true });
    console.log(`✅ [Firestore Write] Success! Subscriber "${cleanEmail}" saved in Firestore (ID: ${targetId}).`);
  } catch (err: any) {
    console.error(`❌ [Firestore Write] Error saving subscriber to Firestore:`, err);
    handleFirestoreQuotaError(err, 'saveSubscriberToFirestore');
  }

  // 2. Dual-write to Server API backup
  try {
    await fetch('/api/v1/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(writePayload)
    });
  } catch (apiErr) {
    // Expected on static client preview
  }
}

export async function deleteSubscriberFromFirestore(subId: string): Promise<void> {
  try {
    const subRef = doc(db, 'subscribers', subId);
    await deleteDoc(subRef);
  } catch (err) {
    handleFirestoreQuotaError(err, 'deleteSubscriberFromFirestore');
  }

  try {
    await fetch(`/api/v1/subscribers/${encodeURIComponent(subId)}`, {
      method: 'DELETE'
    });
  } catch (e) {}
}

export async function saveDeletedSubscriberToFirestore(sub: SubscriberRecord): Promise<void> {
  const deletePayload = cleanForFirestore({
    ...sub,
    deletedAt: (sub as any).deletedAt || new Date().toISOString()
  });

  try {
    const subRef = doc(db, 'deleted_subscribers', sub.id);
    await setDoc(subRef, deletePayload, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveDeletedSubscriberToFirestore');
  }
}

export async function deleteDeletedSubscriberFromFirestore(subId: string): Promise<void> {
  try {
    const subRef = doc(db, 'deleted_subscribers', subId);
    await deleteDoc(subRef);
  } catch (err) {
    handleFirestoreQuotaError(err, 'deleteDeletedSubscriberFromFirestore');
  }
}

export function subscribeToDeletedSubscribers(onUpdate: (subs: SubscriberRecord[]) => void) {
  const subCol = collection(db, 'deleted_subscribers');

  return onSnapshot(subCol, (snapshot) => {
    try {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }
      const subs: SubscriberRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SubscriberRecord;
        const email = (data.email || '').trim();
        if (email) {
          subs.push({
            ...data,
            id: docSnap.id
          });
        }
      });
      onUpdate(subs);
    } catch (err) {
      handleFirestoreQuotaError(err, 'subscribeToDeletedSubscribers snapshot');
      onUpdate([]);
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToDeletedSubscribers listener');
    onUpdate([]);
  });
}

// 9. Social Media Links Realtime Sync
export function subscribeToSocialLinks(
  onUpdate: (links: SocialLinkItem[]) => void,
  onError?: (err: any) => void
) {
  const socialDocRef = doc(db, 'site_config', 'social_links');
  return onSnapshot(socialDocRef, (docSnap) => {
    try {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.links) && data.links.length > 0) {
          onUpdate(data.links);
          return;
        }
      }
      onUpdate(defaultSocialLinks);
    } catch (err) {
      handleFirestoreQuotaError(err, 'subscribeToSocialLinks');
      if (onError) onError(err);
      onUpdate(defaultSocialLinks);
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToSocialLinks listener');
    if (onError) onError(err);
    onUpdate(defaultSocialLinks);
  });
}

export async function saveSocialLinksToFirestore(links: SocialLinkItem[]): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const socialDocRef = doc(db, 'site_config', 'social_links');
    await setDoc(socialDocRef, {
      links: links,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveSocialLinksToFirestore');
  }
}


// 10. Site Logo Sync
export function subscribeToSiteLogo(onUpdate: (logo: string, timestamp?: number) => void) {
  const configRef = doc(db, 'site_config', 'site_logo');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.logoData) {
        onUpdate(data.logoData, data.updatedAt);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToSiteLogo');
  });
}

export async function saveSiteLogoToFirestore(logoData: string): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'site_logo');
    await setDoc(configRef, {
      logoData: logoData,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveSiteLogoToFirestore');
  }
}

export interface LogoBackup {
  id: string;
  logoData: string;
  timestamp: number;
}

export function subscribeToLogoHistory(onUpdate: (history: LogoBackup[]) => void) {
  const configRef = doc(db, 'site_config', 'logo_history');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.history)) {
        onUpdate(data.history);
      } else {
        onUpdate([]);
      }
    } else {
      onUpdate([]);
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToLogoHistory');
    onUpdate([]);
  });
}

export async function saveLogoHistoryToFirestore(history: LogoBackup[]): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'logo_history');
    await setDoc(configRef, {
      history: history,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveLogoHistoryToFirestore');
  }
}

// 11. Column Configs Realtime Sync
export function subscribeToColumnConfigs(onUpdate: (configs: any) => void) {
  const colRef = doc(db, 'site_config', 'column_configs');
  return onSnapshot(colRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.configs) {
        onUpdate(data.configs);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToColumnConfigs');
  });
}

export async function saveColumnConfigsToFirestore(configs: any): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const colRef = doc(db, 'site_config', 'column_configs');
    await setDoc(colRef, {
      configs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveColumnConfigsToFirestore');
  }
}

// 12. Global SEO Config Realtime Sync
export function subscribeToSeoConfig(onUpdate: (config: any) => void) {
  const seoRef = doc(db, 'site_config', 'seo_config');
  return onSnapshot(seoRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.config) {
        onUpdate(data.config);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToSeoConfig');
  });
}

export async function saveSeoConfigToFirestore(config: any): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const seoRef = doc(db, 'site_config', 'seo_config');
    await setDoc(seoRef, {
      config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveSeoConfigToFirestore');
  }
}

// 12b. Category SEO & Meta Tags Realtime Sync
export function subscribeToCategorySeoConfig(onUpdate: (configs: any) => void) {
  const catSeoRef = doc(db, 'site_config', 'category_seo_config');
  return onSnapshot(catSeoRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.configs) {
        onUpdate(data.configs);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToCategorySeoConfig');
  });
}

export async function saveCategorySeoConfigToFirestore(configs: any): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const catSeoRef = doc(db, 'site_config', 'category_seo_config');
    await setDoc(catSeoRef, {
      configs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveCategorySeoConfigToFirestore');
  }
}

// 13. Dynamic Pages & CMS Sync
export function subscribeToDynamicPages(onUpdate: (pages: Record<string, any>) => void) {
  const pagesRef = doc(db, 'site_config', 'dynamic_pages');
  return onSnapshot(pagesRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.pages) {
        onUpdate(data.pages);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToDynamicPages');
  });
}

export async function saveDynamicPagesToFirestore(pages: Record<string, any>): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const pagesRef = doc(db, 'site_config', 'dynamic_pages');
    await setDoc(pagesRef, {
      pages,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveDynamicPagesToFirestore');
  }
}

// 14. API Analytics Config Sync
export function subscribeToApiConfig(onUpdate: (config: any) => void) {
  const apiRef = doc(db, 'site_config', 'api_config');
  return onSnapshot(apiRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.config) {
        onUpdate(data.config);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToApiConfig');
  });
}

export async function saveApiConfigToFirestore(config: any): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const apiRef = doc(db, 'site_config', 'api_config');
    await setDoc(apiRef, {
      config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveApiConfigToFirestore');
  }
}

// 15. Ads Manager Config Sync
export function subscribeToAdsConfig(onUpdate: (ads: any[]) => void) {
  const adsRef = doc(db, 'site_config', 'ads_config');
  return onSnapshot(adsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.ads) {
        onUpdate(data.ads);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToAdsConfig');
  });
}

export async function saveAdsConfigToFirestore(ads: any[]): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const adsRef = doc(db, 'site_config', 'ads_config');
    await setDoc(adsRef, {
      ads,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveAdsConfigToFirestore');
  }
}

// 16. Helpdesk & Candidate Tickets Sync
export function subscribeToHelpdeskTickets(onUpdate: (tickets: any[]) => void) {
  const ticketsRef = doc(db, 'site_config', 'helpdesk_tickets');
  return onSnapshot(ticketsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.tickets)) {
        onUpdate(data.tickets);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToHelpdeskTickets');
  });
}

export async function saveHelpdeskTicketsToFirestore(tickets: any[]): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const ticketsRef = doc(db, 'site_config', 'helpdesk_tickets');
    await setDoc(ticketsRef, {
      tickets,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveHelpdeskTicketsToFirestore');
  }
}

// 17. Master Website Control & Customization Config Sync
export function subscribeToWebsiteControlConfig(onUpdate: (config: any) => void) {
  const configRef = doc(db, 'site_config', 'website_control_config');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.config) {
        onUpdate(data.config);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToWebsiteControlConfig');
  });
}

export async function saveWebsiteControlConfigToFirestore(config: any): Promise<void> {
  try {
    const res = await fetch('/api/v1/update-website-control-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config })
    });
    
    if (!res.ok) {
      // Fallback to direct client-side save if backend route fails or is unavailable on Vercel edge
      if (!isClientFirestoreQuotaExceeded) {
        const configRef = doc(db, 'site_config', 'website_control_config');
        await setDoc(configRef, {
          config,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveWebsiteControlConfigToFirestore');
  }
}

// 18. Automated Email Notifications & Alerts Config Sync
export const defaultEmailNotificationConfig: EmailNotificationConfig = {
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
  preheaderText: 'New Government Job Notification has been published on GovtBharat Portal. Check eligibility and apply now.',
  bannerTitle: 'OFFICIAL GOVERNMENT JOB NOTIFICATION RELEASED',
  callToActionText: 'View Full Job Details & Apply Online',
  footerNote: 'You received this official alert because you subscribed on GovtBharat Portal.',
  sendCategories: ['all', 'latest-jobs', 'admit-cards', 'results', 'answer-key', 'syllabus', 'admission'],
  sendDelaySeconds: 0,
  includePdfLink: true,
  includeApplyLink: true,
};

export function subscribeToEmailNotificationConfig(onUpdate: (config: EmailNotificationConfig) => void) {
  const configRef = doc(db, 'site_config', 'email_notifications');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.config) {
        onUpdate({
          ...defaultEmailNotificationConfig,
          ...data.config
        });
        return;
      }
    }
    onUpdate(defaultEmailNotificationConfig);
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToEmailNotificationConfig');
    onUpdate(defaultEmailNotificationConfig);
  });
}

export async function saveEmailNotificationConfigToFirestore(config: EmailNotificationConfig): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const configRef = doc(db, 'site_config', 'email_notifications');
    await setDoc(configRef, {
      config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveEmailNotificationConfigToFirestore');
  }
}

export async function bulkDeleteJobsFromFirestore(jobIds: string[]): Promise<void> {
  if (!jobIds || jobIds.length === 0 || isClientFirestoreQuotaExceeded) return;
  try {
    const batch = writeBatch(db);
    jobIds.forEach(id => {
      const jobRef = doc(db, 'jobs', id);
      batch.delete(jobRef);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreQuotaError(err, 'bulkDeleteJobsFromFirestore');
  }
}

// 19. Notification Dispatch History Logs
export function subscribeToNotificationLogs(onUpdate: (logs: NotificationDispatchLog[]) => void) {
  const logsRef = doc(db, 'site_config', 'notification_logs');
  return onSnapshot(logsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.logs)) {
        onUpdate(data.logs);
        return;
      }
    }
    onUpdate([]);
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToNotificationLogs');
    onUpdate([]);
  });
}

export async function saveNotificationLogToFirestore(log: NotificationDispatchLog): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const logsRef = doc(db, 'site_config', 'notification_logs');
    const snap = await getDoc(logsRef);
    let existingLogs: NotificationDispatchLog[] = [];
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.logs)) {
        existingLogs = data.logs;
      }
    }
    const updatedLogs = [log, ...existingLogs.filter(l => l.id !== log.id)].slice(0, 100);
    await setDoc(logsRef, {
      logs: updatedLogs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveNotificationLogToFirestore');
  }
}

// 22. Mobile App Buttons & Tools Realtime Sync
export function subscribeToMobileTabsConfig(onUpdate: (config: any) => void) {
  const tabsRef = doc(db, 'site_config', 'mobile_tabs_config');
  return onSnapshot(tabsRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.config) {
        onUpdate(data.config);
      }
    }
  }, (err) => {
    handleFirestoreQuotaError(err, 'subscribeToMobileTabsConfig');
  });
}

export async function saveMobileTabsConfigToFirestore(config: any): Promise<void> {
  if (isClientFirestoreQuotaExceeded) return;
  try {
    const tabsRef = doc(db, 'site_config', 'mobile_tabs_config');
    await setDoc(tabsRef, {
      config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveMobileTabsConfigToFirestore');
  }
}




// --- Student Documents ---
export async function getStudentDocuments(): Promise<any[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'student_documents'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  } catch (err) {
    handleFirestoreQuotaError(err, 'getStudentDocuments');
    return [];
  }
}

export function subscribeToStudentDocuments(onUpdate: (docs: any[]) => void) {
  if (!db) return () => {};
  try {
    const q = query(collection(db, 'student_documents'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      onUpdate(docs);
    }, (err) => {
      handleFirestoreQuotaError(err, 'subscribeToStudentDocuments listener');
      onUpdate([]);
    });
  } catch (err) {
    handleFirestoreQuotaError(err, 'subscribeToStudentDocuments');
    return () => {};
  }
}

export async function addStudentDocument(docData: any): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(collection(db, 'student_documents'));
    await setDoc(docRef, { ...docData, id: docRef.id });
  } catch (err) {
    handleFirestoreQuotaError(err, 'addStudentDocument');
    throw err;
  }
}

export async function updateStudentDocument(id: string, docData: any): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'student_documents', id);
    await updateDoc(docRef, docData);
  } catch (err) {
    handleFirestoreQuotaError(err, 'updateStudentDocument');
    throw err;
  }
}

export async function deleteStudentDocument(id: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'student_documents', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreQuotaError(err, 'deleteStudentDocument');
    throw err;
  }
}

export async function getSuperAdminCredentials(): Promise<{ username: string; password: string }> {
  if (!db) return { username: 'Vikaspatelaoc', password: 'JTY@67YVP' };
  try {
    const docRef = doc(db, 'site_config', 'super_admin_credentials');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        username: data.username || 'Vikaspatelaoc',
        password: data.password || 'JTY@67YVP'
      };
    } else {
      const defaultCreds = { username: 'Vikaspatelaoc', password: 'JTY@67YVP' };
      await setDoc(docRef, defaultCreds);
      return defaultCreds;
    }
  } catch (err) {
    handleFirestoreQuotaError(err, 'getSuperAdminCredentials');
    return { username: 'Vikaspatelaoc', password: 'JTY@67YVP' };
  }
}

export async function updateSuperAdminCredentials(username: string, password: string): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'site_config', 'super_admin_credentials');
    await setDoc(docRef, { username, password });
  } catch (err) {
    handleFirestoreQuotaError(err, 'updateSuperAdminCredentials');
    throw err;
  }
}

// ----------------------------------------------------
// App Version Release & Live In-App Update Sync System
// ----------------------------------------------------

export const DEFAULT_APP_VERSION_RELEASE: AppVersionRelease = {
  version: '2.5.0',
  buildNumber: '2026.09.19.1',
  title: '🚀 Naye Features & Fast Performance Update!',
  releaseNotes: [
    'Job links now open directly in your phone default browser on a new page',
    'Instant push update alerts when Super Admin launches new features',
    'Enhanced Sarkari Result direct download & official portal tools',
    'Performance speedups and smoother mobile navigation'
  ],
  forceUpdate: false,
  targetPlatform: 'all',
  releasedAt: new Date().toISOString(),
  releasedBy: 'Super Admin',
  status: 'active',
  changelogText: 'Default browser launcher, real-time in-app update notification, and faster job loading.'
};

export function subscribeToAppVersionRelease(
  onUpdate: (release: AppVersionRelease | null) => void,
  onError?: (err: any) => void
) {
  if (!db) {
    const cached = localStorage.getItem('GovtBharat_latest_app_release');
    if (cached) {
      try {
        onUpdate(JSON.parse(cached));
      } catch {
        onUpdate(DEFAULT_APP_VERSION_RELEASE);
      }
    } else {
      onUpdate(DEFAULT_APP_VERSION_RELEASE);
    }
    return () => {};
  }

  const docRef = doc(db, 'site_config', 'app_version_release');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppVersionRelease;
        localStorage.setItem('GovtBharat_latest_app_release', JSON.stringify(data));
        onUpdate(data);
      } else {
        localStorage.setItem('GovtBharat_latest_app_release', JSON.stringify(DEFAULT_APP_VERSION_RELEASE));
        onUpdate(DEFAULT_APP_VERSION_RELEASE);
      }
    },
    (err) => {
      console.warn('Firestore app version subscription notice:', err);
      const cached = localStorage.getItem('GovtBharat_latest_app_release');
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          onUpdate(DEFAULT_APP_VERSION_RELEASE);
        }
      } else {
        onUpdate(DEFAULT_APP_VERSION_RELEASE);
      }
      if (onError) onError(err);
    }
  );
}

export async function getAppVersionReleaseFromFirestore(): Promise<AppVersionRelease | null> {
  if (!db) {
    const cached = localStorage.getItem('GovtBharat_latest_app_release');
    return cached ? JSON.parse(cached) : DEFAULT_APP_VERSION_RELEASE;
  }
  try {
    const docRef = doc(db, 'site_config', 'app_version_release');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AppVersionRelease;
    }
    return DEFAULT_APP_VERSION_RELEASE;
  } catch (err) {
    handleFirestoreQuotaError(err, 'getAppVersionRelease');
    const cached = localStorage.getItem('GovtBharat_latest_app_release');
    return cached ? JSON.parse(cached) : DEFAULT_APP_VERSION_RELEASE;
  }
}

export async function saveAppVersionReleaseToFirestore(release: AppVersionRelease): Promise<void> {
  localStorage.setItem('GovtBharat_latest_app_release', JSON.stringify(release));
  if (!db) return;
  try {
    const docRef = doc(db, 'site_config', 'app_version_release');
    await setDoc(docRef, {
      ...release,
      releasedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreQuotaError(err, 'saveAppVersionRelease');
    console.warn('Saved app version release to local storage as fallback.');
  }
}


