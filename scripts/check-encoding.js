const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === '.claude' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/(ts|tsx|js|jsx|json|md|sql|yml|yaml)$/.test(e.name)) out.push(p);
  }
  return out;
}

let bad = 0;
for (const f of walk('.')) {
  const t = fs.readFileSync(f, 'utf8');
  const mojibake = (t.match(/Р[°µ»±Ўў]/g) || []).length;
  const bom = t.charCodeAt(0) === 0xFEFF;
  if (mojibake > 0 || bom) {
    bad++;
    console.log('BAD ' + f + ': mojibake=' + mojibake + ' BOM=' + bom);
  }
}
console.log(bad === 0 ? 'ALL CLEAN' : 'files with issues: ' + bad);