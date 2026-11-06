import React, { useState, useRef, useEffect, useId } from 'react';

export interface TooltipPopoverProps {
  trigger: (props: {
    isOpen: boolean;
    toggle: (e: React.MouseEvent) => void;
    onFocus: () => void;
    onBlur: () => void;
    ariaDescribedBy?: string;
  }) => React.ReactNode;
  content: (close: () => void) => React.ReactNode;
  widthClassName?: string;
}

export const TooltipPopover: React.FC<TooltipPopoverProps> = ({
  trigger,
  content,
  widthClassName = 'w-72 sm:w-80',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const show = () => {
    clearTimer();
    setIsOpen(true);
  };

  const hideDelayed = () => {
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className="relative inline-block align-baseline"
      onMouseEnter={show}
      onMouseLeave={hideDelayed}
    >
      {trigger({
        isOpen,
        toggle: (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((v) => !v);
        },
        onFocus: show,
        onBlur: hideDelayed,
        ariaDescribedBy: isOpen ? tooltipId : undefined,
      })}

      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hideDelayed}
          className={`fixed sm:absolute z-50 left-4 right-4 sm:left-0 sm:right-auto bottom-6 sm:bottom-full sm:mb-2 w-auto ${widthClassName} p-3.5 ui-popover-panel block text-left font-sans text-xs leading-relaxed`}
        >
          {content(() => setIsOpen(false))}
        </span>
      )}
    </span>
  );
};
