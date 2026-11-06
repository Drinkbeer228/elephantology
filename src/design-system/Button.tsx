import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'icon';
  active?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'sm', active = false, className = '', children, ...props }, ref) => {
    const variantClass = active
      ? 'ui-btn-primary'
      : variant === 'primary'
      ? 'ui-btn-primary'
      : variant === 'outline'
      ? 'ui-btn-outline'
      : variant === 'ghost'
      ? 'ui-btn-ghost'
      : 'ui-btn-secondary';

    const sizeClass =
      size === 'xs'
        ? 'h-7 px-2.5 text-[11px]'
        : size === 'sm'
        ? 'h-8 px-3 text-xs'
        : size === 'md'
        ? 'h-10 px-4 text-sm'
        : 'w-8 h-8 p-0';

    return (
      <button
        ref={ref}
        type="button"
        className={`ui-btn ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
