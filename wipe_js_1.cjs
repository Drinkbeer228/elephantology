const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startIdx = html.indexOf('function showModulesHub()');
const endIdx = html.indexOf('// SCIENTIFIC INFOGRAPHICS');

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + html.substring(endIdx);
}

fs.writeFileSync('index.html', html);
