const fs = require('fs');
const files = [
  'c:/Pris2026/src/app/[locale]/signup/student/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pharmacist/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pending/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/healthcare/page.tsx',
  'c:/Pris2026/src/app/[locale]/reset-password/page.tsx',
  'c:/Pris2026/src/app/[locale]/login/page.tsx',
  'c:/Pris2026/src/app/[locale]/forgot-password/page.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/LOGO1\.png/g, 'LOGO_PRIS_NEW-removebg-preview.png');
  // Ensuring we KEEP brightness-0 to make it black as user requested
  // If brightness-0 was removed earlier, we add it back.
  content = content.replace(/className="(h-\[55px\] w-auto object-contain)"/g, 'className="$1 brightness-0"');
  content = content.replace(/className="(h-9 w-auto object-contain)"/g, 'className="$1 brightness-0"');
  fs.writeFileSync(f, content);
});
console.log('done');
