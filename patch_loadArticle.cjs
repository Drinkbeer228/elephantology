const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetStr = `          updateActiveViewBanner('article', article.title || path, article.category);
          scrollToMainView();`;

const newStr = `          updateActiveViewBanner('article', article.title || path, article.category);
          scrollToMainView();
          init3DViewerIfPresent();`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('index.html', code);
    console.log('patched loadArticle');
} else {
    console.log('could not find scrollToMainView');
}
