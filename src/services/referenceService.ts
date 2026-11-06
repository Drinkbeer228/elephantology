import { StructuredReference, TocItem } from '../types';

/**
 * Content Service: Footnotes, DOI, Reference & Heading Processing
 * Decouples scientific reference normalization and TOC extraction from UI components.
 */

export function normalizeDoi(doiInput?: string | null): string | null {
  if (!doiInput || typeof doiInput !== 'string') return null;

  let cleaned = doiInput.trim();
  cleaned = cleaned.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
  cleaned = cleaned.replace(/^doi:\s*/i, '');
  cleaned = cleaned.trim();

  const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
  if (doiRegex.test(cleaned)) {
    return cleaned;
  }

  if (cleaned.startsWith('10.') && cleaned.includes('/')) {
    return cleaned;
  }

  return null;
}

export function formatDoiUrl(doiInput?: string | null): string | null {
  const clean = normalizeDoi(doiInput);
  if (!clean) return null;
  return `https://doi.org/${clean}`;
}

export function slugifyHeading(rawText: string): string {
  const cleaned = String(rawText)
    .replace(/(\*\*|\*|`|\[|\]|\([^)]*\))/g, '')
    .trim();
  return cleaned
    .toLowerCase()
    .replace(/[^\w\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function cleanArticleMarkdownBody(cleanContent: string): string {
  // 1. Remove redundant duplicate top-level H1 if present
  let bodyContent = cleanContent.replace(/^\s*#\s+[^\n]+\n+/, '');

  // 2. Normalize mechanical lead headings
  bodyContent = bodyContent.replace(/^##\s+Кратко\s*\(Lead\)\s*$/gm, '## Обзор темы');

  // 3. Strip decorative emojis and custom {#id} attributes from markdown headings
  bodyContent = bodyContent.replace(
    /^(#{2,4}\s+)(?:[📚📊⚖️🧬🦴🧠🩺🌿🛡️🏛️🫀🐘🔬]+\s*)+/gm,
    '$1'
  );
  bodyContent = bodyContent.replace(/^(#{2,4}\s+.+?)\s*\{\s*#[\w-]+\s*\}\s*$/gm, '$1');

  // 4. Remove empty trailing "## Литература" heading when followed only by footnote definitions [^1]:
  bodyContent = bodyContent.replace(
    /\n*---\s*\n+##\s+Литература\s*\n+(?=\[\^\d+\]:)/i,
    '\n\n'
  );
  bodyContent = bodyContent.replace(
    /\n+##\s+Литература\s*\n+(?=\[\^\d+\]:)/i,
    '\n\n'
  );

  return bodyContent;
}

export function extractTocFromMarkdown(markdownBody: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const extracted: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdownBody)) !== null) {
    const level = match[1].length;
    const rawText = match[2]
      .replace(/(\*\*|\*|`|\[|\]|\([^)]*\))/g, '')
      .trim();
    const id = slugifyHeading(rawText);
    if (rawText && id) {
      extracted.push({ id, text: rawText, level });
    }
  }

  return extracted;
}

export function buildEnrichedReferences(
  rawContent: string,
  baseReferences: StructuredReference[] = []
): StructuredReference[] {
  const footnoteMap: Record<string, string> = {};
  const fnRegex = /^\[\^(\d+)\]:\s*(.+)$/gm;
  let m: RegExpExecArray | null;

  while ((m = fnRegex.exec(rawContent)) !== null) {
    footnoteMap[m[1]] = m[2].trim();
  }

  if (baseReferences.length === 0 && Object.keys(footnoteMap).length > 0) {
    return Object.entries(footnoteMap).map(([num, text]) => {
      const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
      const cleanDoi = doiMatch
        ? normalizeDoi(doiMatch[0].replace(/[.,;)]+$/, '')) || undefined
        : undefined;
      return {
        id: `ref_${num}`,
        title: text.replace(/https?:\/\/doi\.org\/[^\s)]+/g, '').trim(),
        doi: cleanDoi,
      };
    });
  }

  return baseReferences.map((ref, idx) => {
    const num = String(idx + 1);
    const fnText = footnoteMap[num];
    const existingDoi = ref.doi ? normalizeDoi(ref.doi) || ref.doi : undefined;

    if (fnText && fnText.length > (ref.title?.length || 0)) {
      const doiMatch = fnText.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
      const extractedDoi = doiMatch
        ? normalizeDoi(doiMatch[0].replace(/[.,;)]+$/, '')) || undefined
        : undefined;
      return {
        ...ref,
        title: fnText.replace(/https?:\/\/doi\.org\/[^\s)]+/g, '').trim(),
        doi: existingDoi || extractedDoi,
      };
    }

    return {
      ...ref,
      doi: existingDoi,
    };
  });
}
