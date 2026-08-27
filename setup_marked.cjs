const fs = require('fs');

const setupCode = `
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import markedFootnote from 'marked-footnote';

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

marked.use(markedFootnote());

// Custom renderer for callouts and PDFs
const renderer = new marked.Renderer();

const originalParagraph = renderer.paragraph.bind(renderer);
renderer.paragraph = ({ tokens }) => {
  const text = renderer.parser.parseInline(tokens);
  if (text.startsWith('!!! ') || text.startsWith('??? ')) {
    const match = text.match(/^(?:!!!|???)\\s+(note|warning|info|tip|quote|evidence|reading-path)\\s*"?([^"]*)"?/i);
    const type = match && match[1] ? match[1].toLowerCase() : 'info';
    const title = match && match[2] ? match[2] : 'Заметка';
    
    // Extract the rest of the paragraph (if there is any content on the same line)
    // Or we just render a nice block
    let borderColor = 'border-kingdom-gold';
    let icon = '💡';
    if (type === 'warning') { borderColor = 'border-rose-500'; icon = '⚠️'; }
    else if (type === 'evidence') { borderColor = 'border-emerald-500'; icon = '🔬'; }
    
    return \`<div class="callout my-6 bg-kingdom-card/50 border-l-4 \${borderColor} p-4 rounded-r-xl">
      <div class="font-bold text-white flex items-center gap-2 mb-2">\${icon} \${title}</div>
    </div>\`;
  }
  return originalParagraph({ tokens });
};

const originalLink = renderer.link.bind(renderer);
renderer.link = ({ href, title, tokens }) => {
  const text = renderer.parser.parseInline(tokens);
  if (href && href.endsWith('.pdf')) {
    const pdfName = href.split('/').pop();
    return \`<a href="/docs/assets/books/\${pdfName}" target="_blank" class="inline-flex items-center gap-1.5 font-semibold text-kingdom-gold hover:underline bg-kingdom-gold/10 px-2 py-0.5 rounded border border-kingdom-gold/30 my-1"><span class="pdf-icon">📄</span> \${text} (PDF)</a>\`;
  }
  return originalLink({ href, title, tokens });
};

marked.use({ renderer });

(window as any).marked = marked;
`;

let mainCode = fs.readFileSync('src/main.tsx', 'utf8');
// Replace the old marked setup block with the new one
mainCode = mainCode.replace(/import \{ marked \} from 'marked';[\s\S]*?\(window as any\)\.marked = marked;/, setupCode.trim());
fs.writeFileSync('src/main.tsx', mainCode);
console.log("Updated main.tsx with marked renderer");
