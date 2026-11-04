import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  ShieldCheck,
  Scale,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Layers,
  ChevronsUpDown,
  Search,
  Command
} from 'lucide-react';
import { ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { CategoryDef } from './catalog/CategoryTile';
import { ru } from '../i18n/ru';

const EVIDENCE_BADGE_MAP: Record<string, { key: 'established' | 'moderate' | 'limited' | 'hypothesis' | 'contested', classes: string, icon: any }> = {
  'established': { key: 'established', classes: 'chip-emerald', icon: ShieldCheck },
  'moderate':    { key: 'moderate',    classes: 'text-sky-300 bg-sky-400/10 border-sky-400/25 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border', icon: Scale },
  'limited':     { key: 'limited',     classes: 'text-orange-300 bg-orange-400/10 border-orange-400/25 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border', icon: AlertCircle },
  'hypothesis':  { key: 'hypothesis',  classes: 'text-sky-300 bg-sky-400/10 border-sky-400/25 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border', icon: Lightbulb },
  'contested':   { key: 'contested',   classes: 'text-rose-300 bg-rose-400/10 border-rose-400/25 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border', icon: HelpCircle },
};

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

interface CategoryCardProps {
  cat: typeof ACADEMIC_CATEGORIES[0];
  articles: ArticleItem[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onArticleClick: (path: string) => void;
}

/** Карточка рубрики: hairline-бордер + тонкий градиентный hover, элегантный аккордеон статей */
const CategoryCard = React.memo(function CategoryCard({
  cat,
  articles,
  isExpanded,
  onToggle,
  onArticleClick
}: CategoryCardProps) {
  const categoryArticles = useMemo(() => articles.filter(a => a.category === cat.id), [articles, cat.id]);
  const count = categoryArticles.length;

  return (
    <section
      className={`editorial-card overflow-hidden w-full ${
        isExpanded ? '!border-brand-emerald/40 shadow-lg shadow-black/40' : ''
      }`}
    >
      {/* Компактный заголовок рубрики */}
      <button
        onClick={() => onToggle(cat.id)}
        aria-expanded={isExpanded}
        aria-label={`Рубрика: ${cat.name}`}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors select-none group"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-xl shrink-0 p-1.5 rounded-lg bg-white/[0.04] border border-ink-border group-hover:scale-105 transition-transform">
            {cat.icon}
          </span>
          <div className="min-w-0">
            <h3 className={`font-semibold text-[15px] leading-snug truncate transition-colors ${
              isExpanded ? 'text-brand-emerald' : 'text-slate-100 group-hover:text-white'
            }`}>
              {cat.name}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[300px] sm:max-w-[420px] leading-relaxed">
              {cat.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
            isExpanded
              ? 'bg-brand-emerald text-[#06231a] font-bold border-brand-emerald'
              : 'bg-black/30 text-slate-400 border-ink-border group-hover:text-brand-emerald group-hover:border-brand-emerald/30'
          }`}>
            {count} {ru.catalog.articlesCount}
          </span>
          <div className={`p-1 rounded-md transition-all ${
            isExpanded ? 'bg-brand-emerald/15 text-brand-emerald' : 'text-slate-500 group-hover:text-slate-300'
          }`}>
            {isExpanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Аккордеон: статьи — элегантный список с превью, без громоздких плашек */}
      {isExpanded && (
        <ul className="border-t border-ink-border bg-ink-base/60 px-2 pb-2 pt-1 animate-fade-in list-none">
          {categoryArticles.length === 0 ? (
            <li className="text-xs text-slate-500 italic py-3 text-center">{ru.search.noResults}</li>
          ) : (
            categoryArticles.map((article) => {
              const readingTime = article.readingTime || `4 ${ru.catalog.readingTime}`;
              const badgeDef = article.evidenceLevel
                ? EVIDENCE_BADGE_MAP[article.evidenceLevel.toLowerCase()] || EVIDENCE_BADGE_MAP['established']
                : null;
              const BadgeIcon = badgeDef?.icon;
              const badgeText = badgeDef
                ? (ru.evidence[badgeDef.key] ? ru.evidence[badgeDef.key].toUpperCase() : article.evidenceLevel?.toUpperCase())
                : null;

              return (
                <li key={article.path}>
                  <button
                    onClick={() => onArticleClick(article.path)}
                    className="group/item w-full flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-lg text-left transition-colors duration-150 hover:bg-white/[0.04] cursor-pointer focus-visible:bg-white/[0.06] focus:outline-none"
                  >
                    {/* Тонкий акцентный индикатор слева */}
                    <span aria-hidden className="w-1 h-8 shrink-0 rounded-full bg-transparent group-hover/item:bg-brand-emerald/60 transition-colors" />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-200 group-hover/item:text-white truncate leading-snug transition-colors">
                        {article.title}
                      </span>
                      {article.excerpt && (
                        <span className="block text-[11px] text-slate-400 line-clamp-1 leading-relaxed mt-0.5">
                          {article.excerpt}
                        </span>
                      )}
                    </span>

                    {/* Бейдж статуса + время чтения + стрелка перехода */}
                    {badgeDef && BadgeIcon && (
                      <span className={`hidden sm:inline-flex items-center gap-1 shrink-0 ${badgeDef.classes}`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badgeText}
                      </span>
                    )}
                    <span className="hidden md:flex items-center gap-1 shrink-0 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3 h-3" />
                      {readingTime}
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 text-slate-600 group-hover/item:text-brand-emerald group-hover/item:translate-x-0.5 transition-all" />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </section>
  );
});

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const articles = useMemo(() => getStaticArticles(), []);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  const toggleAllCategories = useCallback(() => {
    setExpandedCategories(prev =>
      prev.size === ACADEMIC_CATEGORIES.length
        ? new Set()
        : new Set(ACADEMIC_CATEGORIES.map(c => c.id))
    );
  }, []);

  const allExpanded = expandedCategories.size === ACADEMIC_CATEGORIES.length;
  const openSearch = () => window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }));

  const quickFilters = useMemo(() => {
    const byEvidence = (lvl: string) => articles.filter(a => a.evidenceLevel?.toLowerCase() === lvl).length;
    return [
      { label: ru.evidence.established, count: byEvidence('established'), tag: 'established' },
      { label: ru.evidence.hypothesis, count: byEvidence('hypothesis'), tag: 'hypothesis' },
      { label: `${ru.catalog.readingTime} < 10`, count: articles.filter(a => (a.reading_time_min || 0) < 10).length, tag: 'short' },
      { label: ru.catalog.difficulty.advanced, count: articles.filter(a => a.difficulty === 'advanced').length, tag: 'advanced' }
    ];
  }, [articles]);

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8 pb-16 pt-6 px-1 sm:px-2">

      {/* ===== Hero / header с command-bar ===== */}
      <div className="space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-ink-border pb-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <Layers className="w-7 h-7 text-brand-emerald" />
              {ru.catalog.title}
            </h2>
            <p className="text-[15px] text-slate-400 max-w-2xl leading-relaxed">
              {ru.catalog.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="chip-emerald !text-[11px] normal-case tracking-normal">
              {articles.length} {ru.catalog.articlesCount}
            </span>
            <button
              onClick={toggleAllCategories}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-ink-elevated text-slate-300 hover:text-brand-emerald border border-ink-border hover:border-brand-emerald/50 transition-all cursor-pointer shadow-sm"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>{allExpanded ? ru.catalog.collapseAll : ru.catalog.expandAll}</span>
            </button>
          </div>
        </div>

        {/* Command-bar в стиле Cmd+K — визуальный центр поиска */}
        <div className="max-w-3xl mx-auto w-full space-y-3">
          <button onClick={openSearch} className="command-bar group w-full">
            <Search className="w-[18px] h-[18px] text-slate-400 group-hover:text-brand-emerald transition-colors shrink-0" />
            <span className="flex-1 text-[15px] text-slate-400 truncate">
              {ru.catalog.searchPlaceholder}
            </span>
            <span className="kbd-chip hidden sm:inline-flex items-center gap-1">
              <Command className="w-3 h-3" />K
            </span>
          </button>

          {/* Быстрые фильтры под строкой поиска */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickFilters.map((f) => (
              <button
                key={f.tag}
                onClick={openSearch}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 bg-ink-surface/80 border border-ink-border hover:border-brand-emerald/40 hover:text-brand-emerald transition-all cursor-pointer"
              >
                {f.label}
                <span className="font-mono text-[10px] text-slate-500">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Сетка рубрик: широкая, до max-w-7xl ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Левая колонка (чётные индексы) */}
        <div className="flex flex-col space-y-4 w-full">
          {ACADEMIC_CATEGORIES.filter((_, i) => i % 2 === 0).map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              articles={articles}
              isExpanded={expandedCategories.has(cat.id)}
              onToggle={toggleCategory}
              onArticleClick={openArticle}
            />
          ))}
        </div>

        {/* Правая колонка (нечётные индексы) */}
        <div className="flex flex-col space-y-4 w-full">
          {ACADEMIC_CATEGORIES.filter((_, i) => i % 2 !== 0).map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              articles={articles}
              isExpanded={expandedCategories.has(cat.id)}
              onToggle={toggleCategory}
              onArticleClick={openArticle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
