const fs = require('fs');
let content = fs.readFileSync('src/components/ArticleViewer.tsx', 'utf8');

content = content.replace(
  /\{activeFootnote && \([\s\S]*?\}\s*<\/div>\s*\);\s*\}/,
  `      {activeFootnote && (
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
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/components/ArticleViewer.tsx', content);
