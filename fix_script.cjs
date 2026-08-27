const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /\s*\/\/ --- PROMO VIDEO LOGIC ---[\s\S]*?videoEl\.play\(\);\n\s*\}\n\s*\};\n/g;
html = html.replace(regex, '');
fs.writeFileSync('index.html', html);
console.log('Cleaned up script');
