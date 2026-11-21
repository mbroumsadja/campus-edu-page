"use client";

import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Mi, type NomIcone } from "./Mi";
import { useSession } from "../../lib/useSession";

const ONGLETS: { href: string; label: string; icone: NomIcone; iconeActif?: NomIcone }[] = [
  { href: "/", label: "Recherche", icone: "search" },
  { href: "/favoris", label: "Favoris", icone: "star", iconeActif: "starFill" },
  { href: "/compte", label: "Compte", icone: "person" },
];

type Props = {
  children: React.ReactNode;
  titre?: string;
  retour?: string; // adresse du bouton retour : plus de navigation du bas
  entete?: React.ReactNode; // contenu sous la barre (champ de recherche)
};

export default function AppShell({ children, titre, retour, entete }: Props) {
  const chemin = usePathname();
  const { pret, connecte, user } = useSession();
  const initiales = user ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() : "";

  const lien = (o: (typeof ONGLETS)[number]) => (o.href === "/" ? chemin === "/" : chemin.startsWith(o.href));

  return (
    <div className="app" data-nav={retour ? "aucune" : "oui"}>
      <header className="head">
        <div className="bar">
          {retour ? (
            <a className="icon-btn icon-btn--dark" href={retour} aria-label="Retour">
              <Mi n="back" />
            </a>
          ) : (
            <a href="/" className="bar-brand" aria-label="Campus Edu, accueil">
              <Logo size={28} tone="light" textClassName="text-lg" />
            </a>
          )}
          {titre && <span className="bar-title">{titre}</span>}
          {!retour && (
            <nav className="bar-nav" aria-label="Navigation principale">
              {ONGLETS.map((o) => (
                <a key={o.href} href={o.href} aria-current={lien(o) ? "page" : undefined}>
                  {o.label}
                </a>
              ))}
            </nav>
          )}
          {!retour && (
            <a
              className="avatar"
              href={pret && connecte ? "/compte" : "/connexion"}
              aria-label={pret && connecte ? "Mon compte" : "Se connecter"}
            >
              {pret && connecte && initiales ? initiales : <Mi n="person" size={20} />}
            </a>
          )}
        </div>
      </header>

      <main className="content">
        {entete && <div className="toolbar">{entete}</div>}
        {children}
      </main>

      {!retour && (
        <nav className="nav" aria-label="Navigation principale">
          {ONGLETS.map((o) => {
            const actif = lien(o);
            return (
              <a key={o.href} href={o.href} className="nav-item" aria-current={actif ? "page" : undefined}>
                <Mi n={actif && o.iconeActif ? o.iconeActif : o.icone} />
                <span className="nav-label">{o.label}</span>
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}
