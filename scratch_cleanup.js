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
  
  // Remove unused GSAP imports
  c = c.replace(/import gsap from "gsap";[\r\n]+/g, '');
  c = c.replace(/import \{ useGSAP \} from "@gsap\/react";[\r\n]+/g, '');
  c = c.replace(/const containerRef = useRef<HTMLDivElement>\(null!\);[\r\n]+/g, '');
  
  fs.writeFileSync(f, c);
});
console.log('Cleanup complete');
