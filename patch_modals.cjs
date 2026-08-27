const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Remove Search Modal
const searchRegex = /<!-- SEARCH MODAL \(Ctrl\+K\) -->[\s\S]*?<!-- RANDOM FACT MODAL -->/;
content = content.replace(searchRegex, '<!-- RANDOM FACT MODAL -->');

// Remove Random Fact Modal
const factRegex = /<!-- RANDOM FACT MODAL -->[\s\S]*?<!-- AI ELEPHANTOLOGIST CHAT MODAL -->/;
content = content.replace(factRegex, '<!-- AI ELEPHANTOLOGIST CHAT MODAL -->');

fs.writeFileSync('index.html', content);
