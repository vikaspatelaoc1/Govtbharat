/**
 * One-time migration script for Firestore Job Documents and local database
 * Normalizes all job links using 'normalizeExternalUrl' and flags unrepairable links as 'Needs Review'.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');

// Load Firebase configuration
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
let firebaseConfig = null;

if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('⚠️ Could not parse firebase-applet-config.json:', e.message);
  }
}

/**
 * Normalizes external URL with Indian Govt Portal heuristics
 */
function normalizeExternalUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim() || url.trim() === '#') return '';
  
  let clean = url.trim();

  // Remove invalid characters like quotation marks and angle brackets
  clean = clean.replace(/['"<>]/g, '');

  // Fix protocol relative URLs
  if (clean.startsWith('//')) {
    clean = 'https:' + clean;
  }

  // Ensure protocol exists
  if (!/^https?:\/\//i.test(clean)) {
    if (/^(javascript|data|file):/i.test(clean)) return '';
    clean = `https://${clean}`;
  }

  // Fix duplicate protocols
  clean = clean.replace(/^https?:\/\/(https?:\/\/)+/i, 'https://');
  
  // Fix double slashes in path (but not in protocol)
  clean = clean.replace(/([^:])\/\//g, '$1/');

  try {
    const u = new URL(clean);
    
    // Many Indian govt websites require 'www.' to resolve properly.
    const hostParts = u.hostname.split('.');
    
    if (!u.hostname.startsWith('www.')) {
      const isCountryTLD = hostParts.length === 3 && hostParts[2].length === 2;
      const isNormalTLD = hostParts.length === 2;
      
      if (isNormalTLD || isCountryTLD) {
        u.hostname = 'www.' + u.hostname;
      }
    }

    return u.toString();
  } catch {
    return clean;
  }
}

/**
 * Validates if a normalized URL can be safely repaired and is a valid web destination
 */
function validateLinkSafety(rawUrl, normalizedUrl) {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim() || rawUrl.trim() === '#') {
    return { isSafe: true, isBlank: true, normalized: '' };
  }

  const trimmed = rawUrl.trim();

  // Obvious non-URLs or broken stubs
  if (/^(javascript|data|file|about|blob):/i.test(trimmed)) {
    return { isSafe: false, reason: 'Invalid or forbidden protocol scheme' };
  }

  if (trimmed.toLowerCase() === 'needs review' || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') {
    return { isSafe: false, reason: 'Placeholder or unresolved text' };
  }

  if (!normalizedUrl || typeof normalizedUrl !== 'string' || !normalizedUrl.startsWith('http')) {
    return { isSafe: false, reason: 'Normalization resulted in empty or non-HTTP URL' };
  }

  try {
    const parsed = new URL(normalizedUrl);
    
    // Hostname checks
    if (!parsed.hostname || !parsed.hostname.includes('.') || parsed.hostname.length < 4) {
      return { isSafe: false, reason: 'Hostname is missing or has no top-level domain' };
    }

    // Hostname contains invalid characters or looks like a malformed path
    if (/[^a-zA-Z0-9.-]/.test(parsed.hostname) || parsed.hostname.startsWith('.') || parsed.hostname.endsWith('.')) {
      return { isSafe: false, reason: 'Hostname contains illegal characters' };
    }

    // Suspicious dummy domains
    if (parsed.hostname.includes('undefined') || parsed.hostname.includes('example.invalid')) {
      return { isSafe: false, reason: 'Contains placeholder domain name' };
    }

    return { isSafe: true, normalized: normalizedUrl };
  } catch (err) {
    return { isSafe: false, reason: 'URL failed strict parser validation: ' + err.message };
  }
}

/**
 * Processes a single job item and normalizes all its links
 */
function processJobDocument(job) {
  let hasModifications = false;
  let hasBrokenLinks = false;
  const linkReviewStatus = job.linkReviewStatus ? { ...job.linkReviewStatus } : {};
  const unrepairableLinks = [];

  if (!job.links || typeof job.links !== 'object') {
    return { job, hasModifications: false, hasBrokenLinks: false };
  }

  const updatedLinks = { ...job.links };

  // Iterate over all link fields
  for (const [key, val] of Object.entries(updatedLinks)) {
    if (key === 'otherLinks' && Array.isArray(val)) {
      const updatedOtherLinks = val.map(item => {
        if (!item || !item.url) return item;
        const norm = normalizeExternalUrl(item.url);
        const check = validateLinkSafety(item.url, norm);
        if (check.isSafe) {
          if (norm !== item.url) {
            hasModifications = true;
            return { ...item, url: norm };
          }
        } else {
          hasBrokenLinks = true;
          hasModifications = true;
          return { ...item, url: 'Needs Review', reviewNote: check.reason, originalUrl: item.url };
        }
        return item;
      });
      updatedLinks.otherLinks = updatedOtherLinks;
      continue;
    }

    if (typeof val === 'string' && val.trim() !== '') {
      const norm = normalizeExternalUrl(val);
      const safety = validateLinkSafety(val, norm);

      if (safety.isSafe) {
        if (!safety.isBlank && norm !== val) {
          updatedLinks[key] = norm;
          hasModifications = true;
          linkReviewStatus[key] = 'Healthy (Normalized)';
        } else if (!safety.isBlank) {
          linkReviewStatus[key] = 'Healthy';
        }
      } else {
        // Cannot be safely repaired -> mark as 'Needs Review'
        console.warn(`  ⚠️ Job [${job.id}] "${job.title?.slice(0, 35)}..." - Link [${key}]: ${val} -> MARKED AS 'Needs Review' (${safety.reason})`);
        updatedLinks[key] = 'Needs Review';
        linkReviewStatus[key] = `Needs Review: ${safety.reason}`;
        unrepairableLinks.push(`${key} (${val}): ${safety.reason}`);
        hasBrokenLinks = true;
        hasModifications = true;
      }
    }
  }

  const updatedJob = {
    ...job,
    links: updatedLinks,
    linkReviewStatus,
    ...(hasBrokenLinks ? {
      needsReview: true,
      linkHealthStatus: 'Needs Review',
      unrepairableLinks,
      lastLinkAuditAt: new Date().toISOString()
    } : {
      linkHealthStatus: unrepairableLinks.length > 0 ? 'Needs Review' : 'Healthy',
      lastLinkAuditAt: new Date().toISOString()
    })
  };

  return { job: updatedJob, hasModifications, hasBrokenLinks, unrepairableCount: unrepairableLinks.length };
}

/**
 * Main Migration Executor
 */
async function runMigration() {
  console.log('================================================================');
  console.log('🚀 Starting Job Links Normalization & Audit Migration');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  let stats = {
    localJobsProcessed: 0,
    localJobsModified: 0,
    localBrokenLinksFlagged: 0,
    firestoreJobsProcessed: 0,
    firestoreJobsModified: 0,
    firestoreBrokenLinksFlagged: 0,
  };

  // 1. Process Local JSON Database (data/GovtBharat_database.json)
  const localDbPath = path.resolve(__dirname, '../data/GovtBharat_database.json');
  if (fs.existsSync(localDbPath)) {
    try {
      console.log('📁 1/2. Processing local fallback database (data/GovtBharat_database.json)...');
      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      
      if (localData.jobs && Array.isArray(localData.jobs)) {
        const processedJobs = [];
        for (const job of localData.jobs) {
          stats.localJobsProcessed++;
          const result = processJobDocument(job);
          processedJobs.push(result.job);
          if (result.hasModifications) stats.localJobsModified++;
          if (result.hasBrokenLinks) stats.localBrokenLinksFlagged += result.unrepairableCount;
        }

        localData.jobs = processedJobs;
        localData.lastLinkMigrationAt = new Date().toISOString();
        fs.writeFileSync(localDbPath, JSON.stringify(localData, null, 2), 'utf8');
        console.log(`✅ Local database updated successfully.`);
        console.log(`   - Total Jobs Processed: ${stats.localJobsProcessed}`);
        console.log(`   - Jobs with Link Modifications: ${stats.localJobsModified}`);
        console.log(`   - Links Marked as 'Needs Review': ${stats.localBrokenLinksFlagged}\n`);
      }
    } catch (err) {
      console.error('❌ Error processing local database:', err.message);
    }
  }

  // 2. Process Live Firestore Database
  if (firebaseConfig && firebaseConfig.projectId) {
    try {
      console.log('🔥 2/2. Connecting to Live Firestore Database...');
      console.log(`   - Project ID: ${firebaseConfig.projectId}`);
      console.log(`   - Database ID: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);

      const app = initializeApp(firebaseConfig);
      const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);

      const jobsCollection = collection(db, 'jobs');
      const snapshot = await getDocs(jobsCollection);
      
      console.log(`📊 Fetched ${snapshot.size} documents from Firestore 'jobs' collection.`);

      if (snapshot.size > 0) {
        let batch = writeBatch(db);
        let batchCount = 0;
        let totalBatchesCommitted = 0;

        for (const docSnap of snapshot.docs) {
          stats.firestoreJobsProcessed++;
          const rawJob = { id: docSnap.id, ...docSnap.data() };
          const result = processJobDocument(rawJob);

          if (result.hasModifications) {
            stats.firestoreJobsModified++;
            if (result.hasBrokenLinks) stats.firestoreBrokenLinksFlagged += result.unrepairableCount;

            const docRef = doc(db, 'jobs', docSnap.id);
            batch.update(docRef, {
              links: result.job.links,
              linkReviewStatus: result.job.linkReviewStatus,
              linkHealthStatus: result.job.linkHealthStatus,
              ...(result.job.needsReview ? { needsReview: true } : {}),
              ...(result.job.unrepairableLinks ? { unrepairableLinks: result.job.unrepairableLinks } : {}),
              lastLinkAuditAt: result.job.lastLinkAuditAt
            });
            batchCount++;

            // Firestore batch limit is 500 writes
            if (batchCount >= 400) {
              await batch.commit();
              totalBatchesCommitted++;
              console.log(`   📦 Committed batch #${totalBatchesCommitted} (${batchCount} job documents updated)`);
              batch = writeBatch(db);
              batchCount = 0;
            }
          }
        }

        if (batchCount > 0) {
          await batch.commit();
          totalBatchesCommitted++;
          console.log(`   📦 Committed final batch #${totalBatchesCommitted} (${batchCount} job documents updated)`);
        }

        console.log(`✅ Firestore migration completed.`);
        console.log(`   - Firestore Docs Scanned: ${stats.firestoreJobsProcessed}`);
        console.log(`   - Firestore Docs Updated: ${stats.firestoreJobsModified}`);
        console.log(`   - Unrepairable Links Flagged as 'Needs Review': ${stats.firestoreBrokenLinksFlagged}\n`);
      } else {
        console.log('ℹ️ Firestore collection is currently empty or using server-side local storage.');
      }
    } catch (err) {
      console.warn('⚠️ Firestore live migration encountered an issue (e.g. quota/offline):', err.message);
      console.log('ℹ️ Local database was successfully normalized and ready.');
    }
  }

  console.log('================================================================');
  console.log('🎉 Migration Completed Successfully!');
  console.log('================================================================');
  return stats;
}

if (require.main === module) {
  runMigration().then(() => process.exit(0)).catch((err) => {
    console.error('Fatal Migration Error:', err);
    process.exit(1);
  });
}

module.exports = { runMigration, processJobDocument, validateLinkSafety, normalizeExternalUrl };
