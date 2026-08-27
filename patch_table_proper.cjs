const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf-8');

code = code.replace(
  /'<div class="table-wrapper"><div class="table-scroll-container"><table class="w-full text-xs text-left border-collapse bg-kingdom-card"><\/div>'/g,
  `'<div class="table-wrapper"><div class="table-scroll-container"><table class="w-full text-xs text-left border-collapse bg-kingdom-card">'`
);

code = code.replace(
  /'<\/table><\/div>'/g,
  `'</table></div></div>'`
);

// We need to also collect H2/H3 for TOC.
// Find the Markdown parser block in script.js
// We can just add a global array for TOC and populate it inside parseSimpleMarkdown.

let parserFuncStart = code.indexOf('function parseSimpleMarkdown(md) {');
if (parserFuncStart !== -1) {
  // Replace the heading replacements
  let modifiedCode = code.replace(
    /html = html\.replace\(\/\^## \(.*?\$\)\/gim, '<h2 class=".*?>\$1<\/h2>'\);/g,
    `html = html.replace(/^## (.*$)/gim, (match, p1) => {
        const id = 'sec-' + Math.random().toString(36).substr(2, 9);
        window.currentArticleToc.push({ title: p1.replace(/<[^>]*>?/gm, ''), id, level: 2 });
        return \`<h2 id="\${id}" class="text-lg font-bold text-kingdom-gold border-b border-kingdom-border pb-2 mt-16 mb-6">\${p1}</h2>\`;
      });`
  );

  modifiedCode = modifiedCode.replace(
    /html = html\.replace\(\/\^### \(.*?\$\)\/gim, '<h3 class=".*?>\$1<\/h3>'\);/g,
    `html = html.replace(/^### (.*$)/gim, (match, p1) => {
        const id = 'sec-' + Math.random().toString(36).substr(2, 9);
        window.currentArticleToc.push({ title: p1.replace(/<[^>]*>?/gm, ''), id, level: 3 });
        return \`<h3 id="\${id}" class="text-base font-bold text-white mt-8 mb-3 flex items-center gap-2">\${p1}</h3>\`;
      });`
  );

  // Before returning html, we need to initialize window.currentArticleToc
  modifiedCode = modifiedCode.replace(
    /function parseSimpleMarkdown\(md\) {/,
    `function parseSimpleMarkdown(md) {\n      window.currentArticleToc = [];\n`
  );

  fs.writeFileSync('script.js', modifiedCode);
}
