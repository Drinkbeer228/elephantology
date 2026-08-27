import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronRight, Tag, X, BookOpen } from 'lucide-react';
import { searchArticles, ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { CategoryDef } from './catalog/CategoryTile';
import { CategorySection } from './catalog/CategorySection';

const ACADEMIC_CATEGORIES: CategoryDef[] = [
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
          <p className="text-gray-400">Каталог академических статей. Исследуйте систематизированные материалы по дисциплинам.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ACADEMIC_CATEGORIES.map((cat) => {
            const count = articles.filter(a => a.category === cat.id).length;
            return (
              <button 
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className="group relative flex flex-col justify-between items-start text-left p-5 h-32 rounded-lg bg-kingdom-card/40 border border-kingdom-border hover:border-kingdom-gold/40 hover:bg-kingdom-card/80 transition-all cursor-pointer"
              >
                <div className="w-full flex justify-between items-start">
                  <h3 className="font-semibold text-sm tracking-wide text-gray-200 group-hover:text-white leading-snug w-3/4">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-kingdom-bg/80 text-kingdom-muted border border-kingdom-border group-hover:border-kingdom-gold/30 group-hover:text-kingdom-gold transition-colors">
                    {count} ст.
                  </span>
                </div>
                
                <div className="w-full flex items-center justify-between text-kingdom-muted group-hover:text-kingdom-gold/80 transition-colors">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Дисциплина</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Display by Disciplines */}
      <div id="articles-list-container" className="space-y-12 pt-4">
        {ACADEMIC_CATEGORIES.map(category => {
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
