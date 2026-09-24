"use client";

import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="wrap nav-wrap">
        <div className="brand">
          <Image src="/logo.png" alt="Campus Edu" width={40} height={40} priority />
          <div className="brand-text">
            <div className="word">Campus Edu</div>
            <div className="tagline">Partagez · Téléchargez · Réussissez</div>
          </div>
        </div>

        <button
          className="hamburger"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
        >
          <span className={`hamburger-box ${open ? "is-open" : ""}`} />
        </button>

        <nav className={`main-menu ${open ? "open" : ""}`} aria-label="Menu principal">
          <a href="#accueil" onClick={() => setOpen(false)}>
            Campus Edu
          </a>
          <a href="#documentation" onClick={() => setOpen(false)}>
            Documentation
          </a>
          <a href="#guide" onClick={() => setOpen(false)}>
            Guide Etudiant
          </a>
          <a href="#telechargement" onClick={() => setOpen(false)}>
            Téléchargement
          </a>
        </nav>

        <a className="pill-button" href="#telechargement">
          Télécharger
        </a>
      </div>
    </header>
  );
}
