"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { IconDownload, IconFile, IconSearch } from "../components/Icons";
import {
  ApiError,
  listerSupports,
  rafraichirProfil,
  telecharger,
  type Pagination,
  type Support,
  type SupportFichier,
} from "../../lib/campus";
import { useSession } from "../../lib/useSession";

const taille = (o: number) => {
  if (!o) return "";
  if (o < 1024 * 1024) return `${Math.max(1, Math.round(o / 1024))} Ko`;
  return `${(o / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
};

export default function Supports() {
  const { pret, connecte, user } = useSession();
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [liste, setListe] = useState<Support[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [telechargement, setTelechargement] = useState<string | null>(null);
  const [avis, setAvis] = useState("");
  const ctrl = useRef<AbortController | null>(null);

  // Session absente : retour à la connexion
  useEffect(() => {
    if (pret && !connecte) window.location.replace("/connexion");
  }, [pret, connecte]);

  // Profil à jour (filière et niveau affichés)
  useEffect(() => {
    if (pret && connecte) rafraichirProfil().catch(() => {});
  }, [pret, connecte]);

  // Recherche différée pendant la saisie
  useEffect(() => {
    const t = setTimeout(() => setRecherche(saisie.trim()), 350);
    return () => clearTimeout(t);
  }, [saisie]);

  const charger = useCallback(async (page: number, ajouter: boolean) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setChargement(true);
    setErreur("");
    try {
      const r = await listerSupports({ search: recherche || undefined, page }, c.signal);
      setListe((l) => (ajouter ? [...l, ...r.supports] : r.supports));
      setPagination(r.pagination);
      setChargement(false);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErreur(e instanceof ApiError ? e.message : "Chargement impossible.");
      setChargement(false);
    }
  }, [recherche]);

  useEffect(() => {
    if (pret && connecte) void charger(1, false);
  }, [pret, connecte, charger]);

  const prendre = async (s: Support, f?: SupportFichier) => {
    const cle = `${s.id}-${f?.id ?? 0}`;
    setTelechargement(cle);
    setAvis("");
    try {
      await telecharger(s, f);
    } catch (e) {
      setAvis(e instanceof ApiError ? e.message : "Téléchargement impossible.");
    } finally {
      setTelechargement(null);
    }
  };

  if (!pret || !connecte) {
    return (
      <div className="page">
        <SiteHeader />
        <main className="shell-loading">Chargement…</main>
      </div>
    );
  }

  const vide = !chargement && !erreur && liste.length === 0;

  return (
    <div className="page">
      <SiteHeader />
      <main>
        <section className="hero hero--compact">
          <div className="wrap">
            <span className="eyebrow">Supports de cours</span>
            <h1>Bonjour{user ? `, ${user.prenom}` : ""}.</h1>
            <p className="hero-sub">
              {user?.filiere?.nom && user?.niveau
                ? `Filière ${user.filiere.nom}, niveau ${user.niveau}.`
                : "Recherchez un support par titre."}
            </p>
            <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
              <IconSearch size={22} />
              <label className="sr-only" htmlFor="q">Rechercher un support</label>
              <input
                id="q"
                type="search"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="Rechercher un support, une matière…"
                autoComplete="off"
              />
            </form>
          </div>
        </section>

        <section className="results wrap" aria-live="polite">
          {avis && <p className="alert" role="alert">{avis}</p>}
          {erreur && (
            <div className="empty">
              <p>{erreur}</p>
              <button className="btn btn--outline" onClick={() => void charger(1, false)}>Réessayer</button>
            </div>
          )}
          {vide && (
            <div className="empty">
              <IconFile size={32} />
              <p>{recherche ? `Aucun support ne correspond à « ${recherche} ».` : "Aucun support publié pour votre filière et votre niveau."}</p>
            </div>
          )}

          <ul className="grid">
            {liste.map((s) => (
              <li className="doc" key={s.id}>
                <div className="doc-top">
                  <span className="pill pill--cours">{s.ue?.code ?? s.type.toUpperCase()}</span>
                  {s.anneAcademique && <span className="doc-year tabular">{s.anneAcademique}</span>}
                </div>
                <h2>{s.titre}</h2>
                <p className="doc-meta">
                  {[s.ue?.intitule, s.ue?.semestre, s.enseignant ? `${s.enseignant.prenom} ${s.enseignant.nom}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="doc-actions">
                  {(s.fichiers?.length ? s.fichiers : [undefined]).map((f) => {
                    const cle = `${s.id}-${f?.id ?? 0}`;
                    return (
                      <button
                        key={cle}
                        type="button"
                        className="dl"
                        onClick={() => void prendre(s, f)}
                        disabled={telechargement === cle}
                      >
                        <IconDownload size={18} />
                        <span>{f?.nomFichierOriginal ?? "Télécharger"}</span>
                        {f && <small>{taille(f.tailleFichier)}</small>}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          {chargement && <p className="loading">Chargement…</p>}
          {!chargement && pagination && pagination.page < pagination.totalPages && (
            <div className="more">
              <button className="btn btn--outline" onClick={() => void charger(pagination.page + 1, true)}>
                Afficher plus
              </button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
