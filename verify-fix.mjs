import fs from 'fs';

const c = fs.readFileSync('components/search-interface.tsx', 'utf8');
const lines = c.split('\n');

// Check lines 158-162 (0-indexed 157-161)
for (let i = 157; i <= 161; i++) {
  const line = lines[i] || '';
  console.log(`L${i+1}: ${JSON.stringify(line)}`);
  // Show char codes for the option value area
  const gtIdx = line.indexOf('gt;');
  if (gtIdx >= 0) {
    const start = Math.max(0, gtIdx - 3);
    const end = Math.min(line.length, gtIdx + 8);
    const codes = [];
    for (let j = start; j < end; j++) codes.push(`${line.charCodeAt(j)}`);
    console.log(`  chars[${start}..${end-1}]: ${codes.join(',')}`);
  }
  // Show what is just BEFORE each number
  for (const num of ['100', '1000', '10000']) {
    const idx = line.indexOf(num);
    if (idx > 0) {
      const before = line.substring(idx - 3, idx);
      console.log(`  before "${num}": ${JSON.stringify(before)}`);
    }
  }
  console.log();
}

console.log('--- What fix-jsx.mjs needs to find: ---');
const broken = '"> 1,000</option>';
const idx = c.indexOf(broken);
console.log(`Found "${broken}" at byte ${idx}: ${idx !== -1}`);
const broken2 = '"> 10,000</option>';
const idx2 = c.indexOf(broken2);
console.log(`Found "${broken2}" at byte ${idx2}: ${idx2 !== -1}`);