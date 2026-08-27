import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Sparkles, Clock, ShieldCheck, Scale, AlertCircle, Lightbulb, HelpCircle, Layers, ChevronsUpDown } from 'lucide-react';
import { ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { CategoryDef } from './catalog/CategoryTile';

const ACADEMIC_CATEGORIES: (CategoryDef & { icon: string; description: string })[] = [
  { 
    id: 'taxonomy', 
    name: 'Таксономия и Эволюция',
    icon: '🌳',
    description: 'Систематика хоботных, филогения, классификация видов и эволюционные ветви.'
  },
  { 
    id: 'anatomy', 
    name: 'Анатомия и Физиология',
    icon: '🫀',
    description: 'Морфология хобота, бивней, зубной системы, опорно-двигательный аппарат и терморегуляция.'
  },
  { 
    id: 'ethogram', 
    name: 'Этология и Поведение',
    icon: '🐘',
    description: 'Матриархальная структура, инфразвуковая коммуникация, ритуалы и социальная иерархия.'
  },
  { 
    id: 'cognition', 
    name: 'Когнитивистика и Память',
    icon: '🧠',
    description: 'Зеркальный тест самосознания, долговременная топографическая память и орудийная деятельность.'
  },
  { 
    id: 'veterinary', 
    name: 'Ветеринария и Патологии',
    icon: '🩺',
    description: 'Эндотелиотропный герпесвирус (EEHV), пододерматиты, анестезиология и превентивная медицина.'
  },
  { 
    id: 'ecology', 
    name: 'Экология и Среда обитания',
    icon: '🌿',
    description: 'Средообразующая роль мегагербиворов, дисперсия семян, зоогенная гидрология и кормовой бюджет.'
  },
  { 
    id: 'conservation', 
    name: 'Охрана и Сохранение видов',
    icon: '🛡️',
    description: 'Борьба с браконьерством, фрагментация ареалов, коридоры миграции и мониторинг популяций.'
  },
  { 
    id: 'culture', 
    name: 'Антропозоология и Культура',
    icon: '🏛️',
    description: 'Слоны в мифологии, религиях Востока, военном деле античности и этика сосуществования.'
  },
  { 
    id: 'paleontology', 
    name: 'Палеонтология и Ископаемые',
    icon: '🦴',
    description: 'Мамонтовая фауна, мастодонты, гомфотерии, дейнотерии и островная карликовость.'
  },
  { 
    id: 'genomics', 
    name: 'Геномика и Молекулярная биология',
    icon: '🔬',
    description: 'Парадокс Пето, ген TP53, древняя ДНК мамонтов и эпигенетические адаптации.'
  }
];

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  const toggleAllCategories = useCallback(() => {
    setExpandedCategories(prev => {
      if (prev.size === ACADEMIC_CATEGORIES.length) {
        return new Set();
      }
      return new Set(ACADEMIC_CATEGORIES.map(c => c.id));
    });
  }, []);

  const getEvidenceBadge = (level: string | undefined) => {
    if (!level) return null;
    const mapping: Record<string, {text: string, classes: string, icon: any}> = {
      'established': { text: 'ХОРОШО УСТАНОВЛЕНО', classes: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: ShieldCheck },
      'moderate': { text: 'ДОСТАТОЧНАЯ БАЗА', classes: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Scale },
      'limited': { text: 'ОГРАНИЧЕННЫЕ ДАННЫЕ', classes: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: AlertCircle },
      'hypothesis': { text: 'ГИПОТЕЗА', classes: 'text-sky-400 bg-sky-400/10 border-sky-400/20', icon: Lightbulb },
      'contested': { text: 'ДИСКУССИОННО', classes: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: HelpCircle },
    };
    const badge = mapping[level.toLowerCase()] || mapping['established'];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider border ${badge.classes}`}>
        <Icon className="w-2.5 h-2.5" />
        {badge.text}
      </span>
    );
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-kingdom-muted space-y-4">
        <div className="w-8 h-8 border-2 border-kingdom-gold border-t-transparent animate-spin rounded-full"></div>
        <p className="text-sm tracking-wider">Подготовка базы знаний...</p>
      </div>
    );
  }

  const allExpanded = expandedCategories.size === ACADEMIC_CATEGORIES.length;

  const renderCategoryCard = (cat: typeof ACADEMIC_CATEGORIES[0]) => {
    const categoryArticles = articles.filter(a => a.category === cat.id);
    const isExpanded = expandedCategories.has(cat.id);
    const count = categoryArticles.length;

    return (
      <div 
        key={cat.id}
        className={`rounded-xl border transition-all duration-200 overflow-hidden w-full ${
          isExpanded 
            ? 'bg-[#151720] border-kingdom-gold/40 shadow-lg shadow-black/40' 
            : 'bg-[#14161f]/80 border-[#2b2e3d] hover:border-kingdom-gold/30 hover:bg-[#181a24]'
        }`}
      >
        {/* Category Compact Horizontal Bar */}
        <button 
          onClick={() => toggleCategory(cat.id)}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer transition-colors select-none group"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <span className="text-xl shrink-0 p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:scale-105 transition-transform">
              {cat.icon}
            </span>
            <div className="min-w-0">
              <h3 className={`font-semibold text-sm leading-snug truncate transition-colors ${
                isExpanded ? 'text-kingdom-gold' : 'text-gray-200 group-hover:text-white'
              }`}>
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-400 truncate mt-0.5 max-w-[280px] sm:max-w-[340px]">
                {cat.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0">
            <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
              isExpanded
                ? 'bg-kingdom-gold text-black font-bold border-kingdom-gold'
                : 'bg-black/30 text-gray-400 border-white/5 group-hover:text-kingdom-gold group-hover:border-kingdom-gold/20'
            }`}>
              {count} ст.
            </span>
            <div className={`p-1 rounded-md transition-all ${
              isExpanded ? 'bg-kingdom-gold/15 text-kingdom-gold rotate-180' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </div>
          </div>
        </button>

        {/* Expandable Articles List */}
        {isExpanded && (
          <div className="border-t border-white/5 bg-[#0f1117]/90 p-3 sm:p-3.5 space-y-2.5 animate-fade-in">
            {categoryArticles.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2 text-center">В этой категории пока нет опубликованных статей.</p>
            ) : (
              categoryArticles.map((article) => {
                const readingTime = article.readingTime || '4 мин';
                return (
                  <div 
                    key={article.path}
                    onClick={() => openArticle(article.path)}
                    className="group/item p-3 rounded-lg bg-[#181a24] hover:bg-[#202330] border border-[#2b2e3d]/80 hover:border-kingdom-gold/50 transition-all cursor-pointer space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-200 group-hover/item:text-kingdom-gold transition-colors leading-snug">
                        {article.title}
                      </h4>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover/item:text-kingdom-gold group-hover/item:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </div>

                    {article.excerpt && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-gray-500 font-mono">
                      <div className="flex items-center gap-2">
                        {getEvidenceBadge(article.evidenceLevel)}
                        {article.difficulty && (
                          <span className="text-kingdom-gold/80 font-semibold uppercase text-[9px]">
                            {article.difficulty === 'advanced' ? 'Продвинутый' : article.difficulty === 'intermediate' ? 'Средний' : 'Базовый'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{readingTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-16 pt-6 px-2 sm:px-0">
      
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-kingdom-gold" />
            Слонология
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Систематизированный академический каталог. Выберите тему для раскрытия списка статей.
          </p>
        </div>

        <button
          onClick={toggleAllCategories}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1c26] text-gray-300 hover:text-kingdom-gold border border-white/10 hover:border-kingdom-gold/40 transition-all cursor-pointer shadow-sm shrink-0"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span>{allExpanded ? 'Свернуть все' : 'Развернуть все'}</span>
        </button>
      </div>

      {/* 2 Independent Column Stacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
        {/* Left Column (even indexes: 0, 2, 4, 6, 8) */}
        <div className="flex flex-col space-y-3.5 w-full">
          {ACADEMIC_CATEGORIES.filter((_, i) => i % 2 === 0).map((cat) => renderCategoryCard(cat))}
        </div>

        {/* Right Column (odd indexes: 1, 3, 5, 7, 9) */}
        <div className="flex flex-col space-y-3.5 w-full">
          {ACADEMIC_CATEGORIES.filter((_, i) => i % 2 !== 0).map((cat) => renderCategoryCard(cat))}
        </div>
      </div>
    </div>
  );
}

