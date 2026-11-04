import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
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
      <mark key={index} className="bg-[#1E4631]/20 text-[#1E4631] font-semibold px-0.5 rounded-none">
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
  const { t, lang } = useLanguage();
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
    { id: 'all', name: t.catalog.allCategories, shortName: lang === 'en' ? 'All' : 'Все' },
    { id: 'taxonomy', name: lang === 'en' ? 'Taxonomy & Evolution' : 'Таксономия и Эволюция', shortName: lang === 'en' ? 'Taxonomy' : 'Таксономия' },
    { id: 'anatomy', name: lang === 'en' ? 'Anatomy & Morphology' : 'Анатомия и Морфология', shortName: lang === 'en' ? 'Anatomy' : 'Анатомия' },
    { id: 'ethogram', name: lang === 'en' ? 'Ethogram & Behavior' : 'Этограмма и Поведение', shortName: lang === 'en' ? 'Ethogram' : 'Этограмма' },
    { id: 'cognition', name: lang === 'en' ? 'Cognitive Science & Memory' : 'Когнитивистика и Память', shortName: lang === 'en' ? 'Cognition' : 'Когнитивистика' },
    { id: 'veterinary', name: lang === 'en' ? 'Veterinary & Medicine' : 'Ветеринария и Медицина', shortName: lang === 'en' ? 'Veterinary' : 'Ветеринария' },
    { id: 'ecology', name: lang === 'en' ? 'Ecology & Populations' : 'Экология и Популяции', shortName: lang === 'en' ? 'Ecology' : 'Экология' },
    { id: 'conservation', name: lang === 'en' ? 'Conservation & Protection' : 'Охрана и Сохранение видов', shortName: lang === 'en' ? 'Conservation' : 'Охрана' },
    { id: 'culture', name: lang === 'en' ? 'Anthrozoology & Culture' : 'История и Культура', shortName: lang === 'en' ? 'Culture' : 'Культура' },
    { id: 'paleontology', name: lang === 'en' ? 'Paleontology & Fossils' : 'Палеонтология и Ископаемые', shortName: lang === 'en' ? 'Paleontology' : 'Палеонтология' },
    { id: 'genomics', name: lang === 'en' ? 'Genomics & Genetics' : 'Геномика и Генетика', shortName: lang === 'en' ? 'Genomics' : 'Геномика' }
  ], [t, lang]);

  const evidenceLevels = useMemo(() => [
    { id: 'all', label: lang === 'en' ? 'Any evidence status' : 'Любой статус' },
    { id: 'established', label: `${t.evidence.established} (A1)` },
    { id: 'moderate', label: `${t.evidence.moderate} (A2)` },
    { id: 'limited', label: `${t.evidence.limited} (B)` },
    { id: 'hypothesis', label: `${t.evidence.hypothesis} (C)` }
  ], [t, lang]);

  const readingTimes = useMemo(() => [
    { id: 'all', label: lang === 'en' ? 'Any volume' : 'Любой объём' },
    { id: 'short', label: `< 10 ${t.catalog.readingTime} (${lang === 'en' ? 'Short' : 'Короткие'})` },
    { id: 'medium', label: `10–25 ${t.catalog.readingTime} (${lang === 'en' ? 'Medium' : 'Средние'})` },
    { id: 'long', label: `> 25 ${t.catalog.readingTime} (${lang === 'en' ? 'In-depth' : 'Фундаментальные'})` }
  ], [t, lang]);

  const sortOptions = useMemo(() => [
    { id: 'relevance', label: lang === 'en' ? 'By relevance' : 'По релевантности' },
    { id: 'title_asc', label: lang === 'en' ? 'By title (A–Z)' : 'По названию (А–Я)' },
    { id: 'time_asc', label: lang === 'en' ? 'By volume (shortest first)' : 'По объёму (сначала короткие)' },
    { id: 'time_desc', label: lang === 'en' ? 'By volume (deepest first)' : 'По объёму (сначала глубокие)' }
  ], [t, lang]);

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
      sorted.sort((a, b) => a.title.localeCompare(b.title, lang === 'en' ? 'en' : 'ru'));
    } else if (sortBy === 'time_asc') {
      sorted.sort((a, b) => (a.reading_time_min || 5) - (b.reading_time_min || 5));
    } else if (sortBy === 'time_desc') {
      sorted.sort((a, b) => (b.reading_time_min || 5) - (a.reading_time_min || 5));
    }

    return sorted;
  }, [articles, query, selectedCategory, selectedTag, selectedEvidence, selectedReadingTime, sortBy, lang]);

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
    return found ? found.name : (lang === 'en' ? 'Article' : 'Статья');
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
      aria-label={lang === 'en' ? 'Search encyclopedia' : 'Поиск по энциклопедии'}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 pb-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownResults}
        className="w-full max-w-3xl bg-[#F6F5F0] border border-[#DFDCD4] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 bg-[#EFECE6] border-b border-[#DFDCD4] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6E6B64] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={lang === 'en' ? 'Search terms, taxa, anatomy, or concepts...' : 'Поиск терминов, таксонов, анатомии или концептов...'}
            className="w-full bg-transparent text-[#141413] placeholder-[#6E6B64] text-sm sm:text-base focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#6E6B64] hover:text-[#141413] cursor-pointer"
              title={lang === 'en' ? 'Clear query' : 'Очистить'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`p-2 rounded-none border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
              showAdvancedFilters || hasAnyFilterActive
                ? 'bg-[#141413] text-[#F6F5F0] border-[#141413]'
                : 'bg-[#F6F5F0] text-[#141413] border-[#DFDCD4] hover:bg-[#E8E4DD]'
            }`}
            title={lang === 'en' ? 'Advanced filters' : 'Расширенные фильтры'}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Filters' : 'Фильтры'}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="bg-[#EFECE6] border-b border-[#DFDCD4] px-4 py-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E6B64]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">{lang === 'en' ? 'Disciplines:' : 'Дисциплина:'}</span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-[#1E4631] hover:underline cursor-pointer font-medium"
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
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-none text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#141413] text-[#F6F5F0] border-[#141413] font-bold'
                      : 'bg-[#F6F5F0] text-[#141413] hover:bg-[#E8E4DD] border-[#DFDCD4]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded-none font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#DFDCD4] text-[#6E6B64]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thematic Tags Section */}
        <div className="bg-[#EFECE6] border-b border-[#DFDCD4] p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[#6E6B64]">
              <Tag className="w-3 h-3 text-[#1E4631]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">{lang === 'en' ? 'Thematic tags:' : 'Тематические теги:'}</span>
            </div>
            {popularTags.length > 20 && (
              <button
                onClick={() => setExpandTags(prev => !prev)}
                className="text-[10px] text-[#6E6B64] hover:text-[#141413] transition-colors cursor-pointer font-medium"
              >
                {expandTags ? (lang === 'en' ? 'Collapse tags' : 'Свернуть теги') : (lang === 'en' ? `Show all (${popularTags.length})` : `Показать все (${popularTags.length})`)}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {(expandTags ? popularTags : popularTags.slice(0, 20)).map(tag => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-none transition-colors font-mono text-[11px] cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1E4631] text-[#F6F5F0] border-[#1E4631] font-bold'
                      : 'bg-[#F6F5F0] text-[#6E6B64] hover:text-[#141413] hover:bg-[#E8E4DD] border-[#DFDCD4]'
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
          <div className="p-3.5 bg-[#EFECE6] border-b border-[#DFDCD4] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] text-[#6E6B64] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E4631]" /> {lang === 'en' ? 'Evidence:' : 'Доказательность:'}
              </label>
              <select
                value={selectedEvidence}
                onChange={(e) => setSelectedEvidence(e.target.value)}
                className="w-full bg-[#F6F5F0] text-[#141413] border border-[#DFDCD4] rounded-none px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#141413] cursor-pointer"
              >
                {evidenceLevels.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#6E6B64] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1E4631]" /> {lang === 'en' ? 'Reading Time:' : 'Объём / Время чтения:'}
              </label>
              <select
                value={selectedReadingTime}
                onChange={(e) => setSelectedReadingTime(e.target.value)}
                className="w-full bg-[#F6F5F0] text-[#141413] border border-[#DFDCD4] rounded-none px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#141413] cursor-pointer"
              >
                {readingTimes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#6E6B64] font-medium flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1E4631]" /> {lang === 'en' ? 'Sort:' : 'Сортировка:'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#F6F5F0] text-[#141413] border border-[#DFDCD4] rounded-none px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#141413] cursor-pointer"
              >
                {sortOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results Info & Active Filter Badges Bar */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="px-4 py-2.5 bg-[#EFECE6] border-b border-[#DFDCD4] flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#6E6B64]"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#141413]">
              {lang === 'en' ? 'Articles found:' : 'Найдено статей:'} <strong className="text-[#1E4631] font-bold text-xs">{results.length}</strong> {lang === 'en' ? 'of' : 'из'} {articles.length}
            </span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-[#F6F5F0] text-[#141413] px-2 py-0.5 rounded-none border border-[#DFDCD4] font-medium">
                {getCategoryLabel(selectedCategory)}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-[#1E4631] cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {selectedTag && (
              <span className="inline-flex items-center gap-1 bg-[#1E4631]/10 text-[#1E4631] px-2 py-0.5 rounded-none border border-[#1E4631]/30 font-mono">
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:text-black cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {hasAnyFilterActive && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-[11px] text-[#6E6B64] hover:text-[#141413] transition-colors cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'en' ? 'Reset all' : 'Сбросить все'}</span>
            </button>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={resultsContainerRef}
          className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-[#DFDCD4]"
        >
          {results.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="flex justify-center mb-1">
                <HelpCircle className="w-10 h-10 text-[#6E6B64]" />
              </div>
              <p className="text-sm text-[#141413] font-semibold">{t.search.noResults}</p>
              <p className="text-xs text-[#6E6B64] max-w-md mx-auto leading-relaxed">
                {lang === 'en' ? 'Try changing keywords, selecting a different category, or resetting active filters.' : 'Попробуйте изменить поисковые слова, выбрать другую категорию или сбросить активные фильтры.'}
              </p>
              <button 
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-[#141413] hover:bg-[#1E4631] text-[#F6F5F0] rounded-none text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Reset all parameters' : 'Сбросить все параметры'}
              </button>
            </div>
          ) : (
            results.map((article, idx) => {
              const isKeyboardSelected = idx === selectedIndex;

              return (
                <div 
                  key={article.path}
                  data-result-index={idx}
                  onClick={() => handleSelectArticle(article.path)} 
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 pt-4 rounded-none cursor-pointer border transition-colors flex items-start justify-between gap-3 ${
                    isKeyboardSelected 
                      ? 'bg-[#EFECE6] border-[#141413]' 
                      : 'bg-[#F6F5F0] hover:bg-[#EFECE6] border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#141413] hover:text-[#1E4631] transition-colors">
                        {highlightMatch(article.title, query)}
                      </span>
                    </div>

                    {article.excerpt && (
                      <p className="text-xs text-[#6E6B64] line-clamp-2 leading-relaxed">
                        {highlightMatch(article.excerpt, query)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] text-[#6E6B64]">
                      <span className="font-semibold text-[#1E4631] uppercase">
                        {getCategoryLabel(article.category)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1 text-[#6E6B64]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="px-4 py-2 bg-[#EFECE6] border-t border-[#DFDCD4] flex items-center justify-between text-[10px] text-[#6E6B64]">
          <div className="flex items-center gap-3">
            <span>{lang === 'en' ? 'Use' : 'Используйте'} <kbd className="px-1.5 py-0.5 bg-[#F6F5F0] border border-[#DFDCD4] text-[#141413] font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-[#F6F5F0] border border-[#DFDCD4] text-[#141413] font-mono">↓</kbd> {lang === 'en' ? 'to navigate' : 'для навигации'}</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#F6F5F0] border border-[#DFDCD4] text-[#141413] font-mono">Enter</kbd> {lang === 'en' ? 'to open' : 'для открытия'}</span>
          </div>
          <span className="text-[#6E6B64] font-mono">{lang === 'en' ? 'Total articles:' : 'Всего статей:'} {articles.length}</span>
        </div>

      </div>
    </div>
  );
}
