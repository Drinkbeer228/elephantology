const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveAnatomy.tsx', 'utf8');

content = content.replace(/const callVanilla = \(fnName: string, \.\.\.args: any\[\]\) => \{[\s\S]*?\};\s*/s, "");
content = content.replace(/callVanilla\('showArticle', 'anatomy\/' \+ p\.articleId\)/g, "window.dispatchEvent(new CustomEvent('load-article', { detail: 'anatomy/' + p.articleId }))");

fs.writeFileSync('src/components/InteractiveAnatomy.tsx', content);
