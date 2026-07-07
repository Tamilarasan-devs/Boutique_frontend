const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(srcDir);

const mappings = [
  { oldColor: /#FAF7F1/ig, newColor: '#F4F3F8' },
  { oldColor: /#1C2430/ig, newColor: '#16132D' },
  { oldColor: /#C1652F/ig, newColor: '#7209B7' },
  { oldColor: /#8a6a25/ig, newColor: '#6200EA' },
  { oldColor: /#C99A3E/ig, newColor: '#8338EC' },
  { oldColor: /#2F5D4F/ig, newColor: '#10B981' },
  { oldColor: /#9B3B43/ig, newColor: '#F43F5E' }
];

let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  mappings.forEach(({ oldColor, newColor }) => {
    content = content.replace(oldColor, newColor);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated colors in: ${path.relative(srcDir, file)}`);
    replacedCount++;
  }
});

console.log(`Color replacement completed. Updated ${replacedCount} files.`);
