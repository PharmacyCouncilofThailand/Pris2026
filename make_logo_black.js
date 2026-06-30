const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:/Pris2026/src/app/[locale]/signup',
  'c:/Pris2026/src/app/[locale]/login',
  'c:/Pris2026/src/app/[locale]/forgot-password',
  'c:/Pris2026/src/app/[locale]/reset-password'
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

let files = [];
targetDirs.forEach(d => {
  files = files.concat(walk(d));
});

let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('Logo-Final .png')) {
    let newContent = content.replace(/className="(h-\[55px\] w-auto object-contain)"/g, 'className="$1 brightness-0"');
    newContent = newContent.replace(/className="(h-9 w-auto object-contain)"/g, 'className="$1 brightness-0"');
    if (newContent !== content) {
      fs.writeFileSync(f, newContent);
      changed++;
      console.log('Updated', f);
    }
  }
});
console.log('Total files changed:', changed);
