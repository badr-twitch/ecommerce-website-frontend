import { useEffect, useRef } from 'react';

/**
 * Hook that adds scroll-triggered reveal animations.
 * Uses IntersectionObserver to add 'revealed' class when elements enter viewport.
 *
 * Usage:
 *   const revealRef = useScrollReveal();
 *   <div ref={revealRef}>
 *     <div className="reveal">...</div>
 *     <div className="reveal stagger-1">...</div>
 *     <div className="reveal stagger-2">...</div>
 *   </div>
 */
export default function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return containerRef;
}
