import React from 'react';
import { PreparedArticleDocument } from '../types';
import { MetadataStrip, MetadataStripItem } from '../design-system';
import { splitMonographTitle } from '../pages/CatalogPage';
import { useLanguage } from '../i18n/LanguageContext';
import { BookOpen } from 'lucide-react';
import { libraryBookUrl } from './libraryLink';

interface ArticleMetadataHeaderProps {
  article: PreparedArticleDocument;
}

export const ArticleMetadataHeader: React.FC<ArticleMetadataHeaderProps> = ({ article }) => {
  const { t } = useLanguage();

  const getEvidenceLabel = (level?: string) => {
    switch (level) {
      case 'established':
      case 'high':
        return t.article.evidenceHigh;
      case 'moderate':
        return t.article.evidenceModerate;
      case 'preliminary':
      case 'limited':
      case 'hypothesis':
        return t.article.evidencePreliminary;
      default:
        return t.article.evidenceHigh;
    }
  };

  const metadataItems: Array<MetadataStripItem | string | null | undefined | false> = [
    {
      label: article.categoryTitle,
      accent: true,
    },
    {
      label: getEvidenceLabel(article.evidenceLevel),
      tooltip: t.article.evidenceHighDesc,
    },
    article.readingTime,
    article.lastReviewed ? `${t.article.reviewed}: ${article.lastReviewed}` : null,
  ];

  const { primary, subtitle } = splitMonographTitle(article.title);

  return (
    <header className="mb-8 pb-7 border-b border-rule-strong">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3.5">
        <MetadataStrip items={metadataItems} />
        <a href={libraryBookUrl(article.path)} className="ui-btn ui-btn-secondary h-8 px-3 text-xs">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.article.readAsBook}</span>
        </a>
      </div>

      <h1 className="heading-display mb-2.5">{primary}</h1>

      {subtitle ? (
        <p className="font-serif italic text-lg sm:text-[21px] text-ink-secondary leading-snug mt-3">
          {subtitle}
        </p>
      ) : (
        article.shouldShowLead &&
        article.excerpt && (
          <p className="font-serif italic text-lg sm:text-[20px] text-ink-secondary leading-snug mt-3">
            {article.excerpt}
          </p>
        )
      )}
    </header>
  );
};
