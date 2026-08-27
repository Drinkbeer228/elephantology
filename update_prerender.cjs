const fs = require('fs');

let content = fs.readFileSync('prerender.js', 'utf8');
content = content.replace(
  /outHTML = outHTML\.replace\('<div id="article-prose-content"[^]*?<\/div>\`\);/,
  "outHTML = outHTML.replace('<div id=\"root\"></div>', `<div id=\"root\"><div id=\"article-prose-content\" class=\"markdown-body\">${htmlContent}</div></div>`);"
);

fs.writeFileSync('prerender.js', content);
