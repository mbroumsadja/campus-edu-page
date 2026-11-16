"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mi } from "./Mi";

// Ressort amorti critique (réponse 0,32 s, sans rebond) : part toujours de la position et de la vitesse courantes,
// donc la feuille peut être attrapée et renvoyée à tout moment.
const OMEGA = (2 * Math.PI) / 0.32;
const decelerationRate = 0.998;
const projeter = (v: number) => ((v / 1000) * decelerationRate) / (1 - decelerationRate);
const elastique = (depassement: number, dimension: number, c = 0.55) =>
  (depassement * dimension * c) / (dimension + c * Math.abs(depassement));

type Props = { ouverte: boolean; fermer: () => void; titre: string; children: React.ReactNode };

export default function Feuille({ ouverte, fermer, titre, children }: Props) {
  const [monte, setMonte] = useState(false);
  const feuille = useRef<HTMLDivElement>(null);
  const voile = useRef<HTMLDivElement>(null);
  const etat = useRef({ y: 0, v: 0, cible: 0, raf: 0, fin: undefined as undefined | (() => void), venteDrag: 0 });
  const doigt = useRef<{ id: number; depart: number; origine: number; points: { t: number; y: number }[] } | null>(null);
  const idTitre = useRef(`feuille-${Math.random().toString(36).slice(2, 8)}`).current;

  const reduit = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hauteur = () => feuille.current?.offsetHeight ?? 400;

  const poser = useCallback((y: number) => {
    etat.current.y = y;
    const h = hauteur();
    if (feuille.current) feuille.current.style.transform = `translate3d(0, ${y}px, 0)`;
    if (voile.current) voile.current.style.opacity = String(Math.max(0, Math.min(1, 1 - y / h)));
  }, []);

  const lancer = useCallback(
    (cible: number, vitesse: number, fin?: () => void) => {
      const s = etat.current;
      cancelAnimationFrame(s.raf);
      s.cible = cible;
      s.v = vitesse;
      s.fin = fin;
      if (reduit()) {
        poser(cible);
        fin?.();
        return;
      }
      let prec = performance.now();
      const pas = (maintenant: number) => {
        const dt = Math.min((maintenant - prec) / 1000, 1 / 30);
        prec = maintenant;
        const accel = -OMEGA * OMEGA * (s.y - s.cible) - 2 * OMEGA * s.v;
        s.v += accel * dt;
        poser(s.y + s.v * dt);
        if (Math.abs(s.y - s.cible) < 0.5 && Math.abs(s.v) < 8) {
          poser(s.cible);
          s.fin?.();
          return;
        }
        s.raf = requestAnimationFrame(pas);
      };
      s.raf = requestAnimationFrame(pas);
    },
    [poser]
  );

  // Ouverture : la feuille monte depuis le bas
  useEffect(() => {
    if (ouverte) setMonte(true);
  }, [ouverte]);

  useLayoutEffect(() => {
    if (monte && ouverte) {
      poser(hauteur());
      lancer(0, 0);
      feuille.current?.focus({ preventScroll: true });
    }
  }, [monte, ouverte, poser, lancer]);

  // Fermeture : elle repart par le même chemin, avec la vitesse du geste s'il y en a un
  useEffect(() => {
    if (!ouverte && monte) lancer(hauteur() + 24, etat.current.venteDrag, () => setMonte(false));
  }, [ouverte, monte, lancer]);

  useEffect(() => {
    if (!monte) return;
    const avant = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const touche = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    window.addEventListener("keydown", touche);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", touche);
      avant?.focus?.();
    };
  }, [monte, fermer]);

  useEffect(() => () => cancelAnimationFrame(etat.current.raf), []);

  // Glisser la poignée : suivi 1:1, résistance vers le haut, projection de l'élan au relâchement
  const debut = (e: React.PointerEvent) => {
    if (!ouverte) return;
    cancelAnimationFrame(etat.current.raf);
    e.currentTarget.setPointerCapture(e.pointerId);
    doigt.current = { id: e.pointerId, depart: e.clientY, origine: etat.current.y, points: [{ t: e.timeStamp, y: e.clientY }] };
    etat.current.venteDrag = 0;
  };
  const bouge = (e: React.PointerEvent) => {
    const d = doigt.current;
    if (!d || d.id !== e.pointerId) return;
    d.points.push({ t: e.timeStamp, y: e.clientY });
    if (d.points.length > 6) d.points.shift();
    const brut = d.origine + (e.clientY - d.depart);
    poser(brut >= 0 ? brut : elastique(brut, hauteur()));
  };
  const fin = (e: React.PointerEvent) => {
    const d = doigt.current;
    if (!d || d.id !== e.pointerId) return;
    doigt.current = null;
    // Vitesse sur les 100 dernières ms : un doigt arrêté avant de lâcher ne lance rien
    const p = d.points.filter((pt) => pt.t >= e.timeStamp - 100);
    let vitesse = 0;
    if (p.length >= 2) {
      const dt = Math.max(1, p[p.length - 1].t - p[0].t);
      vitesse = ((p[p.length - 1].y - p[0].y) / dt) * 1000; // px/s
    }
    const arrivee = etat.current.y + projeter(vitesse);
    if (arrivee > hauteur() * 0.5) {
      etat.current.venteDrag = vitesse;
      fermer();
    } else {
      lancer(0, vitesse);
    }
  };

  if (!monte) return null;
  return (
    <div className="sheet-wrap">
      <div className="sheet-scrim" ref={voile} onClick={fermer} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={idTitre} tabIndex={-1} ref={feuille}>
        <div className="sheet-grab" onPointerDown={debut} onPointerMove={bouge} onPointerUp={fin} onPointerCancel={fin}>
          <span className="sheet-handle" aria-hidden="true" />
          <div className="sheet-head">
            <h2 id={idTitre}>{titre}</h2>
            <button type="button" className="icon-btn" onClick={fermer} onPointerDown={(e) => e.stopPropagation()} aria-label="Fermer">
              <Mi n="close" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
