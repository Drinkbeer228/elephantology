const fs = require('fs');

let content = fs.readFileSync('src/components/ArticleViewer.tsx', 'utf8');

// 1. Add X icon import
content = content.replace("import { ArrowLeft, Link as LinkIcon, Share2, Clock, Calendar, Quote, BookOpen, Database } from 'lucide';", "import { ArrowLeft, Link as LinkIcon, Share2, Clock, Calendar, Quote, BookOpen, Database, X } from 'lucide-react';");
// Also fix the previous broken import if it wasn't lucide-react
content = content.replace(/import \{.*?\} from 'lucide';/, "import { ArrowLeft, Link as LinkIcon, Share2, Clock, Calendar, Quote, BookOpen, Database, X } from 'lucide-react';");


// 2. Add hydration logic and footnote state
const stateReplacement = `
  const [content, setContent] = useState<string>('');
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFootnote, setActiveFootnote] = useState<any>(null);

  useEffect(() => {
    const safePath = path.endsWith('.md') ? path : \`\${path}.md\`;
    const win = window as any;
    let expectedUrlPath = \`/article/\${path.replace(/\\.md$/, '')}\`;
    
    if (win.__PRERENDERED_ARTICLE__ === expectedUrlPath && win.__PRERENDERED_RAW_MARKDOWN__) {
       const { metadata, content: mdContent } = parseFrontmatter(win.__PRERENDERED_RAW_MARKDOWN__);
       setMeta(metadata);
       setContent(mdContent);
       setLoading(false);
       
       win.__PRERENDERED_ARTICLE__ = null;
       win.__PRERENDERED_RAW_MARKDOWN__ = null;
       return;
    }

    setLoading(true);
`;
content = content.replace(/const \[content, setContent\] = useState<string>\(''\);\s*const \[meta, setMeta\] = useState<any>\(\{\}\);\s*const \[loading, setLoading\] = useState\(true\);\s*const \[error, setError\] = useState<string \| null>\(null\);\s*useEffect\(\(\) => \{\s*setLoading\(true\);/s, stateReplacement);

// 3. Add custom renderers for footnotes
const renderersReplacement = `
                table: ({node, ...props}: any) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full text-sm border-collapse" {...props} />
                  </div>
                ),
                th: ({node, ...props}: any) => <th className="border border-[#34384a] bg-[#242733] px-4 py-2 font-bold text-left text-gray-200" {...props} />,
                td: ({node, ...props}: any) => <td className="border border-[#34384a] px-4 py-2 text-gray-300" {...props} />,
                a: ({node, href, children, ...props}: any) => {
                  if (href?.startsWith('#user-content-fn-')) {
                    return (
                      <sup className="px-0.5 text-kingdom-gold cursor-pointer hover:underline">
                        <a href={href} {...props} onClick={(e) => {
                          e.preventDefault();
                          const fnId = href.replace('#user-content-fn-', '');
                          // Find in references (assuming id is like ref_dublin_1990 and footnote is 1, maybe they don't map directly by ID, but they map by index)
                          // Remark-gfm footnotes are usually 1, 2, 3...
                          const index = parseInt(fnId) - 1;
                          if (meta.references && meta.references[index]) {
                             setActiveFootnote(meta.references[index]);
                          }
                        }}>
                          {children}
                        </a>
                      </sup>
                    )
                  }
                  return <a href={href} {...props} className="text-kingdom-gold hover:text-white transition-colors border-b border-kingdom-gold/30 hover:border-white">{children}</a>;
                },
                section: ({node, className, children, ...props}: any) => {
                  if (node.properties?.dataFootnotes) {
                    return null; // Hide default footnote section
                  }
                  return <section className={className} {...props}>{children}</section>;
                }
`;
content = content.replace(/table: \(\{node, \.\.\.props\}\) => \(.*?\),\s*th: \(\{node, \.\.\.props\}\) => <th.*? \/>,\s*td: \(\{node, \.\.\.props\}\) => <td.*? \/>,/s, renderersReplacement);

// 4. Add Popover UI before closing div
const popoverUI = `
      {activeFootnote && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 bg-[#1b1d24] border border-[#34384a] rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-kingdom-gold font-bold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4"/> Источник</h4>
            <button onClick={() => setActiveFootnote(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4"/></button>
          </div>
          <div className="text-sm text-gray-200 font-semibold leading-tight">{activeFootnote.title}</div>
          <div className="text-xs text-gray-400 mt-2">{activeFootnote.authors} ({activeFootnote.year})</div>
          {activeFootnote.doi && <a href={\`https://doi.org/\${activeFootnote.doi}\`} target="_blank" rel="noreferrer" className="text-sky-400 text-xs mt-2 inline-block hover:underline">DOI: {activeFootnote.doi}</a>}
        </div>
      )}
    </div>
  );
}
`;
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/s, popoverUI);

fs.writeFileSync('src/components/ArticleViewer.tsx', content);
