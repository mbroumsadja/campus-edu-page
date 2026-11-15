"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
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
      <div className="lp es-page">
        <Header />
        <main className="es-loading">Chargement…</main>
      </div>
    );
  }

  const vide = !chargement && !erreur && liste.length === 0;

  return (
    <div className="lp es-page">
      <Header />
      <main>
        <section className="es-hero">
          <div className="lp-aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="lp-wrap">
            <span className="lp-eyebrow lp-eyebrow--dark">Supports de cours</span>
            <h1>Bonjour{user ? `, ${user.prenom}` : ""}.</h1>
            <p>
              {user?.filiere?.nom && user?.niveau
                ? `Filière ${user.filiere.nom}, niveau ${user.niveau}.`
                : "Recherchez un support par titre."}
            </p>
            <form className="es-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <IconSearch size={22} />
              <label className="es-sr" htmlFor="q">Rechercher un support</label>
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

        <section className="es-results lp-wrap" aria-live="polite">
          {avis && <p className="es-alert" role="alert">{avis}</p>}
          {erreur && (
            <div className="es-empty">
              <p>{erreur}</p>
              <button className="lp-btn lp-btn--outline" onClick={() => void charger(1, false)}>Réessayer</button>
            </div>
          )}
          {vide && (
            <div className="es-empty">
              <IconFile size={32} />
              <p>{recherche ? `Aucun support ne correspond à « ${recherche} ».` : "Aucun support publié pour votre filière et votre niveau."}</p>
            </div>
          )}

          <ul className="es-list">
            {liste.map((s) => (
              <li className="es-item" key={s.id}>
                <div className="es-item-top">
                  <span className="es-pill">{s.ue?.code ?? s.type.toUpperCase()}</span>
                  {s.anneAcademique && <span className="es-year">{s.anneAcademique}</span>}
                </div>
                <h2>{s.titre}</h2>
                <p className="es-meta">
                  {[s.ue?.intitule, s.ue?.semestre, s.enseignant ? `${s.enseignant.prenom} ${s.enseignant.nom}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="es-files">
                  {(s.fichiers?.length ? s.fichiers : [undefined]).map((f) => {
                    const cle = `${s.id}-${f?.id ?? 0}`;
                    return (
                      <button
                        key={cle}
                        type="button"
                        className="es-dl"
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

          {chargement && <p className="es-loading-inline">Chargement…</p>}
          {!chargement && pagination && pagination.page < pagination.totalPages && (
            <div className="es-more">
              <button className="lp-btn lp-btn--outline" onClick={() => void charger(pagination.page + 1, true)}>
                Afficher plus
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
