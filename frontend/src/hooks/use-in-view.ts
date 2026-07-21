'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an element has scrolled into the viewport, once. Used to
 * trigger scroll-reveal animations on the landing page without re-animating
 * every time the element re-enters view.
 */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView, threshold]);

  return { ref, isInView };
}
