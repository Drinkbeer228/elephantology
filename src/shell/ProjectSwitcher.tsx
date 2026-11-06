import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ECOSYSTEM_PROJECTS } from '../config/site';
import { Dropdown } from '../design-system';
import { useLanguage } from '../i18n/LanguageContext';

export const ProjectSwitcher: React.FC = () => {
  const { isEn } = useLanguage();

  return (
    <Dropdown
      align="right"
      widthClassName="w-72"
      triggerClassName="ui-btn ui-btn-secondary h-8 px-2.5 text-xs text-ink-secondary hover:text-ink"
      triggerLabel={
        <span className="font-mono text-[11px] uppercase tracking-wider">
          {isEn ? 'Ecosystem' : 'Экосистема'}
        </span>
      }
    >
      {(close) => (
        <div>
          <div className="px-3.5 py-2 border-b border-rule-subtle">
            <span className="eyebrow-label">
              {isEn ? 'Proboscidea Digital Ecosystem' : 'Исследовательская экосистема'}
            </span>
          </div>

          <div className="divide-y divide-rule-subtle">
            {ECOSYSTEM_PROJECTS.map((proj) => {
              const name = isEn ? proj.nameEn : proj.nameRu;
              const role = isEn ? proj.roleBadgeEn : proj.roleBadgeRu;
              const desc = isEn ? proj.descriptionEn : proj.descriptionRu;

              if (proj.isCurrent) {
                return (
                  <div key={proj.id} className="px-3.5 py-3 bg-paper-warm">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-semibold text-sm text-ink">{name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-forest font-medium">
                        {role}
                      </span>
                    </div>
                    <div className="font-sans text-xs text-ink-secondary mt-1">{desc}</div>
                  </div>
                );
              }

              return (
                <a
                  key={proj.id}
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="block px-3.5 py-3 hover:bg-paper-warm transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-semibold text-sm text-ink group-hover:text-forest transition-colors">
                      {name}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-forest transition-colors" />
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-forest mt-0.5">
                    {role}
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </Dropdown>
  );
};
