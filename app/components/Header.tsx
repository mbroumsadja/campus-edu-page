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

        <a className="pill-button" href="#telechargement">
          Télécharger
        </a>
      </div>
    </header>
  );
}
