const fs = require('fs');
let code = fs.readFileSync('/app/applet/index.html', 'utf8');

code = code.replace(
  '<button onclick="loadArticle(\\'${a.path}\\')" class="w-full text-left p-3 sm:px-4 rounded-xl hover:bg-kingdom-surface border border-transparent hover:border-kingdom-border/50 text-gray-200 hover:text-kingdom-gold transition-all flex items-center justify-between gap-4 group cursor-pointer">',
  '<a href="/article/${a.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${a.path}\\')" class="block w-full text-left p-3 sm:px-4 rounded-xl hover:bg-kingdom-surface border border-transparent hover:border-kingdom-border/50 text-gray-200 hover:text-kingdom-gold transition-all flex items-center justify-between gap-4 group cursor-pointer">'
);
code = code.replace(
  '<button onclick="loadArticle(\\'${a.path}\\')" class="w-full text-left py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-between group ${isActive ? \\'bg-kingdom-gold/20 text-kingdom-gold font-bold border border-kingdom-gold/40 shadow-sm\\' : \\'hover:bg-kingdom-surface text-gray-300 hover:text-white\\'}">',
  '<a href="/article/${a.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${a.path}\\')" class="block w-full text-left py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-between group ${isActive ? \\'bg-kingdom-gold/20 text-kingdom-gold font-bold border border-kingdom-gold/40 shadow-sm\\' : \\'hover:bg-kingdom-surface text-gray-300 hover:text-white\\'}">'
);

code = code.replace(
  '<button onclick="loadArticle(\\'${prev.path}\\')" class="flex flex-col items-start p-4 bg-kingdom-card border border-kingdom-border hover:border-kingdom-gold/50 rounded-xl transition-all cursor-pointer w-full text-left group">',
  '<a href="/article/${prev.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${prev.path}\\')" class="flex flex-col items-start p-4 bg-kingdom-card border border-kingdom-border hover:border-kingdom-gold/50 rounded-xl transition-all cursor-pointer w-full text-left group">'
);

code = code.replace(
  '<button onclick="loadArticle(\\'${next.path}\\')" class="flex flex-col items-end p-4 bg-kingdom-card border border-kingdom-border hover:border-kingdom-gold/50 rounded-xl transition-all cursor-pointer w-full text-right group">',
  '<a href="/article/${next.path.replace(/\\.md$/, \\'\\')}" onclick="event.preventDefault(); loadArticle(\\'${next.path}\\')" class="flex flex-col items-end p-4 bg-kingdom-card border border-kingdom-border hover:border-kingdom-gold/50 rounded-xl transition-all cursor-pointer w-full text-right group">'
);

code = code.replace(/<\\/button>\\s*<\\/li>/g, '</a>\\n                      </li>');
code = code.replace(/<\\/span>\\s*<\\/button>`/g, '</span>\\n              </a>`');
code = code.replace(/<\\/span>\\s*<\\/button>\\n/g, '</span>\\n              </a>\\n');
code = code.replace(/<\\/button>\\s*<\\/div>/g, '</a>\\n                    </div>');

fs.writeFileSync('/app/applet/index.html', code);
