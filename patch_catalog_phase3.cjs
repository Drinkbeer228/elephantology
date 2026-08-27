const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { 
  Library,
  Bone, 
  Brain, 
  Globe, 
  Stethoscope, 
  Dna, 
  ScrollText, 
  ChevronRight,
  Database,
  FlaskConical,
  Map,
  Activity,
  Radio,
  GraduationCap,
  MessageSquareTerminal
} from 'lucide-react';

interface Article {
  title: string;
  category: string;
  excerpt: string;
  path: string;
  content: string;
}

const CATEGORIES = [
  { id: 'anatomy', name: 'Анатомия и физиология', icon: Bone },
  { id: 'ethogram', name: 'Поведение и психология', icon: Brain },
  { id: 'ecology', name: 'Экология и миграции', icon: Globe },
  { id: 'veterinary', name: 'Ветеринария и здоровье', icon: Stethoscope },
  { id: 'taxonomy', name: 'Эволюция и палеонтология', icon: Dna },
  { id: 'philosophy', name: 'Философия и Культура', icon: ScrollText },
  { id: 'main', name: 'Общая база знаний', icon: Library }
];

const TOOLS = [
  { id: 'tree', name: 'Древо Эволюции', desc: 'Таксономия и виды', icon: Dna },
  { id: 'gps', name: 'GPS-Карта', desc: 'Маршруты миграций', icon: Map },
  { id: 'ethogram', name: 'Этограмма', desc: 'Каталог поведения', icon: Brain },
  { id: 'audio', name: 'Акустика', desc: 'Инфразвук (14-20 Гц)', icon: Radio },
  { id: 'musth', name: 'Цикл Муста', desc: 'Гормональный статус', icon: Activity },
  { id: 'vet', name: 'Вет-Чекер', desc: 'Клинические протоколы', icon: Stethoscope },
  { id: 'flashcards', name: 'Тренажер', desc: 'Самопроверка', icon: GraduationCap },
  { id: 'ai', name: 'AI Слонолог', desc: 'Экспертный синтез', icon: MessageSquareTerminal },
];

export function ArticleCatalog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const openArticle = (path: string) => {
    const win = window as any;
    if (win.loadArticle) win.loadArticle(path);
  };

  const openModule = (moduleId: string) => {
     const win = window as any;
     if (win.showModule) win.showModule(moduleId);
  };

  const openAI = () => {
     const win = window as any;
     if (win.toggleAIChat) win.toggleAIChat(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm font-mono uppercase tracking-wider">Инициализация базы данных...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in lg:grid lg:grid-cols-12 gap-10 items-start">
      
      {/* LEFT COLUMN: THE ARCHIVE (7 cols) */}
      <div className="lg:col-span-7 space-y-8">
        <div className="flex items-center justify-between border-b border-kingdom-border/60 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5 text-kingdom-muted" />
            <h2 className="text-lg font-mono font-bold tracking-widest uppercase">[ ARCHIVE ]</h2>
          </div>
          <span className="text-[10px] font-mono text-kingdom-muted px-2 py-0.5 bg-kingdom-surface border border-kingdom-border">
            ENTRIES: {articles.length}
          </span>
        </div>

        <div className="space-y-12">
          {CATEGORIES.map(category => {
            const categoryArticles = articles.filter(a => a.category === category.id);
            if (categoryArticles.length === 0) return null;

            return (
              <div key={category.id} className="space-y-2">
                
                {/* Category Header (Strict, Academic) */}
                <div className="flex items-center gap-3 border-b border-kingdom-border pb-2 mb-3">
                  <h3 className="font-mono text-sm uppercase tracking-widest text-kingdom-gold font-bold">
                    {category.name}
                  </h3>
                  <span className="ml-auto font-mono text-[10px] text-kingdom-muted">
                    [{categoryArticles.length}]
                  </span>
                </div>

                {/* Flat Article List (No Cards, No Fake IDs, Just Real Excerpts) */}
                <div className="flex flex-col">
                  {categoryArticles.map((article, idx) => (
                    <button 
                      key={article.path}
                      onClick={() => openArticle(article.path)}
                      className={\`group flex items-start justify-between py-4 px-2 hover:bg-kingdom-surface/50 border-b border-kingdom-border/20 transition-colors text-left \${idx === categoryArticles.length - 1 ? 'border-b-0' : ''}\`}
                    >
                      <div className="flex flex-col gap-1.5 pr-4">
                        <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                          {article.title}
                        </h4>
                        {article.excerpt && (
                           <p className="text-xs text-kingdom-muted line-clamp-2 leading-relaxed">
                             {article.excerpt}
                           </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-kingdom-muted/30 group-hover:text-kingdom-gold transition-colors mt-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: THE LAB (5 cols) */}
      <div className="lg:col-span-5 mt-12 lg:mt-0 space-y-6">
        <div className="flex items-center justify-between border-b border-kingdom-border/60 pb-3">
          <div className="flex items-center gap-2 text-white">
            <FlaskConical className="w-5 h-5 text-kingdom-muted" />
            <h2 className="text-lg font-mono font-bold tracking-widest uppercase">[ LABORATORY ]</h2>
          </div>
        </div>

        {/* LEVEL 1: FEATURED INSTRUMENT */}
        <button onClick={() => openModule('skeleton')} className="group block w-full text-left bg-kingdom-surface border border-kingdom-border hover:border-kingdom-gold/50 transition-colors">
          <div className="aspect-video w-full bg-[#15171e] relative overflow-hidden border-b border-kingdom-border flex items-center justify-center">
            {/* Stylized X-Ray / Skeleton Background / Preview */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-kingdom-surface/40 via-[#15171e] to-[#15171e]"></div>
            <div className="relative z-10 flex flex-col items-center opacity-70 group-hover:opacity-100 transition-opacity">
               <Bone className="w-16 h-16 text-kingdom-muted group-hover:text-kingdom-gold transition-colors" strokeWidth={1} />
               <div className="mt-4 flex gap-1 items-end opacity-50">
                  <div className="w-1 h-3 bg-kingdom-muted"></div>
                  <div className="w-1 h-5 bg-kingdom-muted"></div>
                  <div className="w-1 h-4 bg-kingdom-muted"></div>
                  <div className="w-1 h-2 bg-kingdom-muted"></div>
               </div>
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
               <span className="px-1.5 py-0.5 bg-kingdom-card border border-kingdom-border text-[9px] font-mono text-kingdom-gold uppercase tracking-widest">Featured Module</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-sm font-bold text-gray-200 group-hover:text-white uppercase tracking-wider">Анатомический Рентген</h3>
              <ChevronRight className="w-4 h-4 text-kingdom-muted group-hover:text-kingdom-gold transition-colors" />
            </div>
            <p className="text-xs text-kingdom-muted leading-relaxed">Интерактивный атлас остеологии. Изучение пневматизации черепа, строения конечностей и скелетной системы.</p>
          </div>
        </button>

        {/* LEVEL 2: RESEARCH TOOLS (Compact Grid) */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {TOOLS.map(tool => (
            <button 
              key={tool.id} 
              onClick={() => tool.id === 'ai' ? openAI() : openModule(tool.id)}
              className="group flex flex-col items-start p-3 bg-kingdom-surface border border-kingdom-border hover:border-kingdom-gold/50 transition-colors text-left"
            >
              <tool.icon className="w-4 h-4 text-kingdom-muted group-hover:text-kingdom-gold mb-2 transition-colors" strokeWidth={1.5} />
              <h4 className="font-mono text-[11px] font-bold text-gray-300 group-hover:text-white uppercase tracking-widest mb-1">{tool.name}</h4>
              <p className="text-[9px] text-kingdom-muted leading-relaxed opacity-80">{tool.desc}</p>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/ArticleCatalog.tsx', content);
