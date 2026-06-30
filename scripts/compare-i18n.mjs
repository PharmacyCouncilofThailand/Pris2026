import fs from 'fs';

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const th = JSON.parse(fs.readFileSync('messages/th.json', 'utf8'));

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(result, flatten(v, key));
    else result[key] = v;
  }
  return result;
}

const fe = flatten(en);
const ft = flatten(th);
const allKeys = new Set([...Object.keys(fe), ...Object.keys(ft)]);
const thaiRegex = /[\u0E00-\u0E7F]/;

console.log('=== MISSING IN TH ===');
console.log([...allKeys].filter((k) => !(k in ft)).join('\n') || 'none');

console.log('\n=== MISSING IN EN ===');
console.log([...allKeys].filter((k) => !(k in fe)).join('\n') || 'none');

console.log('\n=== THAI TEXT IN en.json ===');
for (const [k, v] of Object.entries(fe)) {
  if (thaiRegex.test(String(v))) console.log(`${k}: ${String(v).slice(0, 100)}`);
}

console.log('\n=== ENGLISH-ONLY IN th.json (needs translation) ===');
for (const [k, v] of Object.entries(ft)) {
  const s = String(v);
  if (s.length > 2 && !thaiRegex.test(s) && /[a-zA-Z]{4,}/.test(s)) {
    console.log(`${k}: ${s.slice(0, 100)}`);
  }
}

console.log('\n=== IDENTICAL VALUES (both locales) ===');
for (const k of allKeys) {
  if (k in fe && k in ft && String(fe[k]) === String(ft[k]) && String(fe[k]).length > 2) {
    console.log(`${k}: ${String(fe[k]).slice(0, 100)}`);
  }
}
