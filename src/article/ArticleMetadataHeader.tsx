import React from 'react';
import { PreparedArticleDocument } from '../types';
import { MetadataStrip, MetadataStripItem } from '../design-system';
import { splitMonographTitle } from '../pages/CatalogPage';
import { useLanguage } from '../i18n/LanguageContext';

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
      <MetadataStrip items={metadataItems} className="mb-3.5" />

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
