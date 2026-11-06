import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingSlot?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon, trailingSlot, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div
        className={`relative flex items-center bg-paper border border-rule focus-within:border-rule-emphasis transition-colors ${containerClassName}`}
      >
        {leadingIcon && (
          <span className="pl-3.5 text-forest shrink-0 flex items-center">{leadingIcon}</span>
        )}
        <input
          ref={ref}
          className={`w-full bg-transparent py-2.5 px-3 text-ink placeholder:text-ink-muted focus:outline-none text-sm ${className}`}
          {...props}
        />
        {trailingSlot && (
          <div className="pr-3 flex items-center gap-1.5 shrink-0">{trailingSlot}</div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
