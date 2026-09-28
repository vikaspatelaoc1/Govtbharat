const fs = require('fs');
let file, content;

// src/components/AdminPanel.tsx
file = 'src/components/AdminPanel.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/GovtBharat Result Official • \{getDomainName\(\)\}/g, 'GovtBharat Result Official • {getDomainName()}');
fs.writeFileSync(file, content, 'utf8');

