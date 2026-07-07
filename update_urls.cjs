const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'api');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/http:\/\/localhost:8080/g, 'https://boutique-backend-wm2p.onrender.com');
  fs.writeFileSync(filePath, content, 'utf8');
};

const files = fs.readdirSync(apiDir);
files.forEach(file => {
  if (file.endsWith('.ts')) {
    replaceInFile(path.join(apiDir, file));
  }
});
console.log('Replaced all URLs');
