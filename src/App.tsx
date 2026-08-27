import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BookOpen } from "lucide-react";
import { Header } from './components/Header';
import { ArticleCatalog } from './components/ArticleCatalog';

const ArticleViewer = lazy(() => import('./components/ArticleViewer').then(m => ({ default: m.ArticleViewer })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));
const CitationModal = lazy(() => import('./components/CitationModal').then(m => ({ default: m.CitationModal })));

export default function App() {
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
          setCurrentView('home');
          setCurrentArticlePath(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Check initial path for direct navigation
    const path = window.location.pathname;
    const baseUrl = getBaseUrl().replace(/\/$/, '');
    const cleanPath = path.replace(baseUrl, '');
    
    if (cleanPath.startsWith('/article/')) {
      let articlePath = cleanPath.substring('/article/'.length);
      if (articlePath.endsWith('/')) articlePath = articlePath.slice(0, -1);
      setCurrentArticlePath(articlePath);
      setCurrentView('article');
    }
    
    // Also handle search params if we used those
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('path');
    if (p) {
       setCurrentArticlePath(p);
       setCurrentView('article');
       // Clean URL without reload
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
    const handleLoadArticle = (e: any) => showArticle(e.detail);
    window.addEventListener('show-home', handleShowHome);
    window.addEventListener('load-article', handleLoadArticle);
    return () => {
      window.removeEventListener('show-home', handleShowHome);
      window.removeEventListener('load-article', handleLoadArticle);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex-1 w-full mx-auto px-3 sm:px-6 pb-12 pt-4 lg:pt-8 flex flex-col max-w-7xl relative" id="react-main-root">
        {currentView === 'home' && <ArticleCatalog onArticleClick={showArticle} />}
        {currentView === 'article' && currentArticlePath && (
          <Suspense fallback={
            <div className="animate-pulse space-y-6 py-8 w-full max-w-5xl mx-auto">
              <div className="h-6 bg-[#242733] rounded w-1/4"></div>
              <div className="h-12 bg-[#242733] rounded w-3/4"></div>
              <div className="space-y-4 pt-6">
                <div className="h-4 bg-[#242733] rounded w-full"></div>
                <div className="h-4 bg-[#242733] rounded w-full"></div>
                <div className="h-4 bg-[#242733] rounded w-4/5"></div>
              </div>
            </div>
          }>
            <ArticleViewer path={currentArticlePath} onBack={showHome} />
          </Suspense>
        )}
      </main>
      
      <footer className="mt-auto border-t border-kingdom-border bg-kingdom-card/60 py-8 text-xs text-kingdom-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-kingdom-gold" />
            <div>
              <span className="font-bold text-kingdom-gold tracking-widest uppercase">СЛОНОЛОГИЯ</span> — Академическая цифровая энциклопедия о слонах.
              <p className="text-[11px] text-kingdom-muted">Est. 2026 • Crafted with Academic Precision</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-kingdom-gold transition-colors cursor-pointer">Наверх ↑</button>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <SearchModal />
        <CitationModal />
      </Suspense>
    </div>
  );
}
