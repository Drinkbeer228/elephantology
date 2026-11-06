import React, { useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getPreparedArticle } from '../services';
import {
  ArticleContentRenderer,
  ArticleMetadataHeader,
  ArticleTocRail,
} from '../article';
import { ErrorState } from '../design-system';
import { useLanguage } from '../i18n/LanguageContext';

export interface BibliographyPageProps {
  onBack: () => void;
  onSelectArticle: (path: string) => void;
}

export const BibliographyPage: React.FC<BibliographyPageProps> = ({
  onBack,
  onSelectArticle,
}) => {
  const { lang, t } = useLanguage();

  const preparedBibliography = useMemo(
    () => getPreparedArticle('bibliography.md', lang, t),
    [lang, t]
  );

  useEffect(() => {
    document.title = `${t.nav.bibliography} — Слонология`;
    return () => {
      document.title = 'Слонология — Научная база знаний о слонах и хоботных';
    };
  }, [t]);

  if (!preparedBibliography) {
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

        <span className="font-mono text-[11px] text-ink-muted">
          DOI / Рецензируемый корпус источников
        </span>
      </div>

      {/* Main Two-Column Reading Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <article className="lg:col-span-8 min-w-0">
          <div className="reading-column">
            <ArticleMetadataHeader article={preparedBibliography} />

            <ArticleContentRenderer
              bodyMarkdown={preparedBibliography.bodyMarkdown}
              references={preparedBibliography.references}
              category={preparedBibliography.category}
              onSelectArticle={onSelectArticle}
            />
          </div>
        </article>

        <div className="hidden lg:block lg:col-span-4">
          <ArticleTocRail
            toc={preparedBibliography.toc}
            currentArticlePath="bibliography.md"
            onSelectArticle={onSelectArticle}
            categoryLabel={t.nav.bibliography}
          />
        </div>
      </div>
    </div>
  );
};
