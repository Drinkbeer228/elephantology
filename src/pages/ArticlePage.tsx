import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, List } from 'lucide-react';
import { getPreparedArticle } from '../services';
import {
  ArticleContentRenderer,
  ArticleMetadataHeader,
  KeyFindingsSection,
  EpistemicStatusSection,
  ReferencesSection,
  SequentialArticleNav,
  ArticleTocRail,
} from '../article';
import {
  ArticlePageSkeleton,
  Dialog,
  ErrorState,
} from '../design-system';
import { useLanguage } from '../i18n/LanguageContext';

export interface ArticlePageProps {
  articlePath: string;
  onBack: () => void;
  onSelectArticle: (path: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  articlePath,
  onBack,
  onSelectArticle,
}) => {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const preparedArticle = useMemo(
    () => getPreparedArticle(articlePath, lang, t),
    [articlePath, lang, t]
  );

  useEffect(() => {
    setLoading(true);
    setMobileTocOpen(false);
    const timer = window.setTimeout(() => setLoading(false), 35);
    return () => window.clearTimeout(timer);
  }, [articlePath]);

  useEffect(() => {
    if (preparedArticle?.title) {
      document.title = `${preparedArticle.title} — Слонология`;
    }
    return () => {
      document.title = 'Слонология — Научная база знаний о слонах и хоботных';
    };
  }, [preparedArticle]);

  if (loading) {
    return <ArticlePageSkeleton />;
  }

  if (!preparedArticle) {
    return (
      <div className="shell-container py-16">
        <ErrorState
          title={t.article.errorTitle}
          message={t.article.notFound}
          actionLabel={t.article.backToCatalog}
          onAction={onBack}
        />
      </div>
    );
  }

  const {
    category,
    categoryTitle,
    bodyMarkdown,
    toc,
    references,
    siblingArticles,
    currentIndexInCategory,
    prevArticle,
    nextArticle,
    keyFindings,
    confidenceLevel,
    reviewStatus,
    uncertaintyNotes,
    evidenceBasis,
  } = preparedArticle;

  return (
    <div className="shell-container py-8 sm:py-12">
      {/* Quiet Running Header — No Duplicated Article Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-8 border-b border-rule">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-secondary hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Систематический указатель</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted tabular-nums">
          <span className="text-forest font-medium">{categoryTitle}</span>
          {siblingArticles.length > 1 && currentIndexInCategory >= 0 && (
            <>
              <span>·</span>
              <span>
                Глава {String(currentIndexInCategory + 1).padStart(2, '0')} из{' '}
                {String(siblingArticles.length).padStart(2, '0')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Two-Column Reading Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <article className="lg:col-span-8 xl:col-span-8 min-w-0">
          <div className="reading-column">
            <ArticleMetadataHeader article={preparedArticle} />

            <KeyFindingsSection findings={keyFindings} />

            <ArticleContentRenderer
              bodyMarkdown={bodyMarkdown}
              references={references}
              category={category}
              onSelectArticle={onSelectArticle}
            />

            <EpistemicStatusSection
              confidenceLevel={confidenceLevel}
              reviewStatus={reviewStatus}
              uncertaintyNotes={uncertaintyNotes}
              evidenceBasis={evidenceBasis}
            />

            <ReferencesSection references={references} />

            <SequentialArticleNav
              prevArticle={prevArticle}
              nextArticle={nextArticle}
              onSelectArticle={onSelectArticle}
            />
          </div>
        </article>

        {/* Right Sticky Contextual Table of Contents */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-4">
          <ArticleTocRail
            toc={toc}
            categoryArticles={siblingArticles}
            currentArticlePath={preparedArticle.path}
            onSelectArticle={onSelectArticle}
            categoryLabel={categoryTitle}
          />
        </div>
      </div>

      {/* Mobile Floating TOC Trigger & Bottom Sheet */}
      {toc.length > 0 && (
        <div className="lg:hidden fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => setMobileTocOpen(true)}
            className="ui-btn ui-btn-primary h-9 px-3.5 text-xs shadow-sm"
          >
            <List className="w-3.5 h-3.5" />
            <span className="font-mono uppercase tracking-wider">{t.article.toc}</span>
          </button>
        </div>
      )}

      <Dialog
        isOpen={mobileTocOpen}
        onClose={() => setMobileTocOpen(false)}
        title={t.article.toc}
        variant="bottom-sheet"
      >
        <ul className="space-y-2">
          {toc.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setMobileTocOpen(false);
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full text-left py-1.5 text-sm font-sans text-ink-secondary hover:text-forest ${
                  item.level === 3 ? 'pl-4 text-xs' : 'font-medium text-ink'
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
};
