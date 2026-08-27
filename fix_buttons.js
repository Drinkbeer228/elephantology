const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The Prev/Next buttons
code = code.replace(
  /<button onclick="loadArticle\(`\$\{prev\.path\}`\)"/g,
  '<a href="/article/${prev.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${prev.path}\\')"'
).replace(
  /<button onclick="loadArticle\('\\$\\{prev.path\\}'\)"/g,
  '<a href="/article/${prev.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${prev.path}\\')"'
);

code = code.replace(
  /<button onclick="loadArticle\(`\$\{next\.path\}`\)"/g,
  '<a href="/article/${next.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${next.path}\\')"'
).replace(
  /<button onclick="loadArticle\('\\$\\{next.path\\}'\)"/g,
  '<a href="/article/${next.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${next.path}\\')"'
);

code = code.replace(
  /<button onclick="loadArticle\(`\$\{a\.path\}`\)"/g,
  '<a href="/article/${a.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${a.path}\\')"'
).replace(
  /<button onclick="loadArticle\('\\$\\{a.path\\}'\)"/g,
  '<a href="/article/${a.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${a.path}\\')"'
);

code = code.replace(/<\/span>\s*<\/button>`/g, '</span></a>`');
code = code.replace(/<\/button>\s*<\/li>/g, '</a></li>');

fs.writeFileSync('index.html', code);
