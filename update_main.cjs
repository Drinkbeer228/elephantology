const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

// Add Link icon to imports
code = code.replace("TreeDeciduous, FileText", "TreeDeciduous, FileText, Link");
code = code.replace("Search, Sparkles, Stethoscope, TreeDeciduous, FileText", "Search, Sparkles, Stethoscope, TreeDeciduous, FileText, Link");

// Add heading renderer
const headingRenderer = `
let currentToc: Array<{id: string, text: string, depth: number}> = [];

const originalHeading = renderer.heading.bind(renderer);
renderer.heading = ({ tokens, depth }) => {
  const text = renderer.parser.parseInline(tokens);
  // Generate a URL-friendly ID from Russian/English text
  const id = text.toLowerCase().replace(/[^a-zа-яё0-9\\s-]/g, '').trim().replace(/\\s+/g, '-');
  
  if (depth >= 2 && depth <= 3) {
    currentToc.push({ text: text.replace(/<[^>]+>/g, ''), id, depth });
  }
  
  return \`<h\${depth} id="\${id}" class="group relative flex items-center gap-2">
    <span>\${text}</span>
    <button onclick="copyHeadingLink('\${id}')" class="opacity-0 group-hover:opacity-100 text-kingdom-muted hover:text-kingdom-gold transition-opacity cursor-pointer" title="Скопировать ссылку на раздел">
      <i data-lucide="link" class="w-4 h-4"></i>
    </button>
  </h\${depth}>\`;
};

(window as any).resetToc = () => { currentToc = []; };
(window as any).getToc = () => { return [...currentToc]; };
`;

code = code.replace("marked.use({ renderer });", headingRenderer + "\nmarked.use({ renderer });");

fs.writeFileSync('src/main.tsx', code);
console.log("Updated main.tsx");
