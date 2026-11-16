"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconDownload, IconFile, IconSearch } from "./Icons";
import {
  ApiError,
  NIVEAUX,
  rechercherDocuments,
  urlTelechargement,
  type DocumentPublic,
  type Pagination,
} from "../../lib/campus";

type Genre = "" | "cours" | "sujet";
const GENRES: { id: Genre; label: string }[] = [
  { id: "", label: "Tout" },
  { id: "cours", label: "Cours" },
  { id: "sujet", label: "Sujets d'examen" },
];
const SUGGESTIONS = ["Algorithmique", "Analyse", "Anatomie", "Bases de données"];

export default function Recherche() {
  const [saisie, setSaisie] = useState("");
  const [q, setQ] = useState("");
  const [niveau, setNiveau] = useState("");
  const [genre, setGenre] = useState<Genre>("");
  const [docs, setDocs] = useState<DocumentPublic[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [lance, setLance] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(saisie.trim()), 350);
    return () => clearTimeout(t);
  }, [saisie]);

  const actif = q.length >= 2 || Boolean(niveau);

  const charger = useCallback(
    async (page: number, ajouter: boolean) => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setChargement(true);
      setErreur("");
      try {
        const r = await rechercherDocuments(
          { q: q.length >= 2 ? q : undefined, niveau: niveau || undefined, type: genre || undefined, page },
          c.signal
        );
        setDocs((d) => (ajouter ? [...d, ...r.documents] : r.documents));
        setPagination(r.pagination);
        setLance(true);
        setChargement(false);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErreur(e instanceof ApiError ? e.message : "Recherche impossible.");
        setChargement(false);
      }
    },
    [q, niveau, genre]
  );

  useEffect(() => {
    if (actif) void charger(1, false);
    else {
      ctrl.current?.abort();
      setDocs([]);
      setPagination(null);
      setLance(false);
      setChargement(false);
    }
  }, [actif, charger]);

  const vide = lance && !chargement && !erreur && docs.length === 0;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">Université de Garoua</span>
          <h1>Vos cours et sujets d&apos;examen, en libre accès.</h1>
          <p className="hero-sub">Recherchez un document, téléchargez-le. Aucun compte n&apos;est nécessaire.</p>

          <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
            <IconSearch size={22} />
            <label className="sr-only" htmlFor="q">Rechercher un cours ou un sujet</label>
            <input
              id="q"
              type="search"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Une matière, un code d'UE, une filière…"
              autoComplete="off"
              enterKeyHint="search"
            />
          </form>

          <div className="filters">
            <div className="seg" role="group" aria-label="Type de document">
              {GENRES.map((g) => (
                <button key={g.id} type="button" aria-pressed={genre === g.id} onClick={() => setGenre(g.id)}>
                  {g.label}
                </button>
              ))}
            </div>
            <div className="seg" role="group" aria-label="Niveau">
              <button type="button" aria-pressed={niveau === ""} onClick={() => setNiveau("")}>Tous niveaux</button>
              {NIVEAUX.map((n) => (
                <button key={n} type="button" aria-pressed={niveau === n} onClick={() => setNiveau(niveau === n ? "" : n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="results wrap" aria-live="polite" id="resultats">
        {!actif && (
          <div className="empty">
            <IconSearch size={30} />
            <p>Saisissez au moins deux lettres, ou choisissez un niveau, pour lancer la recherche.</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setSaisie(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {erreur && (
          <div className="empty">
            <p>{erreur}</p>
            <button className="btn btn--outline" onClick={() => void charger(1, false)}>Réessayer</button>
          </div>
        )}

        {vide && (
          <div className="empty">
            <IconFile size={30} />
            <p>Aucun document ne correspond à cette recherche.</p>
          </div>
        )}

        {actif && lance && !erreur && docs.length > 0 && pagination && (
          <p className="count">
            {pagination.total} document{pagination.total > 1 ? "s" : ""}
          </p>
        )}

        <ul className="grid">
          {docs.map((d) => (
            <li className="doc" key={`${d.type_contenu}-${d.id}`}>
              <div className="doc-top">
                <span className={`pill pill--${d.type_contenu === "cours" ? "cours" : "sujet"}`}>
                  {d.type_contenu === "cours" ? "Cours" : `Sujet ${d.type_epreuve ?? ""}`.trim()}
                </span>
                {d.annee_academique && <span className="doc-year tabular">{d.annee_academique}</span>}
              </div>
              <h2>{d.nom}{d.tag_ordre ? ` (${d.tag_ordre})` : ""}</h2>
              <p className="doc-meta">{d.code_ue} · {d.intitule_ue}</p>
              <p className="doc-meta">{d.filiere_nom} · {d.niveau} · {d.semestre}</p>
              <div className="doc-actions">
                <a className="dl" href={urlTelechargement(d.lien_telechargement)} rel="noopener">
                  <IconDownload size={18} />
                  <span>Télécharger</span>
                  {d.taille_lisible && d.taille_lisible !== "Non disponible" && <small>{d.taille_lisible}</small>}
                </a>
                {d.lien_corrige && (
                  <a className="dl dl--alt" href={urlTelechargement(d.lien_corrige)} rel="noopener">
                    <IconDownload size={18} />
                    <span>Corrigé</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>

        {chargement && <p className="loading">Recherche en cours…</p>}
        {!chargement && pagination && pagination.page < pagination.totalPages && (
          <div className="more">
            <button className="btn btn--outline" onClick={() => void charger(pagination.page + 1, true)}>
              Afficher plus
            </button>
          </div>
        )}
      </section>
    </>
  );
}
