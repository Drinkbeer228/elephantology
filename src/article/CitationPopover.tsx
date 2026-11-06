import React from 'react';
import { StructuredReference } from '../types';
import { formatDoiUrl } from '../services/referenceService';
import { TooltipPopover } from '../design-system';

interface CitationPopoverProps {
  citationNumber: string;
  reference?: StructuredReference;
  href: string;
}

export const CitationPopover: React.FC<CitationPopoverProps> = ({
  citationNumber,
  reference,
  href,
}) => {
  const handleScrollToReference = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element =
      document.getElementById(targetId) ||
      document.getElementById(`ref_${citationNumber}`) ||
      document.getElementById(`ref-${citationNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-paper-warm');
      window.setTimeout(() => element.classList.remove('bg-paper-warm'), 1600);
    }
  };

  if (!reference) {
    return (
      <a
        href={href}
        onClick={handleScrollToReference}
        className="article-citation-badge"
        aria-label={`Citation ${citationNumber}`}
      >
        [{citationNumber}]
      </a>
    );
  }

  const doiUrl = formatDoiUrl(reference.doi);

  return (
    <TooltipPopover
      widthClassName="w-80 sm:w-96"
      trigger={({ onFocus, onBlur, ariaDescribedBy }) => (
        <a
          href={href}
          onClick={handleScrollToReference}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-describedby={ariaDescribedBy}
          className="article-citation-badge"
          aria-label={`Citation ${citationNumber}`}
        >
          [{citationNumber}]
        </a>
      )}
      content={() => (
        <span className="block">
          <span className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-rule">
            <span className="font-mono text-[11px] font-semibold text-forest">
              [{citationNumber}] {reference.authors || ''}{' '}
              {reference.year ? `(${reference.year})` : ''}
            </span>
            {doiUrl && (
              <a
                href={doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-forest hover:underline shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                DOI ↗
              </a>
            )}
          </span>
          <span className="block font-sans text-xs text-ink-secondary leading-relaxed line-clamp-4">
            {reference.title}
          </span>
        </span>
      )}
    />
  );
};
