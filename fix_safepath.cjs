const fs = require('fs');
let content = fs.readFileSync('src/components/ArticleViewer.tsx', 'utf8');

content = content.replace(/setError\(null\);\s*const safePath = path.endsWith\('\.md'\) \? path : `\$\{path\}\.md`;/, 'setError(null);');

fs.writeFileSync('src/components/ArticleViewer.tsx', content);
