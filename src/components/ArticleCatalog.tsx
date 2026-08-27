import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronRight, Tag, X, BookOpen } from 'lucide-react';
import { searchArticles, ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { CategoryDef } from './catalog/CategoryTile';
import { CategorySection } from './catalog/CategorySection';

const MONOGRAPH_CATEGORIES: CategoryDef[] = [
  { id: 'taxonomy', name: 'Таксономия и Эволюция' },
  { id: 'anatomy', name: 'Анатомия и Физиология' },
  { id: 'ethogram', name: 'Этология и Поведение' },
  { id: 'cognition', name: 'Когнитивистика и Память' },
  { id: 'veterinary', name: 'Ветеринария и Патологии' },
  { id: 'ecology', name: 'Экология и Среда обитания' },
  { id: 'conservation', name: 'Охрана и Сохранение видов' },
  { id: 'culture', name: 'Антропозоология и Культура' },
  { id: 'paleontology', name: 'Палеонтология и Ископаемые' },
  { id: 'genomics', name: 'Геномика и Молекулярная биология' }
];

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
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

  const scrollToCategory = useCallback((catId: string) => {
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm tracking-wider">Подготовка базы знаний...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-10 pb-16 pt-6">
      
      {/* Catalog Header & Grid of Disciplines */}
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
          /* Mobile (2 cols, 5 rows) */
          @media (max-width: 767px) {
            .catalog-tile-bg { background-size: calc(200% + 12px) calc(500% + 48px); }
            .tile-0 { background-position: 0% 0%; }
            .tile-1 { background-position: 100% 0%; }
            .tile-2 { background-position: 0% 25%; }
            .tile-3 { background-position: 100% 25%; }
            .tile-4 { background-position: 0% 50%; }
            .tile-5 { background-position: 100% 50%; }
            .tile-6 { background-position: 0% 75%; }
            .tile-7 { background-position: 100% 75%; }
            .tile-8 { background-position: 0% 100%; }
            .tile-9 { background-position: 100% 100%; }
          }
          /* Desktop (5 cols, 2 rows) */
          @media (min-width: 768px) {
            .catalog-tile-bg { background-size: calc(500% + 48px) calc(200% + 12px); }
            .tile-0 { background-position: 0% 0%; }
            .tile-1 { background-position: 25% 0%; }
            .tile-2 { background-position: 50% 0%; }
            .tile-3 { background-position: 75% 0%; }
            .tile-4 { background-position: 100% 0%; }
            .tile-5 { background-position: 0% 100%; }
            .tile-6 { background-position: 25% 100%; }
            .tile-7 { background-position: 50% 100%; }
            .tile-8 { background-position: 75% 100%; }
            .tile-9 { background-position: 100% 100%; }
          }
        `}</style>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MONOGRAPH_CATEGORIES.map((cat, index) => {
            const count = articles.filter(a => a.category === cat.id).length;
            return (
              <button 
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className="group relative overflow-hidden h-36 rounded-xl border border-[#34384a] hover:border-kingdom-gold/60 text-center transition-all cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              >
                {/* Background Image Layer */}
                <div className={`absolute inset-0 z-0 catalog-tile-bg tile-${index} opacity-20 group-hover:opacity-60 transition-opacity duration-500`} />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 z-10 bg-[#181a22]/75 group-hover:bg-[#181a22]/40 transition-colors duration-300" />
                
                {/* Content */}
                <div className="relative z-20 flex flex-col items-center justify-between h-full p-2.5">
                  <div className="w-full flex justify-end">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/40 text-kingdom-gold border border-kingdom-gold/20">
                      {count} ст.
                    </span>
                  </div>
                  <div className="filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <div className={`cat-icon cat-icon-${cat.id} text-[72px]`} style={{ mixBlendMode: 'screen' }}></div>
                  </div>
                  <h3 className="font-bold text-xs tracking-wide text-gray-200 group-hover:text-white line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Display by Disciplines */}
      <div id="articles-list-container" className="space-y-12 pt-4">
        {MONOGRAPH_CATEGORIES.map(category => {
          const categoryArticles = articles.filter(a => a.category === category.id);
          if (categoryArticles.length === 0) return null;
          return (
            <div key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
              <CategorySection 
                category={category}
                articles={categoryArticles}
                onArticleClick={openArticle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
