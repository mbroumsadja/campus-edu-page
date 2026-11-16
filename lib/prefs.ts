"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentPublic } from "./campus";
import { useSession } from "./useSession";

export type Prefs = {
  vue: "grille" | "liste";
  niveau: string;
  type: "" | "cours" | "sujet";
  filiere: string;
  pourMoi: boolean;
};

const DEFAUT: Prefs = { vue: "grille", niveau: "", type: "", filiere: "", pourMoi: false };
const CLE = "campus.prefs";

const lire = <T,>(cle: string, defaut: T): T => {
  try {
    const brut = window.localStorage.getItem(cle);
    return brut ? ({ ...defaut, ...JSON.parse(brut) } as T) : defaut;
  } catch {
    return defaut;
  }
};
const ecrire = (cle: string, v: unknown) => {
  try {
    window.localStorage.setItem(cle, JSON.stringify(v));
  } catch {
    /* navigation privée : les préférences durent le temps de la page */
  }
};

// Préférences d'affichage et de filtre, gardées dans le navigateur
export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAUT);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setPrefs(lire(CLE, DEFAUT));
    setPret(true);
  }, []);

  const maj = useCallback((p: Partial<Prefs>) => {
    setPrefs((cur) => {
      const suivant = { ...cur, ...p };
      ecrire(CLE, suivant);
      return suivant;
    });
  }, []);

  return { prefs, maj, pret };
}

export const cleDoc = (d: DocumentPublic) => `${d.type_contenu}:${d.id}`;

// Favoris gardés sur l'appareil, séparés par compte
export function useFavoris() {
  const { user } = useSession();
  const cle = `campus.favoris.${user?.id ?? "anonyme"}`;
  const [liste, setListe] = useState<DocumentPublic[]>([]);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setListe(lire<{ docs: DocumentPublic[] }>(cle, { docs: [] }).docs ?? []);
    setPret(true);
  }, [cle]);

  const basculer = useCallback(
    (d: DocumentPublic) => {
      setListe((cur) => {
        const existe = cur.some((x) => cleDoc(x) === cleDoc(d));
        const suivant = existe ? cur.filter((x) => cleDoc(x) !== cleDoc(d)) : [d, ...cur];
        ecrire(cle, { docs: suivant });
        return suivant;
      });
    },
    [cle]
  );

  const estFavori = useCallback((d: DocumentPublic) => liste.some((x) => cleDoc(x) === cleDoc(d)), [liste]);
  return { liste, basculer, estFavori, pret };
}
