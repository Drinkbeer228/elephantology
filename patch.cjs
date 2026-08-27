const fs = require('fs');

let content = fs.readFileSync('src/components/ArticleViewer.tsx', 'utf8');

const replacement = `
            </ReactMarkdown>
            
            {meta.references && meta.references.length > 0 && (
              <div className="mt-16 pt-8 border-t border-kingdom-border">
                <h3 className="text-kingdom-gold font-bold text-lg mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Библиография и источники
                </h3>
                <ul className="space-y-4 text-sm text-gray-300">
                  {meta.references.map((ref: any, i: number) => (
                    <li key={ref.id || i} id={ref.id} className="pl-4 border-l-2 border-kingdom-border hover:border-kingdom-gold transition-colors">
                      <div className="font-semibold text-gray-200">{ref.title}</div>
                      <div className="text-gray-400 mt-1">
                        {ref.authors} ({ref.year})
                        {ref.doi && (
                          <span className="ml-2">
                            <a href={\`https://doi.org/\${ref.doi}\`} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 hover:underline">
                              DOI: {ref.doi}
                            </a>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
`;

content = content.replace('</ReactMarkdown>', replacement);
// We also need to add BookOpen to the imports from lucide if not there.
content = content.replace("import { ArrowLeft, Link as LinkIcon, Share2, Clock, Calendar, Quote } from 'lucide';", "import { ArrowLeft, Link as LinkIcon, Share2, Clock, Calendar, Quote, BookOpen } from 'lucide';");

fs.writeFileSync('src/components/ArticleViewer.tsx', content);
