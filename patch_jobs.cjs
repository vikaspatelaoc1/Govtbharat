const fs = require('fs');

const path = 'src/components/JobDetailsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace standard links
code = code.replace(/<a([^>]*?)href=\{cleanOfficialUrl\((.*?)\)\}([^>]*?)>([\s\S]*?)<\/a>/g, (match, p1, p2, p3, p4) => {
  let attrs = (p1 + p3)
    .replace(/\s+target="_blank"/g, '')
    .replace(/\s+rel="noopener noreferrer"/g, '')
    .replace(/\s+rel="noreferrer"/g, '');
    
  let showIcon = !p4.includes('<ExternalLink');
  p4 = p4.replace(/<ExternalLink[^>]*\/>/g, '');
  return "<SafeExternalLink url={" + p2 + "}" + attrs + " showIcon={" + showIcon + "}>" + p4 + "</SafeExternalLink>";
});

// Also replace simple href={job.links.xxx}
code = code.replace(/<a([^>]*?)href=\{(job\.links\??\.[a-zA-Z]+)\}([^>]*?)>([\s\S]*?)<\/a>/g, (match, p1, p2, p3, p4) => {
  let attrs = (p1 + p3)
    .replace(/\s+target="_blank"/g, '')
    .replace(/\s+rel="noopener noreferrer"/g, '')
    .replace(/\s+rel="noreferrer"/g, '');
    
  let showIcon = !p4.includes('<ExternalLink');
  p4 = p4.replace(/<ExternalLink[^>]*\/>/g, '');
  return "<SafeExternalLink url={" + p2 + "}" + attrs + " showIcon={" + showIcon + "}>" + p4 + "</SafeExternalLink>";
});

// Also replace href={job.links?.xxx || fallback}
code = code.replace(/<a([^>]*?)href=\{(job\.links\??\.[a-zA-Z]+ \|\| "[^"]+")\}([^>]*?)>([\s\S]*?)<\/a>/g, (match, p1, p2, p3, p4) => {
  let attrs = (p1 + p3)
    .replace(/\s+target="_blank"/g, '')
    .replace(/\s+rel="noopener noreferrer"/g, '')
    .replace(/\s+rel="noreferrer"/g, '');
    
  let showIcon = !p4.includes('<ExternalLink');
  p4 = p4.replace(/<ExternalLink[^>]*\/>/g, '');
  return "<SafeExternalLink url={" + p2 + "}" + attrs + " showIcon={" + showIcon + "}>" + p4 + "</SafeExternalLink>";
});

// There might be some fallback using single quotes or different structure like href={job.links?.telegram || 'https://t.me/GovtBharatgov'}
code = code.replace(/<a([^>]*?)href=\{(job\.links\??\.[a-zA-Z]+ \|\| '[^']+?')\}([^>]*?)>([\s\S]*?)<\/a>/g, (match, p1, p2, p3, p4) => {
  let attrs = (p1 + p3)
    .replace(/\s+target="_blank"/g, '')
    .replace(/\s+rel="noopener noreferrer"/g, '')
    .replace(/\s+rel="noreferrer"/g, '');
    
  let showIcon = !p4.includes('<ExternalLink');
  p4 = p4.replace(/<ExternalLink[^>]*\/>/g, '');
  return "<SafeExternalLink url={" + p2 + "}" + attrs + " showIcon={" + showIcon + "}>" + p4 + "</SafeExternalLink>";
});

fs.writeFileSync(path, code);
console.log('Patched JobDetailsPage!');
