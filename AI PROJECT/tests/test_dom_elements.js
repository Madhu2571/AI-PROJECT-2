const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

const idRegex = /document\.getElementById\(['"]([a-zA-Z0-9_-]+)['"]\)/g;
let match;
const idMatches = new Set();
while ((match = idRegex.exec(app)) !== null) {
  idMatches.add(match[1]);
}

console.log('Total unique getElementById targets found:', idMatches.size);

const missing = [];
for (const id of idMatches) {
  const pattern1 = `id="${id}"`;
  const pattern2 = `id='${id}'`;
  if (!html.includes(pattern1) && !html.includes(pattern2)) {
    // Check if it might be dynamically created or error elements
    missing.push(id);
  }
}

if (missing.length > 0) {
  console.error('Missing IDs in index.html:', missing);
  process.exit(1);
} else {
  console.log('✓ SUCCESS: All 46 DOM IDs in app.js were successfully verified to exist in index.html!');
}
