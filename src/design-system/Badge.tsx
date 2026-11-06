import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'accent' | 'index';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  className = '',
  children,
}) => {
  const variantClasses =
    variant === 'accent'
      ? 'font-mono text-[10px] uppercase tracking-[0.12em] text-forest font-semibold'
      : variant === 'index'
      ? 'font-mono text-xs tabular-nums text-ink-muted'
      : 'font-mono text-[11px] text-ink-muted';

  return <span className={`${variantClasses} ${className}`}>{children}</span>;
};

export interface MetadataStripItem {
  label: React.ReactNode;
  accent?: boolean;
  tooltip?: string;
}

export const MetadataStrip: React.FC<{
  items: Array<MetadataStripItem | string | null | undefined | false>;
  className?: string;
}> = ({ items, className = '' }) => {
  const validItems = items.filter(Boolean) as Array<MetadataStripItem | string>;
  if (validItems.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-ink-muted ${className}`}
    >
      {validItems.map((item, idx) => {
        const isObj = typeof item === 'object' && item !== null && 'label' in item;
        const label = isObj ? item.label : item;
        const accent = isObj ? item.accent : false;
        const tooltip = isObj ? item.tooltip : undefined;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-rule-strong">·</span>}
            <span
              title={tooltip}
              className={`${
                accent ? 'text-forest font-semibold uppercase tracking-[0.12em]' : ''
              } ${
                tooltip
                  ? 'text-ink font-medium border-b border-dotted border-ink-muted cursor-help'
                  : ''
              }`}
            >
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};
