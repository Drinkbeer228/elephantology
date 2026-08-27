const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /const wordCount = rawMd\.split[\s\S]*?\$\{visualHtml\}\s*`;/g;
const replacement = `
          // Clean Minimalist Header (No timers, no nested cards, no duplicated titles)
          const visualHtml = getArticleScientificVisual(path, article.title || path);
          
          const articleHeaderHtml = \`
            <div class="mb-10 flex items-center justify-between gap-4 border-b border-kingdom-border/50 pb-4">
              <span class="text-[10px] font-bold text-kingdom-muted uppercase tracking-widest">
                \${article.category ? (CATEGORY_META[article.category] ? CATEGORY_META[article.category].title : article.category) : 'Энциклопедия'}
              </span>
              <button onclick="toggleAIChat(true, 'Расскажи простыми словами ключевые выводы из статьи: \${article.title ? article.title.replace(/'/g, "\\\\'") : path}')" class="text-kingdom-muted hover:text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Спросить AI</span>
              </button>
            </div>
            \${visualHtml}
          \`;`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
