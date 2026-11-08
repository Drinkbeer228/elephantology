import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { StructuredReference } from '../types';
import { slugifyHeading } from '../services/referenceService';
import { resolveInternalCrossReference, resolvePublicAssetUrl } from '../services/articleService';
import { CitationPopover } from './CitationPopover';
import { annotateChildrenWithGlossary } from './GlossaryAnnotation';
import { useLanguage } from '../i18n/LanguageContext';

export interface ArticleContentRendererProps {
  bodyMarkdown: string;
  references: StructuredReference[];
  category: string;
  onSelectArticle: (path: string) => void;
}

export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  bodyMarkdown,
  references,
  category,
  onSelectArticle,
}) => {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const referenceByNumber = useMemo(() => {
    const map = new Map<string, StructuredReference>();
    references.forEach((ref, index) => {
      const num = String(index + 1);
      map.set(num, ref);
      map.set(ref.id.replace(/^ref_/, ''), ref);
    });
    return map;
  }, [references]);

  const handleCopyAnchor = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="article-prose markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: () => null,
          h2: ({ children, ...props }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return (
              <h2 id={id} className="group relative scroll-mt-24 flex items-center gap-2" {...props}>
                <span>{children}</span>
                <button
                  type="button"
                  onClick={() => handleCopyAnchor(id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-ink-muted hover:text-forest font-mono text-xs"
                  title={t.article.share}
                  aria-label={t.article.share}
                >
                  {copiedId === id ? '✓' : '#'}
                </button>
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const id = slugifyHeading(text);
            return (
              <h3 id={id} className="group relative scroll-mt-24 flex items-center gap-2" {...props}>
                <span>{children}</span>
                <button
                  type="button"
                  onClick={() => handleCopyAnchor(id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-ink-muted hover:text-forest font-mono text-xs"
                  title={t.article.share}
                  aria-label={t.article.share}
                >
                  {copiedId === id ? '✓' : '#'}
                </button>
              </h3>
            );
          },
          p: ({ children, ...props }) => (
            <p {...props}>{annotateChildrenWithGlossary(children)}</p>
          ),
          li: ({ children, ...props }) => (
            <li {...props}>{annotateChildrenWithGlossary(children)}</li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote {...props}>{children}</blockquote>
          ),
          sup: ({ children }) => <>{children}</>,
          section: ({ className, children, ...props }) => {
            // Hide GFM's auto-generated duplicate footnotes section at bottom of markdown since ReferencesSection renders structured DOI references
            if (className?.includes('footnotes')) {
              return null;
            }
            return (
              <section className={className} {...props}>
                {children}
              </section>
            );
          },
          a: ({ href, children, ...props }) => {
            if (
              href?.startsWith('#ref-') ||
              href?.startsWith('#ref_') ||
              href?.includes('user-content-fn-')
            ) {
              const numMatch = href.match(/(\d+)$/);
              const citationNumber = numMatch ? numMatch[1] : String(children).replace(/\D/g, '');
              const refItem = referenceByNumber.get(citationNumber);
              return (
                <CitationPopover
                  citationNumber={citationNumber || '1'}
                  reference={refItem}
                  href={`#ref_${citationNumber}`}
                />
              );
            }

            const internalPath = resolveInternalCrossReference(href || '', category);
            if (internalPath) {
              return (
                <a
                  href={`?article=${encodeURIComponent(internalPath)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectArticle(internalPath);
                  }}
                  className="article-inline-link cursor-pointer"
                  {...props}
                >
                  {children}
                </a>
              );
            }

            if (href?.startsWith('#')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(href.slice(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="article-inline-link"
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
                rel="noopener noreferrer"
                className="article-inline-link"
                {...props}
              >
                {children}
              </a>
            );
          },
          table: ({ children, ...props }) => (
            <div className="my-7 overflow-x-auto border-y border-rule">
              <table className="w-full text-left border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          pre: ({ children, ...props }) => (
            <pre
              className="my-6 p-4 bg-paper-warm border border-rule font-mono text-xs text-ink overflow-x-auto leading-relaxed"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className && className.includes('language-'));
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="font-mono text-[0.86em] bg-paper-warm text-ink px-1.5 py-0.5 border border-rule-subtle"
                {...props}
              >
                {children}
              </code>
            );
          },
          img: ({ src, alt, ...props }) => {
            const resolvedSrc = resolvePublicAssetUrl(src || '');
            return (
              <span className="block my-8 border border-rule bg-paper-warm p-3">
                <img
                  src={resolvedSrc}
                  alt={alt || ''}
                  loading="lazy"
                  className="w-full h-auto object-contain max-h-[540px] mx-auto block"
                  {...props}
                />
                {alt && (
                  <span className="block mt-2.5 pt-2 border-t border-rule-subtle font-sans text-xs text-ink-muted text-center">
                    {alt}
                  </span>
                )}
              </span>
            );
          },
        }}
      >
        {bodyMarkdown}
      </ReactMarkdown>
    </div>
  );
};
