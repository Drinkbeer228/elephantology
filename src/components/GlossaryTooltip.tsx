import React, { useState, useRef, useEffect, useId } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import glossaryData from '../data/glossary.json';

interface GlossaryEntry {
  term: string;
  full: string;
  definition: {
    ru: string;
    en: string;
  };
  category: {
    ru: string;
    en: string;
  };
  annotate?: boolean;
}

const glossaryMap: Record<string, GlossaryEntry> = glossaryData as Record<string, GlossaryEntry>;

// Only active annotated terms
const activeAnnotatedKeys = Object.keys(glossaryMap).filter(
  (key) => glossaryMap[key].annotate === true
);

interface GlossaryTooltipProps {
  termKey: string;
  children: React.ReactNode;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ termKey, children }) => {
  const { isEn } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const entry = glossaryMap[termKey];
  if (!entry) {
    return <>{children}</>;
  }

  const fullTerm = entry.full;
  const def = isEn ? entry.definition.en : entry.definition.ru;
  const category = isEn ? entry.category.en : entry.category.ru;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  return (
    <span className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-expanded={isVisible}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline cursor-help text-inherit font-inherit border-b border-dotted border-kingdom-gold/70 hover:border-kingdom-gold focus:outline-none focus:ring-1 focus:ring-kingdom-gold/50 rounded-xs transition-colors px-0.5"
      >
        {children}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-[#181a24] text-gray-200 border border-[#3b3f54] rounded-lg shadow-xl text-left text-xs leading-normal animate-fade-in pointer-events-none"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
            <span className="font-bold text-kingdom-gold font-mono text-[11px]">{entry.term}</span>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{category}</span>
          </div>
          {fullTerm && fullTerm !== entry.term && (
            <div className="font-semibold text-gray-100 text-xs mb-1">{fullTerm}</div>
          )}
          <p className="text-gray-300 text-[11px] leading-relaxed m-0">{def}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#3b3f54]" />
        </div>
      )}
    </span>
  );
};

export function annotateTextWithGlossary(
  text: string,
  seenTermsSet: Set<string>
): React.ReactNode[] {
  if (!text || typeof text !== 'string') return [text];

  // If all curated terms were already seen in this article, return fast
  const availableKeys = activeAnnotatedKeys.filter((k) => !seenTermsSet.has(k));
  if (availableKeys.length === 0) return [text];

  // Match only whole words / boundary-sensitive tokens
  const pattern = new RegExp(
    `\\b(${availableKeys.map((k) => k.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('|')})\\b`,
    'g'
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const matchedTerm = match[1];
    const matchIndex = match.index;

    // Push preceding plain text
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    if (!seenTermsSet.has(matchedTerm)) {
      seenTermsSet.add(matchedTerm);
      parts.push(
        <GlossaryTooltip key={`${matchedTerm}-${matchIndex}`} termKey={matchedTerm}>
          {matchedTerm}
        </GlossaryTooltip>
      );
    } else {
      parts.push(matchedTerm);
    }

    lastIndex = matchIndex + matchedTerm.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
