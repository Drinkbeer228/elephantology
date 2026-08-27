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
  Check
} from 'lucide-react';
import { searchArticles, ArticleItem, ARTICLE_SEMANTIC_TAGS } from '../lib/searchEngine';
import { getStaticArticles } from '../lib/articles';

const DISCIPLINES = [
  { id: 'all', name: 'Все дисциплины' },
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

const EVIDENCE_LEVELS = [
  { id: 'all', label: 'Любой статус' },
  { id: 'established', label: 'Хорошо установлено (A1)' },
  { id: 'moderate', label: 'Достаточная база (A2)' },
  { id: 'limited', label: 'Ограниченные данные (B)' },
  { id: 'hypothesis', label: 'Гипотеза / Дискуссионно (C)' }
];

const READING_TIMES = [
  { id: 'all', label: 'Любой объём' },
  { id: 'short', label: '< 10 мин (Короткие)' },
  { id: 'medium', label: '10–25 мин (Средние)' },
  { id: 'long', label: '> 25 мин (Фундаментальные)' }
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'По релевантности' },
  { id: 'title_asc', label: 'По названию (А–Я)' },
  { id: 'time_asc', label: 'По объёму (сначала короткие)' },
  { id: 'time_desc', label: 'По объёму (сначала глубокие)' }
];

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string>('all');
  const [selectedReadingTime, setSelectedReadingTime] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load articles
  useEffect(() => {
    try {
      setArticles(getStaticArticles());
    } catch (e) {
      console.error('Failed to load articles in SearchModal:', e);
    }
  }, []);

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
      if (e.key === 'Escape') {
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
      allArticleTags.forEach(t => {
        const clean = t.trim().toLowerCase();
        if (clean.length > 2) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([tag]) => tag);
  }, [articles]);

  // Check how many filters are active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedTag) count++;
    if (selectedEvidence !== 'all') count++;
    if (selectedReadingTime !== 'all') count++;
    if (sortBy !== 'relevance') count++;
    return count;
  }, [selectedCategory, selectedTag, selectedEvidence, selectedReadingTime, sortBy]);

  const resetAllFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setSelectedEvidence('all');
    setSelectedReadingTime('all');
    setSortBy('relevance');
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
        const staticTags = (ARTICLE_SEMANTIC_TAGS[a.path] || []).map(t => t.toLowerCase());
        const customTags = (a.tags || []).map(t => t.toLowerCase());
        return customTags.includes(targetTag) || staticTags.includes(targetTag) || staticTags.some(t => t.includes(targetTag));
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

  const handleSelectArticle = (path: string) => {
    const win = window as any;
    if (win.loadArticle) {
      win.loadArticle(path);
    } else {
      window.dispatchEvent(new CustomEvent('load-article', { detail: path }));
    }
    setIsOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    const found = DISCIPLINES.find(d => d.id === category?.toLowerCase());
    return found ? found.name : 'Статья';
  };

  const renderEvidenceBadge = (level?: string) => {
    if (!level) return null;
    const l = level.toLowerCase();
    if (l === 'established') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
        <ShieldCheck className="w-3 h-3" /> A1
      </span>
    );
    if (l === 'moderate') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
        <Scale className="w-3 h-3" /> A2
      </span>
    );
    if (l === 'limited') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
        <AlertCircle className="w-3 h-3" /> B
      </span>
    );
    if (l === 'hypothesis') return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
        <Lightbulb className="w-3 h-3" /> C
      </span>
    );
    return null;
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99996] flex items-start justify-center pt-8 sm:pt-14 px-3 sm:px-4 animate-fade-in"
      style={{ isolation: 'isolate' }}
    >
      <div className="bg-[#181a22] border border-[#34384a] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] relative z-10">
        
        {/* Search Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#34384a] flex items-center gap-3 bg-[#13141a]">
          <Search className="w-5 h-5 text-kingdom-gold shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск статей: термины, гены, авторы, синонимы..." 
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm sm:text-base font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Очистить запрос"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-kingdom-gold/15 text-kingdom-gold border-kingdom-gold/40'
                : 'bg-[#242733] text-gray-400 hover:text-white border-white/10'
            }`}
            title="Параметры фильтрации"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-kingdom-gold text-black text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1.5 bg-[#242733] border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
        
        {/* Discipline Filter Row (Scrollable Pills) */}
        <div className="px-3.5 py-2.5 bg-[#14161d] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-gray-500 shrink-0 font-medium mr-1">Дисциплина:</span>
          {DISCIPLINES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? articles.length 
              : articles.filter(a => a.category?.toLowerCase() === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-kingdom-gold text-black font-bold shadow-sm'
                    : 'bg-[#222530] text-gray-300 hover:text-white hover:bg-[#2c303f] border border-white/5'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Popular Tags Row */}
        <div className="px-3.5 py-2 bg-[#121319] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-gray-500 shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3 text-kingdom-gold/70" /> Теги:
          </span>
          {popularTags.map(tag => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-md transition-all shrink-0 font-mono text-[11px] cursor-pointer ${
                  isSelected
                    ? 'bg-kingdom-gold text-black font-bold shadow-sm'
                    : 'bg-[#1e202a] text-gray-400 hover:text-kingdom-gold hover:bg-[#272b38] border border-white/5'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {/* Expanded Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="p-3.5 bg-[#161822] border-b border-[#34384a] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            {/* Evidence Level */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-medium">Доказательность:</label>
              <select
                value={selectedEvidence}
                onChange={(e) => setSelectedEvidence(e.target.value)}
                className="w-full bg-[#202330] text-gray-200 border border-[#34384a] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-kingdom-gold"
              >
                {EVIDENCE_LEVELS.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                ))}
              </select>
            </div>

            {/* Reading Time */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-medium">Объём / Время чтения:</label>
              <select
                value={selectedReadingTime}
                onChange={(e) => setSelectedReadingTime(e.target.value)}
                className="w-full bg-[#202330] text-gray-200 border border-[#34384a] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-kingdom-gold"
              >
                {READING_TIMES.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.label}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-medium">Сортировка:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#202330] text-gray-200 border border-[#34384a] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-kingdom-gold"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results Info & Active Filter Badges Bar */}
        <div className="px-4 py-2 bg-[#101217] border-b border-white/5 flex items-center justify-between flex-wrap gap-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Найдено статей: <strong className="text-kingdom-gold font-bold">{results.length}</strong> из {articles.length}</span>
            {selectedTag && (
              <span className="inline-flex items-center gap-1 bg-kingdom-gold/15 text-kingdom-gold px-2 py-0.5 rounded-md border border-kingdom-gold/30 font-mono">
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-[#242733] text-gray-200 px-2 py-0.5 rounded-md border border-white/10">
                {getCategoryLabel(selectedCategory)}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedEvidence !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-[#242733] text-gray-200 px-2 py-0.5 rounded-md border border-white/10">
                {EVIDENCE_LEVELS.find(l => l.id === selectedEvidence)?.label}
                <button onClick={() => setSelectedEvidence('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {(activeFiltersCount > 0 || query) && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-kingdom-gold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить фильтры</span>
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="flex justify-center mb-1">
                <HelpCircle className="w-10 h-10 text-rose-400/70" />
              </div>
              <p className="text-sm text-gray-200 font-semibold">Статей по заданным критериям не найдено.</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Попробуйте изменить поисковые слова, выбрать другую дисциплину или сбросить активные фильтры.
              </p>
              <button 
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-[#242733] hover:bg-[#2f3343] text-kingdom-gold border border-[#34384a] rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить все параметры
              </button>
            </div>
          ) : (
            results.map(article => {
              const staticTags = ARTICLE_SEMANTIC_TAGS[article.path] || [];
              const displayTags = Array.from(new Set([...(article.tags || []), ...staticTags])).slice(0, 4);

              return (
                <div 
                  key={article.path}
                  onClick={() => handleSelectArticle(article.path)} 
                  className="p-3.5 pt-4 bg-[#1e202a]/60 hover:bg-[#252836] rounded-xl cursor-pointer border border-transparent hover:border-kingdom-gold/30 transition-all group flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-kingdom-gold transition-colors flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-kingdom-gold shrink-0" />
                        {article.title}
                      </span>
                    </div>

                    {article.excerpt && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {article.excerpt}
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

                      {displayTags.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                          #{t}
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

      </div>
    </div>
  );
}
