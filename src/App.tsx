import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { useLanguage } from './i18n/LanguageContext';
import { ArticleCatalog } from './components/ArticleCatalog';

const ArticleViewer = lazy(() => import('./components/ArticleViewer').then(m => ({ default: m.ArticleViewer })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));

export default function App() {
  const { t } = useLanguage();
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
          const p = urlParams.get('path');
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
    const p = urlParams.get('path');
    if (p) {
       setCurrentArticlePath(p);
       setCurrentView('article');
       window.history.replaceState({ view: 'article', path: p }, '', `${baseUrl}/article/${p.replace('.md', '')}`);
    }
  }, []);

  const showHome = () => navigateTo('home');

  const showArticle = (path: string) => {
    let cleanPath = path;
    if (cleanPath.endsWith('.md')) cleanPath = cleanPath.slice(0, -3);
    navigateTo('article', cleanPath);
  };

  useEffect(() => {
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
    <div className="flex flex-col min-h-screen relative bg-[#F6F5F0] text-[#141413]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1E4631] focus:text-[#F6F5F0] focus:font-semibold focus:rounded-none focus:outline-none"
      >
        {t.a11y?.skipToContent || 'Перейти к основному содержимому'}
      </a>
      <Header />
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 pb-16 pt-6 flex flex-col max-w-7xl relative" id="main-content">
        {currentView === 'home' && <ArticleCatalog onArticleClick={showArticle} />}
        {currentView === 'article' && currentArticlePath && (
          <Suspense fallback={
            <div className="animate-pulse space-y-6 py-8 w-full max-w-5xl mx-auto">
              <div className="h-6 bg-[#EFECE6] rounded-none w-1/4"></div>
              <div className="h-12 bg-[#EFECE6] rounded-none w-3/4"></div>
              <div className="space-y-4 pt-6">
                <div className="h-4 bg-[#EFECE6] rounded-none w-full"></div>
                <div className="h-4 bg-[#EFECE6] rounded-none w-full"></div>
                <div className="h-4 bg-[#EFECE6] rounded-none w-4/5"></div>
              </div>
            </div>
          }>
            <ArticleViewer path={currentArticlePath} onBack={showHome} />
          </Suspense>
        )}
      </main>
      
      <footer className="mt-auto border-t border-[#DFDCD4] bg-[#EFECE6] py-8 text-xs text-[#6E6B64]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-[#141413] tracking-wider uppercase font-serif">СЛОНОЛОГИЯ</span>
            <p className="text-[11px] text-[#6E6B64] mt-0.5">{t.footer.text}</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="text-[#6E6B64] hover:text-[#141413] transition-colors cursor-pointer font-medium">{t.footer.toTop}</button>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <SearchModal />
      </Suspense>
    </div>
  );
}
