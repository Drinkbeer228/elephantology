const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(/if \(window\.init3DViewerIfPresent\).*?;/, '');
fs.writeFileSync('index.html', code);
console.log('Reverted loadArticle');
