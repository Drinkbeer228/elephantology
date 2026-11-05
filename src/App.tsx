import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { useLanguage } from './i18n/LanguageContext';
import { ArticleCatalog } from './components/ArticleCatalog';
import { CitationModal } from './components/CitationModal';

const ArticleViewer = lazy(() => import('./components/ArticleViewer').then(m => ({ default: m.ArticleViewer })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));

export default function App() {
  const { t, isEn, setLang } = useLanguage();
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'module'>('home');
  const [currentArticlePath, setCurrentArticlePath] = useState<string | null>(null);

  const getBaseUrl = () => import.meta.env.BASE_URL || '/';

  const navigateTo = (view: 'home' | 'article', path: string | null = null, pushState = true) => {
    setCurrentView(view);
    setCurrentArticlePath(path);
    
    if (pushState) {
      const baseUrl = getBaseUrl().replace(/\/$/, '');
      if (view === 'home') {
        window.history.pushState({ view: 'home', path: null }, '', `${baseUrl}/`);
      } else if (view === 'article' && path) {
        window.history.pushState({ view: 'article', path }, '', `${baseUrl}/article/${path}`);
      }
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        setCurrentArticlePath(e.state.path || null);
      } else {
        const path = window.location.pathname;
        const baseUrl = getBaseUrl().replace(/\/$/, '');
        const cleanPath = path.replace(baseUrl, '');
        
        if (cleanPath.startsWith('/article/')) {
          let articlePath = cleanPath.substring('/article/'.length);
          if (articlePath.endsWith('/')) articlePath = articlePath.slice(0, -1);
          setCurrentArticlePath(articlePath);
          setCurrentView('article');
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const p = urlParams.get('path') || urlParams.get('article');
          if (p) {
            setCurrentArticlePath(p);
            setCurrentView('article');
          } else if (window.location.hash && currentArticlePath) {
            return;
          } else {
            setCurrentView('home');
            setCurrentArticlePath(null);
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentArticlePath]);

  useEffect(() => {
    const path = window.location.pathname;
    const baseUrl = getBaseUrl().replace(/\/$/, '');
    const cleanPath = path.replace(baseUrl, '');
    
    if (cleanPath.startsWith('/article/')) {
      let articlePath = cleanPath.substring('/article/'.length);
      if (articlePath.endsWith('/')) articlePath = articlePath.slice(0, -1);
      setCurrentArticlePath(articlePath);
      setCurrentView('article');
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('path') || urlParams.get('article');
    if (p) {
       setCurrentArticlePath(p);
       setCurrentView('article');
       window.history.replaceState({ view: 'article', path: p }, '', `${baseUrl}/article/${p.replace('.md', '')}`);
    }
  }, []);

  const showHome = (scrollToId?: string) => {
    navigateTo('home');
    if (scrollToId) {
      setTimeout(() => {
        const el = document.getElementById(scrollToId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    }
  };

  const showArticle = (path: string) => {
    let cleanPath = path;
    if (cleanPath.endsWith('.md')) cleanPath = cleanPath.slice(0, -3);
    navigateTo('article', cleanPath);
  };

  useEffect(() => {
    const win = window as any;
    win.loadArticle = showArticle;
    win.showHome = showHome;
    const handleShowHome = () => showHome();
    const handleLoadArticle = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      showArticle(customEvent.detail);
    };
    window.addEventListener('show-home', handleShowHome);
    window.addEventListener('load-article', handleLoadArticle);
    return () => {
      window.removeEventListener('show-home', handleShowHome);
      window.removeEventListener('load-article', handleLoadArticle);
    };
  }, []);

  return (
    <div id="top" className="flex flex-col min-h-screen relative bg-[#FBF9F5] text-[#1C1917]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#14532D] focus:text-[#FBF9F5] focus:font-semibold focus:rounded-none focus:outline-none"
      >
        {t.a11y?.skipToContent || 'Перейти к основному содержимому'}
      </a>

      <Header
        currentView={currentView}
        currentArticlePath={currentArticlePath}
        onNavigateHome={showHome}
        onOpenArticle={showArticle}
      />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6 flex flex-col max-w-[1380px] relative" id="main-content">
        {currentView === 'home' && <ArticleCatalog onArticleClick={showArticle} />}
        {currentView === 'article' && currentArticlePath && (
          <Suspense fallback={
            <div className="animate-pulse space-y-6 py-8 w-full max-w-5xl mx-auto">
              <div className="h-6 bg-[#F2EFE9] rounded-none w-1/4"></div>
              <div className="h-12 bg-[#F2EFE9] rounded-none w-3/4"></div>
              <div className="space-y-4 pt-6">
                <div className="h-4 bg-[#F2EFE9] rounded-none w-full"></div>
                <div className="h-4 bg-[#F2EFE9] rounded-none w-full"></div>
                <div className="h-4 bg-[#F2EFE9] rounded-none w-4/5"></div>
              </div>
            </div>
          }>
            <ArticleViewer path={currentArticlePath} onBack={() => showHome()} />
          </Suspense>
        )}
      </main>
      
      <footer className="mt-auto border-t border-[#DED8CD] bg-[#F2EFE9] py-12 text-xs text-[#78716C]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-1.5 max-w-xl">
            <span className="font-bold text-base text-[#1C1917] tracking-[0.12em] uppercase font-serif block">
              {isEn ? 'ELEPHANTOLOGY · PROBOSCIDEA ARCHIVE' : 'СЛОНОЛОГИЯ · АКАДЕМИЧЕСКИЙ АРХИВ'}
            </span>
            <p className="text-xs text-[#44403C] leading-relaxed">
              {t.footer.text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#44403C]">
            <button
              type="button"
              onClick={() => showHome('catalog-section')}
              className="hover:text-[#14532D] transition-colors cursor-pointer font-medium whitespace-nowrap"
            >
              {isEn ? 'Rubricator' : 'Рубрикатор'}
            </button>
            <button
              type="button"
              onClick={() => showArticle('glossary')}
              className="hover:text-[#14532D] transition-colors cursor-pointer font-medium whitespace-nowrap"
            >
              {isEn ? 'Glossary' : 'Глоссарий'}
            </button>
            <button
              type="button"
              onClick={() => showArticle('bibliography')}
              className="hover:text-[#14532D] transition-colors cursor-pointer font-medium whitespace-nowrap"
            >
              {isEn ? 'Bibliography' : 'Библиография'}
            </button>
            <button
              type="button"
              onClick={() => setLang(isEn ? 'ru' : 'en')}
              className="font-mono text-[11px] px-2.5 py-1 bg-[#FBF9F5] border border-[#DED8CD] hover:border-[#1C1917] text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap"
            >
              {isEn ? 'Switch to RU' : 'Switch to EN'}
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              className="text-[#1C1917] hover:text-[#14532D] transition-colors cursor-pointer font-semibold whitespace-nowrap"
            >
              {t.footer.toTop}
            </button>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <SearchModal />
      </Suspense>
      <CitationModal />
    </div>
  );
}
