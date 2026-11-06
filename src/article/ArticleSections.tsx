import React from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import {
  ArticleSummary,
  ConfidenceLevel,
  ReviewStatus,
  StructuredReference,
} from '../types';
import { formatDoiUrl } from '../services/referenceService';
import { splitMonographTitle } from '../pages/CatalogPage';
import { useLanguage } from '../i18n/LanguageContext';

export const KeyFindingsSection: React.FC<{ findings?: string[] }> = ({ findings }) => {
  const { t } = useLanguage();
  if (!findings || findings.length === 0) return null;

  return (
    <section
      id="key-findings"
      className="my-7 p-5 rounded bg-paper-elevated border border-rule scroll-mt-24"
    >
      <h2 className="eyebrow-accent mb-3">{t.article.keyFindings}</h2>
      <ol className="space-y-2 list-decimal list-inside font-sans text-sm text-ink leading-relaxed">
        {findings.map((finding, idx) => (
          <li key={idx} className="pl-1">
            <span className="text-ink">{finding}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export const EpistemicStatusSection: React.FC<{
  confidenceLevel?: ConfidenceLevel;
  reviewStatus?: ReviewStatus;
  uncertaintyNotes?: string;
  evidenceBasis?: string[];
}> = ({ confidenceLevel, reviewStatus, uncertaintyNotes, evidenceBasis }) => {
  const { t } = useLanguage();

  if (!confidenceLevel && !reviewStatus && !uncertaintyNotes) return null;

  const confidenceLabel =
    confidenceLevel === 'high'
      ? t.article.confidenceHigh
      : confidenceLevel === 'moderate'
      ? t.article.confidenceModerate
      : t.article.confidenceLow;

  const reviewLabel =
    reviewStatus === 'verified'
      ? t.article.reviewVerified
      : reviewStatus === 'reviewed'
      ? t.article.reviewReviewed
      : t.article.reviewDraft;

  return (
    <section
      id="evidence-status"
      className="my-10 pt-6 border-t border-rule scroll-mt-24"
    >
      <div className="mb-3">
        <span className="eyebrow-label block mb-0.5">{t.article.evidenceBasisLabel}</span>
        <h2 className="heading-section">{t.article.epistemicTitle}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-ink-secondary py-2.5 border-y border-rule-subtle mb-3">
        {confidenceLevel && <span className="text-forest font-medium">{confidenceLabel}</span>}
        {reviewStatus && (
          <>
            <span className="text-rule-strong">·</span>
            <span>{reviewLabel}</span>
          </>
        )}
        {evidenceBasis && evidenceBasis.length > 0 && (
          <>
            <span className="text-rule-strong">·</span>
            <span>{evidenceBasis.join(', ')}</span>
          </>
        )}
      </div>

      {uncertaintyNotes && (
        <div className="p-4 rounded bg-paper-warm border border-rule">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            {t.article.uncertaintyTitle}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {uncertaintyNotes}
          </p>
        </div>
      )}
    </section>
  );
};

export const ReferencesSection: React.FC<{ references: StructuredReference[] }> = ({
  references,
}) => {
  const { t } = useLanguage();
  if (!references || references.length === 0) return null;

  return (
    <section
      id="references-section"
      className="mt-12 pt-8 border-t border-rule scroll-mt-24"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="heading-section">{t.article.referencesTitle}</h2>
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          [{references.length}]
        </span>
      </div>

      <ol className="divide-y divide-rule-subtle border-t border-rule-subtle">
        {references.map((ref, index) => {
          const num = index + 1;
          const doiUrl = formatDoiUrl(ref.doi);
          return (
            <li
              key={ref.id || num}
              id={`ref_${num}`}
              className="py-3 flex items-baseline gap-3 text-xs sm:text-sm font-sans text-ink-secondary leading-relaxed transition-colors scroll-mt-28"
            >
              <span className="font-mono text-xs tabular-nums text-forest font-medium shrink-0 w-7">
                [{num}]
              </span>
              <div className="flex-1 min-w-0">
                {ref.authors && (
                  <span className="font-medium text-ink">
                    {ref.authors} {ref.year ? `(${ref.year}). ` : '. '}
                  </span>
                )}
                <span className="text-ink">{ref.title}</span>
                {(ref.journal || ref.book || ref.source) && (
                  <span className="italic text-ink-secondary font-serif">
                    {' '}
                    — {ref.journal || ref.book || ref.source}.
                  </span>
                )}
                {doiUrl && (
                  <a
                    href={doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-2 font-mono text-[11px] text-forest hover:underline break-all"
                  >
                    <span>DOI: {ref.doi}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export const RelatedArticlesSection: React.FC<{
  relatedArticles: ArticleSummary[];
  onSelectArticle: (path: string) => void;
}> = ({ relatedArticles, onSelectArticle }) => {
  const { t } = useLanguage();
  if (!relatedArticles || relatedArticles.length === 0) return null;

  return (
    <section className="mt-10 pt-6 border-t border-rule">
      <div className="mb-3">
        <h2 className="heading-section">{t.article.relatedTitle}</h2>
      </div>

      <div className="divide-y divide-rule border-y border-rule">
        {relatedArticles.map((article, idx) => {
          const { primary } = splitMonographTitle(article.title);
          return (
            <button
              key={article.path}
              type="button"
              onClick={() => onSelectArticle(article.path)}
              className="w-full py-3 flex items-baseline justify-between gap-4 text-left group hover:bg-paper-elevated px-2.5 -mx-2.5 rounded transition-colors"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-mono text-xs tabular-nums text-ink-muted group-hover:text-forest shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-sans text-sm font-medium text-ink group-hover:text-forest transition-colors truncate">
                  {primary}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
                {article.readingTime && <span>{article.readingTime}</span>}
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-forest group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const SequentialArticleNav: React.FC<{
  prevArticle: ArticleSummary | null;
  nextArticle: ArticleSummary | null;
  onSelectArticle: (path: string) => void;
}> = ({ prevArticle, nextArticle, onSelectArticle }) => {
  const { t } = useLanguage();
  if (!prevArticle && !nextArticle) return null;

  const prevSplit = prevArticle ? splitMonographTitle(prevArticle.title) : null;
  const nextSplit = nextArticle ? splitMonographTitle(nextArticle.title) : null;

  return (
    <nav
      aria-label="Навигация по главам раздела"
      className="mt-12 pt-8 border-t border-rule-strong grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {prevArticle && prevSplit ? (
        <button
          type="button"
          onClick={() => onSelectArticle(prevArticle.path)}
          className="group p-4 rounded bg-paper-elevated border border-rule hover:border-rule-strong text-left transition-colors"
        >
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            {t.article.prevArticle}
          </span>
          <span className="block font-sans font-medium text-sm text-ink group-hover:text-forest transition-colors leading-snug">
            {prevSplit.primary}
          </span>
        </button>
      ) : (
        <div />
      )}

      {nextArticle && nextSplit ? (
        <button
          type="button"
          onClick={() => onSelectArticle(nextArticle.path)}
          className="group p-4 rounded bg-paper-elevated border border-rule hover:border-rule-strong text-right transition-colors"
        >
          <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] text-ink-muted mb-1.5">
            {t.article.nextArticle}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="block font-sans font-medium text-sm text-ink group-hover:text-forest transition-colors leading-snug">
            {nextSplit.primary}
          </span>
        </button>
      ) : (
        <div />
      )}
    </nav>
  );
};
