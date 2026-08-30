import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  ArrowRight, 
  Tag, 
  HelpCircle, 
  SlidersHorizontal, 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  Scale, 
  AlertCircle, 
  Lightbulb,
  ListFilter
} from 'lucide-react';
import { searchArticles, ArticleItem, ARTICLE_SEMANTIC_TAGS } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';
import { useLanguage } from '../i18n/LanguageContext';

function highlightMatch(text: string, query: string) {
  if (!query.trim() || !text) return text;
  
  const tokens = query.toLowerCase().trim().split(/[\s,.;:!?\-\/]+/).filter(t => t.length > 1);
  if (tokens.length === 0) return text;

  // Escape regex special chars
  const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  const parts = text.split(regex);
  return parts.map((part, index) => {
    const isMatched = tokens.some(t => part.toLowerCase() === t.toLowerCase());
    return isMatched ? (
      <mark key={index} className="bg-amber-400/30 text-amber-200 font-semibold px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    );
  });
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
  ], [lang]);

  // Load articles
  useEffect(() => {
    try {
      setArticles(getStaticArticles(lang));
    } catch (e) {
      console.error('Failed to load articles in SearchModal:', e);
    }
  }, [lang]);

  // Event listener for opening modal with optional pre-selected tag, category, or query
  useEffect(() => {
    const handleToggle = (e: any) => {
      const shouldOpen = e.detail?.force !== undefined ? e.detail.force : !isOpen;
      setIsOpen(shouldOpen);
      if (e.detail?.tag) {
        setSelectedTag(e.detail.tag);
      }
      if (e.detail?.category) {
        setSelectedCategory(e.detail.category);
      }
      if (e.detail?.query) {
        setQuery(e.detail.query);
      }
      if (shouldOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    window.addEventListener('toggle-search', handleToggle);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      // Ctrl+K / Cmd+K to toggle search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-search', handleToggle);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 60);
      setSelectedIndex(-1);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Compute all unique tags with frequency counts
  const popularTags = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      const staticTags = ARTICLE_SEMANTIC_TAGS[a.path] || [];
      const allArticleTags = [...(a.tags || []), ...staticTags];
      allArticleTags.forEach(tTag => {
        const clean = tTag.trim().toLowerCase();
        if (clean.length > 2) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [articles]);

  // Count active ADVANCED filters specifically
  const activeAdvancedFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedEvidence !== 'all') count++;
    if (selectedReadingTime !== 'all') count++;
    if (sortBy !== 'relevance') count++;
    return count;
  }, [selectedEvidence, selectedReadingTime, sortBy]);

  const hasAnyFilterActive = useMemo(() => {
    return selectedCategory !== 'all' || 
           selectedTag !== null || 
           selectedEvidence !== 'all' || 
           selectedReadingTime !== 'all' || 
           sortBy !== 'relevance' || 
           query.trim().length > 0;
  }, [selectedCategory, selectedTag, selectedEvidence, selectedReadingTime, sortBy, query]);

  const resetAllFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setSelectedEvidence('all');
    setSelectedReadingTime('all');
    setSortBy('relevance');
    setSelectedIndex(-1);
  }, []);

  // Filter and Sort Engine
  const results = useMemo(() => {
    let list = articles;

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Tag Filter
    if (selectedTag) {
      const targetTag = selectedTag.toLowerCase();
      list = list.filter(a => {
        const staticTags = (ARTICLE_SEMANTIC_TAGS[a.path] || []).map(tTag => tTag.toLowerCase());
        const customTags = (a.tags || []).map(tTag => tTag.toLowerCase());
        return customTags.includes(targetTag) || staticTags.includes(targetTag) || staticTags.some(tTag => tTag.includes(targetTag));
      });
    }

    // 3. Evidence Level Filter
    if (selectedEvidence !== 'all') {
      list = list.filter(a => {
        const lvl = (a.evidenceLevel || a.evidence_level || '').toLowerCase();
        if (selectedEvidence === 'established') return lvl === 'established';
        if (selectedEvidence === 'moderate') return lvl === 'moderate';
        if (selectedEvidence === 'limited') return lvl === 'limited';
        if (selectedEvidence === 'hypothesis') return lvl === 'hypothesis';
        return true;
      });
    }

    // 4. Reading Time Filter
    if (selectedReadingTime !== 'all') {
      list = list.filter(a => {
        const time = a.reading_time_min || 10;
        if (selectedReadingTime === 'short') return time < 10;
        if (selectedReadingTime === 'medium') return time >= 10 && time <= 25;
        if (selectedReadingTime === 'long') return time > 25;
        return true;
      });
    }

    // 5. Query Search
    if (query.trim()) {
      list = searchArticles(list, query);
    }

    // 6. Sorting (if not default relevance or if query is empty)
    if (sortBy === 'title_asc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'time_asc') {
      list = [...list].sort((a, b) => (a.reading_time_min || 10) - (b.reading_time_min || 10));
    } else if (sortBy === 'time_desc') {
      list = [...list].sort((a, b) => (b.reading_time_min || 10) - (a.reading_time_min || 10));
    }

    return list;
  }, [articles, query, selectedCategory, selectedTag, selectedEvidence, selectedReadingTime, sortBy]);

  const handleSelectArticle = useCallback((path: string) => {
    const win = window as any;
    if (win.loadArticle) {
      win.loadArticle(path);
    } else {
      window.dispatchEvent(new CustomEvent('load-article', { detail: path }));
    }
    setIsOpen(false);
  }, []);

  // Keyboard navigation for results
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
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

  const renderEvidenceBadge = (level?: string) => {
    if (!level) return null;
    const l = level.toLowerCase();
    if (l === 'established') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
        <ShieldCheck className="w-3 h-3" /> A1 {t.evidence.established}
      </span>
    );
    if (l === 'moderate') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
        <Scale className="w-3 h-3" /> A2 {t.evidence.moderate}
      </span>
    );
    if (l === 'limited') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
        <AlertCircle className="w-3 h-3" /> B {t.evidence.limited}
      </span>
    );
    if (l === 'hypothesis') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
        <Lightbulb className="w-3 h-3" /> C {t.evidence.hypothesis}
      </span>
    );
    return null;
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="search-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99996] flex items-start justify-center pt-4 sm:pt-10 md:pt-14 px-3 sm:px-4 animate-fade-in"
      style={{ isolation: 'isolate' }}
    >
      <div 
        id="search-modal-window"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.search.placeholder}
        className="bg-[#151720] border border-[#2e3244] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[86vh] relative z-10"
      >
        
        {/* Search Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#2e3244] flex items-center gap-3 bg-[#111218]">
          <Search className="w-5 h-5 text-kingdom-gold shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder={t.search.placeholder} 
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm sm:text-base font-medium"
          />

          {query && (
            <button 
              id="btn-clear-search-query"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={lang === 'en' ? 'Clear query' : 'Очистить поисковый запрос'}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            id="btn-toggle-advanced-filters"
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showAdvancedFilters || activeAdvancedFiltersCount > 0
                ? 'bg-kingdom-gold/15 text-kingdom-gold border-kingdom-gold/40 shadow-sm'
                : 'bg-[#1f222e] text-gray-300 hover:text-white border-white/10'
            }`}
            title={lang === 'en' ? 'Filter settings' : 'Параметры фильтрации'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Filters' : 'Фильтры'}</span>
            {activeAdvancedFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-kingdom-gold text-black text-[10px] font-extrabold flex items-center justify-center">
                {activeAdvancedFiltersCount}
              </span>
            )}
          </button>

          <button 
            id="btn-close-search-modal"
            onClick={() => setIsOpen(false)} 
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-[#1f222e] hover:bg-[#282c3c] border border-white/10 rounded-xl transition-all cursor-pointer font-medium"
          >
            Esc
          </button>
        </div>

        {/* Category Filter Section - Clean Wrapping Blocks */}
        <div className="bg-[#13151c] border-b border-white/5 p-3 sm:p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-kingdom-gold" /> {lang === 'en' ? 'Categories' : 'Категории'}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">({disciplines.length - 1})</span>
            </div>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] text-kingdom-gold hover:underline transition-colors cursor-pointer font-medium"
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-kingdom-gold text-black font-bold border-kingdom-gold shadow-sm'
                      : 'bg-[#1b1e29] text-gray-300 hover:text-white hover:bg-[#252938] border-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-black/25 text-black font-bold' : 'bg-white/10 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thematic Tags Section - Clean Wrapping Blocks */}
        <div className="bg-[#101217] border-b border-white/5 p-3 sm:p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Tag className="w-3 h-3 text-kingdom-gold/70" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">{lang === 'en' ? 'Thematic tags:' : 'Тематические теги:'}</span>
            </div>
            {popularTags.length > 20 && (
              <button
                onClick={() => setExpandTags(prev => !prev)}
                className="text-[10px] text-gray-400 hover:text-kingdom-gold transition-colors cursor-pointer font-medium"
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
                  className={`px-2.5 py-1 rounded-md transition-all font-mono text-[11px] cursor-pointer border ${
                    isSelected
                      ? 'bg-kingdom-gold text-black font-bold border-kingdom-gold shadow-sm'
                      : 'bg-[#181a23] text-gray-400 hover:text-kingdom-gold hover:bg-[#222532] border-white/5'
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
          <div className="p-3.5 bg-[#14161f] border-b border-[#2e3244] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            {/* Evidence Level */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {lang === 'en' ? 'Evidence:' : 'Доказательность:'}
              </label>
              <select
                value={selectedEvidence}
                onChange={(e) => setSelectedEvidence(e.target.value)}
                className="w-full bg-[#1e212d] text-gray-200 border border-[#34384a] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-kingdom-gold cursor-pointer"
              >
                {evidenceLevels.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                ))}
              </select>
            </div>

            {/* Reading Time */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {lang === 'en' ? 'Reading Time:' : 'Объём / Время чтения:'}
              </label>
              <select
                value={selectedReadingTime}
                onChange={(e) => setSelectedReadingTime(e.target.value)}
                className="w-full bg-[#1e212d] text-gray-200 border border-[#34384a] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-kingdom-gold cursor-pointer"
              >
                {readingTimes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.label}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-kingdom-gold" /> {lang === 'en' ? 'Sort:' : 'Сортировка:'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#1e212d] text-gray-200 border border-[#34384a] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-kingdom-gold cursor-pointer"
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
          className="px-4 py-2.5 bg-[#0e1015] border-b border-white/5 flex items-center justify-between flex-wrap gap-2 text-[11px] text-gray-400"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-300">
              {lang === 'en' ? 'Articles found:' : 'Найдено статей:'} <strong className="text-kingdom-gold font-bold text-xs">{results.length}</strong> {lang === 'en' ? 'of' : 'из'} {articles.length}
            </span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 bg-[#222634] text-kingdom-gold px-2.5 py-0.5 rounded-lg border border-kingdom-gold/30 font-medium">
                {getCategoryLabel(selectedCategory)}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {selectedTag && (
              <span className="inline-flex items-center gap-1 bg-kingdom-gold/15 text-kingdom-gold px-2 py-0.5 rounded-md border border-kingdom-gold/30 font-mono">
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {selectedEvidence !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-[#222634] text-gray-200 px-2 py-0.5 rounded-md border border-white/10">
                {evidenceLevels.find(l => l.id === selectedEvidence)?.label}
                <button onClick={() => setSelectedEvidence('all')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}

            {selectedReadingTime !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-[#222634] text-gray-200 px-2 py-0.5 rounded-md border border-white/10">
                {readingTimes.find(l => l.id === selectedReadingTime)?.label}
                <button onClick={() => setSelectedReadingTime('all')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {hasAnyFilterActive && (
            <button
              id="btn-reset-all-filters"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-kingdom-gold transition-colors cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'en' ? 'Reset all' : 'Сбросить все'}</span>
            </button>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={resultsContainerRef}
          className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-[#2d3142] scrollbar-track-transparent"
        >
          {results.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="flex justify-center mb-1">
                <HelpCircle className="w-10 h-10 text-rose-400/70" />
              </div>
              <p className="text-sm text-gray-200 font-semibold">{t.search.noResults}</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                {lang === 'en' ? 'Try changing keywords, selecting a different category, or resetting active filters.' : 'Попробуйте изменить поисковые слова, выбрать другую категорию или сбросить активные фильтры.'}
              </p>
              <button 
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-[#202330] hover:bg-[#2a2e40] text-kingdom-gold border border-[#34384a] rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Reset all parameters' : 'Сбросить все параметры'}
              </button>
            </div>
          ) : (
            results.map((article, idx) => {
              const staticTags = ARTICLE_SEMANTIC_TAGS[article.path] || [];
              const displayTags = Array.from(new Set([...(article.tags || []), ...staticTags])).slice(0, 4);
              const isKeyboardSelected = idx === selectedIndex;

              return (
                <div 
                  key={article.path}
                  onClick={() => handleSelectArticle(article.path)} 
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 pt-4 rounded-xl cursor-pointer border transition-all group flex items-start justify-between gap-3 ${
                    isKeyboardSelected 
                      ? 'bg-[#222533] border-kingdom-gold/50 shadow-md ring-1 ring-kingdom-gold/20' 
                      : 'bg-[#181a24]/70 hover:bg-[#1f2230] border-transparent hover:border-kingdom-gold/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-kingdom-gold transition-colors flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-kingdom-gold shrink-0" />
                        {highlightMatch(article.title, query)}
                      </span>
                    </div>

                    {article.excerpt && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {highlightMatch(article.excerpt, query)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-kingdom-gold/90 bg-kingdom-gold/10 px-2 py-0.5 rounded border border-kingdom-gold/20">
                        {getCategoryLabel(article.category)}
                      </span>

                      {renderEvidenceBadge(article.evidenceLevel || article.evidence_level)}

                      {article.readingTime && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {article.readingTime}
                        </span>
                      )}

                      {displayTags.map((tTag, tIdx) => (
                        <span key={tIdx} className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                          #{tTag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 pt-1 text-gray-500 group-hover:text-kingdom-gold group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="px-4 py-2 bg-[#0c0e12] border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>{lang === 'en' ? 'Use' : 'Используйте'} <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 font-mono">↓</kbd> {lang === 'en' ? 'to navigate' : 'для навигации'}</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 font-mono">Enter</kbd> {lang === 'en' ? 'to open' : 'для открытия'}</span>
          </div>
          <span className="text-gray-400 font-mono">{lang === 'en' ? 'Total articles:' : 'Всего статей:'} {articles.length}</span>
        </div>

      </div>
    </div>
  );
}
