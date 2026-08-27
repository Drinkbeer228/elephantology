const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('isUser ? msg.content.replace')) {
    lines[i] = '              ${isUser ? msg.content.replace(/&/g, \'&amp;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\').replace(/"/g, \'&quot;\') : formatChatMarkdown(msg.content)}';
  }
}
fs.writeFileSync('index.html', lines.join('\n'));
