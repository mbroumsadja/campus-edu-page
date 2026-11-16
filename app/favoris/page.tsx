"use client";

import AppShell from "../components/AppShell";
import DocCard from "../components/DocCard";
import { Mi } from "../components/Mi";
import { useSnack } from "../components/Snack";
import { partager } from "../components/Recherche";
import { useFavoris, usePrefs } from "../../lib/prefs";

function Contenu() {
  const snack = useSnack();
  const { liste, basculer, estFavori, pret } = useFavoris();
  const { prefs, maj } = usePrefs();

  return (
    <AppShell titre="Favoris">
      <section className="results">
        <div className="results-head">
          <div>
            <h1>Mes favoris</h1>
            {pret && liste.length > 0 && <p className="count">{liste.length} document{liste.length > 1 ? "s" : ""}, gardés sur cet appareil</p>}
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
            <p>Touchez l&apos;étoile d&apos;un document pour le retrouver ici.</p>
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
                surTelechargement={(x) => snack(`Téléchargement lancé : ${x.intitule_ue}`)}
                surPartage={partager}
              />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

export default Contenu;
