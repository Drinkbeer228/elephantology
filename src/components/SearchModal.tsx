import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Tag } from 'lucide-react';
import { searchArticles, ArticleItem, ARTICLE_SEMANTIC_TAGS } from '../lib/searchEngine';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Intercept vanilla function to toggle modal
    const handleToggle = (e: any) => {
      setIsOpen(prev => e.detail?.force !== undefined ? e.detail.force : !prev);
      if (e.detail?.force !== false) {
        setTimeout(() => document.getElementById('search-input')?.focus(), 100);
      }
    };
    window.addEventListener('toggle-search', handleToggle);;

    // Keyboard listener only for Escape to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Fetch articles metadata
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => setArticles(data))
      .catch(console.error);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-search', handleToggle);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const results = searchArticles(articles, query);

  const handleSelectArticle = (path: string) => {
    const win = window as any;
    if (win.loadArticle) {
      win.loadArticle(path);
    }
    setIsOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'anatomy': return 'Анатомия и физиология';
      case 'ethogram': return 'Этограмма и поведение';
      case 'veterinary': return 'Ветеринария и медицина';
      case 'ecology': return 'Экология и охрана';
      case 'taxonomy': return 'Таксономия и эволюция';
      default: return 'Научная база';
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99996] flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in"
      style={{ isolation: 'isolate' }}
    >
      <div className="bg-[#181a22] border border-[#34384a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] relative z-10">
        
        {/* Search Header Bar */}
        <div className="p-4 border-b border-[#34384a] flex items-center gap-3 bg-[#13141a]">
          <Search className="w-5 h-5 text-kingdom-gold shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: ноги, очистка, хобот, муст, герпес, мамонты..." 
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1.5 bg-[#242733] border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
        
        {/* Quick Tag Pills */}
        <div className="px-4 py-2.5 bg-[#14161d] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-gray-500 shrink-0 flex items-center gap-1"><Tag className="w-3 h-3" /> Популярные:</span>
          {['ноги', 'очистка', 'хобот', 'муст', 'eehv', 'мамонт', 'интеллект', 'бивни'].map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2 py-0.5 rounded-md bg-[#222530] text-gray-300 hover:text-kingdom-gold hover:bg-[#2c303f] border border-white/5 transition-all shrink-0 cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-white/5">
          {!query.trim() ? (
            <div className="text-center py-10 space-y-2">
              <div className="text-3xl">🔍</div>
              <p className="text-xs text-gray-400">Введите поисковый запрос или выберите тег выше</p>
              <p className="text-[11px] text-gray-500">Поддерживаются синонимы: «лапы / стопа / ноги», «чистка / купание / гигиена» и др.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="text-2xl">🐘</div>
              <p className="text-xs text-rose-400">По запросу «{query}» статей не найдено.</p>
              <p className="text-[11px] text-gray-500">Попробуйте изменить формулировку или использовать базовые термины.</p>
            </div>
          ) : (
            results.map(article => {
              const staticTags = ARTICLE_SEMANTIC_TAGS[article.path] || [];
              return (
                <div 
                  key={article.path}
                  onClick={() => handleSelectArticle(article.path)} 
                  className="p-3.5 pt-4 bg-[#1e202a]/60 hover:bg-[#252836] rounded-xl cursor-pointer border border-transparent hover:border-kingdom-gold/30 transition-all group flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white group-hover:text-kingdom-gold transition-colors flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-kingdom-gold shrink-0" />
                        {article.title}
                      </span>
                    </div>

                    {article.excerpt && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-kingdom-gold/80 bg-kingdom-gold/10 px-2 py-0.5 rounded border border-kingdom-gold/20">
                        {getCategoryLabel(article.category)}
                      </span>
                      {staticTags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.2 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 pt-1 text-gray-500 group-hover:text-kingdom-gold group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
