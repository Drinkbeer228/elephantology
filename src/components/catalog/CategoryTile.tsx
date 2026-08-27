import React from 'react';

export interface CategoryDef {
  id: string;
  name: string;
  shortName?: string;
  emoji?: string;
  intent?: string;
  match?: string[];
  color?: string;
  featuredArticle?: string;
  featuredArticleTitle?: string;
}

interface CategoryTileProps {
  category?: CategoryDef;
  isAll?: boolean;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryTile = React.memo(function CategoryTile({ 
  category, 
  isAll = false, 
  count, 
  isActive, 
  onClick 
}: CategoryTileProps) {
  if (isAll) {
    return (
      <button 
        onClick={onClick}
        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all text-left cursor-pointer group ${
          isActive 
            ? 'bg-kingdom-gold text-black font-bold border-kingdom-gold shadow-[0_0_15px_rgba(255,209,102,0.25)]' 
            : 'bg-[#121318] border-[#34384a] text-gray-300 hover:text-white hover:border-kingdom-gold/40 hover:bg-[#1e202a]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base shrink-0">📚</span>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">Все статьи</div>
          </div>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
          isActive ? 'bg-black/20 text-black' : 'bg-white/5 text-kingdom-gold border border-white/5'
        }`}>
          {count}
        </span>
      </button>
    );
  }

  if (!category) return null;

  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all text-left cursor-pointer group ${
        isActive 
          ? 'bg-kingdom-gold text-black font-bold border-kingdom-gold shadow-[0_0_15px_rgba(255,209,102,0.25)]' 
          : 'bg-[#121318] border-[#34384a] text-gray-300 hover:text-white hover:border-kingdom-gold/40 hover:bg-[#1e202a]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{category.name}</div>
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
        isActive ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-400 border border-white/5 group-hover:text-kingdom-gold'
      }`}>
        {count}
      </span>
    </button>
  );
});
