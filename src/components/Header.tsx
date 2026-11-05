import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  currentView: 'home' | 'article' | 'module';
  currentArticlePath: string | null;
  onNavigateHome: (scrollToId?: string) => void;
  onOpenArticle: (path: string) => void;
}

export function Header({
  currentView,
  currentArticlePath,
  onNavigateHome,
  onOpenArticle,
}: HeaderProps) {
  const { lang, isEn } = useLanguage();

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }));
  };

  const isGlossaryActive = currentView === 'article' && currentArticlePath?.includes('glossary');
  const isBiblioActive = currentView === 'article' && currentArticlePath?.includes('bibliography');

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#DED8CD] transition-colors">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (single text element, one line) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="font-serif font-bold text-xl sm:text-2xl text-[#1C1917] hover:text-[#14532D] transition-colors tracking-[0.12em] uppercase whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D]"
          title={isEn ? 'Back to homepage' : 'На главную'}
        >
          {isEn ? 'ELEPHANTOLOGY' : 'СЛОНОЛОГИЯ'}
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav aria-label={isEn ? 'Primary Navigation' : 'Основная навигация'} className="hidden md:flex items-center gap-7 text-sm font-medium text-[#44403C]">
          <button
            type="button"
            onClick={() => onNavigateHome('catalog-section')}
            className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'home'
                ? 'border-[#14532D] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#C5BDB0]'
            }`}
          >
            {isEn ? 'Catalog' : 'Рубрикатор'}
          </button>

          <button
            type="button"
            onClick={() => onNavigateHome('featured-section')}
            className="py-1 border-b border-transparent hover:text-[#1C1917] hover:border-[#C5BDB0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isEn ? 'Monographs' : 'Монографии'}
          </button>

          <button
            type="button"
            onClick={() => onOpenArticle('glossary')}
            className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isGlossaryActive
                ? 'border-[#14532D] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#C5BDB0]'
            }`}
          >
            {isEn ? 'Glossary' : 'Глоссарий'}
          </button>

          <button
            type="button"
            onClick={() => onOpenArticle('bibliography')}
            className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isBiblioActive
                ? 'border-[#14532D] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#C5BDB0]'
            }`}
          >
            {isEn ? 'Bibliography' : 'Библиография'}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Search Trigger) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleOpenSearch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#14532D] hover:bg-[#166534] text-[#FBF9F5] text-xs font-medium tracking-wide transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#14532D]"
            aria-label={lang === 'en' ? 'Search knowledge base' : 'Поиск по базе знаний'}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>{isEn ? 'Search Archive' : 'Поиск по базе'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
