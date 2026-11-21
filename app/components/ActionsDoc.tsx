"use client";

import { useCallback, useState } from "react";
import FeuilleForfait from "./FeuilleForfait";
import ApercuPdf from "./ApercuPdf";
import { useSnack } from "./Snack";
import {
  ApiError,
  fichierDisponible,
  obtenirTelechargement,
  urlTelechargement,
  type DocumentPublic,
  type ForfaitInfo,
} from "../../lib/campus";

export function partager(d: DocumentPublic) {
  const texte = `${d.intitule_ue} (${d.code_ue}), ${d.nom} : ${urlTelechargement(d.lien_telechargement)}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ title: d.intitule_ue, text: texte }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank", "noopener");
  }
}

// Téléchargement, aperçu et feuille de forfait, partagés par la recherche et les favoris
export function useActionsDoc() {
  const snack = useSnack();
  const [forfaitRequis, setForfaitRequis] = useState<ForfaitInfo | null>(null);
  const [apercu, setApercu] = useState<DocumentPublic | null>(null);

  const telecharge = useCallback(
    async (d: DocumentPublic, corrige = false) => {
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
    },
    [snack]
  );

  const ecrans = (
    <>
      <ApercuPdf doc={apercu} fermer={() => setApercu(null)} surTelechargement={telecharge} surPartage={partager} />
      <FeuilleForfait forfait={forfaitRequis} fermer={() => setForfaitRequis(null)} />
    </>
  );

  return { telecharge, ouvrirApercu: setApercu, ecrans };
}
