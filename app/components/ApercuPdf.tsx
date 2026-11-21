"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mi } from "./Mi";
import { obtenirApercu, type DocumentPublic } from "../../lib/campus";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Pdf = { numPages: number; getPage: (n: number) => Promise<any>; destroy: () => Promise<void> };

type Props = {
  doc: DocumentPublic | null;
  fermer: () => void;
  surTelechargement: (d: DocumentPublic, corrige?: boolean) => void;
  surPartage: (d: DocumentPublic) => void;
};

// pdf.js est chargé à la demande : il n'alourdit pas la page de recherche
let bibliotheque: Promise<any> | null = null;
const charger = () => {
  if (!bibliotheque) {
    bibliotheque = import("pdfjs-dist/build/pdf").then((m: any) => {
      m.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      return m;
    });
  }
  return bibliotheque;
};

function PagePdf({ pdf, numero, largeur, ratio }: { pdf: Pdf; numero: number; largeur: number; ratio: number }) {
  const bloc = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(numero <= 2);
  const [fait, setFait] = useState(false);

  useEffect(() => {
    const el = bloc.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entrees) => entrees.some((e) => e.isIntersecting) && setVisible(true),
      { rootMargin: "600px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !toile.current) return;
    let annule = false;
    let tache: { cancel: () => void } | null = null;
    (async () => {
      const page = await pdf.getPage(numero);
      if (annule || !toile.current) return;
      const base = page.getViewport({ scale: 1 });
      const echelle = largeur / base.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vp = page.getViewport({ scale: echelle * dpr });
      const c = toile.current;
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      c.style.width = `${Math.floor(vp.width / dpr)}px`;
      c.style.height = `${Math.floor(vp.height / dpr)}px`;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      tache = page.render({ canvasContext: ctx, viewport: vp });
      try {
        await (tache as any).promise;
        if (!annule) setFait(true);
      } catch {
        /* rendu interrompu par un redimensionnement ou la fermeture */
      }
    })();
    return () => {
      annule = true;
      tache?.cancel();
    };
  }, [visible, pdf, numero, largeur]);

  return (
    <div className="apercu-page" ref={bloc} style={{ width: largeur, height: Math.round(largeur * ratio) }} data-fait={fait}>
      {visible && <canvas ref={toile} aria-label={`Page ${numero}`} />}
      <span className="apercu-num tabular">{numero}</span>
    </div>
  );
}

export default function ApercuPdf({ doc, fermer, surTelechargement, surPartage }: Props) {
  const [corrige, setCorrige] = useState(false);
  const [etat, setEtat] = useState<"chargement" | "pret" | "erreur">("chargement");
  const [pdf, setPdf] = useState<Pdf | null>(null);
  const [ratio, setRatio] = useState(1.414);
  const [largeur, setLargeur] = useState(0);
  const [lienDirect, setLienDirect] = useState("");
  const corps = useRef<HTMLDivElement>(null);
  const panneau = useRef<HTMLElement>(null);
  const ouvert = Boolean(doc);

  // Nouveau document : on repart de l'énoncé
  useEffect(() => setCorrige(false), [doc]);

  // Largeur des pages, suivie quand la fenêtre change
  useEffect(() => {
    const el = corps.current;
    if (!el || !ouvert) return;
    const mesurer = () => {
      const w = Math.min(el.clientWidth - 32, 720);
      setLargeur((prec) => (Math.abs(prec - w) > 24 ? Math.max(w, 200) : prec));
    };
    mesurer();
    const obs = new ResizeObserver(mesurer);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ouvert, etat]);

  // Chargement du PDF
  useEffect(() => {
    if (!doc) return;
    let annule = false;
    let courant: Pdf | null = null;
    setEtat("chargement");
    setPdf(null);
    setLienDirect("");
    (async () => {
      try {
        const lien = corrige && doc.lien_corrige ? doc.lien_corrige : doc.lien_telechargement;
        const url = await obtenirApercu(lien);
        if (annule) return;
        setLienDirect(url);
        const lib = await charger();
        const tache = lib.getDocument({ url, isEvalSupported: false, withCredentials: false });
        const ouvertPdf: Pdf = await tache.promise;
        courant = ouvertPdf;
        if (annule) {
          void ouvertPdf.destroy();
          return;
        }
        const p1 = await ouvertPdf.getPage(1);
        const v = p1.getViewport({ scale: 1 });
        setRatio(v.height / v.width);
        setPdf(ouvertPdf);
        setEtat("pret");
      } catch {
        if (!annule) setEtat("erreur");
      }
    })();
    return () => {
      annule = true;
      if (courant) void courant.destroy();
    };
  }, [doc, corrige]);

  // Échap, défilement bloqué, focus rendu à la fermeture
  const ferme = useCallback(() => fermer(), [fermer]);
  useEffect(() => {
    if (!ouvert) return;
    const avant = document.activeElement as HTMLElement | null;
    const prec = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panneau.current?.focus({ preventScroll: true });
    const touche = (e: KeyboardEvent) => e.key === "Escape" && ferme();
    window.addEventListener("keydown", touche);
    return () => {
      document.body.style.overflow = prec;
      window.removeEventListener("keydown", touche);
      avant?.focus?.();
    };
  }, [ouvert, ferme]);

  if (!doc) return null;
  const sujet = doc.type_contenu === "sujet_examen";
  const verrou = doc.acces === "forfait_requis";
  const genre = sujet ? `Sujet${doc.type_epreuve ? ` ${doc.type_epreuve}` : ""}` : "Cours";
  const annee = doc.annee_academique ? ` · ${doc.annee_academique}` : "";

  return (
    <div className="apercu-wrap">
      <div className="apercu-scrim" onClick={ferme} aria-hidden="true" />
      <aside className="apercu" role="dialog" aria-modal="true" aria-labelledby="apercu-titre" tabIndex={-1} ref={panneau}>
        <header className="apercu-head">
          <div className="apercu-titre">
            <p className="code">{doc.code_ue}</p>
            <h2 id="apercu-titre">{doc.intitule_ue}</h2>
            <p className="apercu-meta">{genre} · {doc.niveau} · {doc.semestre}{annee}</p>
          </div>
          <button type="button" className="icon-btn" onClick={ferme} aria-label="Fermer l'aperçu">
            <Mi n="close" />
          </button>
        </header>

        {doc.lien_corrige && (
          <div className="apercu-onglets" role="tablist" aria-label="Document à afficher">
            <button type="button" role="tab" aria-selected={!corrige} onClick={() => setCorrige(false)}>Sujet</button>
            <button type="button" role="tab" aria-selected={corrige} onClick={() => setCorrige(true)}>Corrigé</button>
          </div>
        )}

        <div className="apercu-corps" ref={corps}>
          {etat === "chargement" && (
            <div className="apercu-etat" role="status">
              <span className="sk apercu-sk" />
              <p>Chargement de l&apos;aperçu</p>
            </div>
          )}
          {etat === "erreur" && (
            <div className="apercu-etat" role="alert">
              <p>L&apos;aperçu ne s&apos;affiche pas. Le fichier est peut-être momentanément indisponible.</p>
              {lienDirect && (
                <a className="btn btn--outline" href={lienDirect} target="_blank" rel="noopener noreferrer">
                  <Mi n="external" size={20} />
                  <span>Ouvrir dans un nouvel onglet</span>
                </a>
              )}
            </div>
          )}
          {etat === "pret" && pdf && largeur > 0 &&
            Array.from({ length: pdf.numPages }, (_, i) => (
              <PagePdf key={`${doc.id}-${corrige}-${i}`} pdf={pdf} numero={i + 1} largeur={largeur} ratio={ratio} />
            ))}
        </div>

        <footer className="apercu-pied">
          <button type="button" className="btn btn--primary" onClick={() => surTelechargement(doc, corrige)}>
            <Mi n={verrou ? "lock" : "download"} size={20} />
            <span>{verrou ? "Débloquer" : "Télécharger"}{corrige ? " le corrigé" : ""}</span>
          </button>
          <button type="button" className="icon-btn" onClick={() => surPartage(doc)} aria-label={`Partager ${doc.intitule_ue}`}>
            <Mi n="share" />
          </button>
          {pdf && <span className="apercu-pages tabular">{pdf.numPages} page{pdf.numPages > 1 ? "s" : ""}</span>}
        </footer>
      </aside>
    </div>
  );
}
