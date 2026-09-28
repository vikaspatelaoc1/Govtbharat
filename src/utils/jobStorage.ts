import { JobAlert } from '../types';
import { defaultJobsDatabase } from '../data';
import { cleanOfficialUrl } from './jobEnricher';

const CUSTOM_JOBS_KEY = 'GovtBharat_custom_jobs';
const LEGACY_JOBS_KEY = 'GovtBharat_jobs';

/**
 * Safely saves custom jobs/overrides to localStorage without exceeding quota.
 * Storing only customized/delta jobs ensures we stay well within the ~5MB browser limit.
 */
export const safeSaveJobsToLocalStorage = (allJobs: JobAlert[]): void => {
  if (typeof window === 'undefined') return;

  try {
    const defaultMap = new Map<string, JobAlert>();
    defaultJobsDatabase.forEach(j => {
      if (j && j.id) defaultMap.set(j.id, j);
    });

    // Find custom added, edited, or deleted jobs
    const customOrModified = allJobs.filter(j => {
      if (!j || !j.id) return false;
      const defaultJob = defaultMap.get(j.id);
      if (!defaultJob) return true; // Custom added job
      if ((j as any).isDeleted || (j as any).deleted) return true; // Marked deleted
      // Check if critical fields were edited
      return (
        defaultJob.title !== j.title ||
        defaultJob.category !== j.category ||
        defaultJob.postDate !== j.postDate ||
        defaultJob.state !== j.state ||
        defaultJob.shortInfo !== j.shortInfo
      );
    });

    try {
      localStorage.setItem(CUSTOM_JOBS_KEY, JSON.stringify(customOrModified));
    } catch (quotaErr) {
      console.warn('[Storage] Quota exceeded saving custom jobs, trimming payload:', quotaErr);
      // If even custom jobs exceed, trim to top 50 recent custom jobs
      try {
        localStorage.setItem(CUSTOM_JOBS_KEY, JSON.stringify(customOrModified.slice(0, 50)));
      } catch {}
    }

    // Clean up legacy monolithic key to reclaim 5MB browser storage space
    try {
      if (allJobs.length <= 80) {
        localStorage.setItem(LEGACY_JOBS_KEY, JSON.stringify(allJobs));
      } else {
        localStorage.removeItem(LEGACY_JOBS_KEY);
      }
    } catch {
      localStorage.removeItem(LEGACY_JOBS_KEY);
    }
  } catch (err) {
    console.warn('[Storage] Safe job save warning:', err);
  }
};

/**
 * Loads and restores jobs by merging default comprehensive catalog with custom local overrides.
 */
export const loadJobsFromLocalStorage = (): JobAlert[] => {
  if (typeof window === 'undefined') return defaultJobsDatabase;

  try {
    const customRaw = localStorage.getItem(CUSTOM_JOBS_KEY);
    const legacyRaw = localStorage.getItem(LEGACY_JOBS_KEY);
    const rawData = customRaw || legacyRaw;

    if (!rawData) return defaultJobsDatabase;

    const parsed = JSON.parse(rawData);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultJobsDatabase;

    const masterMap = new Map<string, JobAlert>();
    // 1. Seed with full master catalog
    defaultJobsDatabase.forEach(j => {
      if (j && j.id) masterMap.set(j.id, j);
    });

    // 2. Overlay local modifications
    parsed.forEach((j: any) => {
      if (j && j.id) {
        if (j.isDeleted || j.deleted) {
          masterMap.delete(j.id);
        } else {
          const existing = masterMap.get(j.id);
          masterMap.set(j.id, { ...(existing || {}), ...j });
        }
      }
    });

    return Array.from(masterMap.values()).map((j: any) => {
      const rawLinks = j.links || {};
      const official = cleanOfficialUrl(rawLinks.official, 'https://india.gov.in');
      const apply = cleanOfficialUrl(rawLinks.apply, official);
      const notification = cleanOfficialUrl(rawLinks.notification, official);
      return {
        ...j,
        links: {
          ...rawLinks,
          official,
          apply,
          notification,
          applyServer2: rawLinks.applyServer2 ? cleanOfficialUrl(rawLinks.applyServer2, apply) : undefined,
          admitCard: rawLinks.admitCard ? cleanOfficialUrl(rawLinks.admitCard, apply) : undefined,
          result: rawLinks.result ? cleanOfficialUrl(rawLinks.result, apply) : undefined,
          resultServer2: rawLinks.resultServer2 ? cleanOfficialUrl(rawLinks.resultServer2, apply) : undefined,
          answerKey: rawLinks.answerKey ? cleanOfficialUrl(rawLinks.answerKey, official) : undefined,
        }
      };
    });
  } catch (err) {
    console.warn('[Storage] Failed to parse local jobs, falling back to default database:', err);
    return defaultJobsDatabase;
  }
};

/**
 * Universal safe setItem that never throws QuotaExceededError
 */
export const safeSetLocalStorage = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[Storage] Failed to set "${key}" in localStorage:`, err);
    return false;
  }
};
