const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The fact modal structure
const factModalRegex = /<!-- RANDOM FACT MODAL -->[\s\S]*?<\/div>\s*<\/div>/g;
html = html.replace(factModalRegex, '');

// The AI Chat Modal structure (if any left)
const aiChatRegex = /<!-- AI ELEPHANTOLOGIST CHAT MODAL -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
html = html.replace(aiChatRegex, '');

fs.writeFileSync('index.html', html);
