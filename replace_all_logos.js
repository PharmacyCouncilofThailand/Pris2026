const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Pris2026/src');
let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('LOGO_PRIS_NEW-removebg-preview.png')) {
    content = content.replace(/LOGO_PRIS_NEW-removebg-preview\.png/g, 'Logo-Final .png');
    
    // Also remove brightness-0 in case it messes up the new logo's colors.
    content = content.replace(/ brightness-0/g, '');

    fs.writeFileSync(f, content);
    changed++;
    console.log('Updated', f);
  }
});
console.log('Total files changed:', changed);
