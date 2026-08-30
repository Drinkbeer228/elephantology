import { useLanguage } from '../i18n/LanguageContext';
import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, BookOpen, Sparkles, Clock, ShieldCheck, Scale, AlertCircle, Lightbulb, HelpCircle, Layers, ChevronsUpDown, Search } from 'lucide-react';
import { ArticleItem } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { CategoryDef } from './catalog/CategoryTile';

const EVIDENCE_BADGE_MAP: Record<string, { key: 'established' | 'moderate' | 'limited' | 'hypothesis' | 'contested', classes: string, icon: any }> = {
  'established': { key: 'established', classes: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: ShieldCheck },
  'moderate': { key: 'moderate', classes: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Scale },
  'limited': { key: 'limited', classes: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: AlertCircle },
  'hypothesis': { key: 'hypothesis', classes: 'text-sky-400 bg-sky-400/10 border-sky-400/20', icon: Lightbulb },
  'contested': { key: 'contested', classes: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: HelpCircle },
};

const ACADEMIC_CATEGORIES: (CategoryDef & { icon: string; description: string; nameEn?: string; descriptionEn?: string })[] = [
  { 
    id: 'taxonomy', 
    name: 'Таксономия и Эволюция', 
    nameEn: 'Taxonomy and Evolution',
    icon: '🌳',
    description: 'Систематика хоботных, филогения, классификация видов и эволюционные ветви.', 
    descriptionEn: 'Systematics of Proboscidea, phylogeny, species classification, and evolutionary branches.'
  },
  { 
    id: 'anatomy', 
    name: 'Анатомия и Физиология', 
    nameEn: 'Anatomy and Physiology',
    icon: '🫀',
    description: 'Морфология хобота, бивней, зубной системы, опорно-двигательный аппарат и терморегуляция.', 
    descriptionEn: 'Morphology of trunk, tusks, dentition, musculoskeletal system, and thermoregulation.'
  },
  { 
    id: 'ethogram', 
    name: 'Этология и Поведение', 
    nameEn: 'Ethology and Behavior',
    icon: '🐘',
    description: 'Матриархальная структура, инфразвуковая коммуникация, ритуалы и социальная иерархия.', 
    descriptionEn: 'Matriarchal structure, infrasonic communication, rituals, and social hierarchy.'
  },
  { 
    id: 'cognition', 
    name: 'Когнитивистика и Память', 
    nameEn: 'Cognition and Memory',
    icon: '🧠',
    description: 'Зеркальный тест самосознания, долговременная топографическая память и орудийная деятельность.', 
    descriptionEn: 'Mirror self-recognition test, long-term topographic memory, and tool use.'
  },
  { 
    id: 'veterinary', 
    name: 'Ветеринария и Патологии', 
    nameEn: 'Veterinary and Pathologies',
    icon: '🩺',
    description: 'Эндотелиотропный герпесвирус (EEHV), пододерматиты, анестезиология и превентивная медицина.', 
    descriptionEn: 'Endotheliotropic herpesvirus (EEHV), pododermatitis, anesthesiology, and preventive medicine.'
  },
  { 
    id: 'ecology', 
    name: 'Экология и Среда обитания', 
    nameEn: 'Ecology and Habitat',
    icon: '🌿',
    description: 'Средообразующая роль мегагербиворов, дисперсия семян, зоогенная гидрология и кормовой бюджет.', 
    descriptionEn: 'Habitat-forming role of megaherbivores, seed dispersal, zoogenic hydrology, and foraging budget.'
  },
  { 
    id: 'conservation', 
    name: 'Охрана и Сохранение видов', 
    nameEn: 'Conservation and Protection',
    icon: '🛡️',
    description: 'Борьба с браконьерством, фрагментация ареалов, коридоры миграции и мониторинг популяций.', 
    descriptionEn: 'Anti-poaching, habitat fragmentation, migration corridors, and population monitoring.'
  },
  { 
    id: 'culture', 
    name: 'Антропозоология и Культура', 
    nameEn: 'Anthrozoology and Culture',
    icon: '🏛️',
    description: 'Слоны в мифологии, религиях Востока, военном деле античности и этика сосуществования.', 
    descriptionEn: 'Elephants in mythology, Eastern religions, ancient warfare, and coexistence ethics.'
  },
  { 
    id: 'paleontology', 
    name: 'Палеонтология и Ископаемые', 
    nameEn: 'Paleontology and Fossils',
    icon: '🦴',
    description: 'Мамонтовая фауна, мастодонты, гомфотерии, дейнотерии и островная карликовость.', 
    descriptionEn: 'Mammoth fauna, mastodons, gomphotheres, deinotheres, and island dwarfism.'
  },
  { 
    id: 'genomics', 
    name: 'Геномика и Молекулярная биология',
    nameEn: 'Genomics and Molecular Biology',
    icon: '🔬',
    description: 'Парадокс Пето, ген TP53, древняя ДНК мамонтов и эпигенетические адаптации.',
    descriptionEn: "Peto's paradox, TP53 duplication, ancient mammoth DNA, and epigenetic adaptations."
  }
];

interface CategoryCardProps {
  cat: typeof ACADEMIC_CATEGORIES[0];
  articles: ArticleItem[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onArticleClick: (path: string) => void;
  lang: string;
  t: any;
}

const CategoryCard = React.memo(function CategoryCard({
  cat,
  articles,
  isExpanded,
  onToggle,
  onArticleClick,
  lang,
  t
}: CategoryCardProps) {
  const categoryArticles = useMemo(() => articles.filter(a => a.category === cat.id), [articles, cat.id]);
  const count = categoryArticles.length;
  const categoryTitle = lang === 'en' && cat.nameEn ? cat.nameEn : cat.name;

  return (
    <div 
      className={`rounded-xl border transition-all duration-200 overflow-hidden w-full ${
        isExpanded 
          ? 'bg-[#151720] border-kingdom-gold/40 shadow-lg shadow-black/40' 
          : 'bg-[#14161f]/80 border-[#2b2e3d] hover:border-kingdom-gold/30 hover:bg-[#181a24]'
      }`}
    >
      {/* Category Compact Horizontal Bar */}
      <button 
        onClick={() => onToggle(cat.id)}
        aria-expanded={isExpanded}
        aria-label={`${categoryTitle} category`}
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
              {categoryTitle}
            </h3>
            <p className="text-[11px] text-gray-400 truncate mt-0.5 max-w-[280px] sm:max-w-[340px]">
              {lang === 'en' && cat.descriptionEn ? cat.descriptionEn : cat.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
            isExpanded
              ? 'bg-kingdom-gold text-black font-bold border-kingdom-gold'
              : 'bg-black/30 text-gray-400 border-white/5 group-hover:text-kingdom-gold group-hover:border-kingdom-gold/20'
          }`}>
            {count} {t.catalog.articlesCount}
          </span>
          <div className={`p-1 rounded-md transition-all ${
            isExpanded ? 'bg-kingdom-gold/15 text-kingdom-gold' : 'text-gray-500 group-hover:text-gray-300'
          }`}>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Articles List */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-[#0f1117]/90 p-3 sm:p-3.5 space-y-2.5 animate-fade-in">
          {categoryArticles.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2 text-center">{t.search.noResults}</p>
          ) : (
            categoryArticles.map((article) => {
              const readingTime = article.readingTime || `4 ${t.catalog.readingTime}`;
              const badgeDef = article.evidenceLevel ? EVIDENCE_BADGE_MAP[article.evidenceLevel.toLowerCase()] || EVIDENCE_BADGE_MAP['established'] : null;
              const BadgeIcon = badgeDef?.icon;
              const badgeText = badgeDef ? (t.evidence[badgeDef.key] ? t.evidence[badgeDef.key].toUpperCase() : article.evidenceLevel?.toUpperCase()) : null;

              return (
                <div 
                  key={article.path}
                  onClick={() => onArticleClick(article.path)}
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
                      {badgeDef && BadgeIcon && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider border ${badgeDef.classes}`}>
                          <BadgeIcon className="w-2.5 h-2.5" />
                          {badgeText}
                        </span>
                      )}
                      {article.difficulty && (
                        <span className="text-kingdom-gold/80 font-semibold uppercase text-[9px]">
                          {article.difficulty === 'advanced' ? t.catalog.difficulty.advanced : article.difficulty === 'intermediate' ? t.catalog.difficulty.intermediate : t.catalog.difficulty.basic}
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
});

export function ArticleCatalog({ onArticleClick }: { onArticleClick?: (path: string) => void }) {
  const { t, lang } = useLanguage();
  const articles = useMemo(() => getStaticArticles(lang), [lang]);
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

  const allExpanded = expandedCategories.size === ACADEMIC_CATEGORIES.length;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-16 pt-6 px-2 sm:px-0">
      
      {/* Catalog Header with Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-kingdom-gold" />
              {t.catalog.title}
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              {t.catalog.subtitle}
            </p>
          </div>

          <button
            onClick={toggleAllCategories}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1c26] text-gray-300 hover:text-kingdom-gold border border-white/10 hover:border-kingdom-gold/40 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>{allExpanded ? t.catalog.collapseAll : t.catalog.expandAll}</span>
          </button>
        </div>

        {/* Search input field with magnifying glass icon above categories */}
        <div className="relative">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }))}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#161822] hover:bg-[#1b1e2b] border border-white/10 hover:border-kingdom-gold/40 rounded-xl text-left transition-all group shadow-inner cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-kingdom-gold transition-colors shrink-0" />
              <span className="text-sm text-gray-400 font-normal">
                {t.catalog.searchPlaceholder}
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">{t.search.searchTitle}</span>
          </button>
        </div>
      </div>

      {/* 2 Independent Column Stacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
        {/* Left Column (even indexes: 0, 2, 4, 6, 8) */}
        <div className="flex flex-col space-y-3.5 w-full">
          {ACADEMIC_CATEGORIES.filter((_, i) => i % 2 === 0).map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              articles={articles}
              isExpanded={expandedCategories.has(cat.id)}
              onToggle={toggleCategory}
              onArticleClick={openArticle}
              lang={lang}
              t={t}
            />
          ))}
        </div>

        {/* Right Column (odd indexes: 1, 3, 5, 7, 9) */}
        <div className="flex flex-col space-y-3.5 w-full">
          {ACADEMIC_CATEGORIES.filter((_, i) => i % 2 !== 0).map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              articles={articles}
              isExpanded={expandedCategories.has(cat.id)}
              onToggle={toggleCategory}
              onArticleClick={openArticle}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
