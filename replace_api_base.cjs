const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'api');
const files = fs.readdirSync(apiDir);

files.forEach(file => {
  if (file.endsWith('.ts')) {
    const filePath = path.join(apiDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes("from '@/constants'")) return;

    if (content.includes("https://boutique-backend-wm2p.onrender.com/api/inventory")) {
      content = `import { API_BASE_URL as BASE } from '@/constants';\n` + content.replace(/const API_BASE = '.*';/g, 'const API_BASE = `${BASE}/inventory`;');
    } else if (content.includes("https://boutique-backend-wm2p.onrender.com/api/reports")) {
      content = `import { API_BASE_URL as BASE } from '@/constants';\n` + content.replace(/const API_BASE_URL = '.*';/g, 'const API_BASE_URL = `${BASE}/reports`;');
    } else if (content.includes("https://boutique-backend-wm2p.onrender.com/api/billing")) {
      content = `import { API_BASE_URL as BASE } from '@/constants';\n` + content.replace(/const API_BASE_URL = '.*';/g, 'const API_BASE_URL = `${BASE}/billing`;');
    } else if (content.includes("https://boutique-backend-wm2p.onrender.com/api")) {
      content = `import { API_BASE_URL } from '@/constants';\n` + content.replace(/const API_BASE_URL = '.*';\n?/g, '');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Replaced all API base URLs to use common endpoint from constants');
