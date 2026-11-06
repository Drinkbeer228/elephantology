import { useState, useEffect, useCallback } from 'react';
import { SiteShell } from './shell';
import {
  CatalogPage,
  ArticlePage,
  GlossaryPage,
  BibliographyPage,
} from './pages';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, ''); // '/elephantology'

function getArticleFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const queryArticle = params.get('article');
  if (queryArticle) return queryArticle;

  let pathname = window.location.pathname;
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length);
  }
  pathname = pathname.replace(/^\/+|\/+$/g, '');

  if (!pathname || pathname === 'index.html') return null;
  if (!pathname.endsWith('.md')) return `${pathname}.md`;
  return pathname;
}

function buildArticleUrl(articlePath: string | null): string {
  if (!articlePath) return `${BASE_PATH}/`;
  const clean = articlePath.replace(/\.md$/, '').replace(/^\/+/, '');
  return `${BASE_PATH}/${clean}`;
}

export default function App() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(getArticleFromUrl);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigateToArticle = useCallback((path: string | null) => {
    setSelectedArticle(path);
    const url = buildArticleUrl(path);
    window.history.pushState({ article: path }, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateHome = useCallback((categoryId?: string) => {
    setSelectedArticle(null);
    setSelectedDiscipline(categoryId || 'all');
    const url = buildArticleUrl(null);
    window.history.pushState({ article: null }, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryArticle = params.get('article');
    if (queryArticle) {
      window.history.replaceState(
        { article: queryArticle },
        '',
        buildArticleUrl(queryArticle)
      );
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedArticle(getArticleFromUrl());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleLoadArticle = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) {
        navigateToArticle(detail.endsWith('.md') ? detail : `${detail}.md`);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('load-article', handleLoadArticle);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load-article', handleLoadArticle);
    };
  }, [navigateToArticle]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        !isSearchOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const renderPageTemplate = () => {
    if (!selectedArticle) {
      return (
        <CatalogPage
          onSelectArticle={(path) => navigateToArticle(path)}
          onOpenSearch={() => setIsSearchOpen(true)}
          initialCategory={selectedDiscipline}
        />
      );
    }

    if (selectedArticle === 'glossary.md') {
      return (
        <GlossaryPage
          onBack={() => navigateHome('all')}
          onSelectArticle={(path) => navigateToArticle(path)}
        />
      );
    }

    if (selectedArticle === 'bibliography.md') {
      return (
        <BibliographyPage
          onBack={() => navigateHome('all')}
          onSelectArticle={(path) => navigateToArticle(path)}
        />
      );
    }

    return (
      <ArticlePage
        articlePath={selectedArticle}
        onBack={() => navigateHome('all')}
        onSelectArticle={(path) => navigateToArticle(path)}
      />
    );
  };

  return (
    <SiteShell
      currentArticle={selectedArticle}
      isSearchOpen={isSearchOpen}
      onOpenSearch={() => setIsSearchOpen(true)}
      onCloseSearch={() => setIsSearchOpen(false)}
      onNavigateHome={navigateHome}
      onSelectArticle={(path) => navigateToArticle(path)}
    >
      {renderPageTemplate()}
    </SiteShell>
  );
}
