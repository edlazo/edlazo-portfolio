import React, { useEffect, useRef, useState } from 'react';

type RevealState = 'visible' | 'above' | 'below';

interface RevealProps {
  children: React.ReactNode;
  /** Stagger offset in ms, applied only when entering. */
  delay?: number;
  className?: string;
  /**
   * For content already on screen at page load (the hero): starts visible so
   * it never delays LCP, and only fades out once scrolled past the top.
   */
  aboveTheFold?: boolean;
}

/**
 * Fades content in while it is inside the viewport band and back out as it
 * leaves, moving in the scroll direction (exits upward at the top, downward at
 * the bottom). Only animates opacity/transform and is disabled by the
 * prefers-reduced-motion rules in index.css.
 *
 * The outer div is the one observed and is never transformed; animating it
 * directly would shift its box across the band edge and make it flicker.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className = '',
  aboveTheFold = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>(aboveTheFold ? 'visible' : 'below');
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    if (!('IntersectionObserver' in window)) {
      setState('visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // A jump (scroll restoration, fast fling) can skip the band entirely,
          // leaving the hidden state on the wrong side. Snap it to the side it
          // is actually entering from, without a transition, before fading in.
          const side = entry.boundingClientRect.top < window.innerHeight / 2 ? 'above' : 'below';
          const current = stateRef.current;
          if (current !== 'visible' && current !== side) {
            inner.style.transition = 'none';
            inner.dataset.reveal = side;
            void inner.offsetHeight; // commit the snapped position
            inner.style.transition = '';
          }
          setState('visible');
          return;
        }
        // Never hide something the keyboard user is currently on.
        if (el.contains(document.activeElement)) return;

        const isAbove = entry.boundingClientRect.bottom < window.innerHeight / 2;
        if (!isAbove && aboveTheFold) return;
        setState(isAbove ? 'above' : 'below');
      },
      // A 10% band at each edge, so the fade-out happens while it's still on screen.
      { threshold: 0, rootMargin: '-10% 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [aboveTheFold]);

  return (
    <div ref={ref} className={className} onFocusCapture={() => setState('visible')}>
      <div
        ref={innerRef}
        className="reveal h-full"
        data-reveal={state}
        style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      >
        {children}
      </div>
    </div>
  );
};
