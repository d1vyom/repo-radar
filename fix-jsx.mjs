import fs from 'fs';

let c = fs.readFileSync('components/search-interface.tsx', 'utf8');

// The file stores ">> " (chr 62, 62, 32) where it needs "> " (5 chars: & g t ; space)
// We need to replace just the 2 raw ">" with the 4-char entity ">"
// (Add 2 extra bytes of content to the file)
//
// Construct "> " by its char codes: & (38), g (103), t (116), ; (59), space (32)
const GT_SP = String.fromCharCode(38, 103, 116, 59) + ' ';

let count = 0;
// Use the indexOf approach to be sure about what we match
const broken1 = '>> 1,000</option>';
const broken2 = '>> 10,000</option>';

if (c.includes(broken1)) {
  const idx = c.indexOf(broken1);
  c = c.substring(0, idx) + GT_SP + '1,000</option>' + c.substring(idx + broken1.length);
  count++;
  console.log(`Replaced ">> 1,000" -> "> 1,000" at byte ${idx}`);
}
if (c.includes(broken2)) {
  const idx = c.indexOf(broken2);
  c = c.substring(0, idx) + GT_SP + '10,000</option>' + c.substring(idx + broken2.length);
  count++;
  console.log(`Replaced ">> 10,000" -> "> 10,000" at byte ${idx}`);
}
if (count === 0) {
  console.log('Nothing to replace - both patterns not found');
}

fs.writeFileSync('components/search-interface.tsx', c);

// Verify
const lines = c.split('\n');
for (let i = 158; i <= 161; i++) {
  const l = lines[i - 1] || '';
  const an = l.indexOf('1000');
  if (an >= 0 && an < 50) {
    const slice = l.slice(Math.max(0, an - 5), an + 15);
    const bytes = [];
    for (let j = Math.max(0, an - 5); j < Math.min(l.length, an + 15); j++) {
      bytes.push(`${j}:${l.charCodeAt(j)}`);
    }
    console.log(`\nL${i}: ${JSON.stringify(l)}`);
    console.log(`  bytes: ${bytes.join(' ')}`);
  }
}