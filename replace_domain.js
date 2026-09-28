const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/JobDetailModal.tsx',
  'src/components/AdminPanel.tsx',
  'src/components/AutoFeedContent.tsx',
  'src/components/SeoEditorTab.tsx',
  'src/components/CategorySeoEditorTab.tsx',
  'src/components/Hero.tsx',
  'src/components/JobDetailsPage.tsx',
  'src/data/defaultPages.ts',
  'src/utils/seo.ts',
  'src/App.tsx'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if (content.includes('GovtBharat.info') || content.includes('GovtBharat.info')) {
    // Add import if not exists
    if (!content.includes('getDomainName')) {
       // Find last import
       const importMatch = content.match(/^import.*?;/gm);
       if (importMatch) {
         const lastImport = importMatch[importMatch.length - 1];
         content = content.replace(lastImport, lastImport + "\nimport { getDomainName, getDomainNameLowercase } from '../utils/domain';");
       } else {
         content = "import { getDomainName, getDomainNameLowercase } from '../utils/domain';\n" + content;
       }
    }

    // JSX Text replacement (very naive, let's just do manual string replacements to avoid breaking code)
  }
});
