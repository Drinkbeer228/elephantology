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
  Share2,
  Printer,
  Tag,
  Clock,
  Calendar,
  Layers,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle as HelpIcon,
  Scale,
  Languages,
  Sparkles
} from 'lucide-react';
import { parseFrontmatter } from '../lib/markdown';
import { MODULES_CACHE, getStaticArticles, resolveArticlePath } from '../lib/articles';
import { ArticleItem } from '../lib/searchEngine';
import { EvidenceBadge, EditorialStatusBlock } from './ArticleBlocks';
import { useLanguage } from '../i18n/LanguageContext';
import { ARTICLE_TRANSLATIONS_EN } from '../lib/articleTranslations';
import { translateMarkdownToEnglish } from '../lib/translateMarkdown';
import { CATEGORY_MAP_RU, CATEGORY_MAP_EN } from '../data/categories';
import { ArticleMetadata, ReferenceItem, EvidenceBasisType } from '../types';
import { annotateTextWithGlossary } from './GlossaryTooltip';
import { normalizeDoi, formatDoiUrl } from '../lib/doi';

declare global {
  interface Window {
    loadArticle?: (path: string) => void;
    currentArticlePath?: string;
    __PRERENDERED_ARTICLE__?: string;
  }
}

interface ArticleViewerProps {
  path: string;
  onBack: () => void;
}

// Helper to extract citation info from a React node representing <sup><a>...</a></sup>
function extractCitationInfo(node: React.ReactNode): { num: number; href: string; id?: string; element: React.ReactElement } | null {
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
  if (!numMatch) return null;

  const num = parseInt(numMatch[1], 10);
  if (isNaN(num)) return null;

  return {
    num,
    href,
    id: aProps.id,
    element: aElement
  };
}

// Groups consecutive citation <sup> elements and collapses sequences (e.g. [8, 9, 10, 212, 214] => [8–10, 212, 214])
function collapseCitationNodes(nodes: React.ReactNode[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let currentGroup: Array<{
    node: React.ReactElement;
    element: React.ReactElement;
    num: number;
    href: string;
    id?: string;
  }> = [];

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    if (currentGroup.length === 1) {
      result.push(currentGroup[0].node);
      currentGroup = [];
      return;
    }

    // Sort citations by reference number
    const sorted = [...currentGroup].sort((a, b) => a.num - b.num);

    // Group into consecutive number ranges
    const ranges: Array<Array<{ node: React.ReactElement; element: React.ReactElement; num: number; href: string; id?: string }>> = [];
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
        badgeElements.push(<span key={`sep-${rIdx}`} className="text-kingdom-gold/50 mx-0.5 font-bold">, </span>);
      }

      if (range.length >= 3) {
        const start = range[0];
        const end = range[range.length - 1];
        badgeElements.push(
          <span key={`range-${start.num}-${end.num}`} className="inline-flex items-center">
            {React.cloneElement(start.element, { key: `cite-${start.num}` })}
            <span className="text-kingdom-gold/70 px-0.5 font-bold">–</span>
            {React.cloneElement(end.element, { key: `cite-${end.num}` })}
          </span>
        );
      } else {
        range.forEach((item, itemIdx) => {
          if (itemIdx > 0) {
            badgeElements.push(<span key={`sep-inner-${rIdx}-${itemIdx}`} className="text-kingdom-gold/50 mx-0.5 font-bold">, </span>);
          }
          badgeElements.push(React.cloneElement(item.element, { key: `cite-${item.num}-${itemIdx}` }));
        });
      }
    });

    result.push(
      <sup
        key={`grouped-sup-${currentGroup.map(g => g.num).join('-')}`}
        id={`group-${currentGroup.map(g => g.num).join('-')}`}
        className="inline-flex items-center text-[11px] font-mono font-medium px-1.5 py-0.5 mx-1 rounded-md bg-kingdom-gold/15 border border-kingdom-gold/30 text-kingdom-gold select-none align-super hover:bg-kingdom-gold/25 transition-colors"
      >
        <span className="text-kingdom-gold/60 font-bold mr-0.5">[</span>
        {badgeElements}
        <span className="text-kingdom-gold/60 font-bold ml-0.5">]</span>
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
      currentGroup.push({
        node: child as React.ReactElement,
        element: citeInfo.element,
        num: citeInfo.num,
        href: citeInfo.href,
        id: citeInfo.id
      });
    } else {
      flushGroup();
      result.push(child);
    }
  }

  flushGroup();
  return result;
}

// Helpers for consolidating footnote backrefs at the bottom of the article
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

  // Extract all backref elements found inside this footnote item
  const allBackrefs = collectBackrefElements(content);
  if (allBackrefs.length === 0) return content;

  // Helper to handle smooth scroll & highlight
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
          'ring-kingdom-gold',
          'bg-kingdom-gold/30',
          'shadow-[0_0_16px_rgba(212,175,55,0.7)]'
        );
        const parentParagraph = targetEl.closest('p');
        if (parentParagraph) {
          parentParagraph.classList.add('bg-kingdom-gold/10', 'ring-1', 'ring-kingdom-gold/30', 'rounded-lg');
        }
        setTimeout(() => {
          targetSup.classList.remove(
            'ring-2',
            'ring-kingdom-gold',
            'bg-kingdom-gold/30',
            'shadow-[0_0_16px_rgba(212,175,55,0.7)]'
          );
          if (parentParagraph) {
            parentParagraph.classList.remove('bg-kingdom-gold/10', 'ring-1', 'ring-kingdom-gold/30', 'rounded-lg');
          }
        }, 2500);
      }
    }
  };

  // Filter out original backrefs
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

  // Single mention: clean compact arrow
  if (allBackrefs.length === 1) {
    const originalHref = (allBackrefs[0].props as any)?.href || '';
    return (
      <div className="w-full text-xs text-gray-300 leading-relaxed">
        <span className="inline leading-relaxed break-words">{cleanedContent}</span>
        <a
          href={originalHref}
          data-footnote-backref="true"
          title={isEn ? 'Jump to cited location in article text' : 'Перейти к месту цитирования в тексте статьи'}
          onClick={(e) => handleJumpToMention(e, originalHref)}
          className="inline-flex items-center justify-center w-5 h-5 ml-2 text-kingdom-gold hover:text-amber-200 font-sans text-xs font-bold rounded bg-kingdom-gold/15 hover:bg-kingdom-gold/25 border border-kingdom-gold/40 hover:border-kingdom-gold/60 shadow-xs transition-all duration-150 cursor-pointer no-underline select-none align-middle"
        >
          ↑
        </a>
      </div>
    );
  }

  // Multiple mentions: compact numbered badges row with a single arrow prefix
  return (
    <div className="w-full text-xs text-gray-300 leading-relaxed">
      <span className="inline leading-relaxed break-words">{cleanedContent}</span>
      <span className="inline-flex flex-wrap items-center gap-1 text-xs ml-2 select-none align-middle py-0.5">
        <span className="text-kingdom-gold font-bold text-xs select-none mr-0.5">↑</span>
        {allBackrefs.map((br, idx) => {
          const originalHref: string = (br.props as any)?.href || '';
          return (
            <a
              key={`backref-num-${idx}`}
              href={originalHref}
              data-footnote-backref="true"
              title={isEn ? `Jump to mention #${idx + 1} in article text` : `Перейти к месту цитирования #${idx + 1} в тексте статьи`}
              onClick={(e) => handleJumpToMention(e, originalHref)}
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded bg-kingdom-gold/15 hover:bg-kingdom-gold/30 border border-kingdom-gold/40 hover:border-kingdom-gold/70 text-kingdom-gold hover:text-amber-100 font-mono text-[11px] font-bold shadow-xs transition-all duration-150 cursor-pointer no-underline"
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
  const { t, lang, setLang, isEn } = useLanguage();
  const [content, setContent] = useState<string>('');
  const [rawContent, setRawContent] = useState<string>('');
  const [meta, setMeta] = useState<ArticleMetadata>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categoryDict = isEn ? CATEGORY_MAP_EN : CATEGORY_MAP_RU;

  // Extracted structured sections (raw Russian)
  const [rawKeyFindings, setRawKeyFindings] = useState<string | null>(null);
  const [rawUncertainty, setRawUncertainty] = useState<{ known?: string; probable?: string; unknown?: string } | null>(null);
  const [rawCleanBody, setRawCleanBody] = useState<string>('');

  const safePath = path.endsWith('.md') ? path : `${path}.md`;
  const cleanPath = safePath.replace(/^\//, '');
  const pathPart = cleanPath.replace(/\.md$/, '');
  const translationKey = pathPart.replace(/^docs\//, '');
  const translationData = ARTICLE_TRANSLATIONS_EN[translationKey];

  // Neighbor articles (prev / next) computed dynamically from lang and path
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

  // Related articles computed dynamically from lang, meta, and path
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

  // Load raw article markdown content only on path changes
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

        // 1. Extract and separate Key Findings
        let processedContent = rawMd;
        let extractedKeyFindings: string | null = null;
        const keyFindingsMatch = processedContent.match(/##\s*(?:📊\s*)?(?:Ключевые сведения|Ключевые показатели|Ключевые метрики|Ключевые палеонтологические метрики|Ключевые геномные|Key Insights|Key Findings|Key Metrics)[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
        if (keyFindingsMatch) {
          extractedKeyFindings = keyFindingsMatch[1].trim();
          processedContent = processedContent.replace(keyFindingsMatch[0], '');
        }

        // 2. Extract Uncertainty block
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

        // 3. Remove H1 header if duplicating meta.title
        processedContent = processedContent.replace(/^#\s+[^\n]+\n+/, '');

        // 4. Clean related knowledge section (rendered natively)
        const relatedSectionMatch = processedContent.match(/##\s*(?:Связанные знания|Связанные материалы|Связанные темы|Related Topics|Related Articles)[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
        if (relatedSectionMatch) {
          processedContent = processedContent.replace(relatedSectionMatch[0], '');
        }

        // 5. Remove redundant empty "## Литература" header before footnote definitions to avoid empty orphaned header
        processedContent = processedContent.replace(/##\s*(?:📚\s*)?(?:Литература|Список литературы|Библиография|References|Bibliography)[^\n]*\s*(?=\n\s*\[\^|\n*$)/gi, '');

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

  // Derived translated content
  const displayTitle = useMemo(() => {
    if (isEn && translationData?.title) {
      return translationData.title;
    }
    return meta.title || '';
  }, [isEn, translationData, meta.title]);

  const displayExcerpt = useMemo(() => {
    if (isEn && translationData?.excerpt) {
      return translationData.excerpt;
    }
    return meta.excerpt || '';
  }, [isEn, translationData, meta.excerpt]);

  const displayTags: string[] = useMemo(() => {
    if (isEn && translationData?.tags) {
      return translationData.tags;
    }
    return (meta.tags || []) as string[];
  }, [isEn, translationData, meta.tags]);

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

  // Set document title and window metadata
  useEffect(() => {
    if (displayTitle) {
      document.title = `${displayTitle} — ${isEn ? 'Elephantology' : 'Слонология'}`;
      window.currentArticlePath = path;
    }
    return () => {
      document.title = isEn ? 'Elephantology — Academic Encyclopedia' : 'Слонология — Академическая энциклопедия';
    };
  }, [displayTitle, path, isEn]);

  // Track annotated terms in current article to ensure each curated term is annotated only once
  const seenGlossaryTerms = useMemo(() => new Set<string>(), [path, isEn]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCite = () => {
    const catName = categoryDict[meta.category?.toLowerCase() || ''] || meta.category || (isEn ? 'GENERAL BIOLOGY' : 'ОБЩАЯ БИОЛОГИЯ');
    window.dispatchEvent(
      new CustomEvent('openCitationModal', {
        detail: {
          title: displayTitle,
          category: catName
        }
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleLanguage = () => {
    setLang(isEn ? 'ru' : 'en');
  };

  const navigateToArticle = useCallback((targetPath: string) => {
    if (!targetPath || !targetPath.trim()) return;
    if (window.loadArticle) {
      window.loadArticle(targetPath);
    } else {
      window.dispatchEvent(new CustomEvent('load-article', { detail: targetPath }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true, tag } }));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-4 bg-[#202330] rounded w-1/4"></div>
        <div className="h-10 bg-[#202330] rounded w-5/6"></div>
        <div className="h-4 bg-[#202330] rounded w-1/2"></div>
        <div className="space-y-3 pt-8">
          <div className="h-4 bg-[#202330] rounded w-full"></div>
          <div className="h-4 bg-[#202330] rounded w-full"></div>
          <div className="h-4 bg-[#202330] rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (error || !meta.title) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-20 px-4">
        <div className="inline-flex p-3 rounded-full bg-rose-950/40 border border-rose-900/40 text-rose-400 mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          {isEn ? 'Article Not Found' : 'Статья не найдена'}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {isEn ? 'The requested academic material does not exist or has been moved.' : 'Запрошенный академический материал не существует или был перемещен.'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#202330] text-kingdom-gold border border-white/10 hover:border-kingdom-gold/40 rounded-xl text-xs font-semibold hover:bg-[#282c3c] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.article.back}</span>
        </button>
      </div>
    );
  }

  const categoryKey = meta.category?.toLowerCase() || '';
  const categoryTitle = categoryDict[categoryKey] || meta.category || (isEn ? 'General Biology' : 'Общая биология');
  const readingTime = meta.readingTimeMin || 8;
  const lastReviewedDate = meta.lastReviewed || '2026-08-28';
  const referencesList = meta.references || [];

  return (
    <article className="w-full pb-20 pt-2 selection:bg-kingdom-gold selection:text-black">
      
      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-0 mb-8 flex items-center justify-between gap-3 text-xs text-gray-400 border-b border-[#34384a] pb-4">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 flex-wrap min-w-0">
          <button
            onClick={onBack}
            className="hover:text-kingdom-gold transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.catalog.title}</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-[400px] font-medium text-slate-200">
            {categoryTitle}
          </span>
        </nav>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Direct Article Language Switcher */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-xs font-medium ${
              isEn 
                ? 'bg-kingdom-gold/20 text-kingdom-gold border-kingdom-gold/40 shadow-sm' 
                : 'bg-[#202330] hover:bg-[#282c3c] text-gray-300 hover:text-white border-white/5'
            }`}
            title={isEn ? 'Switch to Russian' : 'Переключить на Английский'}
          >
            <Languages className="w-3.5 h-3.5 text-kingdom-gold" />
            <span>{isEn ? 'EN' : 'RU'}</span>
          </button>

          <button
            onClick={handleCite}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202330] hover:bg-[#282c3c] text-gray-300 hover:text-white border border-white/5 transition-colors cursor-pointer text-xs font-medium"
            title={t.article.cite}
          >
            <Quote className="w-3.5 h-3.5 text-kingdom-gold" />
            <span className="hidden sm:inline">{t.article.cite}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202330] hover:bg-[#282c3c] text-gray-300 hover:text-white border border-white/5 transition-colors cursor-pointer text-xs font-medium"
            title={t.article.share}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? t.article.copied : t.article.share}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-[#202330] hover:bg-[#282c3c] text-gray-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
            title={isEn ? 'Print' : 'Печать'}
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Column */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-0">
        
        {/* English Translation Notice Banner when reading in English */}
        {isEn && (
          <div className="mb-6 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kingdom-gold shrink-0" />
              <span>
                <strong>English Academic Translation:</strong> Standardized zoological & veterinary terminology applied.
              </span>
            </div>
            <button
              onClick={() => setLang('ru')}
              className="text-xs text-kingdom-gold hover:underline cursor-pointer ml-3 shrink-0"
            >
              Original RU
            </button>
          </div>
        )}

        {/* Title and Evidence Badge */}
        <header className="mb-8 space-y-4">
          <div className="space-y-3">
            {meta.evidenceLevel && (
              <div className="mb-2">
                <EvidenceBadge level={meta.evidenceLevel} />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-[1.25]">
              {displayTitle}
            </h1>
          </div>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-3 border-t border-white/10 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 font-medium text-gray-300">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{readingTime} {t.catalog.readingTime} {isEn ? 'read' : 'чтения'}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{isEn ? 'Revision:' : 'Ревизия:'} {lastReviewedDate}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-400">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>{categoryTitle}</span>
            </div>

            {/* Tags */}
            {displayTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap w-full mt-1">
                <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                {displayTags.map((tTag: string) => (
                  <button
                    key={tTag}
                    onClick={() => handleTagClick(tTag)}
                    className="px-2 py-0.5 rounded-full bg-[#1e2130] hover:bg-[#282c3c] text-gray-300 border border-white/5 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    #{tTag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Lead / Excerpt */}
        {displayExcerpt && (
          <div className="my-6 p-5 rounded-xl bg-[#181a24] border-l-4 border-kingdom-gold text-gray-200 text-base sm:text-lg leading-relaxed font-normal shadow-sm">
            {displayExcerpt}
          </div>
        )}

        {/* Key Findings Block */}
        {displayKeyFindings && (
          <section className="my-8 rounded-xl border border-[#34384a] border-l-4 border-l-amber-400 bg-[#161822] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-amber-300 font-semibold text-sm">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isEn ? 'Key Insights & Parameters' : 'Ключевые сведения и параметры'}</span>
            </div>
            <div className="text-gray-200 text-sm leading-relaxed space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 text-gray-200" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1.5 my-2 text-gray-300 text-xs sm:text-sm" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-kingdom-gold" {...props} />
                }}
              >
                {displayKeyFindings}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* Article Body */}
        <div className="academic-article-prose text-gray-300 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              h2: ({ node, ...props }) => (
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-10 mb-4 pb-2 border-b border-white/10" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-100 mt-7 mb-3" {...props} />
              ),
              p: ({ node, children, ...props }) => {
                const renderAnnotatedChildren = (childNode: React.ReactNode): React.ReactNode => {
                  if (typeof childNode === 'string') {
                    return annotateTextWithGlossary(childNode, seenGlossaryTerms);
                  }
                  if (Array.isArray(childNode)) {
                    return childNode.map((c, i) => (
                      <React.Fragment key={i}>{renderAnnotatedChildren(c)}</React.Fragment>
                    ));
                  }
                  return childNode;
                };

                const annotated = renderAnnotatedChildren(children);
                const collapsed = Array.isArray(annotated) ? collapseCitationNodes(annotated) : annotated;

                return (
                  <p className="mb-5 leading-relaxed text-sm sm:text-base text-gray-300" {...props}>
                    {collapsed}
                  </p>
                );
              },
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside ml-5 space-y-2 mb-5 text-sm sm:text-base text-gray-300" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-outside ml-5 space-y-2.5 mb-5 text-sm sm:text-base text-gray-300" {...props} />
              ),
              li: ({ node, children, ...props }: any) => {
                const isFootnoteItem = props.id?.includes('fn-') || props.id?.includes('fnref');
                if (isFootnoteItem) {
                  return (
                    <li
                      id={props.id}
                      className="text-xs text-gray-300 pl-2 leading-relaxed my-2 rounded-lg p-2.5 transition-colors duration-300 hover:bg-[#1a1c28] border border-transparent hover:border-white/5 [&_p]:inline [&_p]:mb-0 [&_p]:leading-relaxed"
                      {...props}
                    >
                      {consolidateFootnoteItem(children, isEn)}
                    </li>
                  );
                }
                const collapsed = Array.isArray(children) ? collapseCitationNodes(children) : children;
                return <li className="text-gray-300" {...props}>{collapsed}</li>;
              },
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-kingdom-gold pl-4 py-2 my-6 text-gray-300 italic bg-[#181a24] border border-[#2b2e3d] rounded-r-xl" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6 border border-[#2b2e3d] rounded-xl bg-[#14161f]">
                  <table className="min-w-full divide-y divide-[#2b2e3d] text-xs sm:text-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th scope="col" className="px-4 py-2.5 bg-[#181a24] font-bold text-left text-gray-200" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-2.5 border-t border-[#2b2e3d] text-gray-300" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  loading="lazy"
                  decoding="async"
                  className="rounded-xl my-6 max-w-full h-auto border border-white/10 shadow-lg"
                />
              ),
              sup: ({ node, ...props }) => (
                <sup className="text-[11px] font-mono font-medium leading-none px-0.5 text-kingdom-gold hover:text-amber-300 transition-colors select-none align-super" {...props} />
              ),
              a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
                const isFootnoteBackref = (props as any)['data-footnote-backref'] !== undefined ||
                  (props.className && typeof props.className === 'string' && props.className.includes('data-footnote-backref')) ||
                  href?.includes('-fnref-');

                if (href?.startsWith('#')) {
                  const backrefCount = (props as any)['data-backref-count'];
                  const countLabel = backrefCount && backrefCount > 1 ? ` (${backrefCount})` : '';

                  return (
                    <a
                      href={href}
                      title={
                        isFootnoteBackref
                          ? (isEn ? 'Jump to cited location in article text' : 'Перейти к месту цитирования в тексте статьи')
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        const rawId = href.slice(1);
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
                                       document.getElementById(`user-content-fnref-${digitsOnly}`) ||
                                       document.getElementById(`fnref-${digitsOnly}`) ||
                                       document.getElementById(`ref_${digitsOnly}`);
                          }
                        }

                        if (targetEl) {
                          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          
                          // Check if target is a footnote item or in-text anchor
                          const isTargetFootnote = targetEl.id.includes('fn-') || targetEl.tagName.toLowerCase() === 'li';

                          if (isTargetFootnote) {
                            // Highlight the whole footnote entry at the bottom
                            targetEl.classList.add(
                              'ring-2',
                              'ring-kingdom-gold',
                              'bg-[#232738]',
                              'shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                            );
                            setTimeout(() => {
                              targetEl?.classList.remove(
                                'ring-2',
                                'ring-kingdom-gold',
                                'bg-[#232738]',
                                'shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                              );
                            }, 2500);
                          } else {
                            // Target is citation in article body - highlight sup badge cleanly without causing layout shifts
                            const targetSup = targetEl.closest('sup') || targetEl;
                            targetSup.classList.add(
                              'ring-2',
                              'ring-kingdom-gold',
                              'bg-kingdom-gold/30',
                              'shadow-[0_0_16px_rgba(212,175,55,0.7)]'
                            );

                            const parentParagraph = targetEl.closest('p');
                            if (parentParagraph && isFootnoteBackref) {
                              parentParagraph.classList.add('bg-kingdom-gold/10', 'ring-1', 'ring-kingdom-gold/30', 'rounded-lg');
                            }

                            setTimeout(() => {
                              targetSup.classList.remove(
                                'ring-2',
                                'ring-kingdom-gold',
                                'bg-kingdom-gold/30',
                                'shadow-[0_0_16px_rgba(212,175,55,0.7)]'
                              );
                              if (parentParagraph) {
                                parentParagraph.classList.remove('bg-kingdom-gold/10', 'ring-1', 'ring-kingdom-gold/30', 'rounded-lg');
                              }
                            }, 2500);
                          }
                        }
                      }}
                      className={
                        isFootnoteBackref
                          ? 'inline-flex items-center gap-1.5 text-kingdom-gold hover:text-amber-200 font-sans text-xs font-semibold ml-2 px-2.5 py-1 rounded-md bg-kingdom-gold/15 hover:bg-kingdom-gold/25 border border-kingdom-gold/40 hover:border-kingdom-gold/60 shadow-sm hover:shadow transition-all duration-150 cursor-pointer no-underline select-none my-1'
                          : 'text-kingdom-gold hover:underline font-mono text-xs font-semibold px-0.5 inline-block cursor-pointer'
                      }
                      {...props}
                    >
                      {isFootnoteBackref ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-bold leading-none">↑</span>
                          <span>{isEn ? `To text${countLabel}` : `К тексту статьи${countLabel}`}</span>
                        </span>
                      ) : (
                        children
                      )}
                    </a>
                  );
                }

                if (href?.startsWith('http://') || href?.startsWith('https://')) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-kingdom-gold hover:underline font-medium inline-flex items-center gap-0.5 transition-colors"
                      {...props}
                    >
                      <span>{children}</span>
                      <ExternalLink className="w-3 h-3 inline opacity-70" />
                    </a>
                  );
                }

                if (href?.endsWith('.md') || href?.startsWith('/') || href?.includes('/docs/')) {
                  return (
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        const cleanTarget = href.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\.md$/, '');
                        navigateToArticle(cleanTarget);
                      }}
                      className="text-kingdom-gold hover:underline font-medium cursor-pointer transition-colors"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-kingdom-gold hover:underline font-medium inline-flex items-center gap-0.5 transition-colors"
                    {...props}
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-3 h-3 inline opacity-70" />
                  </a>
                );
              },
              section: (props: any) => {
                const { className, children, ...rest } = props;
                if (props['data-footnotes'] || className === 'footnotes' || (typeof className === 'string' && className.includes('footnotes'))) {
                  return (
                    <div id="footnotes-literature-section" className="mt-14 pt-8 border-t border-white/10 text-xs text-gray-300">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center gap-2">
                        <Quote className="w-4 h-4 text-kingdom-gold" />
                        <span>{isEn ? 'References & Literature' : '📚 Литература и источники'}</span>
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

        {/* 4. Scientific Uncertainty (Known / Probable / Unknown) */}
        {displayUncertainty && (
          <section className="my-12 p-5 rounded-2xl bg-[#161822] border border-[#2b2e3d]">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2b2e3d]">
              <Scale className="w-4 h-4 text-kingdom-gold shrink-0" />
              <h3 className="font-bold text-sm text-gray-100">
                {isEn ? 'Scientific Uncertainty & Evidence Boundaries' : 'Научная неопределённость и границы доказанности'}
              </h3>
            </div>

            <div className="space-y-3.5">
              {displayUncertainty.known && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#13151f] border border-emerald-900/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-emerald-300 block mb-0.5">
                      {isEn ? 'Established Fact:' : 'Достоверно установлено:'}
                    </span>
                    <p>{displayUncertainty.known}</p>
                  </div>
                </div>
              )}

              {displayUncertainty.probable && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#13151f] border border-amber-900/40">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-amber-300 block mb-0.5">
                      {isEn ? 'Probable / Requires Verification:' : 'Вероятно / Требует верификации:'}
                    </span>
                    <p>{displayUncertainty.probable}</p>
                  </div>
                </div>
              )}

              {displayUncertainty.unknown && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#13151f] border border-rose-900/40">
                  <HelpIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    <span className="font-semibold text-rose-300 block mb-0.5">
                      {isEn ? 'Open Research Questions:' : 'Открытые исследовательские вопросы:'}
                    </span>
                    <p>{displayUncertainty.unknown}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Related Topics */}
        {relatedArticles.length > 0 && (
          <section className="mt-14 pt-8 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-kingdom-gold" />
              <span>{t.article.related}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {relatedArticles.map((rel) => {
                const relCatKey = rel.category?.toLowerCase() || '';
                return (
                  <button
                    key={rel.path}
                    onClick={() => navigateToArticle(rel.path)}
                    className="p-3.5 rounded-xl bg-[#181a24] border border-[#2b2e3d] hover:border-kingdom-gold/40 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                        {categoryDict[relCatKey] || rel.category}
                      </span>
                      <h4 className="text-xs font-semibold text-gray-200 group-hover:text-kingdom-gold transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    {rel.excerpt && (
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-2">
                        {rel.excerpt}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. References / Bibliography */}
        {referencesList.length > 0 && !rawContent.includes('[^') && (
          <section className="mt-14 pt-8 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center gap-2">
              <Quote className="w-4 h-4 text-kingdom-gold" />
              <span>{isEn ? 'References & Bibliography (APA)' : '📚 Источники и библиография (APA)'}</span>
            </h3>

            <ol className="space-y-3 text-xs text-gray-400 list-decimal list-outside ml-4">
              {referencesList.map((refItem: ReferenceItem | string, idx: number) => {
                const isString = typeof refItem === 'string';
                const ref = isString ? { id: `ref_${idx + 1}`, title: refItem } : refItem;
                const safeId = ref.id || `ref_${idx + 1}`;

                return (
                  <li id={`user-content-fn-${safeId}`} key={idx} className="leading-relaxed pl-1">
                    {isString ? (
                      <span>{refItem}</span>
                    ) : (
                      <span className="text-gray-300">
                        {ref.authors && <span className="font-semibold text-gray-100">{ref.authors} </span>}
                        {ref.year && <span>({ref.year}). </span>}
                        <span className="italic text-gray-200">{ref.title}. </span>
                        {ref.journal && <span>{ref.journal}. </span>}
                        {ref.book && <span>{ref.book}. </span>}
                        {ref.doi && (() => {
                          const cleanDoi = normalizeDoi(ref.doi);
                          const doiUrl = formatDoiUrl(ref.doi);
                          if (!cleanDoi || !doiUrl) return null;
                          return (
                            <a
                              href={doiUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-kingdom-gold hover:underline ml-1.5 font-mono inline-flex items-center gap-0.5"
                            >
                              <span>DOI: {cleanDoi}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          );
                        })()}
                        {ref.isbn && (
                          <span className="text-gray-400 font-mono ml-1.5">
                            ISBN: {ref.isbn}
                          </span>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* 7. Editorial Status Block */}
        <EditorialStatusBlock
          lastReviewed={lastReviewedDate}
          datePublished={meta.datePublished}
          category={meta.category}
          evidenceLevel={meta.evidenceLevel}
          evidenceBasis={meta.evidenceBasis}
        />

        {/* Previous / Next Article Navigation */}
        {(prevArticle || nextArticle) && (
          <nav className="mt-10 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {prevArticle ? (
              <button
                onClick={() => navigateToArticle(prevArticle.path)}
                className="flex flex-col text-left p-3.5 rounded-xl bg-[#181a24] border border-[#2b2e3d] hover:border-kingdom-gold/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center text-gray-400 group-hover:text-kingdom-gold mb-1 font-medium">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>{t.article.prev}</span>
                </div>
                <span className="font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                  {prevArticle.title}
                </span>
              </button>
            ) : <div />}

            {nextArticle ? (
              <button
                onClick={() => navigateToArticle(nextArticle.path)}
                className="flex flex-col text-right p-3.5 rounded-xl bg-[#181a24] border border-[#2b2e3d] hover:border-kingdom-gold/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-end text-gray-400 group-hover:text-kingdom-gold mb-1 font-medium">
                  <span>{t.article.next}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
                <span className="font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                  {nextArticle.title}
                </span>
              </button>
            ) : <div />}
          </nav>
        )}

      </div>
    </article>
  );
}

