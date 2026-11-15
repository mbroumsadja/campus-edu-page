"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IconClose, IconDownload, IconMenu } from "./Icons";
import { seDeconnecter } from "../../lib/campus";
import { useSession } from "../../lib/useSession";

const LINKS = [
  { id: "fonctionnalites", label: "Fonctionnalités" },
  { id: "guide", label: "Guide étudiant" },
  { id: "telechargement", label: "Versions" },
  { id: "faq", label: "FAQ" },
];

// Sur la page d'accueil les ancres restent sur la page ; ailleurs elles y renvoient.
export default function Header({ home = false }: { home?: boolean }) {
  const { pret, connecte, user } = useSession();
  const surSupports = usePathname() === "/supports";
  const ancre = (id: string) => (home ? `#${id}` : `/#${id}`);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  // Fond plus marqué dès que la page défile
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Met en évidence la section visible
  useEffect(() => {
    const targets = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => io.observe(t));

    const hero = document.getElementById("accueil");
    const heroIo = hero
      ? new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) setActive("");
          },
          { rootMargin: "-45% 0px -50% 0px" }
        )
      : null;
    if (hero && heroIo) heroIo.observe(hero);

    return () => {
      io.disconnect();
      heroIo?.disconnect();
    };
  }, []);

  // Menu mobile : blocage du scroll + fermeture avec Échap
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <header className="lp-header" data-scrolled={scrolled} data-open={open}>
      <div className="lp-header-bar">
        <a className="lp-brand" href={ancre("accueil")} onClick={close} aria-label="Campus Edu, retour à l'accueil">
          <span className="lp-brand-mark">
            <Image src="/logo.png" alt="" width={40} height={40} priority />
          </span>
          <span className="lp-brand-word">
            Campus <span>Edu</span>
          </span>
        </a>

        <nav className="lp-nav" aria-label="Menu principal">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={ancre(l.id)}
              aria-current={active === l.id ? "true" : undefined}
              data-active={active === l.id}
            >
              {l.label}
            </a>
          ))}
          <a href="/supports" data-active={surSupports} aria-current={surSupports ? "page" : undefined}>
            Supports
          </a>
        </nav>

        <div className="lp-header-actions">
          {pret && connecte ? (
            <button
              type="button"
              className="lp-btn lp-btn--ghost lp-btn--sm lp-header-login"
              onClick={() => void seDeconnecter()}
              title={user ? `${user.prenom} ${user.nom}` : undefined}
            >
              Déconnexion
            </button>
          ) : (
            <a className="lp-btn lp-btn--ghost lp-btn--sm lp-header-login" href="/connexion">
              Connexion
            </a>
          )}
          <a className="lp-btn lp-btn--primary lp-btn--sm lp-header-cta" href={ancre("telechargement")} onClick={close}>
            <IconDownload size={18} />
            Télécharger
          </a>
          <button
            type="button"
            className="lp-menu-btn"
            aria-expanded={open}
            aria-controls="lp-sheet"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      <div id="lp-sheet" className="lp-sheet" hidden={!open}>
        <nav className="lp-sheet-nav" aria-label="Menu mobile">
          {LINKS.map((l, i) => (
            <a
              key={l.id}
              href={ancre(l.id)}
              onClick={close}
              style={{ ["--d" as string]: `${80 + i * 50}ms` }}
              aria-current={active === l.id ? "true" : undefined}
            >
              {l.label}
            </a>
          ))}
          <a href="/supports" onClick={close} style={{ ["--d" as string]: `${80 + LINKS.length * 50}ms` }}>
            Supports de cours
          </a>
          {pret && connecte ? (
            <a
              href="/connexion"
              onClick={(e) => {
                e.preventDefault();
                close();
                void seDeconnecter();
              }}
              style={{ ["--d" as string]: `${80 + (LINKS.length + 1) * 50}ms` }}
            >
              Déconnexion
            </a>
          ) : (
            <a href="/connexion" onClick={close} style={{ ["--d" as string]: `${80 + (LINKS.length + 1) * 50}ms` }}>
              Connexion
            </a>
          )}
          <a
            className="lp-btn lp-btn--primary lp-sheet-cta"
            href={ancre("telechargement")}
            onClick={close}
            style={{ ["--d" as string]: `${80 + (LINKS.length + 2) * 50}ms` }}
          >
            <IconDownload size={20} />
            Télécharger l&apos;APK
          </a>
        </nav>
      </div>
    </header>
  );
}
