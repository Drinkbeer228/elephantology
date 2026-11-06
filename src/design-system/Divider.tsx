import React from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  emphasis?: 'subtle' | 'strong';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  emphasis = 'subtle',
  className = '',
}) => {
  const colorClass = emphasis === 'strong' ? 'border-rule-emphasis bg-ink' : 'border-rule bg-rule';

  if (orientation === 'vertical') {
    return (
      <span
        className={`inline-block w-[1px] h-3.5 ${
          emphasis === 'strong' ? 'bg-ink' : 'bg-rule'
        } ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <hr
      className={`border-0 border-t ${colorClass} m-0 ${className}`}
      aria-hidden="true"
    />
  );
};
