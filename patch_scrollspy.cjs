const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

code = code.replace(
  /const links = document\.querySelectorAll\('#article-toc a'\);/,
  `const links = document.querySelectorAll('#article-toc a, #mobile-article-toc a');`
);

fs.writeFileSync('script.js', code);
