import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowUpRight, 
  Tag, 
  HelpCircle, 
  SlidersHorizontal, 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  ListFilter
} from 'lucide-react';
import { searchArticles, ArticleItem, ARTICLE_SEMANTIC_TAGS } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { useLanguage } from '../i18n/LanguageContext';

function highlightMatch(text: string, query: string) {
  if (!query.trim() || !text) return text;
  
  const tokens = query.toLowerCase().trim().split(/[\s,.;:!?\-\/]+/).filter(t => t.length > 0);
  if (tokens.length === 0) return text;

  const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  const parts = text.split(regex);
  return parts.map((part, index) => {
    const isMatched = tokens.some(t => part.toLowerCase() === t.toLowerCase());
    return isMatched ? (
      <mark key={index} className="bg-[#14532D]/15 text-[#14532D] font-semibold px-0.5 rounded-none">
        {part}
      </mark>
    ) : (
      part
    );
  });
}

interface ToggleSearchEventDetail {
  force?: boolean;
  tag?: string;
  category?: string;
  query?: string;
}

export function SearchModal() {
  const { t, lang, isEn } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string>('all');
  const [selectedReadingTime, setSelectedReadingTime] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandTags, setExpandTags] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const disciplines = useMemo(() => [
    { id: 'all', name: t.catalog.allCategories, shortName: isEn ? 'All' : 'Все' },
    { id: 'anatomy', name: isEn ? 'Anatomy & Physiology' : 'Анатомия и Физиология', shortName: isEn ? 'Anatomy' : 'Анатомия' },
    { id: 'ethogram', name: isEn ? 'Ethology & Behavior' : 'Этология и Поведение', shortName: isEn ? 'Ethogram' : 'Этология' },
    { id: 'taxonomy', name: isEn ? 'Taxonomy & Evolution' : 'Таксономия и Эволюция', shortName: isEn ? 'Taxonomy' : 'Таксономия' },
    { id: 'veterinary', name: isEn ? 'Veterinary Medicine' : 'Ветеринария и Патологии', shortName: isEn ? 'Veterinary' : 'Ветеринария' },
    { id: 'ecology', name: isEn ? 'Ecology & Biomes' : 'Экология и Биоценозы', shortName: isEn ? 'Ecology' : 'Экология' },
    { id: 'conservation', name: isEn ? 'Conservation & Forensics' : 'Охрана и Криминалистика', shortName: isEn ? 'Conservation' : 'Охрана' },
    { id: 'cognition', name: isEn ? 'Cognition & Neurobiology' : 'Когнитивистика и Память', shortName: isEn ? 'Cognition' : 'Когнитивистика' },
    { id: 'culture', name: isEn ? 'Anthrozoology & History' : 'Антропозоология и История', shortName: isEn ? 'Culture' : 'Культура' },
    { id: 'paleontology', name: isEn ? 'Paleontology & Fossils' : 'Палеонтология и Ископаемые', shortName: isEn ? 'Paleontology' : 'Палеонтология' },
    { id: 'genomics', name: isEn ? 'Genomics & Genetics' : 'Геномика и Иммуногенетика', shortName: isEn ? 'Genomics' : 'Геномика' }
  ], [t, isEn]);

  const evidenceLevels = useMemo(() => [
    { id: 'all', label: isEn ? 'Any evidence status' : 'Любой статус' },
    { id: 'established', label: `${t.evidence.established} (A1)` },
    { id: 'moderate', label: `${t.evidence.moderate} (A2)` },
    { id: 'limited', label: `${t.evidence.limited} (B)` },
    { id: 'hypothesis', label: `${t.evidence.hypothesis} (C)` }
  ], [t, isEn]);

  const readingTimes = useMemo(() => [
    { id: 'all', label: isEn ? 'Any volume' : 'Любой объём' },
    { id: 'short', label: `< 10 ${t.catalog.readingTime} (${isEn ? 'Short' : 'Короткие'})` },
    { id: 'medium', label: `10–25 ${t.catalog.readingTime} (${isEn ? 'Medium' : 'Средние'})` },
    { id: 'long', label: `> 25 ${t.catalog.readingTime} (${isEn ? 'In-depth' : 'Фундаментальные'})` }
  ], [t, isEn]);

  const sortOptions = useMemo(() => [
    { id: 'relevance', label: isEn ? 'By relevance' : 'По релевантности' },
    { id: 'title_asc', label: isEn ? 'By title (A–Z)' : 'По названию (А–Я)' },
    { id: 'time_asc', label: isEn ? 'By volume (shortest first)' : 'По объёму (сначала короткие)' },
    { id: 'time_desc', label: isEn ? 'By volume (deepest first)' : 'По объёму (сначала глубокие)' }
  ], [isEn]);

  useEffect(() => {
    try {
      setArticles(getStaticArticles(lang));
    } catch {
      setArticles([]);
    }
  }, [lang]);

  useEffect(() => {
    const handleToggleSearch = (e: CustomEvent<ToggleSearchEventDetail>) => {
      const detail = e.detail || {};
      if (typeof detail.force === 'boolean') {
        setIsOpen(detail.force);
      } else {
        setIsOpen(prev => !prev);
      }
      if (detail.tag) setSelectedTag(detail.tag);
      if (detail.category) setSelectedCategory(detail.category);
      if (detail.query) setQuery(detail.query);
    };

    window.addEventListener('toggle-search', handleToggleSearch as EventListener);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('toggle-search', handleToggleSearch as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setSelectedTag(null);
      setSelectedCategory('all');
      setSelectedEvidence('all');
      setSelectedReadingTime('all');
      setShowAdvancedFilters(false);
    }
  }, [isOpen]);

  const popularTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach(a => {
      if (a.tags) a.tags.forEach(tTag => set.add(tTag.toLowerCase()));
      const staticTags = ARTICLE_SEMANTIC_TAGS[a.path] || [];
      staticTags.forEach(tTag => set.add(tTag.toLowerCase()));
    });
    return Array.from(set);
  }, [articles]);

  const results = useMemo(() => {
    let list = articles;

    if (selectedCategory !== 'all') {
      list = list.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedTag) {
      list = list.filter(a => {
        const tList = (a.tags || []).map(t => t.toLowerCase());
        const sList = (ARTICLE_SEMANTIC_TAGS[a.path] || []).map(t => t.toLowerCase());
        return tList.includes(selectedTag.toLowerCase()) || sList.includes(selectedTag.toLowerCase());
      });
    }

    if (selectedEvidence !== 'all') {
      list = list.filter(a => (a.evidenceLevel || a.evidence_level || '').toLowerCase() === selectedEvidence.toLowerCase());
    }

    if (selectedReadingTime !== 'all') {
      list = list.filter(a => {
        const rMin = a.reading_time_min || 5;
        if (selectedReadingTime === 'short') return rMin < 10;
        if (selectedReadingTime === 'medium') return rMin >= 10 && rMin <= 25;
        if (selectedReadingTime === 'long') return rMin > 25;
        return true;
      });
    }

    if (query.trim()) {
      list = searchArticles(list, query);
    }

    const sorted = [...list];
    if (sortBy === 'title_asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, isEn ? 'en' : 'ru'));
    } else if (sortBy === 'time_asc') {
      sorted.sort((a, b) => (a.reading_time_min || 5) - (b.reading_time_min || 5));
    } else if (sortBy === 'time_desc') {
      sorted.sort((a, b) => (b.reading_time_min || 5) - (a.reading_time_min || 5));
    }

    return sorted;
  }, [articles, query, selectedCategory, selectedTag, selectedEvidence, selectedReadingTime, sortBy, isEn]);

  const hasAnyFilterActive = selectedCategory !== 'all' || selectedTag !== null || selectedEvidence !== 'all' || selectedReadingTime !== 'all' || query.trim() !== '';

  const resetAllFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setSelectedEvidence('all');
    setSelectedReadingTime('all');
    setSortBy('relevance');
  };

  const handleSelectArticle = (path: string) => {
    setIsOpen(false);
    let cleanPath = path;
    if (cleanPath.endsWith('.md')) cleanPath = cleanPath.slice(0, -3);
    window.dispatchEvent(new CustomEvent('load-article', { detail: cleanPath }));
  };

  const handleKeyDownResults = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectArticle(results[selectedIndex].path);
      } else if (results.length > 0) {
        handleSelectArticle(results[0].path);
      }
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = disciplines.find(d => d.id === category?.toLowerCase());
    return found ? found.name : (isEn ? 'Monograph' : 'Монография');
  };

  useEffect(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const selectedEl = resultsContainerRef.current.querySelector(`[data-result-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'Search encyclopedia' : 'Поиск по энциклопедии'}
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 pb-6 bg-black/50 backdrop-blur-xs"
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownResults}
        className="w-full max-w-3xl bg-[#FBF9F5] border border-[#C5BDB0] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[86vh]"
      >
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 bg-[#F2EFE9] border-b border-[#DED8CD] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#14532D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isEn ? 'Search terms, taxa, anatomy, or concepts...' : 'Поиск терминов, таксонов, анатомии или концептов...'}
            className="w-full bg-transparent text-[#1C1917] placeholder-[#78716C] text-sm sm:text-base focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              title={isEn ? 'Clear query' : 'Очистить'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`px-3 py-1.5 rounded-none border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
              showAdvancedFilters || hasAnyFilterActive
                ? 'bg-[#14532D] text-[#FBF9F5] border-[#14532D]'
                : 'bg-[#FBF9F5] text-[#1C1917] border-[#DED8CD] hover:bg-[#EAE5DC]'
            }`}
            title={isEn ? 'Advanced filters' : 'Расширенные фильтры'}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? 'Filters' : 'Фильтры'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={isEn ? 'Close search' : 'Закрыть поиск'}
            className="p-1.5 bg-[#FBF9F5] border border-[#DED8CD] text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="bg-[#F2EFE9] border-b border-[#DED8CD] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#78716C]">
            <span className="font-semibold uppercase tracking-wider text-[10px] font-mono">
              {isEn ? 'Disciplines:' : 'Дисциплина:'}
            </span>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-[#14532D] hover:underline cursor-pointer font-medium"
              >
                {t.catalog.allCategories}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {disciplines.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? articles.length 
                : articles.filter(a => a.category?.toLowerCase() === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-none text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917] font-semibold'
                      : 'bg-[#FBF9F5] text-[#44403C] hover:text-[#1C1917] hover:bg-[#EAE5DC] border-[#DED8CD]'
                  }`}
                >
                  <span>{cat.shortName}</span>
                  <span className={`text-[10px] font-mono tabular-nums ${
                    isSelected ? 'text-[#DED8CD]' : 'text-[#78716C]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thematic Tags Section */}
        <div className="bg-[#FBF9F5] border-b border-[#DED8CD] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
              <Tag className="w-3 h-3 text-[#14532D]" />
              <span className="font-semibold uppercase tracking-wider text-[10px] font-mono">
                {isEn ? 'Thematic Index:' : 'Тематические дескрипторы:'}
              </span>
            </div>
            {popularTags.length > 16 && (
              <button
                type="button"
                onClick={() => setExpandTags(prev => !prev)}
                className="text-[11px] text-[#14532D] hover:underline transition-colors cursor-pointer font-medium"
              >
                {expandTags ? (isEn ? 'Collapse index' : 'Свернуть') : (isEn ? `Show all (${popularTags.length})` : `Показать все (${popularTags.length})`)}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {(expandTags ? popularTags : popularTags.slice(0, 16)).map(tag => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-none transition-colors font-mono text-[11px] cursor-pointer border whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#14532D] text-[#FBF9F5] border-[#14532D] font-semibold'
                      : 'bg-[#F2EFE9] text-[#44403C] hover:text-[#1C1917] hover:bg-[#EAE5DC] border-[#DED8CD]'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="p-4 bg-[#F2EFE9] border-b border-[#DED8CD] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] text-[#44403C] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#14532D]" /> {isEn ? 'Evidence:' : 'Доказательность:'}
              </label>
              <select
                value={selectedEvidence}
                onChange={(e) => setSelectedEvidence(e.target.value)}
                className="w-full bg-[#FBF9F5] text-[#1C1917] border border-[#DED8CD] rounded-none px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#14532D] cursor-pointer"
              >
                {evidenceLevels.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#44403C] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#14532D]" /> {isEn ? 'Reading Time:' : 'Объём / Время чтения:'}
              </label>
              <select
                value={selectedReadingTime}
                onChange={(e) => setSelectedReadingTime(e.target.value)}
                className="w-full bg-[#FBF9F5] text-[#1C1917] border border-[#DED8CD] rounded-none px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#14532D] cursor-pointer"
              >
                {readingTimes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#44403C] font-medium flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#14532D]" /> {isEn ? 'Sort:' : 'Сортировка:'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#FBF9F5] text-[#1C1917] border border-[#DED8CD] rounded-none px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#14532D] cursor-pointer"
              >
                {sortOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results Info Bar */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="px-4 py-2 bg-[#F2EFE9] border-b border-[#DED8CD] flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#78716C] font-mono tabular-nums"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#1C1917]">
              {isEn ? 'Monographs found:' : 'Найдено статей:'} <strong className="text-[#14532D] font-bold">{results.length}</strong> {isEn ? 'of' : 'из'} {articles.length}
            </span>

            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1.5 bg-[#FBF9F5] text-[#1C1917] px-2 py-0.5 border border-[#DED8CD] font-sans font-medium cursor-pointer"
              >
                <span>{getCategoryLabel(selectedCategory)}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 bg-[#14532D] text-[#FBF9F5] px-2 py-0.5 font-mono cursor-pointer"
              >
                <span>#{selectedTag}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-[11px] text-[#44403C] hover:text-[#1C1917] transition-colors cursor-pointer font-sans font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEn ? 'Reset filters' : 'Сбросить все'}</span>
            </button>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={resultsContainerRef}
          className="overflow-y-auto flex-1 divide-y divide-[#DED8CD] custom-scrollbar"
        >
          {results.length === 0 ? (
            <div className="text-center py-14 px-4 space-y-3">
              <div className="flex justify-center mb-1">
                <HelpCircle className="w-9 h-9 text-[#78716C]" />
              </div>
              <p className="text-base text-[#1C1917] font-semibold font-serif">{t.search.noResults}</p>
              <p className="text-xs text-[#78716C] max-w-md mx-auto leading-relaxed">
                {isEn ? 'Try changing keywords, selecting a different discipline, or resetting active filters.' : 'Попробуйте изменить поисковые слова, выбрать другую дисциплину или сбросить активные фильтры.'}
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-[#14532D] hover:bg-[#166534] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEn ? 'Reset all parameters' : 'Сбросить все параметры'}</span>
              </button>
            </div>
          ) : (
            results.map((article, idx) => {
              const isKeyboardSelected = idx === selectedIndex;

              return (
                <button
                  key={article.path}
                  type="button"
                  data-result-index={idx}
                  onClick={() => handleSelectArticle(article.path)} 
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-5 py-4 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                    isKeyboardSelected 
                      ? 'bg-[#F2EFE9]' 
                      : 'bg-[#FBF9F5] hover:bg-[#F2EFE9]/70'
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#78716C] tabular-nums">
                      <span className="font-semibold text-[#14532D] uppercase">
                        {getCategoryLabel(article.category)}
                      </span>
                      {article.readingTime && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{article.readingTime}</span>
                        </>
                      )}
                    </div>

                    <div className="text-base sm:text-lg font-semibold text-[#1C1917] font-serif leading-snug">
                      {highlightMatch(article.title, query)}
                    </div>

                    {article.excerpt && (
                      <p className="text-xs text-[#44403C] line-clamp-2 leading-relaxed">
                        {highlightMatch(article.excerpt, query)}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pt-2 text-[#78716C]">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="px-4 py-2.5 bg-[#F2EFE9] border-t border-[#DED8CD] flex items-center justify-between text-[11px] text-[#78716C] font-mono tabular-nums">
          <div className="flex items-center gap-3">
            <span>{isEn ? 'Navigate' : 'Навигация'}: <kbd className="px-1.5 py-0.5 bg-[#FBF9F5] border border-[#DED8CD] text-[#1C1917]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-[#FBF9F5] border border-[#DED8CD] text-[#1C1917]">↓</kbd></span>
            <span><kbd className="px-1.5 py-0.5 bg-[#FBF9F5] border border-[#DED8CD] text-[#1C1917]">Enter</kbd> {isEn ? 'open' : 'открыть'}</span>
          </div>
          <span>{isEn ? 'Corpus:' : 'Всего монографий:'} {articles.length}</span>
        </div>

      </div>
    </div>
  );
}
