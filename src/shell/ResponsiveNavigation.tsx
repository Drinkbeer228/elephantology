import React, { useMemo } from 'react';
import { ArrowUpRight, Search, BookOpen, FileText, LayoutGrid } from 'lucide-react';
import { getCatalogDisciplines } from '../services';
import { ECOSYSTEM_PROJECTS } from '../config/site';
import { useLanguage } from '../i18n/LanguageContext';

interface ResponsiveNavigationProps {
  isOpen: boolean;
  currentArticle: string | null;
  onNavigateHome: (categoryId?: string) => void;
  onSelectArticle: (path: string) => void;
  onOpenSearch?: () => void;
  onClose: () => void;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  isOpen,
  currentArticle,
  onNavigateHome,
  onSelectArticle,
  onOpenSearch,
  onClose,
}) => {
  const { lang, isEn, t } = useLanguage();
  const disciplines = useMemo(() => getCatalogDisciplines(lang, t), [lang, t]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden border-t border-rule bg-paper-elevated px-4 py-4 space-y-4 max-h-[82vh] overflow-y-auto shadow-lg">
      {/* Primary Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => {
            onNavigateHome();
            onClose();
          }}
          className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 border ${
            !currentArticle
              ? 'bg-forest text-white border-forest'
              : 'bg-paper text-ink-secondary border-rule'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span>{t.nav.catalog}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSearch?.();
          }}
          className="px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 bg-paper text-ink-secondary border border-rule"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>{t.nav.search}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectArticle('glossary.md');
            onClose();
          }}
          className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 border ${
            currentArticle === 'glossary.md'
              ? 'bg-forest text-white border-forest'
              : 'bg-paper text-ink-secondary border-rule'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>{t.nav.glossary}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectArticle('bibliography.md');
            onClose();
          }}
          className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 border ${
            currentArticle === 'bibliography.md'
              ? 'bg-forest text-white border-forest'
              : 'bg-paper text-ink-secondary border-rule'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>{t.nav.bibliography}</span>
        </button>
      </div>

      {/* 10 Scientific Disciplines */}
      <div className="pt-3 border-t border-rule">
        <div className="eyebrow-label px-2 mb-2">
          {isEn ? 'Scientific Disciplines (01–10)' : 'Научные дисциплины (01–10)'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {disciplines.map((disc) => (
            <button
              key={disc.id}
              type="button"
              onClick={() => {
                onNavigateHome(disc.id);
                onClose();
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-left text-ink-secondary hover:bg-paper-warm hover:text-ink transition-colors"
            >
              <span className="flex items-baseline gap-2 truncate">
                <span className="font-mono text-[11px] tabular-nums text-forest font-medium">
                  {disc.indexNumber}
                </span>
                <span className="truncate font-medium text-ink">{disc.title}</span>
              </span>
              <span className="font-mono text-[10px] tabular-nums text-ink-muted ml-2">
                {disc.articles.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ecosystem */}
      <div className="pt-3 border-t border-rule">
        <div className="eyebrow-label px-2 mb-1.5">
          {isEn ? 'Research Ecosystem' : 'Экосистема'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {ECOSYSTEM_PROJECTS.filter((p) => !p.isCurrent).map((proj) => (
            <a
              key={proj.id}
              href={proj.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-between py-2 px-2.5 rounded-md text-xs text-ink-secondary hover:bg-paper-warm hover:text-ink"
            >
              <div>
                <span className="font-medium text-ink">
                  {isEn ? proj.nameEn : proj.nameRu}
                </span>
                <span className="ml-2 font-mono text-[10px] text-ink-muted">
                  {isEn ? proj.roleBadgeEn : proj.roleBadgeRu}
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
