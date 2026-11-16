"use client";

import { Mi } from "./Mi";
import { urlTelechargement, type DocumentPublic } from "../../lib/campus";

type Props = {
  d: DocumentPublic;
  vue: "grille" | "liste";
  groupe?: "filiere" | "ue"; // regroupement de la liste : évite de répéter la filière ou l'UE sur chaque carte
  favori: boolean;
  basculerFavori: () => void;
  surTelechargement: (d: DocumentPublic) => void;
  surPartage: (d: DocumentPublic) => void;
};

const sansExtension = (nom: string) => nom.replace(/\.[a-z0-9]{2,5}$/i, "");

export default function DocCard({ d, vue, groupe, favori, basculerFavori, surTelechargement, surPartage }: Props) {
  const sujet = d.type_contenu === "sujet_examen";
  const genre = sujet ? `Sujet${d.type_epreuve ? ` ${d.type_epreuve}` : ""}` : "Cours";
  const fichier = `${sansExtension(d.nom)}${d.tag_ordre ? ` (${d.tag_ordre})` : ""}`;
  const taille = d.taille_lisible && d.taille_lisible !== "Non disponible" ? d.taille_lisible : "";
  const lien = urlTelechargement(d.lien_telechargement);
  const parUe = groupe === "ue";
  const titre = parUe ? fichier : d.intitule_ue;
  const annee = d.annee_academique ? ` · ${d.annee_academique}` : "";
  const detail = parUe
    ? `${d.niveau} · ${d.semestre}${annee}`
    : `${d.code_ue} · ${d.niveau} · ${d.semestre}${annee}`;
  const ligneFichier = parUe ? taille : `${fichier}${taille ? ` · ${taille}` : ""}`;

  const boutonFavori = (
    <button
      type="button"
      className={`icon-btn${favori ? " icon-btn--on" : ""}`}
      onClick={basculerFavori}
      aria-pressed={favori}
      aria-label={favori ? `Retirer ${d.intitule_ue} des favoris` : `Ajouter ${d.intitule_ue} aux favoris`}
    >
      <Mi n={favori ? "starFill" : "star"} />
    </button>
  );
  const boutonPartage = (
    <button type="button" className="icon-btn" onClick={() => surPartage(d)} aria-label={`Partager ${d.intitule_ue}`}>
      <Mi n="share" />
    </button>
  );

  const genreLigne = (
    <span className="kind" data-k={sujet ? "sujet" : "cours"}>
      {genre}
    </span>
  );

  if (vue === "liste") {
    return (
      <li className="row">
        <span className="row-lead"><Mi n={sujet ? "exam" : "file"} /></span>
        <div className="row-text">
          <h3>{titre}</h3>
          <p>{genreLigne}{annee}</p>
          {ligneFichier && <p className="row-file">{ligneFichier}</p>}
          {d.lien_corrige && (
            <a className="row-link" href={urlTelechargement(d.lien_corrige)} rel="noopener" onClick={() => surTelechargement(d)}>
              Télécharger le corrigé
            </a>
          )}
        </div>
        <div className="row-actions">
          {boutonFavori}
          <span className="row-share">{boutonPartage}</span>
          <a className="icon-btn icon-btn--filled" href={lien} rel="noopener" onClick={() => surTelechargement(d)} aria-label={`Télécharger ${fichier}`}>
            <Mi n="download" />
          </a>
        </div>
      </li>
    );
  }

  return (
    <li className="tile">
      <div className="tile-top">
        {genreLigne}
        {boutonFavori}
      </div>
      <div className="tile-body">
        <h3>{titre}</h3>
        <p className="tile-meta">{detail}</p>
        {ligneFichier && <p className="tile-file" title={ligneFichier}>{ligneFichier}</p>}
      </div>
      <div className="tile-actions">
        <a className="btn btn--tonal tile-dl" href={lien} rel="noopener" onClick={() => surTelechargement(d)}>
          <Mi n="download" size={20} />
          <span>Télécharger</span>
        </a>
        {boutonPartage}
      </div>
      {d.lien_corrige && (
        <a className="tile-corrige" href={urlTelechargement(d.lien_corrige)} rel="noopener" onClick={() => surTelechargement(d)}>
          Télécharger le corrigé
        </a>
      )}
    </li>
  );
}
