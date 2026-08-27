const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

// Render both desktop and mobile TOC
code = code.replace(
  /const tocContainer = document\.getElementById\('article-toc'\);/,
  `const tocContainer = document.getElementById('article-toc');
  const mobileTocContainer = document.getElementById('mobile-article-toc');
  const tocFab = document.getElementById('mobile-toc-fab');
  if (tocFab) tocFab.style.display = 'flex'; // show FAB when article is loaded`
);

code = code.replace(
  /tocContainer\.innerHTML = html;/,
  `tocContainer.innerHTML = html;
  if (mobileTocContainer) mobileTocContainer.innerHTML = html;`
);

// We must hide the FAB when navigating away from article (e.g. showHome)
code = code.replace(
  /function showHome\(\) \{/,
  `function showHome() {
      const tocFab = document.getElementById('mobile-toc-fab');
      if (tocFab) tocFab.style.display = 'none';`
);

fs.writeFileSync('script.js', code);
