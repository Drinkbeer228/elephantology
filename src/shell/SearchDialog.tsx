import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { queryKnowledgeBase } from '../services';
import { Dialog, EmptyState } from '../design-system';
import { getCategoryMeta } from '../data/categories';
import { splitMonographTitle } from '../pages/CatalogPage';
import { useLanguage } from '../i18n/LanguageContext';

export interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (path: string) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  onSelectArticle,
}) => {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryMeta = useMemo(() => getCategoryMeta(t), [t]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 40);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    return queryKnowledgeBase(
      {
        query,
      },
      lang,
      25
    );
  }, [query, lang]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev - 1 + results.length) % results.length : 0
        );
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onSelectArticle(results[selectedIndex].path);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectArticle, onClose]);

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const cleanQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanQ})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.trim().toLowerCase() ? (
        <mark key={i} className="bg-forest-subtle text-forest font-medium px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
    >
      {/* Search Input Header */}
      <div className="flex items-center px-4 py-3.5 border-b border-rule gap-3">
        <Search className="w-4 h-4 text-ink-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Быстрый переход к монографии (термин, таксон, анатомия, DOI)..."
          className="flex-1 bg-transparent text-ink placeholder-ink-muted text-sm font-sans focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-ink-muted hover:text-ink p-1"
            aria-label="Очистить запрос"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] text-ink-muted hover:text-ink border border-rule rounded px-1.5 py-0.5"
        >
          ESC
        </button>
      </div>

      {/* Results List */}
      <div className="max-h-[60vh] overflow-y-auto divide-y divide-rule-subtle">
        {results.length === 0 ? (
          <EmptyState
            title={t.search.noResults}
            description={t.search.noResultsHint}
            actionLabel={t.search.resetAll}
            onAction={() => setQuery('')}
          />
        ) : (
          results.map((article, idx) => {
            const isSelected = idx === selectedIndex;
            const catTitle = categoryMeta[article.category]?.title || article.category;
            const { primary, subtitle } = splitMonographTitle(article.title);
            return (
              <button
                key={article.path}
                type="button"
                onClick={() => {
                  onSelectArticle(article.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-3 transition-colors flex items-baseline justify-between gap-4 ${
                  isSelected ? 'bg-paper-warm/80' : 'bg-paper-elevated hover:bg-paper-warm/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-ink-muted mb-0.5">
                    <span className="text-forest uppercase font-medium">{catTitle}</span>
                    {article.readingTime && (
                      <>
                        <span>·</span>
                        <span>{article.readingTime}</span>
                      </>
                    )}
                  </div>
                  <div className="font-sans font-medium text-sm text-ink leading-snug">
                    {highlightMatch(primary, query)}
                  </div>
                  {subtitle && (
                    <div className="font-serif italic text-xs text-ink-secondary leading-snug mt-0.5">
                      {highlightMatch(subtitle, query)}
                    </div>
                  )}
                </div>
                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 self-center transition-transform ${
                    isSelected ? 'text-forest translate-x-0.5' : 'text-ink-muted'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-paper border-t border-rule flex items-center justify-between font-mono text-[10px] text-ink-muted">
        <div className="flex items-center gap-4">
          <span>↑↓ выбор</span>
          <span>↵ открыть</span>
        </div>
        <span>
          {t.search.found}: {results.length}
        </span>
      </div>
    </Dialog>
  );
};
