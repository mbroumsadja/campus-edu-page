"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { IconClose, IconMenu } from "./Icons";
import { seDeconnecter } from "../../lib/campus";
import { useSession } from "../../lib/useSession";

export default function SiteHeader() {
  const { pret, connecte, user } = useSession();
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

  const liens = [
    { href: "/", label: "Recherche", actif: chemin === "/" },
    { href: "/supports", label: "Supports de révision", actif: chemin === "/supports" },
  ];

  const sortir = () => {
    fermer();
    void seDeconnecter().then(() => {
      if (chemin === "/supports") window.location.replace("/connexion");
    });
  };

  return (
    <header className="sh">
      <div className="sh-bar">
        <a href="/" className="sh-brand" aria-label="Campus Edu, accueil" onClick={fermer}>
          <Logo size={34} textClassName="text-lg" />
        </a>

        <nav className="sh-nav" aria-label="Menu principal">
          {liens.map((l) => (
            <a key={l.href} href={l.href} aria-current={l.actif ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="sh-actions">
          {pret && connecte ? (
            <>
              <span className="sh-user" title={user ? `${user.prenom} ${user.nom}` : undefined}>
                {user ? user.prenom : "Mon compte"}
              </span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={sortir}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <a className="btn btn--ghost btn--sm sh-login" href="/connexion">Connexion</a>
              <a className="btn btn--primary btn--sm" href="/inscription">Créer un compte</a>
            </>
          )}
          <button
            type="button"
            className="sh-menu"
            aria-expanded={ouvert}
            aria-controls="sh-sheet"
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOuvert((v) => !v)}
          >
            {ouvert ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      <div id="sh-sheet" className="sh-sheet" hidden={!ouvert}>
        {liens.map((l) => (
          <a key={l.href} href={l.href} onClick={fermer} aria-current={l.actif ? "page" : undefined}>
            {l.label}
          </a>
        ))}
        {pret && connecte ? (
          <button type="button" onClick={sortir}>Déconnexion</button>
        ) : (
          <a href="/connexion" onClick={fermer}>Connexion</a>
        )}
      </div>
    </header>
  );
}
