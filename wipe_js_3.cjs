const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startStr = '    let aiChatHistory = [';
const endStr = '    const CATEGORY_META = {';

const startIdx = html.indexOf(startStr);
const endIdx = html.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + html.substring(endIdx);
}

fs.writeFileSync('index.html', html);
