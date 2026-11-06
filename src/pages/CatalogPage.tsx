import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { getCatalogDisciplines, queryKnowledgeBase } from '../services';
import { EmptyState } from '../design-system';
import { useLanguage } from '../i18n/LanguageContext';

export interface CatalogPageProps {
  onSelectArticle: (path: string) => void;
  onOpenSearch?: () => void;
  initialCategory?: string | null;
}

export function splitMonographTitle(rawTitle: string): {
  primary: string;
  subtitle: string | null;
} {
  const colonIdx = rawTitle.indexOf(':');
  if (colonIdx === -1 || colonIdx > rawTitle.length - 4) {
    return { primary: rawTitle.trim(), subtitle: null };
  }
  const primary = rawTitle.slice(0, colonIdx).trim();
  const rawSub = rawTitle.slice(colonIdx + 1).trim();
  const subtitle = rawSub ? rawSub.charAt(0).toUpperCase() + rawSub.slice(1) : null;
  return { primary, subtitle };
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onSelectArticle,
  initialCategory,
}) => {
  const { lang, t } = useLanguage();
  const [inlineQuery, setInlineQuery] = useState('');

  const disciplines = useMemo(() => getCatalogDisciplines(lang, t), [lang, t]);

  const totalArticlesCount = useMemo(
    () =>
      disciplines.reduce(
        (acc, d) => acc + d.articles.filter((a) => a.filename !== 'index.md').length,
        0
      ),
    [disciplines]
  );

  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      const el = document.getElementById(`category-${initialCategory}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [initialCategory]);

  const filteredSearchResults = useMemo(() => {
    if (!inlineQuery.trim()) return null;
    return queryKnowledgeBase(
      {
        query: inlineQuery,
      },
      lang,
      68
    );
  }, [inlineQuery, lang]);

  return (
    <div className="shell-container py-8 sm:py-12">
      {/* Editorial Colophon & Instant Corpus Filter */}
      <header className="pb-8 border-b border-rule-strong">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted mb-3">
              <span className="text-forest font-semibold">Ordo Proboscidea</span>
              <span>·</span>
              <span>Familia Elephantidae</span>
              <span>·</span>
              <span className="tabular-nums">
                {totalArticlesCount} монографий в {disciplines.length} разделах
              </span>
            </div>

            <h1 className="heading-display mb-3">
              Свод монографий по биологии хоботных
            </h1>

            <p className="font-serif text-base sm:text-[17px] text-ink-secondary leading-relaxed max-w-2xl">
              Академический корпус по эволюционной морфологии, гравипортальной биомеханике,
              нейрофизиологии, эндокринологии и популяционной экологии современных и вымерших
              представителей отряда.
            </p>
          </div>

          <div className="lg:col-span-5">
            <label
              htmlFor="corpus-live-filter"
              className="block font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2"
            >
              Быстрый фильтр по корпусу ({totalArticlesCount} статей)
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 pointer-events-none" />
              <input
                id="corpus-live-filter"
                type="text"
                value={inlineQuery}
                onChange={(e) => setInlineQuery(e.target.value)}
                placeholder="Поиск по темам, анатомии, таксонам, генам (TP53, EEHV)..."
                className="w-full h-10 pl-10 pr-9 bg-paper-elevated text-ink placeholder-ink-muted text-xs sm:text-sm font-sans border border-rule-strong rounded focus:outline-none focus:border-forest transition-colors"
              />
              {inlineQuery && (
                <button
                  type="button"
                  onClick={() => setInlineQuery('')}
                  aria-label="Очистить фильтр"
                  className="absolute right-2.5 p-1 text-ink-muted hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Live Filter Results OR 10-Section Monograph Index */}
      {filteredSearchResults ? (
        <section className="pt-6">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-rule">
            <span className="font-mono text-xs text-ink-secondary">
              Найдено монографий: <strong className="text-ink">{filteredSearchResults.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => setInlineQuery('')}
              className="font-mono text-xs text-forest hover:underline"
            >
              Сбросить фильтр
            </button>
          </div>

          {filteredSearchResults.length === 0 ? (
            <EmptyState
              title={t.search.noResults}
              description={t.search.noResultsHint}
              actionLabel={t.search.resetAll}
              onAction={() => setInlineQuery('')}
            />
          ) : (
            <div className="divide-y divide-rule border-b border-rule">
              {filteredSearchResults.map((article, idx) => {
                const { primary, subtitle } = splitMonographTitle(article.title);
                return (
                  <button
                    key={article.path}
                    type="button"
                    onClick={() => onSelectArticle(article.path)}
                    className="w-full text-left py-4 px-3 -mx-3 rounded hover:bg-paper-elevated transition-colors flex items-baseline justify-between gap-6 group"
                  >
                    <div className="flex items-baseline gap-4 min-w-0 flex-1">
                      <span className="font-mono text-xs tabular-nums text-ink-muted group-hover:text-forest shrink-0 w-8">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans text-[15px] font-medium text-ink group-hover:text-forest transition-colors leading-snug">
                          {primary}
                        </h3>
                        {subtitle && (
                          <p className="font-serif italic text-[13.5px] text-ink-secondary leading-snug mt-0.5">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-ink-muted tabular-nums">
                      {article.readingTime && <span>{article.readingTime}</span>}
                      <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-forest transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="divide-y divide-rule-strong">
          {disciplines.map((disc) => {
            const indexArticle = disc.articles.find((a) => a.filename === 'index.md');
            const regularArticles = disc.articles.filter((a) => a.filename !== 'index.md');

            return (
              <div
                key={disc.id}
                id={`category-${disc.id}`}
                className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start scroll-mt-16"
              >
                {/* Left Column: Sticky Section Identity */}
                <div className="lg:col-span-4 lg:sticky lg:top-20">
                  <div className="flex items-baseline gap-2.5 mb-2">
                    <span className="font-mono text-xs font-semibold text-forest tabular-nums">
                      {disc.indexNumber}
                    </span>
                    <h2 className="heading-section">{disc.title}</h2>
                  </div>

                  <p className="font-sans text-xs text-ink-secondary leading-relaxed mb-3">
                    {disc.description}
                  </p>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-ink-muted">
                    <span className="tabular-nums">{regularArticles.length} глав</span>
                    {indexArticle && (
                      <>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => onSelectArticle(indexArticle.path)}
                          className="inline-flex items-center gap-1 text-forest hover:underline font-medium"
                        >
                          <span>Синопсис раздела</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Structured Two-Tier Monograph Rows */}
                <div className="lg:col-span-8">
                  <div className="divide-y divide-rule border-t border-rule">
                    {regularArticles.map((article, aIdx) => {
                      const itemNum = `${disc.indexNumber}.${String(aIdx + 1).padStart(2, '0')}`;
                      const { primary, subtitle } = splitMonographTitle(article.title);

                      return (
                        <button
                          key={article.path}
                          type="button"
                          onClick={() => onSelectArticle(article.path)}
                          className="w-full text-left py-3.5 px-3 -mx-3 rounded hover:bg-paper-elevated transition-colors flex items-baseline justify-between gap-4 group"
                        >
                          <div className="flex items-baseline gap-4 min-w-0 flex-1">
                            <span className="font-mono text-xs tabular-nums text-ink-muted group-hover:text-forest transition-colors shrink-0 w-11">
                              {itemNum}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-sans text-[15px] font-medium text-ink group-hover:text-forest transition-colors leading-snug">
                                {primary}
                              </h3>
                              {subtitle && (
                                <p className="font-serif italic text-[13.5px] text-ink-secondary leading-snug mt-0.5">
                                  {subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
                            {article.readingTime && <span>{article.readingTime}</span>}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-forest transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

export const HomePage = CatalogPage;
