import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownProps {
  triggerLabel: React.ReactNode;
  align?: 'left' | 'right';
  widthClassName?: string;
  triggerClassName?: string;
  children: (close: () => void) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  triggerLabel,
  align = 'left',
  widthClassName = 'w-80',
  triggerClassName = '',
  children,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 transition-colors ${triggerClassName}`}
      >
        {triggerLabel}
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-muted shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 ${widthClassName} ui-popover-panel z-50 animate-fade-in-content`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};
