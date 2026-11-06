import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { getAllGlossaryEntries, getPreparedArticle } from '../services';
import { ArticleContentRenderer, ArticleTocRail } from '../article';
import { EmptyState, MetadataStrip } from '../design-system';
import { useLanguage } from '../i18n/LanguageContext';

export interface GlossaryPageProps {
  onBack: () => void;
  onSelectArticle: (path: string) => void;
}

export const GlossaryPage: React.FC<GlossaryPageProps> = ({
  onBack,
  onSelectArticle,
}) => {
  const { lang, t } = useLanguage();
  const [filterQuery, setFilterQuery] = useState('');

  const glossaryEntries = useMemo(() => getAllGlossaryEntries(), []);
  const preparedGlossaryDoc = useMemo(
    () => getPreparedArticle('glossary.md', lang, t),
    [lang, t]
  );

  const filteredEntries = useMemo(() => {
    if (!filterQuery.trim()) return glossaryEntries;
    const q = filterQuery.toLowerCase().trim();
    return glossaryEntries.filter((entry) => {
      const title = entry.fullRu.toLowerCase();
      const def = entry.defRu.toLowerCase();
      const cat = (entry.categoryRu || '').toLowerCase();
      return (
        entry.term.toLowerCase().includes(q) ||
        title.includes(q) ||
        def.includes(q) ||
        cat.includes(q) ||
        entry.key.toLowerCase().includes(q)
      );
    });
  }, [glossaryEntries, filterQuery]);

  useEffect(() => {
    document.title = `${t.nav.glossary} — Слонология`;
    return () => {
      document.title = 'Слонология — Научная база знаний о слонах и хоботных';
    };
  }, [t]);

  return (
    <div className="shell-container py-8 sm:py-12">
      {/* Top Running Header */}
      <div className="flex items-center justify-between gap-4 pb-5 mb-8 border-b border-rule">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-secondary hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Систематический указатель</span>
        </button>

        <span className="font-mono text-[11px] text-ink-muted tabular-nums">
          {glossaryEntries.length} аннотированных терминов
        </span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 min-w-0">
          <div className="reading-column">
            <header className="mb-8 pb-7 border-b border-rule-strong">
              <MetadataStrip
                items={[
                  {
                    label: 'Терминологический лексикон',
                    accent: true,
                  },
                  `${glossaryEntries.length} контекстных дефиниций`,
                ]}
                className="mb-3.5"
              />
              <h1 className="heading-display mb-3">
                {preparedGlossaryDoc?.title || t.nav.glossary}
              </h1>
              {preparedGlossaryDoc?.shouldShowLead && preparedGlossaryDoc?.excerpt && (
                <p className="font-serif italic text-base sm:text-lg text-ink-secondary leading-relaxed">
                  {preparedGlossaryDoc.excerpt}
                </p>
              )}
            </header>

            {/* Interactive Quick Lexicon Filter (No redundant category button bar) */}
            <section className="mb-12 pb-10 border-b border-rule">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h2 className="eyebrow-accent">
                  Индекс контекстных сносок
                </h2>
                <span className="font-mono text-[11px] text-ink-muted tabular-nums">
                  {filteredEntries.length} из {glossaryEntries.length}
                </span>
              </div>

              <div className="relative flex items-center mb-5">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Фильтр по анатомическим, генетическим и этологическим терминам..."
                  className="w-full bg-paper-elevated text-ink placeholder-ink-muted font-sans text-xs border border-rule-strong rounded focus:border-forest focus:outline-none py-2.5 pl-8 pr-8 transition-colors"
                />
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="absolute right-2.5 text-ink-muted hover:text-ink"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {filteredEntries.length === 0 ? (
                <EmptyState
                  title={t.search.noResults}
                  description={t.search.noResultsHint}
                  actionLabel={t.search.resetAll}
                  onAction={() => setFilterQuery('')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-rule rounded overflow-hidden">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="p-4 border-r border-b border-rule bg-paper-elevated"
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <h3 className="font-sans font-semibold text-sm text-ink">
                          {entry.fullRu}
                        </h3>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-forest shrink-0">
                          {entry.categoryRu}
                        </span>
                      </div>
                      <p className="font-serif text-[13.5px] text-ink-secondary leading-relaxed">
                        {entry.defRu}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Full Systematic Markdown Glossary */}
            {preparedGlossaryDoc && (
              <ArticleContentRenderer
                bodyMarkdown={preparedGlossaryDoc.bodyMarkdown}
                references={preparedGlossaryDoc.references}
                category="general"
                onSelectArticle={onSelectArticle}
              />
            )}
          </div>
        </div>

        {/* Right Sticky Table of Contents */}
        {preparedGlossaryDoc && (
          <div className="hidden lg:block lg:col-span-4">
            <ArticleTocRail
              toc={preparedGlossaryDoc.toc}
              currentArticlePath="glossary.md"
              onSelectArticle={onSelectArticle}
              categoryLabel={t.nav.glossary}
            />
          </div>
        )}
      </div>
    </div>
  );
};
