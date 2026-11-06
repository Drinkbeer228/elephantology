import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  variant?: 'default' | 'inline' | 'nav' | 'card';
  active?: boolean;
  showExternalIcon?: boolean;
}

export const AppLink: React.FC<AppLinkProps> = ({
  external = false,
  variant = 'default',
  active = false,
  showExternalIcon = false,
  className = '',
  children,
  ...props
}) => {
  const variantClasses =
    variant === 'inline'
      ? 'article-inline-link'
      : variant === 'nav'
      ? `py-1 transition-colors border-b-2 ${
          active
            ? 'text-ink font-semibold border-forest'
            : 'text-ink-secondary hover:text-ink border-transparent'
        }`
      : variant === 'card'
      ? 'block bg-paper hover:bg-paper-warm transition-colors focus:outline-none'
      : 'text-ink-secondary hover:text-ink transition-colors';

  return (
    <a
      target={external ? '_blank' : props.target}
      rel={external ? 'noopener noreferrer' : props.rel}
      className={`${variantClasses} ${className}`}
      {...props}
    >
      {children}
      {showExternalIcon && (
        <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted shrink-0 inline-block ml-1" />
      )}
    </a>
  );
};
