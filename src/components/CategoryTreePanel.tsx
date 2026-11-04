import React, { useMemo } from 'react';
import { BookOpen, ChevronLeft, FileText } from 'lucide-react';
import { getStaticArticles } from '../lib/articles';
import { EvidenceBadge } from './ArticleBlocks';

interface CategoryTreePanelProps {
  /** Ключ рубрики текущей статьи (meta.category в нижнем регистре) */
  categoryKey: string;
  /** Отображаемое название рубрики */
  categoryTitle: string;
  /** Путь текущей статьи без .md (например "anatomy/sensory-umwelt...") */
  currentPathPart: string;
  onOpenCatalog: () => void;
  onNavigate: (path: string) => void;
}

/**
 * Левая колонка Docs Architecture — дерево статей текущей рубрики.
 * Активная статья подсвечивается, клик грузит статью без перезагрузки страницы.
 */
export function CategoryTreePanel({
  categoryKey,
  categoryTitle,
  currentPathPart,
  onOpenCatalog,
  onNavigate
}: CategoryTreePanelProps) {
  const siblingArticles = useMemo(() => {
    try {
      return getStaticArticles()
        .filter(a => (a.category || '').toLowerCase() === categoryKey.toLowerCase())
        .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } catch {
      return [];
    }
  }, [categoryKey]);

  return (
    <nav aria-label="Навигация по рубрике" className="text-sm">
      {/* Ссылка назад в каталог */}
      <button
        onClick={onOpenCatalog}
        className="flex items-center gap-1.5 px-3 py-2 mb-3 w-full text-left rounded-lg text-xs font-semibold text-slate-400 hover:text-brand-emerald hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
        <span>Все рубрики</span>
      </button>

      {/* Заголовок рубрики */}
      <div className="flex items-center gap-2 px-3 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 leading-tight">
          {categoryTitle}
        </span>
        <span className="ml-auto font-mono text-[10px] text-slate-500 bg-ink-elevated border border-ink-border rounded px-1.5 py-0.5">
          {siblingArticles.length}
        </span>
      </div>

      {/* Список статей рубрики */}
      {siblingArticles.length === 0 ? (
        <p className="px-3 text-xs text-slate-500 italic">Нет других статей в рубрике</p>
      ) : (
        <ul className="space-y-0.5 border-l border-ink-border">
          {siblingArticles.map((article) => {
            const articlePathPart = article.path.replace(/\.md$/, '');
            const isActive = articlePathPart === currentPathPart;
            return (
              <li key={article.path}>
                <button
                  onClick={() => onNavigate(article.path)}
                  aria-current={isActive ? 'page' : undefined}
                  title={article.title}
                  className={`toc-link flex items-start gap-2 w-full text-left cursor-pointer ${
                    isActive ? 'is-active' : ''
                  }`}
                >
                  <FileText
                    className={`w-3 h-3 mt-1 shrink-0 ${
                      isActive ? 'text-brand-emerald' : 'text-slate-600'
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block leading-snug line-clamp-2">{article.title}</span>
                    {article.evidenceLevel && (
                      <span className="mt-1 inline-flex scale-[0.85] origin-left">
                        <EvidenceBadge level={article.evidenceLevel} compact />
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
