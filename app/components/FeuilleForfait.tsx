"use client";

import Feuille from "./Feuille";
import { Mi } from "./Mi";
import type { ForfaitInfo } from "../../lib/campus";
import { useSession } from "../../lib/useSession";

type Props = { forfait: ForfaitInfo | null; fermer: () => void };

const FCFA = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n).replace(/\s/g, " ")} FCFA`;

// Forfait manquant pour le document demandé : prix, durée et marche à suivre pour payer
export default function FeuilleForfait({ forfait, fermer }: Props) {
  const { connecte, user } = useSession();
  const duree = forfait && forfait.duree_jours >= 360 ? "un an" : forfait ? `${forfait.duree_jours} jours` : "";

  return (
    <Feuille ouverte={!!forfait} fermer={fermer} titre={forfait?.nom ?? "Forfait"}>
      {forfait && (
        <div className="forfait">
          <p className="forfait-prix">
            <span className="forfait-icone"><Mi n="lock" size={22} /></span>
            <span>
              <strong>{FCFA(forfait.prix)}</strong>
              <small>pour {duree}</small>
            </span>
          </p>
          {connecte ? (
            <>
              {forfait.instructions_paiement && <p className="demande-intro">{forfait.instructions_paiement}</p>}
              {user && (
                <p className="forfait-matricule">
                  Votre matricule : <strong>{user.matricule}</strong>
                </p>
              )}
              <div className="empty-actions">
                <button type="button" className="btn btn--tonal" onClick={fermer}>Compris</button>
              </div>
            </>
          ) : (
            <>
              <p className="demande-intro">Connectez-vous ou créez un compte pour accéder à ce document et activer votre forfait.</p>
              <div className="empty-actions">
                <a className="btn btn--primary" href="/connexion">Se connecter</a>
                <a className="btn btn--tonal" href="/inscription">Créer un compte</a>
              </div>
            </>
          )}
        </div>
      )}
    </Feuille>
  );
}
