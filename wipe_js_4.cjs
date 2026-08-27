const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startStr = '// --- LEAFLET MAP LOGIC ---';
const endStr = '// --- SEO LOGIC ---';

const startIdx = html.indexOf(startStr);
const endIdx = html.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + html.substring(endIdx);
}

fs.writeFileSync('index.html', html);
