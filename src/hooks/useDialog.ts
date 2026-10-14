import { useEffect, useRef } from 'react';

/**
 * Shared behaviour for modals and drawers:
 *  - closes on Escape
 *  - locks page scroll while open
 *  - moves focus into the dialog and restores it to the trigger on close
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void,
  options: { focusContainer?: boolean } = {},
) {
  const { focusContainer = true } = options;
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the dialog container so keyboard users land inside it
    const t = focusContainer ? window.setTimeout(() => ref.current?.focus(), 0) : 0;

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, focusContainer]);

  return ref;
}
