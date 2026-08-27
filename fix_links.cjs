const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The Prev/Next buttons
code = code.replace(
  /button onclick="loadArticle\('([^']+)'\)"/g,
  function(match, p1) {
    const url = '/article/' + p1.replace(/\.md$/, '');
    return `a href="${url}" onclick="event.preventDefault(); loadArticle('${p1}')"`;
  }
);

code = code.replace(
  /<button onclick="loadArticle\('\\$\\{prev.path\\}'\)"/g,
  `<a href="/article/\${prev.path.replace(/\\.md$/, '')}" onclick="event.preventDefault(); loadArticle('\${prev.path}')"`
);

code = code.replace(
  /<button onclick="loadArticle\('\\$\\{next.path\\}'\)"/g,
  `<a href="/article/\${next.path.replace(/\\.md$/, '')}" onclick="event.preventDefault(); loadArticle('\${next.path}')"`
);

code = code.replace(
  /<button onclick="loadArticle\('\\$\\{a.path\\}'\)"/g,
  `<a href="/article/\${a.path.replace(/\\.md$/, '')}" onclick="event.preventDefault(); loadArticle('\${a.path}')"`
);

code = code.replace(
  /<button onclick="loadArticle\('\\$\\{match.path\\}'\)"/g,
  `<a href="/article/\${match.path.replace(/\\.md$/, '')}" onclick="event.preventDefault(); loadArticle('\${match.path}')"`
);

// Manually replace corresponding </button> where we know they exist.
// Instead of risky </button> replace, let's just replace ALL `</button>` that follow a loadArticle structure.
// This is actually tricky. Let's just do it with a simpler approach: don't change to `a` tag if it breaks things.
// Wait, we can just leave it as button? But `a` tag is required for right-click copy.
// I will manually fix it.
