const fs = require('fs');

function normalizeExternalUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim() || url.trim() === '#') return '';
  let clean = url.trim().replace(/['"<>]/g, '');
  if (clean.startsWith('//')) clean = 'https:' + clean;
  if (!/^https?:\/\//i.test(clean)) {
    if (/^(javascript|data|file):/i.test(clean)) return '';
    clean = 'https://' + clean;
  }
  clean = clean.replace(/^https?:\/\/(https?:\/\/)+/i, 'https://');
  clean = clean.replace(/([^:])\/\//g, '$1/');
  try { 
    const u = new URL(clean);
    if (!u.hostname.startsWith('www.')) {
      const hostParts = u.hostname.split('.');
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

if (fs.existsSync('data/GovtBharat_database.json')) {
  const db = JSON.parse(fs.readFileSync('data/GovtBharat_database.json', 'utf8'));
  let updated = 0;
  if (db.jobs && Array.isArray(db.jobs)) {
    db.jobs.forEach(job => {
      if (job.links) {
        Object.keys(job.links).forEach(key => {
          if (job.links[key]) {
            const old = job.links[key];
            const fixed = normalizeExternalUrl(old);
            if (old !== fixed) {
              job.links[key] = fixed;
              updated++;
            }
          }
        });
      }
    });
    fs.writeFileSync('data/GovtBharat_database.json', JSON.stringify(db, null, 2));
    console.log(`Updated ${updated} links in data/GovtBharat_database.json!`);
  }
}
