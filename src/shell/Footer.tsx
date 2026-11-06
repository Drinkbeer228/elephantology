import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG, ECOSYSTEM_PROJECTS } from '../config/site';

export interface FooterProps {
  onNavigateHome: () => void;
  onSelectArticle: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const externalProjects = ECOSYSTEM_PROJECTS.filter((p) => !p.isCurrent);

  return (
    <footer className="border-t border-rule bg-paper mt-auto">
      <div className="shell-container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-muted">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-sans font-medium text-ink-secondary">
              {SITE_CONFIG.name}
            </span>
            <span>·</span>
            <span className="font-serif italic text-ink-muted">
              Loxodonta africana · Loxodonta cyclotis · Elephas maximus
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            {externalProjects.map((proj, idx) => (
              <React.Fragment key={proj.id}>
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-ink-muted hover:text-forest transition-colors"
                >
                  <span>{proj.nameRu}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                {idx < externalProjects.length - 1 && (
                  <span className="text-rule-strong">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
