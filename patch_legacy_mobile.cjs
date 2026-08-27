const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// I will now delete the old MOBILE CATALOG & MODULES DRAWER / SHEET from index.html since we don't need it.
const mobileDrawerRegex = /<!-- MOBILE CATALOG & MODULES DRAWER \/ SHEET -->[\s\S]*?<!-- SOUND EFFECTS ENGINE -->/g;
html = html.replace(mobileDrawerRegex, '<!-- SOUND EFFECTS ENGINE -->');

fs.writeFileSync('index.html', html);
