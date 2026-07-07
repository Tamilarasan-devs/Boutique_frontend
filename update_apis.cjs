const fs = require('fs');
const path = require('path');

const dir = '/Users/nivi/Desktop/Projects/gesdemn/Crm 2/Boutique-Frontend/src/api';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'client.ts');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let modified = false;

  // Add import if not exists
  if (content.match(/\bfetch\s*\(/) && !content.includes('fetchWithAuth')) {
    // Insert after the first import or at the top
    const importRegex = /import\s+.*?;?\n/g;
    let lastImportMatch;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportMatch = match;
    }
    
    const importStr = `import { fetchWithAuth } from './client';\n`;
    if (lastImportMatch) {
      content = content.slice(0, importRegex.lastIndex) + importStr + content.slice(importRegex.lastIndex);
    } else {
      content = importStr + content;
    }
    modified = true;
  }
  
  if (content.match(/\bfetch\s*\(/)) {
    content = content.replace(/\bfetch\s*\(/g, 'fetchWithAuth(');
    modified = true;
  }

  // Remove local getAuthHeader definitions and usages to avoid duplication/errors since we have client.ts
  if (content.includes('getAuthHeader')) {
    content = content.replace(/const getAuthHeader = \(\): Record<string, string> => \{[\s\S]*?\};\n+/g, '');
    content = content.replace(/,\s*\.\.\.getAuthHeader\(\)/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});

console.log('Finished updating API files.');
