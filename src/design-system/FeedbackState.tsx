import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="py-12 px-4 text-center">
    <p className="text-sm font-semibold text-ink">{title}</p>
    {description && <p className="text-xs text-ink-muted mt-1">{description}</p>}
    {actionLabel && onAction && (
      <div className="mt-4">
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

export interface ErrorStateProps {
  code?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  code = '404',
  title,
  message,
  actionLabel,
  onAction,
  actionIcon,
}) => (
  <div className="max-w-xl mx-auto my-16 p-8 bg-paper-warm border border-rule-strong">
    <div className="eyebrow-accent mb-2">{code}</div>
    <h2 className="font-serif text-2xl font-semibold text-ink mb-3">{title}</h2>
    <p className="text-sm text-ink-secondary mb-6 leading-relaxed">{message}</p>
    {actionLabel && onAction && (
      <Button variant="primary" size="sm" onClick={onAction}>
        {actionIcon}
        <span>{actionLabel}</span>
      </Button>
    )}
  </div>
);
