"use client";

import AppShell from "../components/AppShell";
import DocCard from "../components/DocCard";
import { Mi } from "../components/Mi";
import { useSnack } from "../components/Snack";
import { partager, useActionsDoc } from "../components/ActionsDoc";
import { useFavoris, usePrefs } from "../../lib/prefs";

function Contenu() {
  const snack = useSnack();
  const { liste, basculer, estFavori, pret } = useFavoris();
  const { prefs, maj } = usePrefs();
  const { telecharge, ouvrirApercu, ecrans } = useActionsDoc();

  return (
    <AppShell titre="Favoris">
      <section className="results">
        <div className="results-head">
          <div>
            <h1>Favoris</h1>
            {pret && liste.length > 0 && <p className="count">{liste.length} document{liste.length > 1 ? "s" : ""}, enregistrés sur cet appareil</p>}
          </div>
          <div className="toggle" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={prefs.vue === "grille"} onClick={() => maj({ vue: "grille" })} aria-label="Affichage en grille"><Mi n="grid" /></button>
            <button type="button" aria-pressed={prefs.vue === "liste"} onClick={() => maj({ vue: "liste" })} aria-label="Affichage en liste"><Mi n="list" /></button>
          </div>
        </div>

        {pret && liste.length === 0 && (
          <div className="empty">
            <span className="empty-icon"><Mi n="star" size={32} /></span>
            <h2>Aucun favori</h2>
            <p>Marquez un document avec l&apos;étoile pour le retrouver ici.</p>
            <a className="btn btn--primary" href="/">Chercher un document</a>
          </div>
        )}

        {liste.length > 0 && (
          <ul className={prefs.vue === "grille" ? "tiles" : "rows"}>
            {liste.map((d) => (
              <DocCard
                key={`${d.type_contenu}-${d.id}`}
                d={d}
                vue={prefs.vue}
                favori={estFavori(d)}
                basculerFavori={() => { basculer(d); snack("Retiré des favoris", { label: "Annuler", run: () => basculer(d) }); }}
                surTelechargement={telecharge}
                surApercu={ouvrirApercu}
                surPartage={partager}
              />
            ))}
          </ul>
        )}
      </section>
      {ecrans}
    </AppShell>
  );
}

export default Contenu;
