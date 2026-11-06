import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutGrid,
  Search,
  BookOpen,
  Compass,
  Menu,
  X,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { getCatalogDisciplines } from '../services';
import { ECOSYSTEM_PROJECTS, SITE_CONFIG } from '../config/site';
import { useLanguage } from '../i18n/LanguageContext';

export interface PrimaryNavigationProps {
  currentArticle: string | null;
  onNavigateHome: (categoryId?: string) => void;
  onSelectArticle: (path: string) => void;
  onOpenSearch?: () => void;
}

interface DockIconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const DockIconButton: React.FC<DockIconButtonProps> = ({
  icon,
  label,
  active = false,
  onClick,
}) => (
  <div className="relative group flex items-center">
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
        active
          ? 'bg-forest text-white shadow-sm'
          : 'text-ink-secondary hover:text-ink hover:bg-paper-warm'
      }`}
    >
      {icon}
    </button>
    <span
      role="tooltip"
      className="pointer-events-none fixed left-[72px] z-50 px-2.5 py-1 rounded-md bg-ink text-white font-sans text-xs font-medium opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap shadow-sm"
    >
      {label}
    </span>
  </div>
);

export const FloatingMorphingDock: React.FC<PrimaryNavigationProps> = ({
  currentArticle,
  onNavigateHome,
  onSelectArticle,
  onOpenSearch,
}) => {
  const { lang, isEn, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlightSection, setHighlightSection] = useState<'disciplines' | 'ecosystem'>('disciplines');
  const panelRef = useRef<HTMLDivElement>(null);

  const disciplines = useMemo(() => getCatalogDisciplines(lang, t), [lang, t]);

  const activeCategory = useMemo(() => {
    if (!currentArticle || currentArticle === 'glossary.md' || currentArticle === 'bibliography.md') {
      return null;
    }
    const parts = currentArticle.split('/');
    return parts.length > 1 ? parts[0] : null;
  }, [currentArticle]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isExpanded]);

  const isCatalogActive = !currentArticle;
  const isGlossaryActive = currentArticle === 'glossary.md';
  const isBibliographyActive = currentArticle === 'bibliography.md';

  const handleSelectDiscipline = (catId: string) => {
    setIsExpanded(false);
    onNavigateHome(catId);
  };

  return (
    <div className="hidden lg:block" ref={panelRef}>
      {/* Collapsed Vertical Floating Capsule */}
      <nav
        aria-label={isEn ? 'Primary navigation dock' : 'Основная панель навигации'}
        className={`fixed left-5 top-1/2 -translate-y-1/2 z-40 ui-dock-capsule p-1.5 flex flex-col items-center gap-1.5 transition-all duration-200 ${
          isExpanded
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        <DockIconButton
          icon={<LayoutGrid className="w-[18px] h-[18px]" />}
          label={t.nav.catalog}
          active={isCatalogActive}
          onClick={() => onNavigateHome()}
        />

        <DockIconButton
          icon={<Search className="w-[18px] h-[18px]" />}
          label={`${t.nav.search} (/)`}
          onClick={() => onOpenSearch?.()}
        />

        <DockIconButton
          icon={<BookOpen className="w-[18px] h-[18px]" />}
          label={t.nav.glossary}
          active={isGlossaryActive}
          onClick={() => onSelectArticle('glossary.md')}
        />

        <DockIconButton
          icon={<Compass className="w-[18px] h-[18px]" />}
          label={isEn ? 'Ecosystem' : 'Экосистема'}
          onClick={() => {
            setHighlightSection('ecosystem');
            setIsExpanded(true);
          }}
        />

        <div className="w-5 h-[1px] bg-rule my-0.5" />

        <DockIconButton
          icon={<Menu className="w-[18px] h-[18px]" />}
          label={isEn ? 'Disciplines & Index' : 'Индекс дисциплин'}
          active={Boolean(activeCategory || isBibliographyActive)}
          onClick={() => {
            setHighlightSection('disciplines');
            setIsExpanded(true);
          }}
        />
      </nav>

      {/* Expanded Floating Navigation Panel (Overlay without layout reflow) */}
      {isExpanded && (
        <aside
          aria-label={isEn ? 'Navigation index' : 'Навигационный индекс'}
          className="fixed left-5 top-16 bottom-6 my-auto h-fit max-h-[calc(100vh-5.5rem)] z-50 w-[310px] ui-dock-panel flex flex-col overflow-hidden"
        >
          {/* Top Identity & Search Strip */}
          <div className="p-3.5 border-b border-rule flex flex-col gap-2.5 bg-paper-elevated">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onNavigateHome();
                }}
                className="flex items-baseline gap-2 text-left group"
              >
                <span className="font-sans font-semibold text-sm tracking-tight text-ink group-hover:text-forest transition-colors">
                  {isEn ? SITE_CONFIG.nameEn : SITE_CONFIG.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  {SITE_CONFIG.subtitleCode}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label={isEn ? 'Collapse navigation' : 'Свернуть панель'}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenSearch?.();
                }}
                className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-md bg-paper hover:bg-paper-warm border border-rule text-xs text-ink-secondary transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{t.nav.search}...</span>
                </span>
                <kbd className="font-mono text-[10px] text-ink-muted">/</kbd>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onNavigateHome('all');
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  isCatalogActive
                    ? 'bg-forest text-white border-forest'
                    : 'bg-paper text-ink-secondary border-rule hover:text-ink'
                }`}
              >
                {t.nav.catalog}
              </button>
            </div>
          </div>

          {/* Numbered Scientific Disciplines List (01–10) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2.5">
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="eyebrow-label">
                {isEn ? 'Scientific Disciplines' : 'Научные дисциплины'}
              </span>
              <span className="font-mono text-[10px] text-ink-muted">01–10</span>
            </div>

            <ul className="space-y-0.5">
              {disciplines.map((disc) => {
                const isActive = activeCategory === disc.id;
                return (
                  <li key={disc.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectDiscipline(disc.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between gap-2 transition-colors ${
                        isActive
                          ? 'bg-forest-subtle text-forest font-semibold'
                          : 'text-ink-secondary hover:bg-paper-warm hover:text-ink'
                      }`}
                    >
                      <span className="flex items-baseline gap-2.5 min-w-0 truncate">
                        <span
                          className={`font-mono text-[11px] tabular-nums shrink-0 ${
                            isActive ? 'text-forest font-semibold' : 'text-ink-muted'
                          }`}
                        >
                          {disc.indexNumber}
                        </span>
                        <span className="truncate">{disc.title}</span>
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-ink-muted shrink-0">
                        {disc.articles.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Secondary Reference & Ecosystem Section */}
          <div
            className={`p-2.5 border-t border-rule bg-paper space-y-2 ${
              highlightSection === 'ecosystem' ? 'ring-1 ring-inset ring-forest/20' : ''
            }`}
          >
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onSelectArticle('glossary.md');
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isGlossaryActive
                    ? 'bg-forest text-white border-forest'
                    : 'bg-paper-elevated text-ink-secondary border-rule hover:text-ink'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.nav.glossary}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onSelectArticle('bibliography.md');
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isBibliographyActive
                    ? 'bg-forest text-white border-forest'
                    : 'bg-paper-elevated text-ink-secondary border-rule hover:text-ink'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.nav.bibliography}</span>
              </button>
            </div>

            <div className="pt-1.5 border-t border-rule-subtle">
              <div className="px-1.5 pb-1 eyebrow-label">
                {isEn ? 'Ecosystem' : 'Экосистема'}
              </div>
              <div className="space-y-0.5">
                {ECOSYSTEM_PROJECTS.filter((p) => !p.isCurrent).map((proj) => (
                  <a
                    key={proj.id}
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs text-ink-secondary hover:text-ink hover:bg-paper-warm transition-colors group"
                  >
                    <span className="font-medium group-hover:text-forest transition-colors">
                      {isEn ? proj.nameEn : proj.nameRu}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-ink-muted">
                      <span>{isEn ? proj.roleBadgeEn : proj.roleBadgeRu}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export const PrimaryNavigation = FloatingMorphingDock;
