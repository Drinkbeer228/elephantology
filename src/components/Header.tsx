import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function Header() {
  const { lang } = useLanguage();

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('toggle-search', { detail: { force: true } }));
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F5F0]/95 backdrop-blur-md border-b border-[#DFDCD4] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo: strictly text "СЛОНОЛОГИЯ" */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('show-home'))}
          className="flex items-center gap-2 group focus:outline-none shrink-0 cursor-pointer"
          title={lang === 'en' ? 'Back to homepage' : 'На главную'}
        >
          <span className="font-bold text-base sm:text-lg text-[#141413] group-hover:text-[#1E4631] transition-colors tracking-[0.16em] uppercase font-serif">
            СЛОНОЛОГИЯ
          </span>
        </button>

        {/* Quick Search Button (Center, no keyboard badge) */}
        <div className="flex-1 max-w-sm sm:max-w-md mx-2">
          <button
            type="button"
            onClick={handleOpenSearch}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-none bg-[#EFECE6] hover:bg-[#E8E4DD] border border-[#DFDCD4] text-xs sm:text-sm text-[#6E6B64] hover:text-[#141413] transition-all duration-200 cursor-pointer group"
            title={lang === 'en' ? 'Search encyclopedia' : 'Поиск по энциклопедии'}
          >
            <Search className="w-4 h-4 text-[#6E6B64] group-hover:text-[#1E4631] shrink-0 transition-colors" />
            <span className="truncate text-xs font-normal">
              {lang === 'en' ? 'Search knowledge base...' : 'Поиск по статьям и материалам...'}
            </span>
          </button>
        </div>

        {/* Empty placeholder for balanced flex alignment */}
        <div className="w-8 shrink-0" />

      </div>
    </header>
  );
}
