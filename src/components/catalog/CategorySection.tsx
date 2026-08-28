import React from 'react';
import { CategoryDef } from './CategoryTile';
import { ArticleCard } from './ArticleCard';
import { ArticleItem } from '../../lib/searchEngine';
import { useLanguage } from '../../i18n/LanguageContext';

interface CategorySectionProps {
  category: CategoryDef;
  articles: ArticleItem[];
  onArticleClick: (path: string) => void;
}

export const CategorySection = React.memo(function CategorySection({
  category,
  articles,
  onArticleClick
}: CategorySectionProps) {
  const { t, lang } = useLanguage();
  if (articles.length === 0) return null;

  const categoryName = lang === 'en' && category.nameEn ? category.nameEn : category.name;

  return (
    <div className="space-y-3 category-section-container">
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-b border-kingdom-border/80 pb-2.5 px-1">
        <div className="flex items-center gap-2.5">
          <h3 className="font-mono text-sm uppercase tracking-wider text-kingdom-gold font-bold">
            {categoryName}
          </h3>
        </div>
        <span className="font-mono text-[11px] text-gray-400 bg-[#181a22] border border-white/10 px-2 py-0.5 rounded">
          {articles.length} {t.catalog.articlesCount}
        </span>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {articles.map((article) => (
          <ArticleCard 
            key={article.path}
            article={article}
            onClick={onArticleClick}
          />
        ))}
      </div>
    </div>
  );
});
