const fs = require('fs');

const files = [
  'c:/Pris2026/src/app/[locale]/login/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/student/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pharmacist/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/healthcare/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pending/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  // Add brightness-0 to logo className
  c = c.replace(/className="h-\[55px\] w-auto object-contain"/g, 'className="h-[55px] w-auto object-contain brightness-0"');
  
  fs.writeFileSync(f, c);
});
console.log('Logo black cleanup complete');
