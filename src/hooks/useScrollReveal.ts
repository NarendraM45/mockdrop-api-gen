import { useEffect, useRef, useState } from "react";

type Options = {
  once?: boolean; // default true – animation runs only first time
  delay?: number; // ms – stagger delay for children
};

/**
 * Hook that provides a ref to attach to an element and a boolean `isVisible`
 * that becomes true when the element enters the viewport (threshold 0.15).
 * It respects `prefers-reduced-motion` – if the user has requested reduced
 * motion the hook will never report visible, allowing callers to skip animations.
 */
export const useScrollReveal = (options: Options = {}) => {
  const { once = true, delay = 0 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // Immediately consider visible so UI remains usable without animation.
      setIsVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay) {
              const timer = setTimeout(() => setIsVisible(true), delay);
              return () => clearTimeout(timer);
            }
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, delay]);

  return { ref, isVisible } as const;
};
