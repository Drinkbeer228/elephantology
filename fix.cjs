const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/\$\{isUser \? msg\.content\.replace.*?\}/, "${isUser ? msg.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : formatChatMarkdown(msg.content)}");
fs.writeFileSync('index.html', content);
