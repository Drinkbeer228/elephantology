const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Remove the HTML structure of ai-chat-modal
const modalRegex = /<!-- AI ELEPHANTOLOGIST CHAT MODAL -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(modalRegex, '');

fs.writeFileSync('index.html', content);
