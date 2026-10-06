const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const trends = fs.readFileSync(path.join(__dirname, '../js/trends.js'), 'utf8');

const idRegex = /document\.getElementById\(['"]([a-zA-Z0-9_-]+)['"]\)/g;
let match;
const idMatches = new Set();
while ((match = idRegex.exec(trends)) !== null) {
  idMatches.add(match[1]);
}

console.log('Trends getElementById targets:', [...idMatches]);

const missing = [];
for (const id of idMatches) {
  if (id === 'containerId') continue; // dynamic param
  const pattern1 = `id="${id}"`;
  const pattern2 = `id='${id}'`;
  if (!html.includes(pattern1) && !html.includes(pattern2)) {
    missing.push(id);
  }
}

if (missing.length > 0) {
  console.error('Missing IDs in index.html for trends:', missing);
  process.exit(1);
} else {
  console.log('✓ SUCCESS: All trends elements verified in index.html!');
}
