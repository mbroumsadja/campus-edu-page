"use client";

import { useEffect, useRef } from "react";
import { Mi } from "./Mi";
import { NIVEAUX, type Filiere } from "../../lib/campus";
import type { Prefs } from "../../lib/prefs";

type Props = {
  ouverte: boolean;
  fermer: () => void;
  prefs: Prefs;
  filieres: Filiere[];
  maj: (p: Partial<Prefs>) => void;
  reinitialiser: () => void;
};

// Feuille de filtres, ancrée en bas sur mobile et centrée sur grand écran
export default function FeuilleFiltres({ ouverte, fermer, prefs, filieres, maj, reinitialiser }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouverte) return;
    const avant = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const touche = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    window.addEventListener("keydown", touche);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", touche);
      avant?.focus?.();
    };
  }, [ouverte, fermer]);

  if (!ouverte) return null;
  return (
    <div className="sheet-wrap">
      <div className="sheet-scrim" onClick={fermer} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t" tabIndex={-1} ref={ref}>
        <span className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id="sheet-t">Filtres</h2>
          <button type="button" className="icon-btn" onClick={fermer} aria-label="Fermer">
            <Mi n="close" />
          </button>
        </div>

        <fieldset className="sheet-group">
          <legend>Type de document</legend>
          <div className="chips-wrap">
            {([["", "Tout"], ["cours", "Cours"], ["sujet", "Sujets d'examen"]] as const).map(([v, l]) => (
              <button key={v} type="button" className="chip" aria-pressed={prefs.type === v} onClick={() => maj({ type: v })}>
                {prefs.type === v && <Mi n="check" size={18} />}
                {l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="sheet-group">
          <legend>Niveau</legend>
          <div className="chips-wrap">
            <button type="button" className="chip" aria-pressed={prefs.niveau === ""} onClick={() => maj({ niveau: "", pourMoi: false })}>
              {prefs.niveau === "" && <Mi n="check" size={18} />}
              Tous
            </button>
            {NIVEAUX.map((n) => (
              <button key={n} type="button" className="chip" aria-pressed={prefs.niveau === n} onClick={() => maj({ niveau: n, pourMoi: false })}>
                {prefs.niveau === n && <Mi n="check" size={18} />}
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="sheet-group">
          <label htmlFor="f-filiere">Filière</label>
          <div className="select">
            <select id="f-filiere" value={prefs.filiere} onChange={(e) => maj({ filiere: e.target.value, pourMoi: false })}>
              <option value="">Toutes les filières</option>
              {filieres.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn--text" onClick={reinitialiser}>Réinitialiser</button>
          <button type="button" className="btn btn--primary" onClick={fermer}>Voir les résultats</button>
        </div>
      </div>
    </div>
  );
}
