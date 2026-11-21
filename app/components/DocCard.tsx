"use client";

import { Mi } from "./Mi";
import { urlTelechargement, type DocumentPublic } from "../../lib/campus";

// Le téléchargement passe par l'application (jeton en en-tête), le lien reste pour l'adresse et le clic droit
const ouvrir = (e: React.MouseEvent, run: () => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  run();
};

type Props = {
  d: DocumentPublic;
  vue: "grille" | "liste";
  groupe?: "filiere" | "ue"; // regroupement : évite de répéter la filière ou l'UE sur chaque carte
  favori: boolean;
  basculerFavori: () => void;
  surTelechargement: (d: DocumentPublic, corrige?: boolean) => void;
  surApercu: (d: DocumentPublic) => void;
  surPartage: (d: DocumentPublic) => void;
};

const sansExtension = (nom: string) => nom.replace(/\.[a-z0-9]{2,5}$/i, "");

export default function DocCard({ d, vue, groupe, favori, basculerFavori, surTelechargement, surApercu, surPartage }: Props) {
  const sujet = d.type_contenu === "sujet_examen";
  const genre = sujet ? `Sujet${d.type_epreuve ? ` ${d.type_epreuve}` : ""}` : "Cours";
  const fichier = `${sansExtension(d.nom)}${d.tag_ordre ? ` (${d.tag_ordre})` : ""}`;
  const taille = d.taille_lisible && d.taille_lisible !== "Non disponible" ? d.taille_lisible : "";
  const lien = urlTelechargement(d.lien_telechargement);
  const verrou = d.acces === "forfait_requis";
  const parUe = groupe === "ue";
  const titre = parUe ? fichier : d.intitule_ue;
  const annee = d.annee_academique ? ` · ${d.annee_academique}` : "";
  const detail = parUe ? `${d.niveau} · ${d.semestre}${annee}` : `${d.niveau} · ${d.semestre}${annee}`;
  const dl = (e: React.MouseEvent) => ouvrir(e, () => surTelechargement(d));
  const dlCorrige = (e: React.MouseEvent) => ouvrir(e, () => surTelechargement(d, true));

  const kicker = (
    <p className="kicker">
      {!parUe && <span className="code">{d.code_ue}</span>}
      <span className="kind" data-k={sujet ? "sujet" : "cours"}>{genre}</span>
      {taille && <span className="tabular kicker-taille">{taille}</span>}
    </p>
  );

  const favoriBtn = (
    <button
      type="button"
      className={`icon-btn${favori ? " icon-btn--on" : ""}`}
      onClick={basculerFavori}
      aria-pressed={favori}
      aria-label={favori ? `Retirer ${d.intitule_ue} des favoris` : `Ajouter ${d.intitule_ue} aux favoris`}
    >
      <Mi n={favori ? "starFill" : "star"} size={20} />
    </button>
  );
  const partageBtn = (
    <button type="button" className="icon-btn" onClick={() => surPartage(d)} aria-label={`Partager ${d.intitule_ue}`}>
      <Mi n="share" size={20} />
    </button>
  );
  const apercuBtn = (
    <button type="button" className="btn btn--ghost" onClick={() => surApercu(d)} aria-label={`Aperçu de ${titre}`}>
      <Mi n="eye" size={20} />
      <span>Aperçu</span>
    </button>
  );
  const dlBtn = (
    <a className="btn btn--outline" href={lien} rel="noopener" onClick={dl} aria-label={`${verrou ? "Débloquer" : "Télécharger"} ${fichier}`}>
      <Mi n={verrou ? "lock" : "download"} size={20} />
      <span>{verrou ? "Débloquer" : "Télécharger"}</span>
    </a>
  );
  const corrigeLien = d.lien_corrige && (
    <a className="lien" href={urlTelechargement(d.lien_corrige)} rel="noopener" onClick={dlCorrige}>
      Corrigé
    </a>
  );

  if (vue === "liste") {
    return (
      <li className="row">
        <div className="row-main">
          {kicker}
          <h3>{titre}</h3>
          <p className="meta">{detail}</p>
        </div>
        <div className="row-actions">
          {corrigeLien}
          {apercuBtn}
          {dlBtn}
          {favoriBtn}
          <span className="row-share">{partageBtn}</span>
        </div>
      </li>
    );
  }

  return (
    <li className="tile">
      <div className="tile-top">
        {kicker}
        {favoriBtn}
      </div>
      <h3>{titre}</h3>
      <p className="meta">{detail}</p>
      <div className="tile-actions">
        {apercuBtn}
        {dlBtn}
        {corrigeLien}
      </div>
    </li>
  );
}
