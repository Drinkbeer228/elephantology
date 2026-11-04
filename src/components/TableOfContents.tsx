import React, { useEffect, useMemo, useState } from 'react';
import { ListTree } from 'lucide-react';

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

/**
 * Интерактивное оглавление статьи (Docs Architecture, правая sticky-колонка).
 * Scroll-spy построен на IntersectionObserver по реальным h2/h3 внутри prose-контейнера.
 */
export function TableOfContents({
  items,
  onNavigate
}: {
  items: TocItem[];
  onNavigate?: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState<string>('');

  // Подсветка текущего заголовка при скролле
  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -66% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      history.replaceState(null, '', `#${id}`);
    }
    onNavigate?.(id);
  };

  const progressLabel = useMemo(() => {
    if (!activeId || items.length === 0) return null;
    const idx = items.findIndex((i) => i.id === activeId);
    return idx >= 0 ? `${idx + 1} / ${items.length}` : null;
  }, [activeId, items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Содержание страницы" className="text-sm">
      <div className="flex items-center justify-between gap-2 mb-3 px-3">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          <ListTree className="w-3.5 h-3.5 text-brand-emerald" />
          Содержание
        </span>
        {progressLabel && (
          <span className="font-mono text-[10px] text-slate-500">{progressLabel}</span>
        )}
      </div>
      <ul className="space-y-0.5 border-l border-ink-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`toc-link ${item.level === 3 ? 'pl-7' : ''} ${
                activeId === item.id ? 'is-active' : ''
              }`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
