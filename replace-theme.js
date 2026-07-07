const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Backgrounds
  content = content.replace(/bg-white/g, 'bg-[#252B33]');
  content = content.replace(/bg-slate-50\/50/g, 'bg-[#1A1D22]');
  content = content.replace(/bg-slate-50\/40/g, 'bg-[#1A1D22]');
  content = content.replace(/bg-slate-50/g, 'bg-[#1A1D22]');
  content = content.replace(/bg-slate-100\/80/g, 'bg-[#20252B]');
  content = content.replace(/bg-slate-100/g, 'bg-[#20252B]');
  content = content.replace(/bg-slate-200/g, 'bg-[#252B33]');
  
  // Text
  content = content.replace(/text-slate-900/g, 'text-[#FFFFFF]');
  content = content.replace(/text-slate-800/g, 'text-[#F8F8F8]');
  content = content.replace(/text-slate-700/g, 'text-[#B8BDC5]');
  content = content.replace(/text-slate-600/g, 'text-[#7C8795]');
  content = content.replace(/text-slate-500/g, 'text-[#7C8795]');
  content = content.replace(/text-slate-400/g, 'text-[#646D79]');
  
  // Borders
  content = content.replace(/border-slate-50/g, 'border-[#2A3038]');
  content = content.replace(/border-slate-100/g, 'border-[#2A3038]');
  content = content.replace(/border-slate-200/g, 'border-[#343A45]');
  content = content.replace(/border-slate-300/g, 'border-[#3D4550]');
  
  // Primary (Gold)
  content = content.replace(/bg-blue-600/g, 'bg-[#D4AF37]');
  content = content.replace(/bg-blue-700/g, 'bg-[#C89B2C]');
  content = content.replace(/bg-blue-50\/50/g, 'bg-[#2E3540]');
  content = content.replace(/bg-blue-50/g, 'bg-[rgba(212,175,55,0.15)]');
  content = content.replace(/text-blue-600/g, 'text-[#D4AF37]');
  content = content.replace(/text-blue-500/g, 'text-[#D4AF37]');
  content = content.replace(/border-blue-200/g, 'border-[#9E7A1F]');
  content = content.replace(/border-blue-400/g, 'border-[#D4AF37]');
  content = content.replace(/ring-blue-100/g, 'ring-[rgba(212,175,55,0.15)]');
  content = content.replace(/shadow-blue-500\/30/g, 'shadow-[rgba(212,175,55,0.2)]');

  // Status Colors (Keep or map to exact hex)
  content = content.replace(/text-emerald-700/g, 'text-[#22C55E]');
  content = content.replace(/text-emerald-600/g, 'text-[#22C55E]');
  content = content.replace(/bg-emerald-50/g, 'bg-[rgba(34,197,94,0.15)]');
  content = content.replace(/border-emerald-200/g, 'border-[#22C55E]');
  
  content = content.replace(/text-amber-700/g, 'text-[#F59E0B]');
  content = content.replace(/text-amber-600/g, 'text-[#F59E0B]');
  content = content.replace(/bg-amber-50/g, 'bg-[rgba(245,158,11,0.15)]');
  content = content.replace(/border-amber-200/g, 'border-[#F59E0B]');
  
  content = content.replace(/text-red-700/g, 'text-[#EF4444]');
  content = content.replace(/text-red-600/g, 'text-[#EF4444]');
  content = content.replace(/bg-red-50/g, 'bg-[rgba(239,68,68,0.15)]');
  content = content.replace(/border-red-200/g, 'border-[#EF4444]');
  
  // Specific fix for primary button text color
  // Buttons with bg-[#D4AF37] and text-white should have text-[#181C20]
  content = content.replace(/bg-\[#D4AF37\] text-white/g, 'bg-[#D4AF37] text-[#181C20]');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});
console.log('Theme updated successfully.');
