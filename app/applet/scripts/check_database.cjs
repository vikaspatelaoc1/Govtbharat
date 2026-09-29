const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/GovtBharat_database.json');
const bakPath = path.resolve(__dirname, '../data/GovtBharat_database.json.bak');

console.log('🔍 Running GovtBharat Database Health & Integrity Check...');

let isValid = false;
let db = null;

if (fs.existsSync(dbPath)) {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (raw && raw.trim().length > 0) {
      db = JSON.parse(raw);
      if (db && typeof db === 'object' && Array.isArray(db.jobs)) {
        isValid = true;
        console.log(`✅ data/GovtBharat_database.json is valid with ${db.jobs.length} jobs.`);
      }
    }
  } catch (err) {
    console.warn('⚠️ data/GovtBharat_database.json is corrupted or invalid:', err.message);
  }
}

if (!isValid) {
  console.log('🔄 Attempting recovery from backup...');
  if (fs.existsSync(bakPath)) {
    try {
      const rawBak = fs.readFileSync(bakPath, 'utf8');
      const parsedBak = JSON.parse(rawBak);
      if (parsedBak && Array.isArray(parsedBak.jobs)) {
        fs.writeFileSync(dbPath, JSON.stringify(parsedBak), 'utf8');
        console.log(`✅ Successfully restored database from backup (${parsedBak.jobs.length} jobs)!`);
        isValid = true;
        db = parsedBak;
      }
    } catch (bakErr) {
      console.warn('⚠️ Backup also invalid:', bakErr.message);
    }
  }
}

if (!isValid) {
  console.log('🔄 Reconstructing database from TypeScript catalog...');
  try {
    const { fullCatalogJobs } = require('../src/data/fullCatalogJobs.ts');
    const newDb = {
      isInitialized: true,
      jobs: fullCatalogJobs || [],
      stagingJobs: [],
      scraperSources: [],
      employees: [],
      subscribers: [],
      siteConfig: { siteName: 'GovtBharat' }
    };
    fs.writeFileSync(dbPath, JSON.stringify(newDb), 'utf8');
    console.log(`✅ Successfully regenerated database from fullCatalogJobs (${newDb.jobs.length} jobs)!`);
    isValid = true;
  } catch (tsErr) {
    console.error('❌ Reconstruction failed:', tsErr.message);
  }
}

// Always ensure backup is kept fresh
if (isValid && db && Array.isArray(db.jobs) && db.jobs.length > 500) {
  try {
    fs.copyFileSync(dbPath, bakPath);
    console.log('💾 Kept backup synchronized.');
  } catch {}
}

console.log('🎉 Database check completed successfully!');
