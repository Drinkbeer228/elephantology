import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import {
  ChevronRight,
  BookOpen,
  Quote,
  Layers,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  X,
  ZoomIn,
  List,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { parseFrontmatter } from '../lib/markdown';
import { MODULES_CACHE, getStaticArticles, resolveArticlePath } from '../lib/articles';
import { useLanguage } from '../i18n/LanguageContext';
import { ARTICLE_TRANSLATIONS_EN } from '../lib/articleTranslations';
import { translateMarkdownToEnglish } from '../lib/translateMarkdown';
import { CATEGORY_MAP_RU, CATEGORY_MAP_EN } from '../data/categories';
import { ArticleMetadata, ReferenceItem } from '../types';
import { annotateTextWithGlossary } from './GlossaryTooltip';
import { normalizeDoi, formatDoiUrl } from '../lib/doi';

declare global {
  interface Window {
    loadArticle?: (path: string) => void;
    currentArticlePath?: string;
    __PRERENDERED_ARTICLE__?: string;
  }
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\{#.*?\}/g, '')
    .replace(/[*_`]/g, '')
    .replace(/[^\w\u0400-\u04FF\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

interface ArticleViewerProps {
  path: string;
  onBack: () => void;
}

export interface ReferenceInfo {
  id: string;
  num?: number;
  authors?: string;
  year?: string | number;
  title?: string;
  journal?: string;
  book?: string;
  doi?: string;
  isbn?: string;
  rawText?: string;
}

export function parseFootnoteDefinitions(rawText: string): Map<string, ReferenceInfo> {
  const map = new Map<string, ReferenceInfo>();
  if (!rawText) return map;

  const regex = /^\[\^([^\]]+)\]:\s*([\s\S]*?)(?=\n\[\^|\n##|\n---|\Z)/gm;
  let match;
  let autoIndex = 1;

  while ((match = regex.exec(rawText)) !== null) {
    const rawId = match[1].trim();
    const content = match[2].trim().replace(/\s+/g, ' ');

    let authors: string | undefined;
    let year: string | undefined;
    let title: string | undefined;
    let publication: string | undefined;
    let doi: string | undefined;

    const doiMatch = content.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
    if (doiMatch) {
      doi = doiMatch[0];
    }

    const apaMatch = content.match(/^([^()]+)\s*\(([12][0-9]{3}[a-z]?)\)\.?\s*([^.]+)\.?\s*(.*)$/);
    if (apaMatch) {
      authors = apaMatch[1].trim();
      year = apaMatch[2].trim();
      title = apaMatch[3].trim().replace(/^\*+|\*+$/g, '');
      publication = apaMatch[4].trim();
    } else {
      title = content;
    }

    const refInfo: ReferenceInfo = {
      id: rawId,
      num: autoIndex,
      authors,
      year,
      title: title || content,
      journal: publication,
      doi,
      rawText: content
    };

    map.set(rawId, refInfo);
    map.set(rawId.toLowerCase(), refInfo);
    map.set(rawId.replace(/^ref_/, ''), refInfo);
    map.set(String(autoIndex), refInfo);
    map.set(`ref_${autoIndex}`, refInfo);
    autoIndex++;
  }

  return map;
}

function extractNodeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractNodeText).join('');
  if (React.isValidElement(node)) return extractNodeText((node.props as any)?.children);
  return '';
}

const TAXON_REGEX = /\b((?:Deinotherium|Prodeinotherium|Chilgatherium|Elephas|Loxodonta|Mammuthus|Palaeoloxodon|Stegodon|Stegolophodon|Gomphotherium|Platybelodon|Amebelodon|Mammut|Cuvieronius|Notiomastodon|Anancus|Moeritherium|Barytherium|Numidotherium|Phosphatherium|Eritherium|Phiomia|Choerolophodon|Sinomastodon|Zygolophodon|Eozygodon|Stegotetrabelodon|Primelephas|Hesperoloxodon|Dugong|Trichechus|Procavia|Heterohyrax|Dendrohyrax|Hydrodamalis|Clostridium)(?:\s+[a-z]{3,20}(?:\s+[a-z]{3,20})?)?|Elephantidae|Elephantinae|Deinotheriidae|Gomphotheriidae|Mammutidae|Stegodontidae|Proboscidea|Sirenia|Afrotheria)\b/g;

export function formatTaxaInText(text: string): React.ReactNode[] {
  if (!text || typeof text !== 'string') return [text];
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(TAXON_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const matchedTaxon = match[1];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    parts.push(
      <em key={`taxon-${matchIndex}-${matchedTaxon}`} className="italic font-serif font-normal text-[#1E4631]">
        {matchedTaxon}
      </em>
    );

    lastIndex = matchIndex + matchedTaxon.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface CitationInfo {
  num: number;
  href: string;
  id?: string;
  rawKey: string;
  element: React.ReactElement;
}

function extractCitationInfo(node: React.ReactNode): CitationInfo | null {
  if (!React.isValidElement(node)) return null;

  const nodeProps = node.props as any;
  const isSup = node.type === 'sup' || nodeProps?.node?.tagName === 'sup' || (typeof nodeProps?.className === 'string' && nodeProps.className.includes('align-super'));
  if (!isSup) return null;

  const inner = nodeProps?.children;
  if (!inner) return null;

  let aElement: React.ReactElement | null = null;
  if (React.isValidElement(inner)) {
    aElement = inner;
  } else if (Array.isArray(inner)) {
    for (const c of inner) {
      if (React.isValidElement(c)) {
        aElement = c;
        break;
      }
    }
  }

  if (!aElement) return null;

  const aProps = (aElement.props as any) || {};
  const href: string = aProps.href || '';
  if (!href.startsWith('#')) return null;

  const numMatch = href.match(/fn-([0-9]+)/) || (typeof aProps.children === 'string' ? aProps.children.match(/([0-9]+)/) : null);
  const rawKey = href.replace(/^#/, '').replace(/^user-content-fn-/, '').replace(/^fn-/, '');

  if (!numMatch && !rawKey) return null;

  const num = numMatch ? parseInt(numMatch[1], 10) : 1;

  return {
    num: isNaN(num) ? 1 : num,
    href,
    id: aProps.id,
    rawKey,
    element: aElement
  };
}

export interface CitationTriggerData {
  num: number;
  rawKey: string;
  href: string;
  rect: DOMRect;
}

function collapseCitationNodes(
  nodes: React.ReactNode[],
  onTrigger?: (data: CitationTriggerData) => void,
  onHoverEnd?: () => void
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let currentGroup: Array<CitationInfo> = [];
  let groupIndex = 0;

  const makeCitationBadge = (item: CitationInfo, key: string, displayLabel?: string) => {
    return (
      <button
        key={key}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onTrigger) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onTrigger({ num: item.num, rawKey: item.rawKey, href: item.href, rect });
          }
        }}
        onMouseEnter={(e) => {
          if (onTrigger) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onTrigger({ num: item.num, rawKey: item.rawKey, href: item.href, rect });
          }
        }}
        onMouseLeave={onHoverEnd}
        className="font-mono font-semibold px-0.5 py-0.5 rounded-none text-[11px] text-[#1E4631] hover:text-[#141413] hover:bg-[#1E4631]/10 transition-all cursor-pointer leading-none"
        title={`Источник [${item.num}]`}
        aria-label={`Источник [${item.num}]`}
      >
        {displayLabel || item.num}
      </button>
    );
  };

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    if (currentGroup.length === 1) {
      const single = currentGroup[0];
      result.push(
        <sup
          key={`cite-single-${single.num}-${result.length}`}
          className="inline-flex items-center text-[11px] font-mono font-medium px-1.5 py-0.5 mx-0.5 rounded-none bg-[#EFECE6] border border-[#DFDCD4] text-[#1E4631] select-none align-super hover:border-[#141413] transition-all"
        >
          <span className="text-[#6E6B64] font-bold mr-0.5">[</span>
          {makeCitationBadge(single, `single-badge-${single.num}`)}
          <span className="text-[#6E6B64] font-bold ml-0.5">]</span>
        </sup>
      );
      currentGroup = [];
      return;
    }

    groupIndex += 1;
    const sorted = [...currentGroup].sort((a, b) => a.num - b.num);

    const ranges: Array<Array<CitationInfo>> = [];
    let curRange = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (cur.num === prev.num + 1) {
        curRange.push(cur);
      } else {
        ranges.push(curRange);
        curRange = [cur];
      }
    }
    ranges.push(curRange);

    const badgeElements: React.ReactNode[] = [];
    ranges.forEach((range, rIdx) => {
      if (rIdx > 0) {
        badgeElements.push(<span key={`sep-${groupIndex}-${rIdx}`} className="text-[#6E6B64] mx-0.5 font-bold">, </span>);
      }

      if (range.length >= 3) {
        const start = range[0];
        const end = range[range.length - 1];
        badgeElements.push(
          <span key={`range-${groupIndex}-${start.num}-${end.num}`} className="inline-flex items-center">
            {makeCitationBadge(start, `range-start-${groupIndex}-${start.num}`)}
            <span className="text-[#6E6B64] px-0.5 font-bold">–</span>
            {makeCitationBadge(end, `range-end-${groupIndex}-${end.num}`)}
          </span>
        );
      } else {
        range.forEach((item, itemIdx) => {
          if (itemIdx > 0) {
            badgeElements.push(<span key={`sep-inner-${groupIndex}-${rIdx}-${itemIdx}`} className="text-[#6E6B64] mx-0.5 font-bold">, </span>);
          }
          badgeElements.push(makeCitationBadge(item, `badge-${groupIndex}-${item.num}-${itemIdx}`));
        });
      }
    });

    result.push(
      <sup
        key={`grouped-sup-${currentGroup.map(g => g.num).join('-')}-${groupIndex}-${result.length}`}
        className="inline-flex items-center text-[11px] font-mono font-medium px-1.5 py-0.5 mx-0.5 rounded-none bg-[#EFECE6] border border-[#DFDCD4] text-[#1E4631] select-none align-super hover:border-[#141413] transition-all"
      >
        <span className="text-[#6E6B64] font-bold mr-0.5">[</span>
        {badgeElements}
        <span className="text-[#6E6B64] font-bold ml-0.5">]</span>
      </sup>
    );

    currentGroup = [];
  };

  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];

    if (typeof child === 'string' && child.trim() === '') {
      continue;
    }

    const citeInfo = extractCitationInfo(child);
    if (citeInfo) {
      currentGroup.push(citeInfo);
    } else {
      flushGroup();
      result.push(child);
    }
  }

  flushGroup();
  return result;
}

function isBackrefElement(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false;
  const props = (child.props as any) || {};
  return (
    props['data-footnote-backref'] !== undefined ||
    (typeof props.className === 'string' && props.className.includes('footnote-backref')) ||
    (typeof props.href === 'string' && props.href.includes('-fnref-'))
  );
}

function collectBackrefElements(content: React.ReactNode, accumulator: React.ReactElement[] = []): React.ReactElement[] {
  if (!content) return accumulator;

  if (Array.isArray(content)) {
    content.forEach((item) => collectBackrefElements(item, accumulator));
  } else if (React.isValidElement(content)) {
    if (isBackrefElement(content)) {
      accumulator.push(content);
    }
    const inner = (content.props as any)?.children;
    if (inner) {
      collectBackrefElements(inner, accumulator);
    }
  }
  return accumulator;
}

function consolidateFootnoteItem(content: React.ReactNode, isEn: boolean): React.ReactNode {
  if (!content) return content;

  const allBackrefs = collectBackrefElements(content);
  if (allBackrefs.length === 0) return content;

  const handleJumpToMention = (e: React.MouseEvent, originalHref: string) => {
    if (originalHref.startsWith('#')) {
      e.preventDefault();
      const targetId = originalHref.slice(1);
      const targetEl =
        document.getElementById(targetId) ||
        document.getElementById(targetId.replace(/^user-content-/, '')) ||
        document.getElementById(`user-content-${targetId}`) ||
        document.querySelector(`[name="${targetId}"]`) ||
        document.querySelector(`[name="${targetId.replace(/^user-content-/, '')}"]`);

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const targetSup = targetEl.closest('sup') || targetEl;
        targetSup.classList.add(
          'ring-2',
          'ring-[#1E4631]',
          'bg-[#1E4631]/20'
        );
        const parentParagraph = targetEl.closest('p');
        if (parentParagraph) {
          parentParagraph.classList.add('bg-[#1E4631]/10', 'ring-1', 'ring-[#1E4631]/30');
        }
        setTimeout(() => {
          targetSup.classList.remove(
            'ring-2',
            'ring-[#1E4631]',
            'bg-[#1E4631]/20'
          );
          if (parentParagraph) {
            parentParagraph.classList.remove('bg-[#1E4631]/10', 'ring-1', 'ring-[#1E4631]/30');
          }
        }, 2500);
      }
    }
  };

  const removeBackrefs = (node: React.ReactNode): React.ReactNode => {
    if (!node) return node;
    if (Array.isArray(node)) {
      return node.map(removeBackrefs).filter(Boolean);
    }
    if (React.isValidElement(node)) {
      if (isBackrefElement(node)) {
        return null;
      }
      const children = (node.props as any)?.children;
      if (children) {
        return React.cloneElement(node, {
          children: removeBackrefs(children)
        } as any);
      }
    }
    return node;
  };

  const cleanedContent = removeBackrefs(content);

  if (allBackrefs.length === 1) {
    const originalHref = (allBackrefs[0].props as any)?.href || '';
    return (
      <div className="w-full text-xs text-[#141413] leading-relaxed">
        <span className="inline leading-relaxed break-words">{cleanedContent}</span>
        <a
          href={originalHref}
          data-footnote-backref="true"
          title={isEn ? 'Jump to cited location in article text' : 'Перейти к месту цитирования в тексте статьи'}
          onClick={(e) => handleJumpToMention(e, originalHref)}
          className="inline-flex items-center justify-center w-5 h-5 ml-2 text-[#1E4631] hover:text-[#141413] font-sans text-xs font-bold rounded-none bg-[#EFECE6] hover:bg-[#DFDCD4] border border-[#DFDCD4] transition-all cursor-pointer no-underline select-none align-middle"
        >
          ↑
        </a>
      </div>
    );
  }

  return (
    <div className="w-full text-xs text-[#141413] leading-relaxed">
      <span className="inline leading-relaxed break-words">{cleanedContent}</span>
      <span className="inline-flex flex-wrap items-center gap-1 text-xs ml-2 select-none align-middle py-0.5">
        <span className="text-[#1E4631] font-bold text-xs select-none mr-0.5">↑</span>
        {allBackrefs.map((br, idx) => {
          const originalHref: string = (br.props as any)?.href || '';
          return (
            <a
              key={`backref-num-${idx}`}
              href={originalHref}
              data-footnote-backref="true"
              title={isEn ? `Jump to mention #${idx + 1} in article text` : `Перейти к месту цитирования #${idx + 1} в тексте статьи`}
              onClick={(e) => handleJumpToMention(e, originalHref)}
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-none bg-[#EFECE6] hover:bg-[#DFDCD4] border border-[#DFDCD4] text-[#1E4631] hover:text-[#141413] font-mono text-[11px] font-bold transition-all cursor-pointer no-underline"
            >
              {idx + 1}
            </a>
          );
        })}
      </span>
    </div>
  );
}

export function ArticleViewer({ path, onBack }: ArticleViewerProps) {
  const { t, lang, isEn } = useLanguage();
  const [content, setContent] = useState<string>('');
  const [rawContent, setRawContent] = useState<string>('');
  const [meta, setMeta] = useState<ArticleMetadata>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  const [mobileArticlesOpen, setMobileArticlesOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
        setMobileTocOpen(false);
        setMobileArticlesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categoryDict = isEn ? CATEGORY_MAP_EN : CATEGORY_MAP_RU;

  const [rawKeyFindings, setRawKeyFindings] = useState<string | null>(null);
  const [rawUncertainty, setRawUncertainty] = useState<{ known?: string; probable?: string; unknown?: string } | null>(null);
  const [rawCleanBody, setRawCleanBody] = useState<string>('');

  const safePath = path.endsWith('.md') ? path : `${path}.md`;
  const cleanPath = safePath.replace(/^\//, '');
  const pathPart = cleanPath.replace(/\.md$/, '');
  const translationKey = pathPart.replace(/^docs\//, '');
  const translationData = ARTICLE_TRANSLATIONS_EN[translationKey];

  const { prevArticle, nextArticle } = useMemo(() => {
    try {
      const allArticles = getStaticArticles(lang);
      const sorted = [...allArticles].sort((a, b) => {
        if (a.category === b.category) {
          return a.title.localeCompare(b.title);
        }
        return (a.category || '').localeCompare(b.category || '');
      });

      const currentIndex = sorted.findIndex(a => {
        const aClean = a.path.replace(/\.md$/, '');
        return aClean === pathPart || a.path.includes(pathPart);
      });

      if (currentIndex >= 0) {
        return {
          prevArticle: currentIndex > 0 ? sorted[currentIndex - 1] : null,
          nextArticle: currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null
        };
      }
    } catch (e) {
      console.warn('Failed to compute neighbor articles:', e);
    }
    return { prevArticle: null, nextArticle: null };
  }, [lang, pathPart]);

  const relatedArticles = useMemo(() => {
    try {
      const allArticles = getStaticArticles(lang);
      const categoryMatches = allArticles.filter(
        a => a.category?.toLowerCase() === meta.category?.toLowerCase() &&
             a.path.replace(/\.md$/, '') !== pathPart
      );

      let relatedList = categoryMatches;
      if (relatedList.length < 3) {
        const tagMatches = allArticles.filter(a => {
          if (a.path.replace(/\.md$/, '') === pathPart) return false;
          if (categoryMatches.some(cm => cm.path === a.path)) return false;
          const myTags = meta.tags || [];
          const otherTags = a.tags || [];
          return myTags.some((tTag: string) => otherTags.includes(tTag));
        });
        relatedList = [...relatedList, ...tagMatches];
      }

      return relatedList.slice(0, 3);
    } catch {
      return [];
    }
  }, [lang, meta.category, meta.tags, pathPart]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const moduleKeys = Object.keys(MODULES_CACHE);
      const matchedKey = resolveArticlePath(path, moduleKeys);

      if (matchedKey && MODULES_CACHE[matchedKey]) {
        const contentObj = MODULES_CACHE[matchedKey];
        const textContent = typeof contentObj === 'string' ? contentObj : (contentObj as { default?: string }).default || '';
        const { metadata, content: rawMd } = parseFrontmatter(textContent);

        let processedContent = rawMd;
        let extractedKeyFindings: string | null = null;
        const keyFindingsMatch = processedContent.match(/##\s*(?:📊\s*)?(?:Ключевые сведения|Ключевые показатели|Ключевые метрики|Ключевые палеонтологические метрики|Ключевые геномные|Key Insights|Key Findings|Key Metrics)[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
        if (keyFindingsMatch) {
          extractedKeyFindings = keyFindingsMatch[1].trim();
          processedContent = processedContent.replace(keyFindingsMatch[0], '');
        }

        let extractedUncertainty: { known?: string; probable?: string; unknown?: string } | null = null;
        const uncertaintyMatch = processedContent.match(/##\s*(?:⚖️\s*)?(?:Научная неопределённость|Границы научного знания|Неопределённость|Scientific Uncertainty|Epistemic Status)[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
        if (uncertaintyMatch) {
          const uncText = uncertaintyMatch[1];
          const knownMatch = uncText.match(/(?:Известно|Достоверно|Known)[:\s]+([^\n]+(?:\n(?!Вероятно|Неизвестно|Probable|Unknown|-|\*)[^\n]+)*)/i);
          const probableMatch = uncText.match(/(?:Вероятно|Гипотезы|Probable)[:\s]+([^\n]+(?:\n(?!Неизвестно|Известно|Unknown|Known|-|\*)[^\n]+)*)/i);
          const unknownMatch = uncText.match(/(?:Неизвестно|Открытые вопросы|Unknown)[:\s]+([^\n]+(?:\n(?!Известно|Вероятно|Known|Probable|-|\*)[^\n]+)*)/i);
          
          if (knownMatch || probableMatch || unknownMatch) {
            extractedUncertainty = {
              known: knownMatch ? knownMatch[1].trim() : undefined,
              probable: probableMatch ? probableMatch[1].trim() : undefined,
              unknown: unknownMatch ? unknownMatch[1].trim() : undefined
            };
          }
          processedContent = processedContent.replace(uncertaintyMatch[0], '');
        }

        processedContent = processedContent.replace(/^#\s+[^\n]+\n+/, '');

        const relatedSectionMatch = processedContent.match(/##\s*(?:Связанные знания|Связанные материалы|Связанные темы|Related Topics|Related Articles)[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
        if (relatedSectionMatch) {
          processedContent = processedContent.replace(relatedSectionMatch[0], '');
        }

        processedContent = processedContent.replace(/>\s*\*\*Уровень доказательности:\*\*\s*\[[^\]]+\]\s*\n?/gi, '');
        processedContent = processedContent.replace(/>\s*\*\*Evidence Level:\*\*\s*\[[^\]]+\]\s*\n?/gi, '');
        processedContent = processedContent.replace(/##\s*(?:📚\s*)?(?:Литература|Список литературы|Библиография|References|Bibliography)[^\n]*\s*(?=\n\s*\[\^|\n*$)/gi, '');
        processedContent = processedContent.replace(/##\s*Редакционный стандарт[^\n]*\n[\s\S]*?(?:\n---\n|\n(?=#+\s))/i, '\n');

        setMeta(metadata);
        setRawKeyFindings(extractedKeyFindings);
        setRawUncertainty(extractedUncertainty);
        setRawCleanBody(processedContent.trim());
        setRawContent(processedContent.trim());
        setLoading(false);
      } else {
        setError(`Article not found: ${path}`);
        setLoading(false);
      }
    } catch (e: unknown) {
      console.error('Error loading article:', e);
      const msg = e instanceof Error ? e.message : 'Error reading article';
      setError(msg);
      setLoading(false);
    }
  }, [path]);

  const displayTitle = useMemo(() => {
    if (isEn && translationData?.title) {
      return translationData.title;
    }
    return meta.title || '';
  }, [isEn, translationData, meta.title]);

  const displayExcerpt = useMemo(() => {
    const raw = (isEn && translationData?.excerpt) ? translationData.excerpt : (meta.excerpt || '');
    return raw.replace(/\s+\d+(?=[.,;:])/g, '').trim();
  }, [isEn, translationData, meta.excerpt]);

  const displayKeyFindings = useMemo(() => {
    if (!rawKeyFindings) return null;
    return isEn ? translateMarkdownToEnglish(rawKeyFindings) : rawKeyFindings;
  }, [isEn, rawKeyFindings]);

  const displayUncertainty = useMemo(() => {
    if (!rawUncertainty) return null;
    if (!isEn) return rawUncertainty;
    return {
      known: rawUncertainty.known ? translateMarkdownToEnglish(rawUncertainty.known) : undefined,
      probable: rawUncertainty.probable ? translateMarkdownToEnglish(rawUncertainty.probable) : undefined,
      unknown: rawUncertainty.unknown ? translateMarkdownToEnglish(rawUncertainty.unknown) : undefined
    };
  }, [isEn, rawUncertainty]);

  const displayCleanBody = useMemo(() => {
    if (!rawCleanBody) return '';
    return isEn ? translateMarkdownToEnglish(rawCleanBody) : rawCleanBody;
  }, [isEn, rawCleanBody]);

  const categoryArticles = useMemo(() => {
    if (!meta.category) return [];
    const catKey = meta.category.toLowerCase();
    const all = getStaticArticles(lang);
    return all.filter(a => a.category?.toLowerCase() === catKey);
  }, [lang, meta.category]);

  const tocItems: TocItem[] = useMemo(() => {
    if (!displayCleanBody) return [];
    const lines = displayCleanBody.split('\n');
    const items: TocItem[] = [];
    const counts = new Map<string, number>();

    for (const line of lines) {
      const trimmed = line.trim();
      const h2Match = trimmed.match(/^##\s+([^#].*)$/);
      const h3Match = trimmed.match(/^###\s+([^#].*)$/);

      if (h2Match || h3Match) {
        const isH2 = Boolean(h2Match);
        const rawText = (isH2 ? h2Match![1] : h3Match![1])
          .replace(/\{#.*?\}/g, '')
          .replace(/[*_`]/g, '')
          .trim();

        if (!rawText) continue;
        const baseSlug = slugifyHeading(rawText);
        const count = counts.get(baseSlug) || 0;
        counts.set(baseSlug, count + 1);
        const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;

        items.push({
          id,
          text: rawText,
          level: isH2 ? 2 : 3
        });
      }
    }
    return items;
  }, [displayCleanBody]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const headingElements = Array.from(document.querySelectorAll<HTMLElement>('.academic-article-prose h2, .academic-article-prose h3'));
    headingElements.forEach((el, index) => {
      if (tocItems[index]) {
        el.id = tocItems[index].id;
        el.classList.add('scroll-mt-24');
      }
    });

    const handleHeadingTracking = () => {
      const scrollPosition = window.scrollY + 140;
      let currentId = '';

      for (const heading of headingElements) {
        if (heading.offsetTop <= scrollPosition) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      if (currentId) {
        setActiveHeadingId(currentId);
      } else if (headingElements[0]) {
        setActiveHeadingId(headingElements[0].id);
      }
    };

    window.addEventListener('scroll', handleHeadingTracking, { passive: true });
    handleHeadingTracking();
    return () => window.removeEventListener('scroll', handleHeadingTracking);
  }, [tocItems, displayCleanBody]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveHeadingId(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (displayTitle) {
      document.title = `${displayTitle} — ${isEn ? 'Elephantology' : 'Слонология'}`;
      window.currentArticlePath = path;
    }
    return () => {
      document.title = isEn ? 'Elephantology — Academic Encyclopedia' : 'Слонология — Академическая энциклопедия';
    };
  }, [displayTitle, path, isEn]);

  const seenGlossaryTerms = useMemo(() => new Set<string>(), [path, isEn]);

  const referenceMap = useMemo(() => {
    const map = parseFootnoteDefinitions(rawContent);

    if (Array.isArray(meta.references)) {
      meta.references.forEach((item: ReferenceItem | string, idx: number) => {
        const isString = typeof item === 'string';
        const refObj: ReferenceItem = isString ? { id: `ref_${idx + 1}`, title: item } : item;
        const safeId = refObj.id || `ref_${idx + 1}`;
        const num = idx + 1;

        const refInfo: ReferenceInfo = {
          id: safeId,
          num,
          authors: refObj.authors,
          year: refObj.year,
          title: refObj.title,
          journal: refObj.journal,
          book: refObj.book,
          doi: refObj.doi,
          isbn: refObj.isbn,
          rawText: typeof item === 'string' ? item : `${refObj.authors || ''} (${refObj.year || ''}). ${refObj.title}`
        };

        map.set(safeId, refInfo);
        map.set(safeId.toLowerCase(), refInfo);
        map.set(safeId.replace(/^ref_/, ''), refInfo);
        map.set(String(num), refInfo);
        map.set(`ref_${num}`, refInfo);
      });
    }

    return map;
  }, [rawContent, meta.references]);

  const [activeCitation, setActiveCitation] = useState<{
    num: number;
    rawKey: string;
    href: string;
    rect: DOMRect;
    refInfo?: ReferenceInfo;
  } | null>(null);

  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCitationTrigger = useCallback(
    ({ num, rawKey, href, rect }: CitationTriggerData) => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      const refInfo =
        referenceMap.get(rawKey) ||
        referenceMap.get(String(num)) ||
        referenceMap.get(`ref_${num}`) ||
        referenceMap.get(rawKey.toLowerCase()) ||
        referenceMap.get(rawKey.replace(/^ref_/, ''));

      setActiveCitation({ num, rawKey, href, rect, refInfo });
    },
    [referenceMap]
  );

  const handleCitationHoverEnd = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveCitation(null);
    }, 250);
  }, []);

  const cancelCloseCitation = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const jumpToFootnote = useCallback((href: string) => {
    const rawId = href.replace(/^#/, '');
    const decodedId = decodeURIComponent(rawId);
    const candidates = [
      decodedId,
      rawId,
      `user-content-${decodedId}`,
      `user-content-${rawId}`,
      decodedId.replace(/^user-content-/, ''),
      rawId.replace(/^user-content-/, '')
    ];
    let targetEl: HTMLElement | null = null;
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) {
        targetEl = el;
        break;
      }
    }
    if (!targetEl) {
      const digitsOnly = rawId.replace(/[^0-9]/g, '');
      if (digitsOnly) {
        targetEl = document.getElementById(`user-content-fn-${digitsOnly}`) || 
                   document.getElementById(`fn-${digitsOnly}`) ||
                   document.getElementById(`ref_${digitsOnly}`);
      }
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add(
        'ring-2',
        'ring-[#1E4631]',
        'bg-[#1E4631]/20'
      );
      setTimeout(() => {
        targetEl?.classList.remove(
          'ring-2',
          'ring-[#1E4631]',
          'bg-[#1E4631]/20'
        );
      }, 2500);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (activeCitation) {
        const tooltipEl = document.getElementById('citation-tooltip-popover');
        if (tooltipEl && !tooltipEl.contains(e.target as Node)) {
          setActiveCitation(null);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCitation(null);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCitation]);

  const navigateToArticle = useCallback((targetPath: string) => {
    if (!targetPath || !targetPath.trim()) return;
    if (window.loadArticle) {
      window.loadArticle(targetPath);
    } else {
      window.dispatchEvent(new CustomEvent('load-article', { detail: targetPath }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="w-full pb-24 animate-pulse bg-[#F6F5F0]">
        <div className="sticky top-16 z-30 h-[3px] w-full bg-[#DFDCD4] overflow-hidden">
          <div className="h-full w-1/4 bg-[#1E4631]/40" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <div className="flex items-center justify-between gap-3 border-b border-[#DFDCD4] pb-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#EFECE6]" />
              <div className="h-3.5 w-24 bg-[#EFECE6]" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <aside className="hidden lg:block lg:col-span-3 space-y-3">
              <div className="p-4 bg-[#EFECE6] border border-[#DFDCD4]" />
            </aside>
            <main className="lg:col-span-6 w-full max-w-3xl mx-auto space-y-7">
              <div className="h-8 bg-[#F2EFE9] w-full" />
              <div className="h-32 bg-[#F2EFE9] border border-[#DED8CD]" />
            </main>
            <aside className="hidden lg:block lg:col-span-3 space-y-4">
              <div className="p-4 bg-[#EFECE6] border border-[#DFDCD4]" />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meta.title) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4 bg-[#F6F5F0]">
        <div className="inline-flex p-3 bg-[#EFECE6] border border-[#DFDCD4] text-[#141413] mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#141413] mb-2 font-serif">
          {isEn ? 'Article Not Found' : 'Статья не найдена'}
        </h2>
        <p className="text-sm text-[#6E6B64] mb-6">
          {isEn ? 'The requested academic material does not exist or has been moved.' : 'Запрошенный академический материал не существует или был перемещен.'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#EFECE6] text-[#141413] border border-[#DFDCD4] hover:border-[#141413] text-xs font-semibold transition-all cursor-pointer rounded-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.article.back}</span>
        </button>
      </div>
    );
  }

  const categoryKey = meta.category?.toLowerCase() || '';
  const categoryTitle = categoryDict[categoryKey] || meta.category || (isEn ? 'General Biology' : 'Общая биология');
  const referencesList = meta.references || [];

  return (
    <article key={path} className="w-full pb-24 selection:bg-[#14532D] selection:text-[#FBF9F5] relative animate-fade-in-content bg-[#FBF9F5]">
      
      {/* Reading Progress Bar */}
      <div className="sticky top-16 z-30 h-[2px] w-full bg-[#DED8CD] overflow-hidden">
        <div 
          className="h-full bg-[#14532D] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* Top Navigation & Curatorial Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#78716C] border-b border-[#DED8CD] pb-4 mb-10">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-[#14532D] text-[#44403C] transition-colors flex items-center gap-1.5 font-medium cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.catalog.title}</span>
            </button>
            <ChevronRight className="w-3 h-3 text-[#78716C] shrink-0" />
            <span className="truncate max-w-[260px] sm:max-w-[400px] font-medium text-[#1C1917]">
              {categoryTitle}
            </span>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('openCitationModal', {
                    detail: { title: displayTitle, category: categoryTitle }
                  })
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2EFE9] hover:bg-[#EAE5DC] border border-[#DED8CD] text-[#1C1917] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Quote className="w-3.5 h-3.5 text-[#14532D]" />
              <span>{t.article.cite}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Clean compact list of discipline articles */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar pr-1 space-y-3">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#141413] uppercase tracking-wider font-serif border-b border-[#DFDCD4] pb-3">
                {categoryTitle}
              </h4>

              <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar pr-1">
                {categoryArticles.map((art) => {
                  const isCurrent = art.path.replace(/\.md$/, '') === pathPart || art.path === path;

                  return (
                    <button
                      key={art.path}
                      onClick={() => {
                        if (!isCurrent) navigateToArticle(art.path);
                      }}
                      className={`w-full text-left py-2.5 transition-colors cursor-pointer block border-b border-[#DFDCD4]/40 ${
                        isCurrent
                          ? 'text-[#1E4631] font-bold'
                          : 'text-[#141413] hover:text-[#1E4631]'
                      }`}
                    >
                      <span className="text-xs leading-snug line-clamp-2">
                        {art.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* CENTER COLUMN: Reading Zone */}
          <main className="lg:col-span-6 xl:col-span-6 w-full max-w-3xl mx-auto space-y-8">
        
        {isEn && (
          <div className="mb-6 p-3 bg-[#EFECE6] border border-[#DFDCD4] flex items-center justify-between text-xs text-[#141413] rounded-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1E4631] shrink-0" />
              <span>
                <strong>English Academic Translation:</strong> Standardized zoological & veterinary terminology applied.
              </span>
            </div>
            <button
              onClick={() => useLanguage().setLang('ru')}
              className="text-xs text-[#1E4631] hover:underline cursor-pointer ml-3 shrink-0 font-medium"
            >
              Original RU
            </button>
          </div>
        )}

        {/* Academic Monograph Header & Unboxed Metadata Strip */}
        <header className="mb-10 space-y-4 border-b border-[#DED8CD] pb-8">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-[#78716C] tabular-nums">
            <span className="text-[#14532D] font-semibold uppercase tracking-wider">
              {categoryTitle}
            </span>
            {meta.readingTimeMin && (
              <>
                <span aria-hidden="true">·</span>
                <span>{meta.readingTimeMin} {t.catalog.readingTime}</span>
              </>
            )}
            {meta.evidenceLevel && (
              <>
                <span aria-hidden="true">·</span>
                <span>{isEn ? `Evidence: ${meta.evidenceLevel}` : `Статус: ${t.evidence[meta.evidenceLevel.toLowerCase() as keyof typeof t.evidence] || meta.evidenceLevel}`}</span>
              </>
            )}
            {meta.lastReviewed && (
              <>
                <span aria-hidden="true">·</span>
                <span>{t.article.lastReviewed}: {meta.lastReviewed}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[42px] font-semibold tracking-tight text-[#1C1917] leading-[1.14] font-serif text-balance">
            {displayTitle}
          </h1>

          {displayExcerpt && (
            <p className="text-lg sm:text-xl text-[#44403C] leading-relaxed pt-2 font-serif italic">
              {displayExcerpt}
            </p>
          )}
        </header>

        {/* Key Findings (Clean All-Around Archival Hairline Box — No thick left bar) */}
        {displayKeyFindings && (
          <section className="my-8 border border-[#C5BDB0] bg-[#F2EFE9] p-6 rounded-none">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#DED8CD] text-[#14532D] font-mono uppercase tracking-wider font-semibold text-xs">
              <Info className="w-4 h-4 text-[#14532D] shrink-0" />
              <span>{isEn ? 'Key Insights & Parameters' : 'Ключевые сведения и параметры'}</span>
            </div>
            <div className="text-[#1C1917] text-sm leading-relaxed space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 text-[#1C1917]" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1.5 my-2 text-[#1C1917] text-xs sm:text-sm" {...props} />,
                  li: ({ node, ...props }) => <li className="text-[#1C1917]" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-[#1C1917]" {...props} />
                }}
              >
                {displayKeyFindings}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* Article Body */}
        <div className="academic-article-prose text-[#1C1917] leading-relaxed sm:leading-[1.8] text-base space-y-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              h2: ({ node, children, ...props }: any) => {
                const rawText = extractNodeText(children)
                  .replace(/\{#.*?\}/g, '')
                  .replace(/[*_`]/g, '')
                  .trim();
                const id = props.id || slugifyHeading(rawText);
                return (
                  <h2
                    id={id}
                    className="group text-2xl sm:text-[28px] font-semibold tracking-tight text-[#1C1917] mt-12 mb-5 pb-3 border-b border-[#DED8CD] scroll-mt-24 flex items-center justify-between font-serif text-balance"
                    {...props}
                  >
                    <span>{children}</span>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHeading(id);
                        window.history.replaceState(null, '', `#${id}`);
                      }}
                      aria-label={`Link to ${rawText}`}
                      className="text-[#78716C] hover:text-[#14532D] opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-sm cursor-pointer shrink-0 font-mono"
                      title={isEn ? 'Copy anchor link' : 'Якорная ссылка на раздел'}
                    >
                      §
                    </a>
                  </h2>
                );
              },
              h3: ({ node, children, ...props }: any) => {
                const rawText = extractNodeText(children)
                  .replace(/\{#.*?\}/g, '')
                  .replace(/[*_`]/g, '')
                  .trim();
                const id = props.id || slugifyHeading(rawText);
                return (
                  <h3
                    id={id}
                    className="group text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917] mt-8 mb-4 scroll-mt-24 flex items-center justify-between font-serif text-balance"
                    {...props}
                  >
                    <span>{children}</span>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHeading(id);
                        window.history.replaceState(null, '', `#${id}`);
                      }}
                      aria-label={`Link to ${rawText}`}
                      className="text-[#78716C] hover:text-[#14532D] opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sm cursor-pointer shrink-0 font-mono"
                      title={isEn ? 'Copy anchor link' : 'Якорная ссылка на подраздел'}
                    >
                      §
                    </a>
                  </h3>
                );
              },
              p: ({ node, children, ...props }: any) => {
                const hasBlockChild = node?.children?.some(
                  (child: any) => child.tagName === 'img' || child.tagName === 'figure' || child.tagName === 'div'
                );

                const renderAnnotatedChildren = (childNode: React.ReactNode): React.ReactNode => {
                  if (typeof childNode === 'string') {
                    const taxaNodes = formatTaxaInText(childNode);
                    const result: React.ReactNode[] = [];
                    taxaNodes.forEach((item) => {
                      if (typeof item === 'string') {
                        const glossaryProcessed = annotateTextWithGlossary(item, seenGlossaryTerms);
                        result.push(...glossaryProcessed);
                      } else {
                        result.push(item);
                      }
                    });
                    return result;
                  }
                  if (Array.isArray(childNode)) {
                    return childNode.map((c, i) => (
                      <React.Fragment key={i}>{renderAnnotatedChildren(c)}</React.Fragment>
                    ));
                  }
                  return childNode;
                };

                const annotated = renderAnnotatedChildren(children);
                const collapsed = Array.isArray(annotated) 
                  ? collapseCitationNodes(annotated, handleCitationTrigger, handleCitationHoverEnd) 
                  : annotated;

                if (hasBlockChild) {
                  return (
                    <div className="mb-6 leading-relaxed sm:leading-[1.8] text-base text-[#141413]" {...props}>
                      {collapsed}
                    </div>
                  );
                }

                return (
                  <p className="mb-6 leading-relaxed sm:leading-[1.8] text-base text-[#141413]" {...props}>
                    {collapsed}
                  </p>
                );
              },
              em: ({ node, ...props }: any) => (
                <em className="italic font-serif font-normal text-[#1E4631]" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside ml-5 space-y-2 mb-6 text-base text-[#141413]" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-outside ml-5 space-y-2.5 mb-6 text-base text-[#141413]" {...props} />
              ),
              li: ({ node, children, ...props }: any) => {
                const isFootnoteItem = props.id?.includes('fn-') || props.id?.includes('fnref');
                if (isFootnoteItem) {
                  return (
                    <li
                      id={props.id}
                      className="text-xs text-[#141413] pl-2 leading-relaxed my-2 p-2.5 border border-[#DFDCD4] bg-[#EFECE6] rounded-none [&_p]:inline [&_p]:mb-0 [&_p]:leading-relaxed"
                      {...props}
                    >
                      {consolidateFootnoteItem(children, isEn)}
                    </li>
                  );
                }

                const renderAnnotatedChildren = (childNode: React.ReactNode): React.ReactNode => {
                  if (typeof childNode === 'string') {
                    const taxaNodes = formatTaxaInText(childNode);
                    const result: React.ReactNode[] = [];
                    taxaNodes.forEach((item) => {
                      if (typeof item === 'string') {
                        result.push(...annotateTextWithGlossary(item, seenGlossaryTerms));
                      } else {
                        result.push(item);
                      }
                    });
                    return result;
                  }
                  if (Array.isArray(childNode)) {
                    return childNode.map((c, i) => (
                      <React.Fragment key={i}>{renderAnnotatedChildren(c)}</React.Fragment>
                    ));
                  }
                  return childNode;
                };

                const annotated = renderAnnotatedChildren(children);
                const collapsed = Array.isArray(annotated) 
                  ? collapseCitationNodes(annotated, handleCitationTrigger, handleCitationHoverEnd) 
                  : annotated;
                return <li className="text-[#141413] leading-relaxed" {...props}>{collapsed}</li>;
              },
              blockquote: ({ node, children, ...props }: any) => {
                const textContent = extractNodeText(children);
                const isAnatomy = /анатомическ(?:ая|ое|ие)\s+специфик|anatomical\s+specif/i.test(textContent);
                const isPaleo = /палеоэкологическ(?:ая|ое|ие)\s+справк|палеоэкологи(?:я|ческий)|paleoecolog/i.test(textContent);

                if (isAnatomy || isPaleo) {
                  return (
                    <aside 
                      role="note"
                      className="my-6 border border-[#C5BDB0] bg-[#F2EFE9] p-5 sm:p-6 rounded-none"
                    >
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#DED8CD] text-xs font-bold uppercase tracking-wider text-[#14532D] font-mono">
                        <Activity className="w-3.5 h-3.5 text-[#14532D]" />
                        <span>{isEn ? 'Anatomical / Ecological Note' : 'Академическая справка'}</span>
                      </div>
                      <div className="text-sm sm:text-base text-[#1C1917] leading-relaxed space-y-2 [&>p]:mb-2 [&>p:last-child]:mb-0">
                        {children}
                      </div>
                    </aside>
                  );
                }

                return (
                  <blockquote className="my-8 py-5 px-6 bg-[#F2EFE9] border-y border-[#C5BDB0] text-[#1C1917] font-serif text-lg italic leading-relaxed rounded-none" {...props}>
                    {children}
                  </blockquote>
                );
              },
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6 border border-[#DFDCD4] bg-[#EFECE6] rounded-none">
                  <table className="min-w-full divide-y divide-[#DFDCD4] text-xs sm:text-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th scope="col" className="px-4 py-2.5 bg-[#EFECE6] border-b border-[#DFDCD4] font-bold text-left text-[#141413]" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-2.5 border-t border-[#DFDCD4] text-[#141413]" {...props} />
              ),
              img: ({ node, src, alt, ...props }) => {
                const resolvedSrc = src && src.startsWith('/') && !src.startsWith(import.meta.env.BASE_URL)
                  ? `${import.meta.env.BASE_URL}${src.slice(1)}`
                  : src;
                return (
                  <figure className="my-8 group">
                    <div 
                      onClick={() => resolvedSrc && setLightboxImage({ src: resolvedSrc, alt: alt || '' })}
                      className="relative overflow-hidden border border-[#DED8CD] bg-[#F2EFE9] cursor-zoom-in transition-colors duration-200 hover:border-[#1C1917] rounded-none"
                      title={isEn ? "Click to view full-size illustration" : "Нажмите для просмотра в полном размере"}
                    >
                      <img
                        src={resolvedSrc}
                        alt={alt || ''}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                        {...props}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-[#FBF9F5] text-[11px] font-medium text-[#1C1917] border border-[#DED8CD] opacity-0 group-hover:opacity-100 transition-opacity rounded-none pointer-events-none">
                        <ZoomIn className="w-3.5 h-3.5 text-[#14532D]" />
                        <span>{isEn ? 'Enlarge' : 'Увеличить'}</span>
                      </div>
                    </div>
                    {alt && (
                      <figcaption className="mt-2.5 px-1 text-center text-xs text-[#78716C] font-serif italic leading-relaxed">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              },
              sup: ({ node, ...props }) => (
                <sup className="text-[11px] font-mono font-medium leading-none px-0.5 text-[#14532D] select-none align-super tabular-nums" {...props} />
              ),
              a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
                const isFootnoteBackref = (props as any)['data-footnote-backref'] !== undefined ||
                  (props.className && typeof props.className === 'string' && props.className.includes('data-footnote-backref')) ||
                  href?.includes('-fnref-');

                if (href?.startsWith('#')) {
                  return (
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        const rawId = href.slice(1);
                        jumpToFootnote(rawId);
                      }}
                      className={
                        isFootnoteBackref
                          ? 'inline-flex items-center gap-1.5 text-[#14532D] hover:text-[#1C1917] font-sans text-xs font-semibold ml-2 px-2.5 py-1 bg-[#F2EFE9] border border-[#DED8CD] shadow-xs cursor-pointer no-underline select-none my-1 rounded-none'
                          : 'text-[#14532D] hover:underline font-mono text-xs font-semibold px-0.5 inline-block cursor-pointer'
                      }
                      {...props}
                    >
                      {isFootnoteBackref ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-bold leading-none">↑</span>
                          <span>{isEn ? 'To text' : 'К тексту статьи'}</span>
                        </span>
                      ) : (
                        children
                      )}
                    </a>
                  );
                }

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#14532D] hover:underline font-medium inline-flex items-center gap-0.5 transition-colors"
                    {...props}
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-3 h-3 inline opacity-70" />
                  </a>
                );
              },
              section: (props: any) => {
                const { className, children, rest } = props;
                if (props['data-footnotes'] || className === 'footnotes' || (typeof className === 'string' && className.includes('footnotes'))) {
                  return (
                    <div id="footnotes-literature-section" className="mt-14 pt-8 border-t border-[#DED8CD] text-xs text-[#1C1917]">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] mb-4 flex items-center gap-2 font-serif">
                        <Quote className="w-4 h-4 text-[#14532D]" />
                        <span>{isEn ? 'References & Literature' : 'Литература и источники'}</span>
                      </h3>
                      <div className="space-y-2">{children}</div>
                    </div>
                  );
                }
                return <section className={className} {...rest}>{children}</section>;
              }
            }}
          >
            {displayCleanBody}
          </ReactMarkdown>
        </div>

        {/* Uncertainty block */}
        {displayUncertainty && (
          <section className="my-12 p-5 bg-[#F2EFE9] border border-[#DED8CD] rounded-none">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DED8CD]">
              <Scale className="w-4 h-4 text-[#14532D] shrink-0" />
              <h3 className="font-bold text-sm text-[#1C1917] font-serif">
                {isEn ? 'Scientific Uncertainty & Evidence Boundaries' : 'Научная неопределённость и границы доказанности'}
              </h3>
            </div>

            <div className="space-y-3.5">
              {displayUncertainty.known && (
                <div className="flex items-start gap-3 p-3 bg-[#FBF9F5] border border-[#DED8CD]">
                  <CheckCircle2 className="w-5 h-5 text-[#14532D] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-[#1C1917] leading-relaxed">
                    <span className="font-semibold text-[#14532D] block mb-0.5">
                      {isEn ? 'Established Fact:' : 'Достоверно установлено:'}
                    </span>
                    <p>{displayUncertainty.known}</p>
                  </div>
                </div>
              )}

              {displayUncertainty.probable && (
                <div className="flex items-start gap-3 p-3 bg-[#FBF9F5] border border-[#DED8CD]">
                  <AlertTriangle className="w-5 h-5 text-[#78716C] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-[#1C1917] leading-relaxed">
                    <span className="font-semibold text-[#1C1917] block mb-0.5">
                      {isEn ? 'Probable / Requires Verification:' : 'Вероятно / Требует верификации:'}
                    </span>
                    <p>{displayUncertainty.probable}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related Topics */}
        {relatedArticles.length > 0 && (
          <section className="mt-14 pt-8 border-t border-[#DED8CD]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] mb-4 flex items-center gap-2 font-serif">
              <BookOpen className="w-4 h-4 text-[#14532D]" />
              <span>{t.article.related}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {relatedArticles.map((rel) => {
                const relCatKey = rel.category?.toLowerCase() || '';
                return (
                  <button
                    key={rel.path}
                    onClick={() => navigateToArticle(rel.path)}
                    className="p-3.5 bg-[#F2EFE9] border border-[#DED8CD] hover:border-[#1C1917] text-left transition-all group flex flex-col justify-between cursor-pointer rounded-none"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-1">
                        {categoryDict[relCatKey] || rel.category}
                      </span>
                      <h4 className="text-sm font-semibold text-[#1C1917] group-hover:text-[#14532D] transition-colors line-clamp-2 leading-snug font-serif">
                        {rel.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* References */}
        {referencesList.length > 0 && !rawContent.includes('[^') && (
          <section className="mt-14 pt-8 border-t border-[#DED8CD]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] mb-4 flex items-center gap-2 font-serif">
              <Quote className="w-4 h-4 text-[#14532D]" />
              <span>{isEn ? 'References & Bibliography (APA)' : 'Источники и библиография (APA)'}</span>
            </h3>

            <ol className="space-y-3 text-xs text-[#78716C] list-decimal list-outside ml-4">
              {referencesList.map((refItem: ReferenceItem | string, idx: number) => {
                const isString = typeof refItem === 'string';
                const ref = isString ? { id: `ref_${idx + 1}`, title: refItem } : refItem;
                const safeId = ref.id || `ref_${idx + 1}`;

                return (
                  <li id={`user-content-fn-${safeId}`} key={idx} className="leading-relaxed pl-1">
                    {isString ? (
                      <span>{refItem}</span>
                    ) : (
                      <span className="text-[#1C1917]">
                        {ref.authors && <span className="font-semibold text-[#1C1917]">{ref.authors} </span>}
                        {ref.year && <span>({ref.year}). </span>}
                        <span className="italic text-[#1C1917]">{ref.title}. </span>
                        {ref.journal && <span>{ref.journal}. </span>}
                        {ref.doi && (() => {
                          const cleanDoi = normalizeDoi(ref.doi);
                          const doiUrl = formatDoiUrl(ref.doi);
                          if (!cleanDoi || !doiUrl) return null;
                          return (
                            <a
                              href={doiUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#14532D] hover:underline ml-1.5 font-mono inline-flex items-center gap-0.5"
                            >
                              <span>DOI: {cleanDoi}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          );
                        })()}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Previous / Next Article Navigation */}
        {(prevArticle || nextArticle) && (
          <nav className="mt-10 pt-6 border-t border-[#DED8CD] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {prevArticle ? (
              <button
                onClick={() => navigateToArticle(prevArticle.path)}
                className="flex flex-col text-left p-3.5 bg-[#F2EFE9] border border-[#DED8CD] hover:border-[#1C1917] transition-colors cursor-pointer group rounded-none"
              >
                <div className="flex items-center text-[#78716C] group-hover:text-[#14532D] mb-1 font-medium">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>{t.article.prev}</span>
                </div>
                <span className="font-semibold text-[#1C1917] transition-colors line-clamp-1 font-serif text-sm">
                  {prevArticle.title}
                </span>
              </button>
            ) : <div />}

            {nextArticle ? (
              <button
                onClick={() => navigateToArticle(nextArticle.path)}
                className="flex flex-col text-right p-3.5 bg-[#F2EFE9] border border-[#DED8CD] hover:border-[#1C1917] transition-colors cursor-pointer group rounded-none"
              >
                <div className="flex items-center justify-end text-[#78716C] group-hover:text-[#14532D] mb-1 font-medium">
                  <span>{t.article.next}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
                <span className="font-semibold text-[#1C1917] transition-colors line-clamp-1 font-serif text-sm">
                  {nextArticle.title}
                </span>
              </button>
            ) : <div />}
          </nav>
        )}
      </main>

      {/* RIGHT COLUMN: Table of Contents (No outer card border, no list icon) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar pl-1 space-y-4">
            
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1C1917] font-serif border-b border-[#DED8CD] pb-2.5">
                <span>{isEn ? 'Table of Contents' : 'СОДЕРЖАНИЕ'}</span>
              </div>

              <nav aria-label="Table of Contents" className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar pr-1">
                {tocItems.length === 0 ? (
                  <p className="text-xs text-[#78716C] italic py-2">
                    {isEn ? 'Standard monograph structure' : 'Монографический текст'}
                  </p>
                ) : (
                  tocItems.map((item, idx) => {
                    const isActive = activeHeadingId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToHeading(item.id)}
                        className={`w-full text-left transition-colors duration-150 cursor-pointer block truncate rounded-none ${
                          item.level === 3 ? 'pl-4 text-[11px]' : 'pl-0 text-xs'
                        } py-1.5 ${
                          isActive
                            ? 'text-[#14532D] font-semibold'
                            : 'text-[#78716C] hover:text-[#1C1917]'
                        }`}
                        title={item.text}
                      >
                        <span className="font-mono text-[10px] mr-1.5 opacity-60 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{item.text}</span>
                      </button>
                    );
                  })
                )}
              </nav>
            </div>

          </aside>

        </div>
      </div>

      {/* MOBILE FLOATING BOTTOM BAR (< lg) */}
      <div className="lg:hidden fixed bottom-4 inset-x-3 sm:inset-x-6 z-40 max-w-sm sm:max-w-md mx-auto">
        <div className="h-14 px-3 bg-[#F2EFE9] border border-[#C5BDB0] shadow-lg flex items-center justify-around gap-1 rounded-none">
          <button
            onClick={() => setMobileArticlesOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[#1C1917] hover:text-[#14532D] transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#14532D]" />
            <span className="text-[10px] font-medium leading-none">{isEn ? 'Section' : 'К рубрикам'}</span>
          </button>

          <div className="w-[1px] h-6 bg-[#DED8CD]" />

          <button
            onClick={() => setMobileTocOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[#1C1917] hover:text-[#14532D] transition-colors cursor-pointer"
          >
            <List className="w-4 h-4 text-[#14532D]" />
            <span className="text-[10px] font-medium leading-none">{isEn ? 'Contents' : 'Оглавление'}</span>
          </button>

          <div className="w-[1px] h-6 bg-[#DED8CD]" />

          <button
            onClick={scrollToTop}
            className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 text-[#78716C] hover:text-[#14532D] transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-[10px] font-medium leading-none">{isEn ? 'Top' : 'Наверх'}</span>
          </button>
        </div>
      </div>

      {/* MOBILE TOC DRAWER */}
      {mobileTocOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            onClick={() => setMobileTocOpen(false)}
            className="fixed inset-0 bg-black/60 transition-opacity"
          />
          <div className="relative z-10 w-full max-h-[82vh] bg-[#FBF9F5] border-t border-[#DED8CD] shadow-2xl flex flex-col overflow-hidden rounded-none">
            <div className="w-12 h-1.5 bg-[#C5BDB0] rounded-none mx-auto my-3 shrink-0" />
            <div className="px-5 pb-3 border-b border-[#DED8CD] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 font-bold text-[#1C1917] text-base font-serif">
                <List className="w-4 h-4 text-[#14532D]" />
                <span>{isEn ? 'Table of Contents' : 'СОДЕРЖАНИЕ'}</span>
              </div>
              <button
                onClick={() => setMobileTocOpen(false)}
                className="p-1.5 bg-[#F2EFE9] border border-[#DED8CD] text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer rounded-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2">
              {tocItems.map((item) => {
                const isActive = activeHeadingId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToHeading(item.id);
                      setMobileTocOpen(false);
                    }}
                    className={`w-full text-left p-3 border text-xs cursor-pointer block rounded-none ${
                      item.level === 3 ? 'pl-6 text-[11px]' : 'font-medium'
                    } ${
                      isActive
                        ? 'border-[#14532D] bg-[#F2EFE9] text-[#14532D] font-semibold'
                        : 'border-[#DED8CD] bg-[#FBF9F5] text-[#1C1917]'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MOBILE CATEGORY ARTICLES DRAWER */}
      {mobileArticlesOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            onClick={() => setMobileArticlesOpen(false)}
            className="fixed inset-0 bg-black/60 transition-opacity"
          />
          <div className="relative z-10 w-full max-h-[82vh] bg-[#FBF9F5] border-t border-[#DED8CD] shadow-2xl flex flex-col overflow-hidden rounded-none">
            <div className="w-12 h-1.5 bg-[#C5BDB0] rounded-none mx-auto my-3 shrink-0" />
            <div className="px-5 pb-3 border-b border-[#DED8CD] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="w-4 h-4 text-[#14532D] shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-[#1C1917] text-sm sm:text-base truncate font-serif">
                    {categoryTitle}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setMobileArticlesOpen(false)}
                className="p-1.5 bg-[#F2EFE9] border border-[#DED8CD] text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer rounded-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2.5">
              {categoryArticles.map((art) => {
                const isCurrent = art.path.replace(/\.md$/, '') === pathPart || art.path === path;
                return (
                  <button
                    key={art.path}
                    onClick={() => {
                      setMobileArticlesOpen(false);
                      if (!isCurrent) navigateToArticle(art.path);
                    }}
                    className={`w-full text-left p-3.5 border transition-all cursor-pointer block rounded-none ${
                      isCurrent
                        ? 'border-[#14532D] bg-[#F2EFE9] text-[#14532D] font-semibold'
                        : 'border-[#DED8CD] bg-[#FBF9F5] text-[#1C1917]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 font-serif ${isCurrent ? 'text-[#14532D]' : 'text-[#1C1917]'}`}>
                        {art.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/75"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-[#FBF9F5] border border-[#DED8CD] shadow-2xl overflow-hidden p-4 rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-[#DED8CD] mb-2">
              <div className="flex items-center gap-2 text-xs text-[#1C1917] font-medium truncate pr-4 font-serif">
                <span className="w-2 h-2 bg-[#14532D] shrink-0"></span>
                <span className="truncate">{lightboxImage.alt || (isEn ? 'Illustration' : 'Иллюстрация')}</span>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 bg-[#F2EFE9] border border-[#DED8CD] text-[#1C1917] hover:bg-[#EAE5DC] transition-colors cursor-pointer rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-auto bg-[#F2EFE9] p-2">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt || ''}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-auto max-w-full object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Citation Popover */}
      {activeCitation && (
        <div
          id="citation-tooltip-popover"
          role="tooltip"
          onMouseEnter={cancelCloseCitation}
          onMouseLeave={handleCitationHoverEnd}
          style={{
            position: 'fixed',
            top: activeCitation.rect.top > 230 
              ? `${Math.max(16, activeCitation.rect.top - 8)}px` 
              : `${Math.min(window.innerHeight - 200, activeCitation.rect.bottom + 8)}px`,
            transform: activeCitation.rect.top > 230 ? 'translateY(-100%)' : 'none',
            left: `${Math.max(16, Math.min(window.innerWidth - 350, activeCitation.rect.left + activeCitation.rect.width / 2 - 165))}px`,
            width: '330px',
            maxWidth: 'calc(100vw - 2rem)',
            zIndex: 60
          }}
          className="bg-[#FBF9F5] border border-[#C5BDB0] p-4 shadow-xl text-xs text-[#1C1917] rounded-none animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#DED8CD] pb-2.5 mb-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#14532D] tabular-nums">
              <span className="px-1.5 py-0.5 bg-[#F2EFE9] border border-[#DED8CD]">
                [{activeCitation.num}]
              </span>
              <span className="text-[#1C1917] font-sans font-medium text-xs">
                {isEn ? 'Source Reference' : 'Источник из библиографии'}
              </span>
            </div>
            <button
              onClick={() => setActiveCitation(null)}
              className="p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer rounded-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {activeCitation.refInfo ? (
              <>
                {activeCitation.refInfo.authors && (
                  <p className="font-semibold text-[#1C1917] text-xs leading-snug">
                    {activeCitation.refInfo.authors}
                    {activeCitation.refInfo.year ? ` (${activeCitation.refInfo.year})` : ''}
                  </p>
                )}
                {activeCitation.refInfo.title && (
                  <p className="italic text-[#14532D] text-[12px] leading-snug font-serif">
                    {activeCitation.refInfo.title}
                  </p>
                )}
                {activeCitation.refInfo.doi && (
                  <div className="pt-1">
                    <a
                      href={formatDoiUrl(activeCitation.refInfo.doi) || `https://doi.org/${activeCitation.refInfo.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#14532D] hover:underline"
                    >
                      <span>DOI: {normalizeDoi(activeCitation.refInfo.doi)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[#78716C] text-xs italic">
                {isEn ? 'Academic source cited in text' : 'Академический источник'}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
