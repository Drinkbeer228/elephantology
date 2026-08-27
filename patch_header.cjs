const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

content = content.replace(/const callVanilla = \(fnName: string, \.\.\.args: any\[\]\) => \{[\s\S]*?\};\s*/s, "");
content = content.replace(/onClick=\{\(\) => callVanilla\('showHome'\)\}/g, "onClick={() => window.dispatchEvent(new CustomEvent('show-home'))}");
content = content.replace(/onClick=\{\(\) => callVanilla\('toggleSearchModal', true\)\}/g, "onClick={() => window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }))}");

fs.writeFileSync('src/components/Header.tsx', content);
