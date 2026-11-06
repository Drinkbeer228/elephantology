import React, { useMemo } from 'react';
import { getGlossaryEntryByKey, segmentTextWithGlossary } from '../services/glossaryService';
import { TooltipPopover } from '../design-system';
import { useLanguage } from '../i18n/LanguageContext';

interface SingleTermTriggerProps {
  matchedText: string;
  termKey: string;
}

const SingleTermTrigger: React.FC<SingleTermTriggerProps> = ({ matchedText, termKey }) => {
  const { isEn } = useLanguage();
  const entry = getGlossaryEntryByKey(termKey);

  if (!entry) return <>{matchedText}</>;

  const fullTitle = isEn ? entry.fullEn : entry.fullRu;
  const definition = isEn ? entry.defEn : entry.defRu;
  const category = isEn ? entry.categoryEn : entry.categoryRu;

  return (
    <TooltipPopover
      widthClassName="w-72 sm:w-80"
      trigger={({ toggle, onFocus, onBlur, ariaDescribedBy }) => (
        <button
          type="button"
          onClick={toggle}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-describedby={ariaDescribedBy}
          className="article-glossary-trigger"
        >
          {matchedText}
        </button>
      )}
      content={() => (
        <span className="block">
          <span className="flex items-baseline justify-between gap-2 mb-1.5 pb-1.5 border-b border-rule">
            <span className="font-sans font-semibold text-sm text-ink">{fullTitle}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-forest shrink-0">
              {category}
            </span>
          </span>
          <span className="block font-serif text-xs text-ink-secondary leading-relaxed">
            {definition}
          </span>
        </span>
      )}
    />
  );
};

export const GlossaryTextSegment: React.FC<{ text: string }> = ({ text }) => {
  const segments = useMemo(() => segmentTextWithGlossary(text), [text]);

  if (segments.length === 1 && segments[0].type === 'text') {
    return <>{text}</>;
  }

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === 'term' && segment.termKey ? (
          <SingleTermTrigger
            key={`${segment.termKey}-${index}`}
            matchedText={segment.value}
            termKey={segment.termKey}
          />
        ) : (
          <React.Fragment key={index}>{segment.value}</React.Fragment>
        )
      )}
    </>
  );
};

export const annotateChildrenWithGlossary = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return <GlossaryTextSegment text={child} />;
    }
    return child;
  });
};
