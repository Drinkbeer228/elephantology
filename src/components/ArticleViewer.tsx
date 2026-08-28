import React, { useEffect, useState, useMemo } from 'react';
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
  Scale
} from 'lucide-react';
import { parseFrontmatter } from '../lib/markdown';
import { getStaticArticles, resolveArticlePath } from '../lib/articles';
import { ArticleItem } from '../lib/searchEngine';
import { EvidenceBadge, EditorialStatusBlock } from './ArticleBlocks';

interface ArticleViewerProps {
  path: string;
  onBack: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  taxonomy: 'Таксономия и Эволюция',
  anatomy: 'Анатомия и Физиология',
  ethogram: 'Этология и Поведение',
  cognition: 'Когнитивистика и Память',
  veterinary: 'Ветеринария и Патологии',
  ecology: 'Экология и Среда обитания',
  conservation: 'Охрана и Сохранение видов',
  culture: 'Антропозоология и Культура',
  paleontology: 'Палеонтология и Ископаемые',
  genomics: 'Геномика и Молекулярная биология'
};

export function ArticleViewer({ path, onBack }: ArticleViewerProps) {
  const [content, setContent] = useState<string>('');
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<ArticleItem[]>([]);
  const [prevArticle, setPrevArticle] = useState<ArticleItem | null>(null);
  const [nextArticle, setNextArticle] = useState<ArticleItem | null>(null);

  // Извлеченные структурированные секции
  const [keyFindings, setKeyFindings] = useState<string | null>(null);
  const [uncertainty, setUncertainty] = useState<{ known?: string; probable?: string; unknown?: string } | null>(null);
  const [cleanBody, setCleanBody] = useState<string>('');

  useEffect(() => {
    const safePath = path.endsWith('.md') ? path : `${path}.md`;
    const cleanPath = safePath.replace(/^\//, '');
    const pathPart = cleanPath.replace(/\.md$/, '');

    // Вычисляем предыдущую и следующую статьи для академической навигации
    try {
      const allArticles = getStaticArticles();
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
        setPrevArticle(currentIndex > 0 ? sorted[currentIndex - 1] : null);
        setNextArticle(currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null);
      } else {
        setPrevArticle(null);
        setNextArticle(null);
      }
    } catch (e) {
      console.warn('Не удалось настроить смежные статьи:', e);
    }

    setLoading(true);
    setError(null);

    try {
      const modules = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
      const moduleKeys = Object.keys(modules);
      const matchedKey = resolveArticlePath(path, moduleKeys);

      if (matchedKey && modules[matchedKey]) {
        const contentObj = modules[matchedKey];
        const textContent = typeof contentObj === 'string' ? contentObj : (contentObj as any).default || '';
        const { metadata, content: rawMd } = parseFrontmatter(textContent);

        // 1. Извлекаем и отделяем блок «Ключевые сведения / показатели / метрики»
        let processedContent = rawMd;
        let extractedKeyFindings: string | null = null;
        const keyFindingsMatch = processedContent.match(/##\s*(?:📊\s*)?(?:Ключевые сведения|Ключевые показатели|Ключевые метрики|Ключевые палеонтологические метрики|Ключевые геномные[^\n]*)\n([\s\S]*?)(?=\n##|\Z)/i);
        if (keyFindingsMatch) {
          extractedKeyFindings = keyFindingsMatch[1].trim();
          processedContent = processedContent.replace(keyFindingsMatch[0], '');
        }

        // 2. Извлекаем блок «Научная неопределённость»
        let extractedUncertainty: { known?: string; probable?: string; unknown?: string } | null = null;
        const uncertaintyMatch = processedContent.match(/##\s*(?:⚖️\s*)?(?:Научная неопределённость|Границы научного знания|Неопределённость[^\n]*)\n([\s\S]*?)(?=\n##|\Z)/i);
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

        // 3. Вырезаем заголовок H1, если он дублирует meta.title в начале текста
        processedContent = processedContent.replace(/^#\s+[^\n]+\n+/, '');

        // 4. Очищаем блок Связанные знания (он будет отрендерен нативно внизу)
        const relatedSectionMatch = processedContent.match(/##\s*(?:Связанные знания|Связанные материалы|Связанные темы)[^\n]*\n([\s\S]*?)(?=\n##|\Z)/i);
        if (relatedSectionMatch) {
          processedContent = processedContent.replace(relatedSectionMatch[0], '');
        }

        setMeta(metadata);
        setKeyFindings(extractedKeyFindings);
        setUncertainty(extractedUncertainty);
        setCleanBody(processedContent.trim());
        computeRelated(metadata, cleanPath);
      } else {
        throw new Error('Статья не найдена в хранилище');
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки статьи');
    } finally {
      setLoading(false);
    }
  }, [path]);

  // Вычисление связанных статей по категории и общим тегам
  const computeRelated = (metadata: any, currentCleanPath: string) => {
    try {
      const allArticles = getStaticArticles();
      const cleanPath = currentCleanPath.replace(/\.md$/, '');
      let related: ArticleItem[] = [];

      // 1. Прямые ссылки из frontmatter `related_knowledge`
      if (metadata.related_knowledge && metadata.related_knowledge.length > 0) {
        metadata.related_knowledge.forEach((rk: any) => {
          const target = (typeof rk === 'string' ? rk : rk.target || '').replace(/\.md$/, '').replace(/^\//, '');
          const found = allArticles.find(
            a => a.path.replace(/\.md$/, '') === target || a.path.includes(target)
          );
          if (found && !related.some(r => r.path === found.path) && found.path.replace(/\.md$/, '') !== cleanPath) {
            related.push(found);
          }
        });
      }

      // 2. Дополняем наиболее релевантными статьями из той же категории
      if (related.length < 3) {
        const currentTags: string[] = metadata.tags || [];
        const candidates = allArticles.filter(
          a => a.path.replace(/\.md$/, '') !== cleanPath && !related.some(r => r.path === a.path)
        );

        candidates.sort((a, b) => {
          let scoreA = a.category?.toLowerCase() === metadata.category?.toLowerCase() ? 3 : 0;
          let scoreB = b.category?.toLowerCase() === metadata.category?.toLowerCase() ? 3 : 0;
          if (a.tags && currentTags.length > 0) {
            scoreA += a.tags.filter(t => currentTags.includes(t)).length * 2;
          }
          if (b.tags && currentTags.length > 0) {
            scoreB += b.tags.filter(t => currentTags.includes(t)).length * 2;
          }
          return scoreB - scoreA;
        });

        for (const c of candidates) {
          if (related.length >= 3) break;
          related.push(c);
        }
      }

      setRelatedArticles(related.slice(0, 3));
    } catch (e) {
      console.warn('Ошибка вычисления связанных статей:', e);
    }
  };

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openCitationModal = () => {
    window.dispatchEvent(
      new CustomEvent('open-citation', {
        detail: {
          title: meta.title || 'Статья',
          url: window.location.href,
          category: meta.category,
          authors: 'Редакционная коллегия Слонологии',
          year: '2026'
        }
      })
    );
  };

  const navigateToArticle = (targetPath: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const modules = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
      const resolved = resolveArticlePath(targetPath, Object.keys(modules));
      const cleanRel = resolved ? resolved.replace(/^\/docs\//, '').replace(/\.md$/, '') : targetPath;

      const win = window as any;
      if (win.loadArticle) {
        win.loadArticle(cleanRel);
      } else {
        window.dispatchEvent(new CustomEvent('load-article', { detail: cleanRel }));
      }
    } catch {
      window.dispatchEvent(new CustomEvent('load-article', { detail: targetPath }));
    }
  };

  const handleTagClick = (tag: string) => {
    window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true, tag } }));
  };

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="space-y-3 pt-8">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (error || !meta.title) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-20 px-4">
        <div className="inline-flex p-3 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Статья не найдена</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Запрошенный академический материал не существует или был перемещен.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в каталог</span>
        </button>
      </div>
    );
  }

  const categoryTitle = CATEGORY_NAMES[meta.category?.toLowerCase()] || meta.category || 'Общая биология';
  const readingTime = meta.readingTimeMin || 8;
  const lastReviewedDate = meta.lastReviewed || '2026-08-28';
  const tagsList: string[] = meta.tags || [];
  const referencesList = meta.references || [];

  return (
    <article className="w-full pb-20 pt-2 selection:bg-slate-200 dark:selection:bg-slate-700">
      
      {/* 1. Верхняя навигационная панель и хлебные крошки */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-0 mb-8 flex items-center justify-between gap-3 text-xs text-slate-400 border-b border-[#34384a] pb-4">
        <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 flex-wrap min-w-0">
          <button
            onClick={onBack}
            className="hover:text-kingdom-gold transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Энциклопедия</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-[400px] font-medium text-slate-200">
            {categoryTitle}
          </span>
        </nav>
      </div>

      {/* 2. Основная читаемая колонка контента (Строго макс. 720px) */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-0">
        
        {/* Заголовок H1 и Evidence Level Бейдж */}
        <header className="mb-8 space-y-4">
          <div className="space-y-3">
            {meta.evidenceLevel && (
              <div className="mb-2">
                <EvidenceBadge level={meta.evidenceLevel} />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.25]">
              {meta.title}
            </h1>
          </div>

          {/* Горизонтальная мета-информация под H1 */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{readingTime} мин чтения</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Ревизия: {lastReviewedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{categoryTitle}</span>
            </div>

            {/* Теги статьи как маленькие бейджи */}
            {tagsList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap w-full mt-1">
                <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                {tagsList.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 1. КРАТКОЕ РЕЗЮМЕ / ЛИД (Lead Paragraph) */}
        {meta.excerpt && (
          <div className="my-6 p-5 rounded-xl bg-[#181a24] border-l-4 border-kingdom-gold text-slate-100 text-base sm:text-lg leading-relaxed font-normal shadow-sm">
            {meta.excerpt}
          </div>
        )}

        {/* 2. КЛЮЧЕВЫЕ СВЕДЕНИЯ / ПОКАЗАТЕЛИ */}
        {keyFindings && (
          <section className="my-8 rounded-xl border border-[#34384a] border-l-4 border-l-amber-400 bg-[#161822] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-amber-300 font-semibold text-sm">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ключевые сведения</span>
            </div>
            <div className="text-slate-200 text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-3 border border-[#34384a] rounded-lg">
                      <table className="w-full text-xs text-left border-collapse" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border-b border-[#34384a] bg-[#1f2230] text-slate-100 font-semibold py-2.5 px-3 uppercase tracking-wider text-[11px]" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border-b border-[#252838] bg-[#141620]/80 py-2.5 px-3 text-slate-200 text-xs" {...props} />
                  )
                }}
              >
                {keyFindings}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* 3. ОСНОВНОЙ ТЕКСТ (Академическая типографика: 18px, line-height 1.7, цвет slate-100 / slate-200) */}
        <div className="article-prose text-[17px] sm:text-[18px] leading-[1.7] text-slate-200 space-y-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-12 mb-4 tracking-tight" {...props} />
              ),
              h2: ({ node, ...props }) => {
                if (props.id === 'footnote-label' || props.children === 'Footnotes' || props.children === 'Сноски') {
                  return null;
                }
                return (
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-10 mb-4 pb-2 border-b border-[#34384a] tracking-tight" {...props} />
                );
              },
              h3: ({ node, ...props }) => (
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mt-8 mb-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-5 leading-[1.7] text-slate-200" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-white" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="my-6 pl-4 py-2.5 border-l-4 border-kingdom-gold bg-[#181a24] rounded-r-lg text-slate-300 text-base italic" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside mb-6 ml-5 space-y-2 text-slate-200" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-outside mb-6 ml-5 space-y-2 text-slate-200" {...props} />
              ),
              li: ({ node, ...props }) => <li className="leading-[1.7]" {...props} />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-8 border border-[#34384a] rounded-xl shadow-sm">
                  <table className="w-full text-left border-collapse text-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="bg-[#1f2230] p-3.5 font-semibold text-white border-b border-[#34384a] text-xs uppercase tracking-wider" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="p-3.5 border-b border-[#252838] bg-[#141620]/60 text-slate-200 text-sm" {...props} />
              ),
              code: ({ node, className, children, ...props }: any) => {
                const isInline = !className && typeof children === 'string' && !children.includes('\n');
                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-[#1e202c] text-kingdom-gold font-mono text-[14px] border border-[#34384a]" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <div className="overflow-x-auto my-6 p-4 rounded-xl bg-[#111218] text-slate-100 font-mono text-xs border border-[#34384a]">
                    <pre {...props}>
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              },
              a: ({ node, href, children, ...props }: any) => {
                if (props['data-footnote-ref']) {
                  return (
                    <a
                      href={href}
                      className="px-0.5 font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline align-super"
                      onClick={(e) => {
                        e.preventDefault();
                        const targetId = href?.replace('#', '');
                        const elem = document.getElementById(targetId);
                        if (elem) {
                          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          elem.classList.add('bg-blue-50', 'dark:bg-blue-950/50', 'transition-colors');
                          setTimeout(() => elem.classList.remove('bg-blue-50', 'dark:bg-blue-950/50'), 2000);
                        }
                      }}
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }

                // Внутренние ссылки на статьи
                if (href && (href.startsWith('/') || href.startsWith('.') || href.endsWith('.md'))) {
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
              section: ({ node, className, children, ...props }: any) => {
                if (props['data-footnotes'] || className === 'footnotes' || (props.className && props.className.includes('footnotes'))) {
                  return (
                    <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">Примечания</h4>
                      <div className="space-y-2">{children}</div>
                    </div>
                  );
                }
                return <section className={className} {...props}>{children}</section>;
              }
            }}
          >
            {cleanBody}
          </ReactMarkdown>
        </div>

        {/* 4. НАУЧНАЯ НЕОПРЕДЕЛЁННОСТЬ (Known / Probable / Unknown) */}
        {uncertainty && (
          <section className="my-12 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Scale className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Научная неопределённость и границы доказанности
              </h3>
            </div>

            <div className="space-y-3.5">
              {uncertainty.known && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      Достоверно установлено:
                    </span>
                    <p>{uncertainty.known}</p>
                  </div>
                </div>
              )}

              {uncertainty.probable && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-amber-800 dark:text-amber-300 block mb-0.5">
                      Вероятно / Требует верификации:
                    </span>
                    <p>{uncertainty.probable}</p>
                  </div>
                </div>
              )}

              {uncertainty.unknown && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40">
                  <HelpIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-rose-800 dark:text-rose-300 block mb-0.5">
                      Открытые исследовательские вопросы:
                    </span>
                    <p>{uncertainty.unknown}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. СВЯЗАННЫЕ ТЕМЫ (Карточки-ссылки: заголовок + 1 строка описания, 2-3 в ряд) */}
        {relatedArticles.length > 0 && (
          <section className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Связанные монографии</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {relatedArticles.map((rel) => (
                <button
                  key={rel.path}
                  onClick={() => navigateToArticle(rel.path)}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-left transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      {CATEGORY_NAMES[rel.category?.toLowerCase()] || rel.category}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  {rel.excerpt && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-2">
                      {rel.excerpt}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 6. ИСТОЧНИКИ (Нумерованный список в APA-формате с кликабельными DOI / ISBN) */}
        {referencesList.length > 0 && (
          <section className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Quote className="w-4 h-4 text-slate-500" />
              <span>Источники и библиография (APA)</span>
            </h3>

            <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-400 list-decimal list-outside ml-4">
              {referencesList.map((ref: any, idx: number) => {
                const safeId = ref.id || `ref_${idx + 1}`;
                const isString = typeof ref === 'string';

                return (
                  <li id={`user-content-fn-${safeId}`} key={idx} className="leading-relaxed pl-1">
                    {isString ? (
                      <span>{ref}</span>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">
                        {ref.authors && <span className="font-semibold text-slate-900 dark:text-slate-200">{ref.authors} </span>}
                        {ref.year && <span>({ref.year}). </span>}
                        <span className="italic">{ref.title}. </span>
                        {ref.journal && <span>{ref.journal}. </span>}
                        {ref.book && <span>{ref.book}. </span>}
                        {ref.doi && (
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline ml-1.5 font-mono inline-flex items-center gap-0.5"
                          >
                            <span>DOI: {ref.doi}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {ref.isbn && (
                          <span className="text-slate-500 font-mono ml-1.5">
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

        {/* 7. РЕДАКЦИОННЫЙ ПЕРЕСМОТР И СТАТУС */}
        <EditorialStatusBlock
          lastReviewed={lastReviewedDate}
          category={meta.category}
          evidenceLevel={meta.evidenceLevel}
        />

        {/* Навигация «Предыдущая / Следующая статья» */}
        {(prevArticle || nextArticle) && (
          <nav className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {prevArticle ? (
              <button
                onClick={() => navigateToArticle(prevArticle.path)}
                className="flex flex-col text-left p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-center text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 mb-1 font-medium">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Предыдущая монография</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {prevArticle.title}
                </span>
              </button>
            ) : <div />}

            {nextArticle ? (
              <button
                onClick={() => navigateToArticle(nextArticle.path)}
                className="flex flex-col text-right p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-end text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 mb-1 font-medium">
                  <span>Следующая монография</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
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
