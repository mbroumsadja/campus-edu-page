"use client";

import { useEffect } from "react";
import AppShell from "../components/AppShell";
import { Mi } from "../components/Mi";
import { rafraichirProfil, seDeconnecter } from "../../lib/campus";
import { usePrefs } from "../../lib/prefs";
import { useSession } from "../../lib/useSession";

export default function Compte() {
  const { pret, connecte, user } = useSession();
  const { prefs, maj } = usePrefs();

  useEffect(() => {
    if (pret && connecte) rafraichirProfil().catch(() => {});
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
    </AppShell>
  );
}
