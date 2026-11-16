"use client";

import Feuille from "./Feuille";
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

export default function FeuilleFiltres({ ouverte, fermer, prefs, filieres, maj, reinitialiser }: Props) {
  return (
    <Feuille ouverte={ouverte} fermer={fermer} titre="Filtres">
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
    </Feuille>
  );
}
