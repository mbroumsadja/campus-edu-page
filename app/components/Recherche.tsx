"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "./AppShell";
import DocCard from "./DocCard";
import FeuilleDemande from "./FeuilleDemande";
import FeuilleForfait from "./FeuilleForfait";
import FeuilleFiltres from "./FeuilleFiltres";
import Squelettes from "./Squelettes";
import { Mi } from "./Mi";
import { useSnack } from "./Snack";
import {
  ApiError,
  listerFilieres,
  NIVEAUX,
  obtenirTelechargement,
  fichierDisponible,
  rafraichirProfil,
  rechercherDocuments,
  urlTelechargement,
  type DocumentPublic,
  type ForfaitInfo,
  type Filiere,
  type Pagination,
} from "../../lib/campus";
import { useFavoris, usePrefs } from "../../lib/prefs";
import { useSession } from "../../lib/useSession";

export function partager(d: DocumentPublic) {
  const texte = `${d.intitule_ue} (${d.code_ue}), ${d.nom} : ${urlTelechargement(d.lien_telechargement)}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ title: d.intitule_ue, text: texte }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank", "noopener");
  }
}

function Contenu() {
  const snack = useSnack();
  const { pret: sessionPrete, connecte, user } = useSession();
  const { prefs, maj, pret: prefsPretes } = usePrefs();
  const { basculer, estFavori } = useFavoris();

  const [forfaitRequis, setForfaitRequis] = useState<ForfaitInfo | null>(null);
  const [saisie, setSaisie] = useState("");
  const [q, setQ] = useState("");
  const [docs, setDocs] = useState<DocumentPublic[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [feuille, setFeuille] = useState(false);
  const [demande, setDemande] = useState(false);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(saisie.trim()), 350);
    return () => clearTimeout(t);
  }, [saisie]);

  useEffect(() => {
    if (sessionPrete && connecte) rafraichirProfil().catch(() => {});
  }, [sessionPrete, connecte]);

  useEffect(() => {
    listerFilieres().then(setFilieres).catch(() => {});
  }, []);

  const monNiveau = connecte ? user?.niveau || "" : "";
  const maFiliere = connecte ? user?.filiere?.id : undefined;
  const pourMoiDispo = Boolean(monNiveau || maFiliere);

  // Première connexion sur cet appareil : on démarre sur la filière et le niveau du compte
  useEffect(() => {
    if (!prefsPretes || !pourMoiDispo || !user) return;
    const cle = `campus.pourMoiInit.${user.id}`;
    try {
      if (window.localStorage.getItem(cle)) return;
      window.localStorage.setItem(cle, "1");
    } catch {
      return;
    }
    maj({ pourMoi: true });
  }, [prefsPretes, pourMoiDispo, user, maj]);

  // Critères réellement envoyés à l'API
  const niveau = prefs.pourMoi && monNiveau ? monNiveau : prefs.niveau;
  const filiereId = prefs.pourMoi && maFiliere ? maFiliere : prefs.filiere ? Number(prefs.filiere) : undefined;
  const type = prefs.type;
  const texte = q.length >= 2 ? q : "";

  const charger = useCallback(
    async (page: number, ajouter: boolean) => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setChargement(true);
      setErreur("");
      try {
        const r = await rechercherDocuments(
          { q: texte || undefined, niveau: niveau || undefined, type: type || undefined, filiere_id: filiereId, page },
          c.signal
        );
        setDocs((d) => (ajouter ? [...d, ...r.documents] : r.documents));
        setPagination(r.pagination);
        setChargement(false);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErreur(e instanceof ApiError ? e.message : "Recherche impossible.");
        setChargement(false);
      }
    },
    [texte, niveau, type, filiereId]
  );

  useEffect(() => {
    if (prefsPretes && sessionPrete) void charger(1, false);
  }, [prefsPretes, sessionPrete, charger]);

  const nbFiltres = (type ? 1 : 0) + (prefs.niveau ? 1 : 0) + (prefs.filiere ? 1 : 0);
  const filtre = Boolean(texte || niveau || type || filiereId);
  const reinitialiser = () => maj({ niveau: "", type: "", filiere: "", pourMoi: false });
  const titreListe = useMemo(() => (filtre ? "Résultats" : "Derniers documents"), [filtre]);
  const vide = !chargement && !erreur && docs.length === 0;

  // Sans compte : par filière. Avec un compte : par unité d'enseignement.
  const regroupement: "filiere" | "ue" = connecte ? "ue" : "filiere";
  const groupes = useMemo(() => {
    const carte = new Map<string, { cle: string; titre: string; detail: string; docs: DocumentPublic[] }>();
    for (const d of docs) {
      const cle = regroupement === "ue" ? `ue:${d.code_ue}:${d.filiere_nom}:${d.niveau}` : `f:${d.filiere_nom}`;
      let g = carte.get(cle);
      if (!g) {
        g = regroupement === "ue"
          ? { cle, titre: `${d.code_ue} · ${d.intitule_ue}`, detail: `${d.filiere_nom} · ${d.niveau} · ${d.semestre}`, docs: [] }
          : { cle, titre: d.filiere_nom, detail: "", docs: [] };
        carte.set(cle, g);
      }
      g.docs.push(d);
    }
    return [...carte.values()];
  }, [docs, regroupement]);

  const telecharge = async (d: DocumentPublic, corrige = false) => {
    const lien = corrige && d.lien_corrige ? d.lien_corrige : d.lien_telechargement;
    try {
      const url = await obtenirTelechargement(lien);
      if (!(await fichierDisponible(url))) {
        snack("Ce document est momentanément indisponible. Réessayez plus tard.");
        return;
      }
      window.location.assign(url);
      snack(`Téléchargement lancé : ${d.intitule_ue}`);
    } catch (err) {
      if (err instanceof ApiError && err.forfait && (err.status === 401 || err.status === 402)) setForfaitRequis(err.forfait);
      else if (err instanceof ApiError && err.status === 401) snack("Connectez-vous pour télécharger ce document.");
      else snack(err instanceof ApiError ? err.message : "Téléchargement impossible. Réessayez.");
    }
  };
  const toggleFavori = (d: DocumentPublic) => {
    if (estFavori(d)) {
      basculer(d);
      snack("Retiré des favoris", { label: "Annuler", run: () => basculer(d) });
    } else {
      basculer(d);
      snack("Ajouté aux favoris");
    }
  };

  const entete = (
    <>
      <form className="searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
        <Mi n="search" />
        <label className="sr-only" htmlFor="q">Rechercher un cours ou un sujet</label>
        <input
          id="q"
          type="search"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Matière, code d'UE, filière"
          autoComplete="off"
          enterKeyHint="search"
        />
        {saisie && (
          <button type="button" className="icon-btn" aria-label="Effacer la recherche" onClick={() => setSaisie("")}>
            <Mi n="close" />
          </button>
        )}
      </form>
      <div className="chips-row" role="group" aria-label="Filtres rapides">
        {pourMoiDispo && (
          <button type="button" className="chip chip--accent" aria-pressed={prefs.pourMoi} onClick={() => maj({ pourMoi: !prefs.pourMoi })}>
            {prefs.pourMoi && <Mi n="check" size={18} />}
            Mon niveau{monNiveau ? ` ${monNiveau}` : ""}
          </button>
        )}
        {NIVEAUX.map((n) => (
          <button key={n} type="button" className="chip" aria-pressed={prefs.niveau === n && !prefs.pourMoi} onClick={() => maj({ niveau: prefs.niveau === n ? "" : n, pourMoi: false })}>
            {prefs.niveau === n && !prefs.pourMoi && <Mi n="check" size={18} />}
            {n}
          </button>
        ))}
        <button type="button" className="chip" aria-pressed={type === "cours"} onClick={() => maj({ type: type === "cours" ? "" : "cours" })}>
          {type === "cours" && <Mi n="check" size={18} />}
          Cours
        </button>
        <button type="button" className="chip" aria-pressed={type === "sujet"} onClick={() => maj({ type: type === "sujet" ? "" : "sujet" })}>
          {type === "sujet" && <Mi n="check" size={18} />}
          Sujets
        </button>
      </div>
    </>
  );

  return (
    <AppShell entete={entete}>
      <section className="results" aria-live="polite">
        <div className="results-head">
          <div>
            <h1>{titreListe}</h1>
            {pagination && !chargement && !erreur && docs.length > 0 && (
              <p className="count">{pagination.total} document{pagination.total > 1 ? "s" : ""}</p>
            )}
          </div>
          <div className="toggle" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={prefs.vue === "grille"} onClick={() => maj({ vue: "grille" })} aria-label="Affichage en grille">
              <Mi n="grid" />
            </button>
            <button type="button" aria-pressed={prefs.vue === "liste"} onClick={() => maj({ vue: "liste" })} aria-label="Affichage en liste">
              <Mi n="list" />
            </button>
          </div>
        </div>

        {erreur && (
          <div className="empty">
            <span className="empty-icon"><Mi n="close" size={32} /></span>
            <h2>Recherche impossible</h2>
            <p>{erreur}</p>
            <button className="btn btn--tonal" onClick={() => void charger(1, false)}>Réessayer</button>
          </div>
        )}

        {vide && (
          <div className="empty">
            <span className="empty-icon"><Mi n="file" size={32} /></span>
            <h2>Aucun document trouvé</h2>
            <p>Essayez un autre mot, retirez un filtre, ou demandez le document à l&apos;administration.</p>
            <div className="empty-actions">
              <button className="btn btn--primary" onClick={() => setDemande(true)}>Demander ce document</button>
              {nbFiltres > 0 || prefs.pourMoi ? (
                <button className="btn btn--text" onClick={reinitialiser}>Retirer les filtres</button>
              ) : null}
            </div>
          </div>
        )}

        {chargement && docs.length === 0 && !erreur && <Squelettes vue={prefs.vue} />}

        {docs.length > 0 && !erreur &&
          groupes.map((g) => (
            <section className="groupe" key={g.cle} aria-labelledby={`g-${g.cle}`}>
              <div className="groupe-t">
                <h2 id={`g-${g.cle}`}>{g.titre}</h2>
                <span className="groupe-n tabular">{g.docs.length}</span>
              </div>
              {g.detail && <p className="groupe-d">{g.detail}</p>}
              <ul className={prefs.vue === "grille" ? "tiles" : "rows"} data-busy={chargement}>
                {g.docs.map((d) => (
                  <DocCard
                    key={`${d.type_contenu}-${d.id}`}
                    d={d}
                    vue={prefs.vue}
                    groupe={regroupement}
                    favori={estFavori(d)}
                    basculerFavori={() => toggleFavori(d)}
                    surTelechargement={telecharge}
                    surPartage={partager}
                  />
                ))}
              </ul>
            </section>
          ))}

        {!chargement && pagination && pagination.page < pagination.totalPages && (
          <div className="more">
            <button className="btn btn--tonal" onClick={() => void charger(pagination.page + 1, true)}>
              Afficher plus
            </button>
          </div>
        )}
        {chargement && docs.length > 0 && <p className="loading">Chargement…</p>}
        {!chargement && !erreur && docs.length > 0 && (
          <p className="manque">
            Il manque un document ? <button type="button" onClick={() => setDemande(true)}>Faire une demande</button>
          </p>
        )}
      </section>

      <button type="button" className="fab" onClick={() => setFeuille(true)} aria-label="Ouvrir les filtres">
        <Mi n="tune" />
        <span>Filtres</span>
        {nbFiltres > 0 && <b className="fab-badge">{nbFiltres}</b>}
      </button>

      <FeuilleForfait forfait={forfaitRequis} fermer={() => setForfaitRequis(null)} />
      <FeuilleDemande ouverte={demande} fermer={() => setDemande(false)} propose={texte} envoye={(m) => snack(m)} />
      <FeuilleFiltres ouverte={feuille} fermer={() => setFeuille(false)} prefs={prefs} filieres={filieres} maj={maj} reinitialiser={reinitialiser} />
    </AppShell>
  );
}

export default function Recherche() {
  return <Contenu />;
}
