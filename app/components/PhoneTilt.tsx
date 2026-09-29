"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Incline légèrement le téléphone en suivant le pointeur (desktop uniquement).
 * Désactivé sur écran tactile et avec « réduire les animations ».
 */
export default function PhoneTilt({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduce) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        stage.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
        stage.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      stage.style.setProperty("--ry", "0deg");
      stage.style.setProperty("--rx", "0deg");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="lp-tilt" ref={stageRef}>
      {children}
    </div>
  );
}
