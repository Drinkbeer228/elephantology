import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Link as LinkIcon, Share2, Clock, Calendar, Quote, BookOpen, Database, X, ShieldCheck, Scale, AlertCircle, Lightbulb, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseFrontmatter } from '../lib/markdown';
import { getStaticArticles } from '../lib/articles';
import { ArticleItem } from '../lib/searchEngine';

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

  useEffect(() => {
    const safePath = path.endsWith('.md') ? path : `${path}.md`;
    
    // Setup prev/next articles
    try {
      const allArticles = getStaticArticles();
      const sorted = [...allArticles].sort((a, b) => {
        if (a.category === b.category) {
          return a.title.localeCompare(b.title);
        }
        return (a.category || '').localeCompare(b.category || '');
      });
      
      const cleanPath = safePath.replace(/^\//, '');
      const pathPart = cleanPath.replace(/\.md$/, '');
      
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
       setMeta(metadata);
       setContent(mdContent);
       setLoading(false);
       
       win.__PRERENDERED_ARTICLE__ = null;
       win.__PRERENDERED_RAW_MARKDOWN__ = null;
       return;
    }

    setLoading(true);
    setError(null);

    try {
      const modules = import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
      const cleanPath = safePath.replace(/^\//, ''); // ensure no leading slash
      const matchedKey = Object.keys(modules).find(key => key.endsWith(`/${cleanPath}`) || key === `/docs/${cleanPath}` || key.endsWith(cleanPath));
      
      if (matchedKey && modules[matchedKey]) {
        const contentObj = modules[matchedKey];
        const textContent = typeof contentObj === 'string' ? contentObj : (contentObj as any).default || '';
        const { metadata, content: mdContent } = parseFrontmatter(textContent);
        setMeta(metadata);
        setContent(mdContent);
      } else {
        throw new Error('Статья не найдена');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
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

  const catMapFull: any = { ecology: 'ЭКОЛОГИЯ И СРЕДА ОБИТАНИЯ', anatomy: 'АНАТОМИЯ И ФИЗИОЛОГИЯ', ethogram: 'ЭТОЛОГИЯ И ПОВЕДЕНИЕ', cognition: 'КОГНИТИВИСТИКА И ПАМЯТЬ', veterinary: 'ВЕТЕРИНАРИЯ И ПАТОЛОГИИ', taxonomy: 'ТАКСОНОМИЯ И ЭВОЛЮЦИЯ', conservation: 'ОХРАНА И СОХРАНЕНИЕ ВИДОВ', culture: 'АНТРОПОЗООЛОГИЯ И КУЛЬТУРА' };
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
      <div className="mb-6 p-2.5 sm:p-3.5 bg-[#1b1d24] border border-[#34384a] rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#242733] hover:bg-kingdom-gold hover:text-black text-gray-300 font-semibold text-xs transition-all border border-[#34384a] hover:border-kingdom-gold cursor-pointer shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>К каталогу</span>
          </button>
          <div className="h-4 w-px bg-[#34384a] hidden sm:block"></div>
          <span className="text-gray-400 font-mono uppercase tracking-widest">{catText}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4 flex-grow relative min-w-0">
          <div className="markdown-body p-4 sm:p-8 bg-[#1b1d24] border border-[#34384a] rounded-3xl shadow-xl prose-kingdom w-full overflow-hidden">
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-8 pb-6 border-b border-[#34384a]/50 text-[11px] font-mono uppercase tracking-wider text-gray-500">
              <span>СЛОЖНОСТЬ: <span className="text-kingdom-gold font-semibold">{diffText}</span></span>
              <span className="text-[#34384a]">|</span>
              {meta.evidenceLevel && (
                <>
                  <span>СТАТУС: <span className="font-semibold">{renderEvidenceLevel(meta.evidenceLevel)}</span></span>
                  <span className="text-[#34384a]">|</span>
                </>
              )}
              <span>ИСТОЧНИКОВ: <span className="text-gray-300 font-semibold">{referenceCount}</span></span>
              {meta.lastReviewed && (
                <>
                  <span className="text-[#34384a]">|</span>
                  <span>ПРОВЕРЕНО: <span className="text-gray-300 font-semibold">{meta.lastReviewed}</span></span>
                </>
              )}
            </div>

            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                table: ({node, ...props}: any) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full text-sm border-collapse" {...props} />
                  </div>
                ),
                th: ({node, ...props}: any) => <th className="border border-[#34384a] bg-[#242733] px-4 py-2 font-bold text-left text-gray-200" {...props} />,
                td: ({node, ...props}: any) => <td className="border border-[#34384a] px-4 py-2 text-gray-300" {...props} />,
                a: ({node, href, children, ...props}: any) => {
                  if (href?.startsWith('#user-content-fn-')) {
                    return (
                      <sup className="px-0.5 text-kingdom-gold cursor-pointer hover:underline">
                        <a href={href} {...props} onClick={(e) => {
                          e.preventDefault();
                          const fnId = href.replace('#user-content-fn-', '');
                          // Find in references (assuming id is like ref_dublin_1990 and footnote is 1, maybe they don't map directly by ID, but they map by index)
                          // Remark-gfm footnotes are usually 1, 2, 3...
                          const index = parseInt(fnId) - 1;
                          if (meta.references && meta.references[index]) {
                             setActiveFootnote(meta.references[index]);
                          }
                        }}>
                          {children}
                        </a>
                      </sup>
                    )
                  }
                  return <a href={href} {...props} className="text-kingdom-gold hover:text-white transition-colors border-b border-kingdom-gold/30 hover:border-white">{children}</a>;
                },
                section: ({node, className, children, ...props}: any) => {
                  if (node.properties?.dataFootnotes) {
                    return null; // Hide default footnote section
                  }
                  return <section className={className} {...props}>{children}</section>;
                }

              }}
            >
              {content}
            
            </ReactMarkdown>
            
            {meta.references && meta.references.length > 0 && (
              <div className="mt-16 pt-8 border-t border-kingdom-border">
                <h3 className="text-kingdom-gold font-bold text-lg mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Библиография и источники
                </h3>
                <ul className="space-y-4 text-sm text-gray-300">
                  {meta.references.map((ref: any, i: number) => (
                    <li key={ref.id || i} id={ref.id} className="pl-4 border-l-2 border-kingdom-border hover:border-kingdom-gold transition-colors">
                      <div className="font-semibold text-gray-200">{ref.title}</div>
                      <div className="text-gray-400 mt-1">
                        {ref.authors} ({ref.year})
                        {ref.doi && (
                          <span className="ml-2">
                            <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 hover:underline">
                              DOI: {ref.doi}
                            </a>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Block */}
            {(prevArticle || nextArticle) && (
              <div className="mt-16 pt-8 border-t border-kingdom-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <button 
                    onClick={() => handleNavigation(prevArticle.path)}
                    className="flex flex-col text-left p-4 bg-[#181a22] border border-[#34384a] rounded-xl hover:border-kingdom-gold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center text-xs text-gray-400 group-hover:text-kingdom-gold mb-2 transition-colors">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Предыдущая монография
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
                      Следующая монография
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                    <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{nextArticle.title}</div>
                    {nextArticle.category && <div className="text-xs text-kingdom-gold/70 mt-1 uppercase font-mono">{catMapFull[nextArticle.category?.toLowerCase()] || nextArticle.category}</div>}
                  </button>
                ) : <div />}
              </div>
            )}
          
            {activeFootnote && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 bg-[#1b1d24] border border-[#34384a] rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-kingdom-gold font-bold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4"/> Источник</h4>
            <button onClick={() => setActiveFootnote(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-4 h-4"/></button>
          </div>
          <div className="text-sm text-gray-200 font-semibold leading-tight">{activeFootnote.title}</div>
          <div className="text-xs text-gray-400 mt-2">{activeFootnote.authors} ({activeFootnote.year})</div>
          {activeFootnote.doi && <a href={`https://doi.org/${activeFootnote.doi}`} target="_blank" rel="noreferrer" className="text-sky-400 text-xs mt-2 inline-block hover:underline">DOI: {activeFootnote.doi}</a>}
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}

