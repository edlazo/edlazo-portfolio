import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Stagger offset in ms for items that enter the viewport together. */
  delay?: number;
  className?: string;
}

/**
 * Fades and lifts its children in the first time they scroll into view.
 * Only animates opacity/transform (compositor-only, no layout shift) and is
 * disabled by the prefers-reduced-motion rules in index.css.
 */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      // threshold 0 so tall cards still trigger; the negative bottom margin
      // waits until the element is ~10% into the viewport.
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      // Tabbing into a not-yet-revealed card must never leave the focus ring invisible.
      onFocusCapture={() => setIsVisible(true)}
      className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
};
