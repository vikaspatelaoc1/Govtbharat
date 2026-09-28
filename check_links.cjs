const fs = require('fs');
const https = require('https');
const http = require('http');

function checkUrl(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ url, status: res.statusCode, location: res.headers.location });
    });
    req.on('error', (err) => resolve({ url, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'timeout' }); });
    req.end();
  });
}

async function run() {
  const db = JSON.parse(fs.readFileSync('data/GovtBharat_database.json', 'utf8'));
  const uniqueUrls = new Set();
  
  db.jobs.forEach(job => {
    if (job.links) {
      Object.values(job.links).forEach(url => {
        if (url && url.startsWith('http')) {
          uniqueUrls.add(url);
        }
      });
    }
  });

  const urls = Array.from(uniqueUrls).slice(0, 30); // test first 30
  console.log(`Checking ${urls.length} urls out of ${uniqueUrls.size} total...`);
  
  for (const url of urls) {
    const res = await checkUrl(url);
    if (res.error || res.status >= 400) {
      console.log(`[FAILED] ${url} -> ${res.error || res.status}`);
      // Try without www if it had it
      if (url.includes('www.')) {
        const url2 = url.replace('www.', '');
        const res2 = await checkUrl(url2);
        if (!res2.error && res2.status < 400) {
          console.log(`  [FIX] -> Works without www: ${url2}`);
        }
      } else {
        // Try with www
        const url2 = url.replace('://', '://www.');
        const res2 = await checkUrl(url2);
        if (!res2.error && res2.status < 400) {
          console.log(`  [FIX] -> Works with www: ${url2}`);
        }
      }
    } else {
      console.log(`[OK] ${url} -> ${res.status}`);
    }
  }
}
run();
