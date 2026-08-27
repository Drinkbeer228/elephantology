const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

const replacement = `
    let frontmatterTitle = null;
    if (md.startsWith('---')) {
      const parts = md.split('---');
      if (parts.length >= 3) {
        const fm = parts[1];
        const fmTitleMatch = fm.match(/^title:\\s*["']?([^"'\\n]+)["']?/m);
        if (fmTitleMatch) {
            frontmatterTitle = fmTitleMatch[1].trim();
        }
        md = parts.slice(2).join('---').trim();
      }
    }

    const titleMatch = md.match(/^#\\s+(.+)$/m);
    const title = frontmatterTitle || (titleMatch ? titleMatch[1].trim() : 'Чтение');
`;

content = content.replace(/if \(md\.startsWith\('---'\)\) \{[\s\S]*?const title = titleMatch \? titleMatch\[1\]\.trim\(\) : 'Чтение';/m, replacement.trim());

fs.writeFileSync('src/main.tsx', content);
console.log('patched');
