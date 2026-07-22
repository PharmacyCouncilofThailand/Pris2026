const fs = require('fs');
const file = 'c:/Pris2026/src/data/scheduleData.ts';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '"ห้อง JUPITER 4-7 (INNOVATION ZONE)"': '"ห้อง JUPITER 4-7"'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(file, content);
console.log("Replacements done");
