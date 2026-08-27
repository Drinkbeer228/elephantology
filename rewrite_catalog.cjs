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
  Radar,
  Radio,
  BookOpen
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm font-mono uppercase tracking-wider">Инициализация архива...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in lg:grid lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: THE ARCHIVE (7 cols) */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between border-b border-kingdom-border/60 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5 text-kingdom-muted" />
            <h2 className="text-lg font-mono font-bold tracking-widest uppercase">[ АРХИВ ]</h2>
          </div>
          <span className="text-[10px] font-mono text-kingdom-muted px-2 py-0.5 rounded-sm bg-kingdom-surface border border-kingdom-border">
            ENTRIES: {articles.length}
          </span>
        </div>

        <div className="space-y-10">
          {CATEGORIES.map(category => {
            const categoryArticles = articles.filter(a => a.category === category.id);
            if (categoryArticles.length === 0) return null;
            const Icon = category.icon;

            return (
              <div key={category.id} className="space-y-3">
                
                {/* Category Header (Strict, Minimal) */}
                <div className="flex items-center gap-3 border-b border-kingdom-border/40 pb-2">
                  <Icon className="w-4 h-4 text-kingdom-gold" />
                  <h3 className="font-mono text-xs uppercase tracking-widest text-gray-300 font-bold">
                    {category.name}
                  </h3>
                  <span className="ml-auto font-mono text-[10px] text-kingdom-muted">
                    [{categoryArticles.length}]
                  </span>
                </div>

                {/* Flat Article List (No Cards) */}
                <div className="flex flex-col">
                  {categoryArticles.map(article => (
                    <button 
                      key={article.path}
                      onClick={() => openArticle(article.path)}
                      className="group flex items-center justify-between py-2.5 px-2 hover:bg-kingdom-surface/50 border-b border-transparent hover:border-kingdom-border/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-kingdom-muted group-hover:text-kingdom-gold/70 transition-colors">
                          {article.path.slice(-7, -3).padStart(4, '0')}
                        </span>
                        <h4 className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {article.title}
                        </h4>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-kingdom-muted group-hover:text-kingdom-gold transition-colors opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: THE LAB (4 cols) */}
      <div className="lg:col-span-4 mt-12 lg:mt-0 space-y-6">
        <div className="flex items-center justify-between border-b border-kingdom-border/60 pb-3">
          <div className="flex items-center gap-2 text-white">
            <FlaskConical className="w-5 h-5 text-kingdom-muted" />
            <h2 className="text-lg font-mono font-bold tracking-widest uppercase">[ ЛАБОРАТОРИЯ ]</h2>
          </div>
        </div>

        <div className="flex flex-col gap-3">
           <button onClick={() => openModule('skeleton')} className="group flex items-start gap-4 p-4 bg-kingdom-surface border border-kingdom-border hover:border-kingdom-gold/50 transition-all text-left">
              <div className="p-2 bg-[#1b1d24] border border-kingdom-border group-hover:border-kingdom-gold/30 transition-colors">
                 <Bone className="w-5 h-5 text-kingdom-muted group-hover:text-kingdom-gold" />
              </div>
              <div>
                 <div className="text-xs font-mono font-bold text-gray-300 group-hover:text-white uppercase tracking-wider mb-1">Атлас скелета</div>
                 <div className="text-[10px] text-kingdom-muted leading-relaxed">Интерактивная 3D проекция и остеология</div>
              </div>
           </button>

           <button onClick={() => openModule('map')} className="group flex items-start gap-4 p-4 bg-kingdom-surface border border-kingdom-border hover:border-emerald-500/50 transition-all text-left">
              <div className="p-2 bg-[#1b1d24] border border-kingdom-border group-hover:border-emerald-500/30 transition-colors">
                 <Map className="w-5 h-5 text-kingdom-muted group-hover:text-emerald-500" />
              </div>
              <div>
                 <div className="text-xs font-mono font-bold text-gray-300 group-hover:text-white uppercase tracking-wider mb-1">Карта миграций</div>
                 <div className="text-[10px] text-kingdom-muted leading-relaxed">GPS трекинг популяций в реальном времени</div>
              </div>
           </button>

           <button onClick={() => openModule('ethogram')} className="group flex items-start gap-4 p-4 bg-kingdom-surface border border-kingdom-border hover:border-sky-500/50 transition-all text-left">
              <div className="p-2 bg-[#1b1d24] border border-kingdom-border group-hover:border-sky-500/30 transition-colors">
                 <Brain className="w-5 h-5 text-kingdom-muted group-hover:text-sky-500" />
              </div>
              <div>
                 <div className="text-xs font-mono font-bold text-gray-300 group-hover:text-white uppercase tracking-wider mb-1">Этограмма</div>
                 <div className="text-[10px] text-kingdom-muted leading-relaxed">Матрица поведенческих паттернов</div>
              </div>
           </button>

           <button onClick={() => openModule('audio')} className="group flex items-start gap-4 p-4 bg-kingdom-surface border border-kingdom-border hover:border-purple-500/50 transition-all text-left">
              <div className="p-2 bg-[#1b1d24] border border-kingdom-border group-hover:border-purple-500/30 transition-colors">
                 <Radio className="w-5 h-5 text-kingdom-muted group-hover:text-purple-500" />
              </div>
              <div>
                 <div className="text-xs font-mono font-bold text-gray-300 group-hover:text-white uppercase tracking-wider mb-1">Акустика</div>
                 <div className="text-[10px] text-kingdom-muted leading-relaxed">Сейсмическая коммуникация (14-20 Гц)</div>
              </div>
           </button>

           <button onClick={() => openModule('musth')} className="group flex items-start gap-4 p-4 bg-kingdom-surface border border-kingdom-border hover:border-amber-500/50 transition-all text-left">
              <div className="p-2 bg-[#1b1d24] border border-kingdom-border group-hover:border-amber-500/30 transition-colors">
                 <Activity className="w-5 h-5 text-kingdom-muted group-hover:text-amber-500" />
              </div>
              <div>
                 <div className="text-xs font-mono font-bold text-gray-300 group-hover:text-white uppercase tracking-wider mb-1">Гормональный цикл</div>
                 <div className="text-[10px] text-kingdom-muted leading-relaxed">Таймлайн состояния муста самцов</div>
              </div>
           </button>

           <button onClick={() => openModule('vet')} className="group flex items-start gap-4 p-4 bg-kingdom-surface border border-kingdom-border hover:border-rose-500/50 transition-all text-left">
              <div className="p-2 bg-[#1b1d24] border border-kingdom-border group-hover:border-rose-500/30 transition-colors">
                 <Stethoscope className="w-5 h-5 text-kingdom-muted group-hover:text-rose-500" />
              </div>
              <div>
                 <div className="text-xs font-mono font-bold text-gray-300 group-hover:text-white uppercase tracking-wider mb-1">Вет-чекер</div>
                 <div className="text-[10px] text-kingdom-muted leading-relaxed">Клиническая диагностика и протоколы</div>
              </div>
           </button>
        </div>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/ArticleCatalog.tsx', content);
