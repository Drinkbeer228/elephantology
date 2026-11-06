import React from 'react';

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-paper-muted animate-pulse ${className}`} aria-hidden="true" />
);

export const ArticlePageSkeleton: React.FC = () => (
  <div className="shell-container py-12">
    <SkeletonBlock className="h-4 w-48 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 space-y-4">
        <SkeletonBlock className="h-10 w-4/5" />
        <div className="h-24 w-full bg-paper-warm border border-rule" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </div>
  </div>
);
