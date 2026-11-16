"use client";

import { useSession } from "../../lib/useSession";

export default function SupportsInvite() {
  const { pret, connecte } = useSession();
  return (
    <section className="invite wrap">
      <div className="invite-card">
        <div>
          <h2>Supports de révision</h2>
          <p>
            Les supports de votre filière et de votre niveau sont réservés aux étudiants inscrits.
            Créez votre compte une fois, votre session reste ouverte sur cet appareil.
          </p>
        </div>
        <div className="invite-actions">
          {pret && connecte ? (
            <a className="btn btn--sun" href="/supports">Ouvrir mes supports</a>
          ) : (
            <>
              <a className="btn btn--sun" href="/inscription">Créer un compte</a>
              <a className="btn btn--light" href="/connexion">Se connecter</a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
