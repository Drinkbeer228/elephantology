import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Link as LinkIcon, Share2, Clock, Quote, BookOpen, Database, X, ShieldCheck, Scale, AlertCircle, Lightbulb, HelpCircle, ChevronLeft, ChevronRight, Tag, Printer, Sparkles, Compass } from 'lucide-react';
import { parseFrontmatter } from '../lib/markdown';
import { getStaticArticles } from '../lib/articles';
import { ArticleItem } from '../lib/searchEngine';
import glossaryData from '../data/glossary.json';

interface ArticleViewerProps {
  path: string;
  onBack: () => void;
}

export function ArticleViewer({ path, onBack }: ArticleViewerProps) {
  
  const [content, setContent] = useState<string>('');
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFootnote, setActiveFootnote] = useState<any>(null);
  const [prevArticle, setPrevArticle] = useState<ArticleItem | null>(null);
  const [nextArticle, setNextArticle] = useState<ArticleItem | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleItem[]>([]);
  const [extractedRelatedContent, setExtractedRelatedContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const safePath = path.endsWith('.md') ? path : `${path}.md`;
    const cleanPath = safePath.replace(/^\//, '');
    const pathPart = cleanPath.replace(/\.md$/, '');

    // Setup prev/next and related articles
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
      console.warn("Could not setup navigation:", e);
    }

    const win = window as any;
    let expectedUrlPath = `/article/${path.replace(/\.md$/, '')}`;
    
    if (win.__PRERENDERED_ARTICLE__ === expectedUrlPath && win.__PRERENDERED_RAW_MARKDOWN__) {
       const { metadata, content: mdContent } = parseFrontmatter(win.__PRERENDERED_RAW_MARKDOWN__);
       
       let finalContent = mdContent;
       const relatedMatch = finalContent.match(/##\s*Связанные знания[^\n]*\n([\s\S]*?)(?=##|$)/i);
       if (relatedMatch) {
         setExtractedRelatedContent(relatedMatch[1].trim());
         finalContent = finalContent.replace(relatedMatch[0], '');
       }

       setMeta(metadata);
       setContent(applyGlossary(finalContent));
       computeRelated(metadata);
       setLoading(false);
       
       win.__PRERENDERED_ARTICLE__ = null;
       win.__PRERENDERED_RAW_MARKDOWN__ = null;
       return;
    }

    setLoading(true);
    setError(null);

    try {
      const modules = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
      const matchedKey = Object.keys(modules).find(key => key.endsWith(`/${cleanPath}`) || key === `/docs/${cleanPath}` || key.endsWith(cleanPath));
      
      if (matchedKey && modules[matchedKey]) {
        const contentObj = modules[matchedKey];
        const textContent = typeof contentObj === 'string' ? contentObj : (contentObj as any).default || '';
        const { metadata, content: mdContent } = parseFrontmatter(textContent);
        
        let finalContent = mdContent;
        const relatedMatch = finalContent.match(/##\s*Связанные знания[^\n]*\n([\s\S]*?)(?=##|$)/i);
        if (relatedMatch) {
          setExtractedRelatedContent(relatedMatch[1].trim());
          finalContent = finalContent.replace(relatedMatch[0], '');
        }
        
        finalContent = finalContent.replace(/\[(ESTABLISHED|CLINICAL GUIDANCE(?:\s*\/\s*(?:CONSERVATION|WELFARE))?)\]/g, (match, tag) => {
          let colorClass = 'bg-gray-500/10 border-gray-500/20 text-gray-400';
          let title = '';
          if (tag === 'ESTABLISHED') {
            colorClass = 'bg-green-500/10 border-green-500/20 text-green-400';
            title = 'Устоявшийся факт';
          } else if (tag.includes('CLINICAL GUIDANCE')) {
            colorClass = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            title = 'Клиническое руководство';
          }
          
          return `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${colorClass} text-[10px] font-bold uppercase tracking-wider align-middle mx-1" title="${title}"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>${tag}</span>`;
        });

        setMeta(metadata);
        setContent(applyGlossary(finalContent));
        computeRelated(metadata);
      } else {
        throw new Error('Статья не найдена');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  const applyGlossary = (text: string) => {
    let newContent = text;
    
    Object.entries(glossaryData).forEach(([term, entry]) => {
      const regex = new RegExp(`(^|[^а-яёa-z0-9_])(${term}[а-яёa-z]*)(?=[^а-яёa-z0-9_]|$)`, 'i');
      let searchStartIndex = 0;
      for (let i = 0; i < 3; i++) {
        const searchContent = newContent.substring(searchStartIndex);
        const match = searchContent.match(regex);
        if (match && match.index !== undefined) {
          const prefix = match[1];
          const word = match[2];
          const startIndex = searchStartIndex + match.index + prefix.length;
          const before = newContent.substring(0, startIndex);
          const openBrackets = (before.match(/\[/g) || []).length;
          const closeBrackets = (before.match(/\]/g) || []).length;
          const currentLine = before.split('\n').pop() || '';
          const isHeading = currentLine.trim().startsWith('#');
          
          if (openBrackets === closeBrackets && !isHeading) {
            newContent = newContent.substring(0, startIndex) + 
                         `<abbr title="${entry.definition}" class="cursor-help underline decoration-dashed decoration-kingdom-gold/50 hover:text-kingdom-gold transition-colors">${word}</abbr>` + 
                         newContent.substring(startIndex + word.length);
            searchStartIndex = startIndex + word.length + entry.definition.length + 100;
            break; 
          } else {
            searchStartIndex = startIndex + word.length;
          }
        } else {
          break;
        }
      }
    });
    return newContent;
  };

  const computeRelated = (metadata: any) => {
    try {
      const allArticles = getStaticArticles();
      const cleanPath = path.replace(/^\//, '').replace(/\.md$/, '');
      let related: ArticleItem[] = [];

      // 1. Explicit related_knowledge
      if (metadata.related_knowledge && metadata.related_knowledge.length > 0) {
        metadata.related_knowledge.forEach((rk: any) => {
          const cleanTarget = rk.target.replace(/\.md$/, '').replace(/^\//, '');
          const found = allArticles.find(a => a.path.replace(/\.md$/, '') === cleanTarget || a.path.includes(cleanTarget));
          if (found && !related.some(r => r.path === found.path) && found.path.replace(/\.md$/, '') !== cleanPath) {
            related.push(found);
          }
        });
      }

      // 2. Complemented with smart similarity (tags / category)
      if (related.length < 3) {
        const currentTags: string[] = metadata.tags || [];
        const candidates = allArticles.filter(a => {
          const aClean = a.path.replace(/\.md$/, '');
          return aClean !== cleanPath && !related.some(r => r.path === a.path);
        });

        candidates.sort((a, b) => {
          let scoreA = (a.category?.toLowerCase() === metadata.category?.toLowerCase() ? 2 : 0);
          let scoreB = (b.category?.toLowerCase() === metadata.category?.toLowerCase() ? 2 : 0);
          if (a.tags && currentTags.length > 0) {
            scoreA += a.tags.filter(t => currentTags.includes(t)).length * 3;
          }
          if (b.tags && currentTags.length > 0) {
            scoreB += b.tags.filter(t => currentTags.includes(t)).length * 3;
          }
          return scoreB - scoreA;
        });

        for (const c of candidates) {
          if (related.length >= 3) break;
          related.push(c);
        }
      }

      setRelatedArticles(related);
    } catch (e) {
      console.warn("Error computing related articles:", e);
    }
  };

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigation = (targetPath: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const win = window as any;
    if (win.loadArticle) {
      win.loadArticle(targetPath);
    } else {
      window.dispatchEvent(new CustomEvent('load-article', { detail: targetPath }));
    }
  };

  const handleTagClick = (tag: string) => {
    window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true, tag } }));
  };

  const openCitationModal = () => {
    window.dispatchEvent(new CustomEvent('open-citation', {
      detail: {
        title: meta.title || 'Статья',
        url: window.location.href,
        category: meta.category,
        authors: 'Коллектив авторов Слонологии',
        year: '2026'
      }
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 py-4 w-full">
        <div className="h-4 bg-[#242733] rounded w-1/4"></div>
        <div className="h-10 bg-[#242733] rounded w-3/4"></div>
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-[#242733] rounded w-full"></div>
          <div className="h-4 bg-[#242733] rounded w-full"></div>
          <div className="h-4 bg-[#242733] rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4 bg-[#1b1d24] rounded-2xl w-full">
        <div className="flex justify-center mb-4"><Database className="w-12 h-12 text-gray-600" /></div>
        <h3 className="text-lg font-bold text-gray-300">Сбой в базе данных</h3>
        <p className="text-sm text-gray-500">Не удалось загрузить запрошенный материал: {error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#242733] text-kingdom-gold hover:text-white border border-[#34384a] rounded-xl text-xs font-bold transition-all cursor-pointer">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  const catMapFull: any = { 
    ecology: 'ЭКОЛОГИЯ И СРЕДА ОБИТАНИЯ', 
    anatomy: 'АНАТОМИЯ И ФИЗИОЛОГИЯ', 
    ethogram: 'ЭТОЛОГИЯ И ПОВЕДЕНИЕ', 
    cognition: 'КОГНИТИВИСТИКА И ПАМЯТЬ', 
    veterinary: 'ВЕТЕРИНАРИЯ И ПАТОЛОГИИ', 
    taxonomy: 'ТАКСОНОМИЯ И ЭВОЛЮЦИЯ', 
    conservation: 'ОХРАНА И СОХРАНЕНИЕ ВИДОВ', 
    culture: 'АНТРОПОЗООЛОГИЯ И КУЛЬТУРА',
    paleontology: 'ПАЛЕОНТОЛОГИЯ И ИСКОПАЕМЫЕ',
    genomics: 'ГЕНОМИКА И МОЛЕКУЛЯРНАЯ БИОЛОГИЯ'
  };
  const catText = catMapFull[meta.category?.toLowerCase()] || 'КАТАЛОГ';
  const diffMap: any = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
  const diffText = diffMap[meta.difficulty?.toLowerCase()] || meta.difficulty || 'Стандарт';
  const referenceCount = meta.references ? meta.references.length : 0;

  const renderEvidenceLevel = (level: string) => {
    const l = level.toLowerCase();
    if (l === 'established') return <><ShieldCheck className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5 text-emerald-400" /><span className="text-emerald-400">ХОРОШО УСТАНОВЛЕНО</span></>;
    if (l === 'moderate') return <><Scale className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5 text-amber-400" /><span className="text-amber-400">ДОСТАТОЧНАЯ БАЗА</span></>;
    if (l === 'limited') return <><AlertCircle className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5 text-orange-400" /><span className="text-orange-400">ОГРАНИЧЕННЫЕ ДАННЫЕ</span></>;
    if (l === 'hypothesis') return <><Lightbulb className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5 text-sky-400" /><span className="text-sky-400">ГИПОТЕЗА</span></>;
    return <><HelpCircle className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5 text-rose-400" /><span className="text-rose-400">ДИСКУССИОННО</span></>;
  };

  return (
    <div className="w-full max-w-[90rem] mx-auto pb-16 px-4">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium flex-wrap">
        <button onClick={onBack} className="hover:text-kingdom-gold transition-colors flex items-center gap-1 cursor-pointer">
          <BookOpen className="w-3.5 h-3.5 text-kingdom-gold" />
          <span>Каталог</span>
        </button>
        <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
        <button 
          onClick={() => {
            if (meta.category) {
              sessionStorage.setItem("react_active_category", meta.category.toLowerCase());
            }
            onBack();
          }} 
          className="hover:text-kingdom-gold transition-colors uppercase font-mono tracking-wider cursor-pointer"
        >
          {catText}
        </button>
        {meta.title && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
            <span className="text-gray-300 font-medium truncate max-w-xs sm:max-w-md">{meta.title}</span>
          </>
        )}
      </nav>

      {/* Top Action Bar */}
      <div className="mb-6 p-2.5 sm:p-3.5 bg-[#1b1d24] border border-[#34384a] rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-gray-400 font-mono uppercase tracking-widest text-[11px]">{catText}</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={openCitationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242733] hover:bg-[#2e3242] text-gray-300 hover:text-kingdom-gold border border-white/10 rounded-xl transition-all cursor-pointer font-medium"
            title="Сформировать академическую цитату"
          >
            <Quote className="w-3.5 h-3.5 text-kingdom-gold" />
            <span>Цитировать</span>
          </button>
          
          <button 
            onClick={copyArticleLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242733] hover:bg-[#2e3242] text-gray-300 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
            title="Скопировать ссылку"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Скопировано!' : 'Поделиться'}</span>
          </button>

          <button 
            onClick={() => window.print()}
            className="p-1.5 bg-[#242733] hover:bg-[#2e3242] text-gray-400 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer hidden sm:flex items-center justify-center"
            title="Версия для печати / PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4 flex-grow relative min-w-0">
          <div className="markdown-body p-4 sm:p-8 bg-[#1b1d24] border border-[#34384a] rounded-3xl shadow-xl prose-kingdom w-full overflow-hidden">
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6 pb-6 border-b border-[#34384a]/50 text-[11px] font-mono uppercase tracking-wider text-gray-500">
              <span>СЛОЖНОСТЬ: <span className="text-kingdom-gold font-semibold">{diffText}</span></span>
              <span className="text-[#34384a]">|</span>
              <span>ИСТОЧНИКОВ: <span className="text-gray-300 font-semibold">{referenceCount}</span></span>
            </div>

            {/* Evidence Level Badge */}
            {meta.evidenceLevel && (
              <div className="mb-6 relative group inline-flex items-center gap-2 px-3 py-1.5 bg-[#242733] border border-white/5 hover:border-kingdom-gold/30 rounded-full cursor-help transition-all">
                 {renderEvidenceLevel(meta.evidenceLevel)}
                 
                 {/* Evidence Level Tooltip */}
                 <div className="absolute left-0 top-full mt-2 w-64 bg-[#1b1d24] border border-[#34384a] rounded-lg shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                    <div className="text-xs text-gray-300 font-sans normal-case">
                       Редакционная классификация, отражающая степень поддержки утверждения существующей академической литературой и научным консенсусом.
                    </div>
                 </div>
              </div>
            )}

            {/* Article Tags */}
            {meta.tags && meta.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-kingdom-gold/70 shrink-0" />
                {meta.tags.map((tag: string) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-2 py-0.5 bg-[#242733] hover:bg-kingdom-gold hover:text-black text-gray-300 rounded-md text-[11px] font-mono border border-white/5 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                blockquote: ({node, className, children, ...props}: any) => {
                  return (
                    <blockquote className="my-5 pl-4 py-2 border-l-4 border-kingdom-gold/70 bg-[#161820]/70 rounded-r-xl text-gray-300 text-sm italic" {...props}>
                      {children}
                    </blockquote>
                  );
                },
                table: ({node, ...props}: any) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full text-sm border-collapse" {...props} />
                  </div>
                ),
                th: ({node, ...props}: any) => <th className="border border-[#34384a] bg-[#242733] px-4 py-2 font-bold text-left text-gray-200" {...props} />,
                td: ({node, ...props}: any) => <td className="border border-[#34384a] px-4 py-2 text-gray-300" {...props} />,
                pre: ({node, className, children, ...props}: any) => (
                  <div className="overflow-x-auto my-6 bg-[#141620] border border-[#34384a] rounded-xl p-4">
                    <pre className={`text-[10px] sm:text-xs font-mono text-gray-300 ${className || ''}`} {...props}>
                      {children}
                    </pre>
                  </div>
                ),
                h2: ({node, ...props}: any) => {
                  if (props.id === 'footnote-label') {
                    return null;
                  }
                  if (props.children === 'Сноски (Footnotes)' || props.children === 'Footnotes' || 
                     (Array.isArray(props.children) && (props.children[0] === 'Сноски (Footnotes)' || props.children[0] === 'Footnotes'))) {
                     return null;
                  }
                  return <h2 className="text-xl font-bold text-gray-100 mt-10 mb-4 border-b border-[#34384a]/50 pb-2" {...props} />;
                },
                li: ({node, className, children, ...props}: any) => {
                   if (props.id && props.id.startsWith('user-content-fn-')) {
                     return (
                       <li className="mb-3 pl-2 border-l-2 border-[#34384a] text-gray-300 marker:text-gray-500" {...props}>
                         {children}
                       </li>
                     );
                   }
                   return <li className={className} {...props}>{children}</li>;
                },
                a: ({node, href, children, ...props}: any) => {
                  if (props['data-footnote-ref']) {
                    let tooltip = "Перейти к источнику";
                    const match = href?.match(/fn-(\d+)/);
                    if (match && meta.references) {
                      const idx = parseInt(match[1], 10) - 1;
                      const ref = meta.references[idx];
                      if (ref) {
                        tooltip = `${ref.authors ? ref.authors + ' ' : ''}${ref.year ? '(' + ref.year + ') - ' : ''}${ref.title || ''}`;
                      }
                    }

                    return (
                      <a href={href} {...props} className="px-0.5 text-kingdom-gold cursor-pointer hover:underline font-bold text-[11px] align-super" title={tooltip} onClick={(e) => {
                          e.preventDefault();
                          const target = document.getElementById(href?.replace('#', '') || '');
                          if (target) {
                             target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                             target.classList.add('bg-kingdom-gold/20', 'rounded', 'transition-colors', 'duration-500');
                             setTimeout(() => target.classList.remove('bg-kingdom-gold/20', 'rounded', 'transition-colors', 'duration-500'), 2000);
                          }
                        }}>
                        {children}
                      </a>
                    );
                  }
                  
                  if (props['data-footnote-backref'] || (props.className && props.className.includes('data-footnote-backref'))) { 
                     return (
                       <a 
                         href={href} 
                         {...props} 
                         className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-[#242733] hover:bg-kingdom-gold text-[9px] uppercase tracking-wider text-gray-400 hover:text-black transition-colors no-underline font-semibold"
                         onClick={(e) => {
                           e.preventDefault();
                           const target = document.getElementById(href?.replace('#', '') || '');
                           if (target) {
                              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              target.classList.add('bg-kingdom-gold/30', 'rounded', 'transition-colors', 'duration-500');
                              setTimeout(() => target.classList.remove('bg-kingdom-gold/30', 'rounded', 'transition-colors', 'duration-500'), 2000);
                           }
                         }}
                       >
                         ↑ назад
                       </a>
                     );
                  }
                  if (href && (href.startsWith('/') || href.startsWith('.') || href.endsWith('.md'))) {
                    return (
                      <a 
                        href={href} 
                        onClick={(e) => {
                          e.preventDefault();
                          const cleanPath = href.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\.md$/, '');
                          handleNavigation(cleanPath);
                        }}
                        className="text-kingdom-gold hover:text-white transition-colors cursor-pointer border-b border-kingdom-gold/30 hover:border-white"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  }
                  return (
                    <a 
                      href={href} 
                      {...props} 
                      className="text-kingdom-gold hover:text-white transition-colors border-b border-kingdom-gold/30 hover:border-white"
                      onClick={(e) => {
                        if (href?.startsWith('#')) {
                          e.preventDefault();
                          const target = document.getElementById(href.replace('#', ''));
                          if (target) {
                             target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                             target.classList.add('bg-kingdom-gold/20', 'rounded', 'transition-colors', 'duration-500');
                             setTimeout(() => target.classList.remove('bg-kingdom-gold/20', 'rounded', 'transition-colors', 'duration-500'), 2000);
                          }
                        }
                      }}
                    >
                      {children}
                    </a>
                  );
                },
                section: ({node, className, children, ...props}: any) => {
                  if (props['data-footnotes'] || className === 'footnotes' || (props.className && props.className.includes('footnotes'))) {
                    return (
                      <div className="mt-14 pt-8 border-t border-kingdom-border footnotes-container">
                        {meta.references && meta.references.length > 0 && (
                          <div className="mb-10">
                            <h3 className="text-kingdom-gold font-bold text-lg mb-6 flex items-center gap-2">
                              <BookOpen className="w-5 h-5" />
                              Источники и академическая литература
                            </h3>
                            <div className="space-y-4">
                              {meta.references.map((ref: any, idx: number) => {
                                const safeId = ref.id || (idx + 1).toString();
                                const isString = typeof ref === 'string';
                                return (
                                  <div id={`user-content-fn-${safeId}`} key={idx} className="flex gap-4 text-sm group relative">
                                    <div className="text-kingdom-gold/60 font-mono">[{safeId}]</div>
                                    <div className="flex-1 text-gray-300 leading-relaxed pr-24">
                                      {isString ? (
                                        <span>{ref}</span>
                                      ) : (
                                        <>
                                          {ref.authors && <span className="font-semibold text-gray-200">{ref.authors} </span>}
                                          {ref.year && <span className="text-gray-400">({ref.year}). </span>}
                                          <span className="italic">{ref.title}. </span>
                                          {ref.journal && <span className="text-gray-400">{ref.journal}. </span>}
                                          {ref.doi && (
                                            <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors ml-2 text-xs whitespace-nowrap">
                                              DOI: {ref.doi} ↗
                                            </a>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <a href={`#user-content-fnref-${safeId}`} className="text-kingdom-gold hover:text-white text-xs font-mono whitespace-nowrap" onClick={(e) => {
                                               e.preventDefault();
                                               const target = document.getElementById(`user-content-fnref-${safeId}`);
                                               if (target) {
                                                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                  target.classList.add('bg-kingdom-gold/30', 'rounded', 'transition-colors', 'duration-500');
                                                  setTimeout(() => target.classList.remove('bg-kingdom-gold/30', 'rounded', 'transition-colors', 'duration-500'), 2000);
                                               }
                                             }}>
                                        ↑ назад
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-8 border-t border-kingdom-border/30 pt-6">
                          <h3 className="text-kingdom-gold/80 font-bold text-sm mb-4 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" />
                            Примечания текста
                          </h3>
                          <div className="text-xs text-gray-400 prose-footnotes">
                             {children}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return <section className={className} {...props}>{children}</section>;
                },
              }}
            >
              {content}
            </ReactMarkdown>

            {/* Related Knowledge Section */}
            {(relatedArticles.length > 0 || extractedRelatedContent) && (
              <div className="mt-14 pt-8 border-t border-kingdom-border">
                <div className="flex items-center gap-2 text-kingdom-gold font-bold text-base mb-4">
                  <Compass className="w-4 h-4" />
                  <span>Связанные материалы</span>
                </div>
                
                {extractedRelatedContent && (
                  <div className="mb-6">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">Статьи из энциклопедии</h4>
                    <div className="prose-kingdom text-sm text-gray-300">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          a: ({node, href, children, ...props}: any) => {
                            if (href && (href.startsWith('/') || href.startsWith('.') || href.endsWith('.md'))) {
                              return (
                                <a 
                                  href={href} 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const cleanPath = href.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\.md$/, '');
                                    handleNavigation(cleanPath);
                                  }}
                                  className="text-kingdom-gold hover:text-white transition-colors cursor-pointer underline decoration-kingdom-gold/30 underline-offset-2"
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            }
                            return <a href={href} {...props} className="text-kingdom-gold hover:text-white">{children}</a>;
                          }
                        }}
                      >
                        {extractedRelatedContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {relatedArticles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">Темы и дисциплины</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {relatedArticles.map((rel) => (
                        <button
                          key={rel.path}
                          onClick={() => handleNavigation(rel.path)}
                          className="p-3.5 bg-[#181a22] hover:bg-[#202330] border border-[#34384a] hover:border-kingdom-gold/60 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                        >
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono text-kingdom-gold uppercase tracking-wider">
                              {catMapFull[rel.category?.toLowerCase()] || rel.category}
                            </div>
                            <div className="text-xs font-bold text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                              {rel.title}
                            </div>
                          </div>
                          <div className="flex items-center text-[10px] text-gray-400 group-hover:text-kingdom-gold mt-2 transition-colors">
                            <span>Читать статью →</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Previous / Next Navigation Block */}
            {(prevArticle || nextArticle) && (
              <div className="mt-12 pt-8 border-t border-kingdom-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <button 
                    onClick={() => handleNavigation(prevArticle.path)}
                    className="flex flex-col text-left p-4 bg-[#181a22] border border-[#34384a] rounded-xl hover:border-kingdom-gold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center text-xs text-gray-400 group-hover:text-kingdom-gold mb-2 transition-colors">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Предыдущая статья
                    </div>
                    <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{prevArticle.title}</div>
                    {prevArticle.category && <div className="text-xs text-kingdom-gold/70 mt-1 uppercase font-mono">{catMapFull[prevArticle.category?.toLowerCase()] || prevArticle.category}</div>}
                  </button>
                ) : <div />}
                
                {nextArticle ? (
                  <button 
                    onClick={() => handleNavigation(nextArticle.path)}
                    className="flex flex-col text-right p-4 bg-[#181a22] border border-[#34384a] rounded-xl hover:border-kingdom-gold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-end text-xs text-gray-400 group-hover:text-kingdom-gold mb-2 transition-colors">
                      Следующая статья
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                    <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{nextArticle.title}</div>
                    {nextArticle.category && <div className="text-xs text-kingdom-gold/70 mt-1 uppercase font-mono">{catMapFull[nextArticle.category?.toLowerCase()] || nextArticle.category}</div>}
                  </button>
                ) : <div />}
              </div>
            )}
          
            {/* Footnote Popover Panel */}
            {activeFootnote && (
              <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 bg-[#1b1d24] border border-kingdom-gold/40 rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-kingdom-gold font-bold text-xs flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <BookOpen className="w-3.5 h-3.5"/> Источник цитаты
                  </h4>
                  <button onClick={() => setActiveFootnote(null)} className="text-gray-400 hover:text-white cursor-pointer p-0.5">
                    <X className="w-4 h-4"/>
                  </button>
                </div>
                <div className="text-sm text-gray-200 font-semibold leading-snug">{activeFootnote.title}</div>
                <div className="text-xs text-gray-400 mt-2">{activeFootnote.authors} ({activeFootnote.year})</div>
                {activeFootnote.doi && (
                  <a href={`https://doi.org/${activeFootnote.doi}`} target="_blank" rel="noreferrer" className="text-sky-400 text-xs mt-2 inline-block hover:underline">
                    DOI: {activeFootnote.doi}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

