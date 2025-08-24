"use client";

import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(
  selectors: string[],
  options?: IntersectionObserverInit
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = selectors.map((selector) =>
      document.getElementById(selector)
    ).filter(Boolean) as HTMLElement[];

    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver((entries) => {
      let firstVisibleId: string | null = null;
      
      // Find the first element that is intersecting from the top
      for (const entry of entries) {
        if (entry.isIntersecting) {
          firstVisibleId = entry.target.id;
          break;
        }
      }

      // If no element is visible, check which was the last active one
      if (firstVisibleId) {
         setActiveId(firstVisibleId);
      } else {
        // Find if any element is fully above the viewport
        let lastAboveViewportId: string | null = null;
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            const rect = el.getBoundingClientRect();
            if (rect.bottom < (options?.rootMargin ? parseInt(options.rootMargin) : 0)) {
                lastAboveViewportId = el.id;
                break;
            }
        }
        if (lastAboveViewportId) {
             setActiveId(lastAboveViewportId);
        }
      }

    }, options);

    elements.forEach((el) => observer.current!.observe(el));

    return () => observer.current?.disconnect();
  }, [selectors, options]);

  return activeId;
}
