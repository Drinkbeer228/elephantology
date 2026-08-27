const fs = require('fs');
let content = fs.readFileSync('src/components/SearchModal.tsx', 'utf8');

content = content.replace(
  /const win = window as any;\s*win\.toggleSearchModal = \(.*?\).*?;\s*\}/s,
  `const handleToggle = (e: any) => {
      setIsOpen(prev => e.detail?.force !== undefined ? e.detail.force : !prev);
      if (e.detail?.force !== false) {
        setTimeout(() => document.getElementById('search-input')?.focus(), 100);
      }
    };
    window.addEventListener('toggle-search', handleToggle);`
);

content = content.replace(
  /window\.removeEventListener\('keydown', handleKeyDown\);/,
  `window.removeEventListener('keydown', handleKeyDown);\n      window.removeEventListener('toggle-search', handleToggle);`
);

content = content.replace(/callVanilla\('showArticle',\s*.*?\)/g, "(window as any).loadArticle($1)"); // I'll change everything in App.tsx
// wait, instead of window.loadArticle, we'll use an event in App.tsx!
content = content.replace(/callVanilla\('loadArticle',\s*(.*?)\)/g, "window.dispatchEvent(new CustomEvent('load-article', { detail: $1 }))");

content = content.replace(/const callVanilla = \(fnName: string, \.\.\.args: any\[\]\) => \{[\s\S]*?\};/s, "");

fs.writeFileSync('src/components/SearchModal.tsx', content);
