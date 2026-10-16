import fs from 'fs';

const c = fs.readFileSync('components/search-interface.tsx', 'utf8');
const lines = c.split('\n');

function showLine(n) {
  const line = lines[n - 1] || '';
  console.log(`L${n} (len=${line.length}): ${JSON.stringify(line)}`);
  const anchor = line.indexOf('1000');
  if (anchor === -1) {
    console.log(`  "1000" not found\n`);
    return;
  }
  const start = Math.max(0, anchor - 10);
  const end = Math.min(line.length, anchor + 20);
  const bytes = [];
  for (let i = start; i < end; i++) {
    bytes.push(`${i}:${line.charCodeAt(i)}`);
  }
  console.log(`  bytes[${start}..${end-1}]: ${bytes.join(' ')}`);
  console.log(`  decoded slice: "${line.slice(start, end)}"\n`);
}

showLine(159);
showLine(160);
showLine(161);
showLine(232);