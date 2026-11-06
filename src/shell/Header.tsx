import React from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG, ECOSYSTEM_PROJECTS } from '../config/site';

export interface HeaderProps {
  onOpenSearch: () => void;
  onNavigateHome: (categoryId?: string) => void;
  onSelectArticle: (path: string) => void;
  currentArticle: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onNavigateHome,
  onSelectArticle,
  currentArticle,
}) => {
  const isGlossary = currentArticle === 'glossary.md';
  const isBibliography = currentArticle === 'bibliography.md';
  const isReadingPage = currentArticle !== null;
  const researchStation = ECOSYSTEM_PROJECTS.find((p) => p.id === 'research-station');

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-sm border-b border-rule">
      <div className="shell-container">
        <div className="flex items-center justify-between h-12 gap-4">
          {/* Masthead Identity */}
          <button
            type="button"
            onClick={() => onNavigateHome('all')}
            className="text-left group focus:outline-none flex items-baseline gap-2.5 whitespace-nowrap shrink-0"
          >
            <span className="font-sans font-semibold text-[15px] sm:text-base tracking-tight text-ink group-hover:text-forest transition-colors">
              {SITE_CONFIG.name}
            </span>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Ordo Proboscidea
            </span>
          </button>

          {/* Single Coherent Masthead Navigation — Zero Duplication */}
          <nav
            aria-label="Основная навигация"
            className="flex items-center gap-4 sm:gap-5 text-xs font-sans"
          >
            <button
              type="button"
              onClick={() => onSelectArticle('glossary.md')}
              className={`transition-colors ${
                isGlossary
                  ? 'text-forest font-semibold underline underline-offset-4 decoration-forest'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Глоссарий
            </button>

            <button
              type="button"
              onClick={() => onSelectArticle('bibliography.md')}
              className={`transition-colors ${
                isBibliography
                  ? 'text-forest font-semibold underline underline-offset-4 decoration-forest'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Библиография
            </button>

            {researchStation && (
              <>
                <span className="hidden md:inline text-rule-strong select-none">|</span>
                <a
                  href={researchStation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-0.5 text-ink-muted hover:text-forest transition-colors font-mono text-[11px]"
                >
                  <span>{researchStation.nameRu}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </>
            )}

            {/* Only show Search button in header when inside an article/reference page; Homepage already has the primary search input */}
            {isReadingPage && (
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Поиск по корпусу"
                className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded bg-paper-elevated border border-rule hover:border-rule-strong text-ink-secondary hover:text-ink transition-colors"
              >
                <Search className="w-3 h-3 text-ink-muted" />
                <span className="hidden sm:inline text-[11px]">Поиск</span>
                <kbd className="hidden sm:inline font-mono text-[10px] text-ink-muted ml-0.5">
                  /
                </kbd>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
