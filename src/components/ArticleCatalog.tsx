import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { searchArticles, ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { CategoryDef } from './catalog/CategoryTile';
import { CategorySection } from './catalog/CategorySection';

const MONOGRAPH_CATEGORIES: CategoryDef[] = [
  { id: 'taxonomy', name: 'Таксономия и Эволюция', emoji: '🧬' },
  { id: 'anatomy', name: 'Анатомия и Физиология', emoji: '🦴' },
  { id: 'ethogram', name: 'Этология и Поведение', emoji: '🧠' },
  { id: 'cognition', name: 'Когнитивистика и Память', emoji: '💡' },
  { id: 'veterinary', name: 'Ветеринария и Патологии', emoji: '🩺' },
  { id: 'ecology', name: 'Экология и Среда обитания', emoji: '🌍' },
  { id: 'conservation', name: 'Охрана и Сохранение видов', emoji: '🛡️' },
  { id: 'culture', name: 'Антропозоология и Культура', emoji: '🏛️' }
];

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    try {
      const savedFilter = sessionStorage.getItem("react_active_category");
      if (savedFilter) setActiveCategory(savedFilter);

      const parsedArticles = getStaticArticles();
      setArticles(parsedArticles);
    } catch (err) {
      console.error('Failed to load static articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const openArticle = useCallback((path: string) => {
    if (onArticleClick) {
      onArticleClick(path);
      return;
    }
    const win = window as any;
    if (win.loadArticle) win.loadArticle(path);
  }, [onArticleClick]);
  
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(prev => {
      const next = prev === cat ? 'all' : cat;
      sessionStorage.setItem("react_active_category", next);
      return next;
    });
    setTimeout(() => {
      const articlesList = document.getElementById('articles-list-container');
      if (articlesList) {
        const y = articlesList.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (activeCategory !== 'all') {
      result = result.filter(a => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      result = searchArticles(result, searchQuery);
    }
    return result;
  }, [articles, searchQuery, activeCategory]);

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm tracking-wider">Подготовка базы знаний...</p>
      </div>
    );
  }

  const categoriesToRender = activeCategory === 'all' 
    ? MONOGRAPH_CATEGORIES 
    : MONOGRAPH_CATEGORIES.filter(c => c.id === activeCategory);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-12 pb-16 pt-6">
      
      {/* Catalog Grid */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Слонология</h2>
          <p className="text-gray-400">Каталог академических монографий. Исследуйте систематизированные статьи по дисциплинам.</p>
        </div>

        <style>{`
          .catalog-tile-bg {
            background-image: url('/catalog-bg.jpg');
            background-repeat: no-repeat;
            background-attachment: scroll;
          }
          /* Mobile (2 cols, 4 rows) */
          @media (max-width: 767px) {
            .catalog-tile-bg { background-size: calc(200% + 12px) calc(400% + 36px); }
            .tile-0 { background-position: 0% 0%; }
            .tile-1 { background-position: 100% 0%; }
            .tile-2 { background-position: 0% 33.333%; }
            .tile-3 { background-position: 100% 33.333%; }
            .tile-4 { background-position: 0% 66.666%; }
            .tile-5 { background-position: 100% 66.666%; }
            .tile-6 { background-position: 0% 100%; }
            .tile-7 { background-position: 100% 100%; }
          }
          /* Desktop (4 cols, 2 rows) */
          @media (min-width: 768px) {
            .catalog-tile-bg { background-size: calc(400% + 36px) calc(200% + 12px); }
            .tile-0 { background-position: 0% 0%; }
            .tile-1 { background-position: 33.333% 0%; }
            .tile-2 { background-position: 66.666% 0%; }
            .tile-3 { background-position: 100% 0%; }
            .tile-4 { background-position: 0% 100%; }
            .tile-5 { background-position: 33.333% 100%; }
            .tile-6 { background-position: 66.666% 100%; }
            .tile-7 { background-position: 100% 100%; }
          }
        `}</style>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MONOGRAPH_CATEGORIES.map((cat, index) => {
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`group relative overflow-hidden h-40 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive ? 'border-kingdom-gold shadow-[0_0_15px_rgba(255,209,102,0.2)]' : 'border-[#34384a] hover:border-kingdom-gold/50'
                }`}
              >
                {/* Background Image Layer */}
                <div className={`absolute inset-0 z-0 catalog-tile-bg tile-${index} opacity-20 group-hover:opacity-70 transition-opacity duration-700`} />
                
                {/* Dark Overlay for text readability */}
                <div className={`absolute inset-0 z-10 transition-colors duration-500 ${isActive ? 'bg-kingdom-gold/20' : 'bg-[#181a22]/70 group-hover:bg-[#181a22]/30'}`} />
                
                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full p-2">
                  <div className="mb-1 filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <div className={`cat-icon cat-icon-${cat.id} text-[96px]`} style={{ mixBlendMode: 'screen' }}></div>
                  </div>
                  <h3 className={`font-bold text-sm tracking-wide ${isActive ? 'text-kingdom-gold' : 'text-gray-200 group-hover:text-white'}`}>
                    {cat.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Display */}
      <div id="articles-list-container" className="pt-2">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-[#181a22] rounded-2xl border border-[#34384a] p-8 shadow-inner">
             <div className="text-3xl text-gray-500">🐘</div>
             <p className="text-sm text-gray-300">Ничего не найдено по вашему запросу.</p>
             <button 
               onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} 
               className="px-4 py-2 bg-[#242733] text-kingdom-gold hover:text-white border border-[#34384a] rounded-xl text-xs font-bold transition-all cursor-pointer"
             >
               Сбросить фильтры
             </button>
          </div>
        ) : (
          <div className="space-y-10">
            {categoriesToRender.map(category => (
              <CategorySection 
                key={category.id}
                category={category}
                articles={filteredArticles.filter(a => a.category === category.id)}
                onArticleClick={openArticle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
