"use client";

import { useEffect, useState } from "react";
import FeuilleForfait from "../components/FeuilleForfait";
import AppShell from "../components/AppShell";
import { Mi } from "../components/Mi";
import { etatPaiement, listerForfaits, mesAbonnements, rafraichirProfil, seDeconnecter, type EtatForfaits, type ForfaitInfo, type MonAbonnement } from "../../lib/campus";
import { usePrefs } from "../../lib/prefs";
import { useSession } from "../../lib/useSession";

export default function Compte() {
  const { pret, connecte, user } = useSession();
  const { prefs, maj } = usePrefs();

  useEffect(() => {
    if (pret && connecte) rafraichirProfil().catch(() => {});
  }, [pret, connecte]);

  const [forfaits, setForfaits] = useState<EtatForfaits | null>(null);
  const [abonnements, setAbonnements] = useState<MonAbonnement[]>([]);

  useEffect(() => {
    if (!pret || !connecte) return;
    listerForfaits().then(setForfaits).catch(() => {});
    mesAbonnements().then(setAbonnements).catch(() => {});
  }, [pret, connecte]);

  const [forfaitChoisi, setForfaitChoisi] = useState<ForfaitInfo | null>(null);
  const [paiement, setPaiement] = useState<"" | "attente" | "reussi" | "echec">("");

  // Retour de Fapshi : /compte?paiement=<id>. L'API vérifie chez Fapshi ; on réessaie quelques secondes.
  useEffect(() => {
    if (!pret || !connecte) return;
    const id = new URLSearchParams(window.location.search).get("paiement");
    if (!id) return;
    let essais = 0;
    let stop = false;
    const verifier = async () => {
      try {
        const p = await etatPaiement(id);
        if (stop) return;
        if (p.statut === "reussi") {
          setPaiement("reussi");
          mesAbonnements().then(setAbonnements).catch(() => {});
          window.history.replaceState(null, "", "/compte");
          return;
        }
        if (p.statut !== "en_attente") return void (setPaiement("echec"), window.history.replaceState(null, "", "/compte"));
      } catch {
        /* réessai ci-dessous */
      }
      setPaiement("attente");
      if (++essais < 12) setTimeout(verifier, 4000);
    };
    void verifier();
    return () => { stop = true; };
  }, [pret, connecte]);

  const initiales = user ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <AppShell titre="Compte">
      <section className="results compte">
        {!pret ? null : connecte && user ? (
          <>
            <div className="profil">
              <span className="profil-avatar">{initiales}</span>
              <div>
                <h1>{user.prenom} {user.nom}</h1>
                <p className="profil-meta">{user.matricule}</p>
                {(user.filiere?.nom || user.niveau) && (
                  <p className="profil-meta">{[user.filiere?.nom, user.niveau].filter(Boolean).join(" · ")}</p>
                )}
              </div>
            </div>

            <div className="carte">
              <label className="switch-row">
                <span>
                  <strong>Mon niveau en premier</strong>
                  <small>Les recherches démarrent sur votre filière et votre niveau.</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className="switch"
                  checked={prefs.pourMoi}
                  onChange={(e) => maj({ pourMoi: e.target.checked })}
                />
              </label>
            </div>

            {paiement && (
              <p className="paiement-etat" role="status" data-etat={paiement}>
                {paiement === "reussi" && "Paiement confirmé. Votre forfait est actif."}
                {paiement === "attente" && "Paiement en cours de confirmation. Cela peut prendre quelques instants."}
                {paiement === "echec" && "Le paiement n'a pas abouti. Vous pouvez réessayer."}
              </p>
            )}

            {forfaits?.actifs && (
              <>
                <h2 className="compte-section">Mes forfaits</h2>
                <div className="carte">
                  {forfaits.forfaits.map((f) => {
                    const abo = abonnements.find((a) => a.forfait_code === f.code);
                    return (
                      <div key={f.code} className="forfait-ligne">
                        <span>
                          <strong>{f.nom}</strong>
                          <small>
                            {abo
                              ? `Valable jusqu'au ${new Date(abo.fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                              : `${new Intl.NumberFormat("fr-FR").format(f.prix)} FCFA par an`}
                          </small>
                        </span>
                        {abo ? (
                          <span className="forfait-etat">Actif</span>
                        ) : (
                          <button type="button" className="btn btn--tonal forfait-obtenir" onClick={() => setForfaitChoisi({ ...f, instructions_paiement: forfaits.instructions_paiement })}>Obtenir</button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="demande-intro">Les documents déjà publiés restent gratuits jusqu'au {new Date(forfaits.libre_jusqu_au).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.</p>
              </>
            )}

            <button type="button" className="btn btn--outline compte-out" onClick={() => void seDeconnecter()}>
              <Mi n="logout" size={20} />
              Se déconnecter
            </button>
          </>
        ) : (
          <div className="empty">
            <span className="empty-icon"><Mi n="person" size={32} /></span>
            <h1 className="empty-h">Votre compte étudiant</h1>
            <p>Gardez votre filière et votre niveau : les recherches démarrent sur vos documents, et vos favoris restent séparés de ceux des autres comptes.</p>
            <div className="empty-actions">
              <a className="btn btn--primary" href="/inscription">Créer un compte</a>
              <a className="btn btn--tonal" href="/connexion">Se connecter</a>
            </div>
          </div>
        )}
      </section>
      <FeuilleForfait forfait={forfaitChoisi} fermer={() => setForfaitChoisi(null)} />
    </AppShell>
  );
}
