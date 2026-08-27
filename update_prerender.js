const fs = require('fs');

let content = fs.readFileSync('prerender.js', 'utf8');
content = content.replace(
  /outHTML = outHTML\.replace\('<div id="article-prose-content"[^>]*><\/div>',[^)]*\);/,
  "outHTML = outHTML.replace('<div id=\"root\"></div>', `<div id=\"root\"><main style=\"display: none;\" class=\"seo-crawler-content markdown-body\">${htmlContent}</main></div>`);"
);

fs.writeFileSync('prerender.js', content);
