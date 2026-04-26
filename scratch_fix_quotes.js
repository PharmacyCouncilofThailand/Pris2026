const fs = require('fs');
const files = [
  'c:/Pris2026/src/app/[locale]/signup/student/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/pharmacist/page.tsx',
  'c:/Pris2026/src/app/[locale]/signup/healthcare/page.tsx'
];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/'\{t\("chooseFile"\)\}'/g, 't("chooseFile")');
  c = c.replace(/'\{t\("clickToChange"\)\}'/g, 't("clickToChange")');
  c = c.replace(/'\{t\("selectDoc"\)\}'/g, 't("selectDoc")');
  fs.writeFileSync(f, c);
});
console.log('Fixed quotes syntax');
