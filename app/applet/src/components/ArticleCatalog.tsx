import React, { useState, useEffect } from 'react';
import { 
  Library,
  Bone, 
  Brain, 
  Globe, 
  Stethoscope, 
  Dna, 
  ScrollText, 
  ChevronRight,
  Database
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm font-mono uppercase tracking-wider">Инициализация базы данных...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      
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

              {/* Flat Article List */}
              <div className="flex flex-col">
                {categoryArticles.map((article, idx) => {
                  const isLast = idx === categoryArticles.length - 1;
                  return (
                    <button 
                      key={article.path}
                      onClick={() => openArticle(article.path)}
                      className={`group flex items-start justify-between py-4 px-2 hover:bg-kingdom-surface/50 border-b border-kingdom-border/20 transition-colors text-left ${isLast ? 'border-b-0' : ''}`}
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
                  );
                })}
              </div>
              
            </div>
          );
        })}
      </div>

    </div>
  );
}
