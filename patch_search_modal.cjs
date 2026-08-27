const fs = require('fs');
let content = fs.readFileSync('src/components/SearchModal.tsx', 'utf8');

// Replace (window as any).toggleSearchModal
content = content.replace(
  /const win = window as any;\s*win\.toggleSearchModal = \(force\?: boolean\) => \{[\s\S]*?\};\s*const handleKeyDown = /s,
  `const handleToggle = (e: any) => {
      setIsOpen(prev => e.detail?.force !== undefined ? e.detail.force : !prev);
      if (e.detail?.force !== false) {
        setTimeout(() => document.getElementById('search-input')?.focus(), 100);
      }
    };
    window.addEventListener('toggle-search', handleToggle);
    const handleKeyDown = `
);
content = content.replace(
  /return \(\) => window\.removeEventListener\('keydown', handleKeyDown\);/,
  `return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.addEventListener('toggle-search', handleToggle);
    };`
);
// Also fix callVanilla('loadArticle') in SearchModal
content = content.replace(/callVanilla\('loadArticle', path\)/g, "window.dispatchEvent(new CustomEvent('load-article', { detail: path }))");
content = content.replace(/const callVanilla = \[\s\S\]*?\};\n/, ""); // remove callVanilla function if exists
content = content.replace(/const callVanilla = \(fnName: string, \.\.\.args: any\[\]\) => \{[\s\S]*?\};/s, "");

fs.writeFileSync('src/components/SearchModal.tsx', content);
