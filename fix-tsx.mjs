const fs = require('fs');
let c = fs.readFileSync('components/search-interface.tsx', 'utf8');

// Fix the three problematic > in JSX text that TS1382 flags
const fixes = [
  ['> 1,000', '> 1,000'],
  ['> 10,000', '> 10,000'],
  ['Stars: >{Number', 'Stars: > Number'],
];
for (const [from, to] of fixes) {
  if (c.includes(from)) {
    c = c.replace(from, to);
    console.log('Replaced:', JSON.stringify(from), '->', JSON.stringify(to));
  } else {
    console.log('NOT FOUND:', JSON.stringify(from));
  }
}
fs.writeFileSync('components/search-interface.tsx', c);
console.log('Done');