"use client";

import { createElement, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

// useLayoutEffect côté navigateur seulement (évite l'avertissement SSR)
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article" | "section" | "p";
};

/**
 * Fait apparaître le contenu quand il entre dans l'écran.
 * - Le contenu déjà visible au chargement n'est jamais masqué.
 * - Sans JavaScript ou avec « réduire les animations », tout reste visible.
 */
export default function Reveal({ children, className = "", delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add("lp-reveal");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  );
}
