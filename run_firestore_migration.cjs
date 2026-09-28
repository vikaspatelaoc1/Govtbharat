const fs = require('fs');

async function migrate() {
  if (fs.existsSync('data/GovtBharat_database.json')) {
     const db = JSON.parse(fs.readFileSync('data/GovtBharat_database.json', 'utf8'));
     
     function normalizeExternalUrl(url) {
       if (!url || typeof url !== 'string' || !url.trim() || url.trim() === '#') return '';
       let clean = url.trim().replace(/['"<>]/g, '');
       if (clean.startsWith('//')) clean = 'https:' + clean;
       if (!/^https?:\/\//i.test(clean)) {
         if (/^(javascript|data|file):/i.test(clean)) return '';
         clean = 'https://' + clean;
       }
       clean = clean.replace(/^https?:\/\/(https?:\/\/)+/i, 'https://');
       try { return new URL(clean).toString(); } catch { return clean; }
     }

     if (db.jobs && Array.isArray(db.jobs)) {
       db.jobs.forEach(job => {
         if (job.links) {
           Object.keys(job.links).forEach(key => {
             if (job.links[key]) {
               job.links[key] = normalizeExternalUrl(job.links[key]);
             }
           });
         }
       });
       fs.writeFileSync('data/GovtBharat_database.json', JSON.stringify(db, null, 2));
       console.log("Updated data/GovtBharat_database.json!");
     }
  }
}

migrate();
