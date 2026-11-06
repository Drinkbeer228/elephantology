import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { ArticleSummary, TocItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ArticleTocRailProps {
  toc: TocItem[];
  categoryArticles?: ArticleSummary[];
  currentArticlePath?: string;
  onSelectArticle?: (path: string) => void;
  categoryLabel?: string;
}

export const ArticleTocRail: React.FC<ArticleTocRailProps> = ({ toc }) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string>('');
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        setReadProgress(Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -75% 0px' }
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  let h2Index = 0;

  return (
    <aside className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-1">
      {/* Subtle Reading Progress & Header */}
      <div className="mb-4 pb-3 border-b border-rule">
        <div className="flex items-center justify-between font-mono text-[11px] tabular-nums text-ink-muted mb-2">
          <span className="uppercase tracking-wider">{t.article.toc}</span>
          <span>{readProgress}%</span>
        </div>
        <div className="w-full h-[2px] bg-rule rounded-full overflow-hidden">
          <div
            className="h-full bg-forest transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>
      </div>

      {/* Contextual Article Table of Contents */}
      {toc.length > 0 && (
        <nav aria-label={t.article.toc}>
          <ul className="space-y-0.5 border-l border-rule">
            {toc.map((item) => {
              const isH2 = item.level === 2;
              if (isH2) h2Index += 1;
              const isActive = activeId === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left py-1.5 pr-2 transition-colors flex items-baseline gap-2 border-l-2 -ml-[1px] ${
                      item.level === 3 ? 'pl-5 text-[11px]' : 'pl-3 text-xs'
                    } ${
                      isActive
                        ? 'border-forest text-forest font-medium'
                        : 'border-transparent text-ink-secondary hover:text-ink hover:border-rule-strong'
                    }`}
                  >
                    {isH2 && (
                      <span className="font-mono text-[10px] tabular-nums text-ink-muted shrink-0">
                        {String(h2Index).padStart(2, '0')}
                      </span>
                    )}
                    <span className="line-clamp-2 leading-snug">{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {readProgress > 20 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-5 pt-3 border-t border-rule w-full flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-forest transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>{t.article.up}</span>
        </button>
      )}
    </aside>
  );
};
