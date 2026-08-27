import React from 'react';
import { Clock, ChevronRight, Calendar } from 'lucide-react';
import { ArticleItem, ARTICLE_SEMANTIC_TAGS } from '../../lib/searchEngine';

interface ArticleCardProps {
  article: ArticleItem;
  onClick: (path: string) => void;
}

export const ArticleCard = React.memo(function ArticleCard({ article, onClick }: ArticleCardProps) {
  const readingTime = article.readingTime || '4 мин';
  
  const getEvidenceBadge = (level: string | undefined) => {
    if (!level) return null;
    const mapping: Record<string, {text: string, classes: string}> = {
      'established': { text: 'ХОРОШО УСТАНОВЛЕНО', classes: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
      'moderate': { text: 'ДОСТАТОЧНАЯ БАЗА', classes: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
      'limited': { text: 'ОГРАНИЧЕННЫЕ ДАННЫЕ', classes: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
      'hypothesis': { text: 'ГИПОТЕЗА', classes: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
      'contested': { text: 'ДИСКУССИОННО', classes: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
    };
    const badge = mapping[level.toLowerCase()] || mapping['established'];
    return (
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${badge.classes}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <button 
      onClick={() => onClick(article.path)}
      className="group flex flex-col justify-between p-4 bg-[#181a22]/70 hover:bg-[#1f222e] border border-[#34384a]/60 hover:border-kingdom-gold/50 rounded-xl transition-all text-left shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden h-full"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {getEvidenceBadge(article.evidenceLevel)}
          {article.difficulty && (
            <span className="text-[10px] uppercase font-mono tracking-wider text-kingdom-gold font-semibold">
              {article.difficulty === 'advanced' ? 'Продвинутый' : article.difficulty === 'intermediate' ? 'Средний' : 'Начальный'}
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-gray-200 group-hover:text-kingdom-gold transition-colors leading-snug">
            {article.title}
          </h4>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-kingdom-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </div>
        {article.excerpt && (
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 mt-3 border-t border-[#34384a]/60 text-[10px] text-gray-500 font-mono uppercase">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-gray-600" />
          <span>{readingTime}</span>
        </div>
        {article.lastReviewed && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-gray-600" />
            <span>Пров: {article.lastReviewed}</span>
          </div>
        )}
      </div>
    </button>
  );
});
