"use client";

import { useEffect, useState } from "react";
import { lireSession, surChangementSession, type Utilisateur } from "./campus";

// État de la session du navigateur. `pret` reste faux jusqu'à la lecture du stockage,
// pour éviter un clignotement « déconnecté » au chargement.
export function useSession() {
  const [etat, setEtat] = useState<{ pret: boolean; connecte: boolean; user: Utilisateur | null }>({
    pret: false,
    connecte: false,
    user: null,
  });

  useEffect(() => {
    const lire = () => {
      const { access, refresh, user } = lireSession();
      setEtat({ pret: true, connecte: Boolean(access && refresh), user });
    };
    lire();
    return surChangementSession(lire);
  }, []);

  return etat;
}
