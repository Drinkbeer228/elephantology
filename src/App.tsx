import React, { useState, useEffect } from 'react';
import { BookOpen } from "lucide-react";
import { Header } from './components/Header';
import { ArticleCatalog } from './components/ArticleCatalog';
import { ArticleViewer } from './components/ArticleViewer';
import { SearchModal } from './components/SearchModal';
import { CitationModal } from './components/CitationModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'article'>('home');
  const [currentArticlePath, setCurrentArticlePath] = useState<string | null>(null);

  // Получаем базовый путь из vite.config.ts (например, '/elephantology/' или '/')
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  const parseCurrentLocation = () => {
    let path = window.location.pathname;
    
    // Отрезаем базовый префикс репозитория
    if (baseUrl && path.startsWith(baseUrl)) {
      path = path.slice(baseUrl.length) || '/';
    }

    if (path.startsWith('/article/')) {
      let articlePath = path.substring('/article/'.length);
      if (articlePath.endsWith('/')) articlePath = articlePath.slice(0, -1);
      if (articlePath.endsWith('.md')) articlePath = articlePath.slice(0, -3);
      setCurrentArticlePath(articlePath);
      setCurrentView('article');
      return;
    }

    // Обработка query-параметров ?path=...
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('path');
    if (p) {
      const cleanPath = p.replace('.md', '');
      setCurrentArticlePath(cleanPath);
      setCurrentView('article');
      window.history.replaceState({}, '', `${baseUrl}/article/${cleanPath}`);
      return;
    }

    setCurrentView('home');
    setCurrentArticlePath(null);
  };

  useEffect(() => {
    parseCurrentLocation();

    // Обработка кнопок «Назад / Вперед» в браузере
    const handlePopState = () => parseCurrentLocation();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showHome = () => {
    setCurrentView('home');
    setCurrentArticlePath(null);
    window.history.pushState({}, '', `${baseUrl}/`);
  };

  const showArticle = (path: string) => {
    let cleanPath = path;
    if (cleanPath.endsWith('.md')) cleanPath = cleanPath.slice(0, -3);
    setCurrentArticlePath(cleanPath);
    setCurrentView('article');
    window.history.pushState({}, '', `${baseUrl}/article/${cleanPath}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <ArticleViewer path={currentArticlePath} onBack={showHome} />
        )}
      </main>
      
      <footer className="mt-auto border-t border-kingdom-border bg-kingdom-card/60 py-8 text-xs text-kingdom-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-kingdom-gold" />
            <div>
              <span className="font-bold text-kingdom-gold tracking-widest uppercase">ЭЛЕФАНТОЛОГИЯ</span> — Фундаментальная цифровая монография о слонах.
              <p className="text-[11px] text-kingdom-muted">Est. 2026 • Crafted with Academic Precision</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-kingdom-gold transition-colors">
              Наверх ↑
            </button>
          </div>
        </div>
      </footer>

      <SearchModal />
      <CitationModal />
    </div>
  );
}
