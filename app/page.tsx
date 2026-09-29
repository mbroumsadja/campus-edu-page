import type { CSSProperties } from "react";
import Image from "next/image";
import { getVersions } from "@/lib/versions";
import Header from "./components/Header";
import PhoneTilt from "./components/PhoneTilt";
import Reveal from "./components/Reveal";
import {
  IconArrowRight,
  IconBook,
  IconCheck,
  IconChevronDown,
  IconDownload,
  IconFile,
  IconFilter,
  IconFolderDown,
  IconHistory,
  IconSearch,
  IconShield,
} from "./components/Icons";

export const revalidate = 0;

const CHIPS = [
  "Mathématiques",
  "Algorithmique",
  "Anciens examens",
  "Supports de cours",
  "Ressources académiques",
  "Recherche rapide",
  "Filtres",
  "Fichiers téléchargés",
];

const STEPS = [
  {
    title: "Téléchargez l'APK",
    text: "Choisissez la version actuelle dans la section Téléchargement et enregistrez le fichier sur votre téléphone.",
  },
  {
    title: "Autorisez l'installation",
    text: "Si Android le demande, autorisez l'installation depuis une source inconnue, puis lancez l'installation.",
  },
  {
    title: "Vérifiez la version",
    text: "Contrôlez que la version installée correspond bien à la version marquée « Actuelle » sur cette page.",
  },
];

const FAQ = [
  {
    q: "Faut-il créer un compte ?",
    a: "Non. L'accès est public : installez l'application, puis recherchez vos documents sans vous inscrire.",
  },
  {
    q: "Sur quels téléphones fonctionne l'application ?",
    a: "Campus Edu est distribuée sous forme de fichier APK, le format d'installation des applications Android.",
  },
  {
    q: "Pourquoi Android demande-t-il une autorisation ?",
    a: "L'application s'installe depuis un fichier et non depuis une boutique. Android peut donc demander d'autoriser l'installation depuis une source inconnue. C'est normal.",
  },
  {
    q: "Comment savoir si j'ai la dernière version ?",
    a: "Comparez le numéro de la version installée avec celle marquée « Actuelle » dans la section Téléchargement.",
  },
  {
    q: "Où retrouver les fichiers que j'ai téléchargés ?",
    a: "Dans l'onglet « Fichiers » de l'application, à côté de « Catalogue », « Recherche » et « Notification ».",
  },
];

function delay(ms: number): CSSProperties {
  return { ["--d" as string]: `${ms}ms` } as CSSProperties;
}

export default async function HomePage() {
  const versions = await getVersions();
  const current = versions.find((v) => v.isCurrent) ?? versions[0];
  const older = versions.filter((v) => v.id !== current?.id);

  return (
    <div className="lp">
      <a className="lp-skip" href="#fonctionnalites">
        Aller au contenu
      </a>

      <Header />

      <main>
        {/* ------------------------------------------------------------ */}
        {/* Hero                                                          */}
        {/* ------------------------------------------------------------ */}
        <section className="lp-hero" id="accueil">
          <div className="lp-aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="lp-grid-bg" aria-hidden="true" />

          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              {current && (
                <a className="lp-badge lp-rise" href="#telechargement" style={delay(0)}>
                  <span className="lp-dot" aria-hidden="true" />
                  Version {current.version} disponible
                  <IconArrowRight size={16} />
                </a>
              )}

              <h1 className="lp-rise" style={delay(80)}>
                Tous vos cours et examens,{" "}
                <span className="lp-grad">dans votre poche.</span>
              </h1>

              <p className="lp-lead lp-rise" style={delay(160)}>
                Campus Educatif réunit les cours, les sujets d&apos;examen et leurs corrigés de
                l&apos;Université de Garoua. Cherchez, téléchargez, révisez, où que vous soyez.
              </p>

              <div className="lp-actions lp-rise" style={delay(240)}>
                <a className="lp-btn lp-btn--primary" href="#telechargement">
                  <IconDownload size={20} />
                  Télécharger l&apos;APK
                </a>
                <a className="lp-btn lp-btn--ghost" href="#guide">
                  Comment installer
                  <IconArrowRight size={18} />
                </a>
              </div>

              <ul className="lp-trust lp-rise" style={delay(320)}>
                <li>
                  <IconCheck size={18} />
                  Accès public, sans compte
                </li>
                <li>
                  <IconCheck size={18} />
                  Application Android
                </li>
                <li>
                  <IconCheck size={18} />
                  Université de Garoua
                </li>
              </ul>
            </div>

            <div className="lp-stage lp-rise" style={delay(200)}>
              <PhoneTilt>
                <div className="lp-phone">
                  <div className="lp-phone-screen">
                    <Image
                      src="/app-1.17.jpg"
                      alt="Écran de recherche de l'application Campus Educatif avec les filtres école, filière et niveau"
                      width={720}
                      height={1516}
                      sizes="(min-width: 960px) 300px, 70vw"
                      priority
                    />
                  </div>
                </div>
              </PhoneTilt>

              <div className="lp-float lp-float--a" aria-hidden="true">
                <span className="lp-float-icon">
                  <IconSearch size={20} />
                </span>
                <div>
                  <strong>Recherche rapide</strong>
                  <small>Un titre, une matière</small>
                </div>
              </div>
              <div className="lp-float lp-float--b" aria-hidden="true">
                <span className="lp-float-icon">
                  <IconFolderDown size={20} />
                </span>
                <div>
                  <strong>Fichiers</strong>
                  <small>Vos téléchargements, réunis</small>
                </div>
              </div>
              <div className="lp-float lp-float--c" aria-hidden="true">
                <span className="lp-float-icon lp-float-icon--ok">
                  <IconShield size={20} />
                </span>
                <div>
                  <strong>Accès public</strong>
                  <small>Aucun compte requis</small>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-ticker" aria-hidden="true">
            <div className="lp-ticker-track">
              {[0, 1].map((g) => (
                <div className="lp-ticker-group" key={g} aria-hidden={g === 1 ? "true" : undefined}>
                  {CHIPS.map((c) => (
                    <span className="lp-chip" key={`${g}-${c}`}>
                      <IconBook size={16} />
                      {c}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Fonctionnalités                                               */}
        {/* ------------------------------------------------------------ */}
        <section className="lp-section lp-features" id="fonctionnalites">
          <div className="lp-wrap">
            <Reveal className="lp-head">
              <span className="lp-eyebrow">Fonctionnalités</span>
              <h2 className="lp-h2">Tout pour réviser, rien de superflu.</h2>
              <p className="lp-sub">
                Une application pensée pour retrouver vite le bon document, puis y revenir quand
                vous en avez besoin.
              </p>
            </Reveal>

            <div className="lp-bento">
              <Reveal as="article" className="lp-card lp-card--dark lp-card--wide">
                <span className="lp-card-icon">
                  <IconSearch size={24} />
                </span>
                <h3>Trouvez le bon document en quelques secondes</h3>
                <p>
                  Tapez un titre ou une matière. Vos recherches récentes et fréquentes restent à
                  portée de main pour revenir vite aux mêmes sujets.
                </p>
                <div className="lp-card-visual" aria-hidden="true">
                  <div className="lp-mini-search">
                    <IconSearch size={20} />
                    Rechercher un document…
                    <span className="lp-caret" />
                  </div>
                  <div className="lp-mini-chips">
                    <span className="lp-mini-chip">
                      <IconHistory size={16} />
                      Mathématiques <b>3×</b>
                    </span>
                    <span className="lp-mini-chip">
                      <IconHistory size={16} />
                      Algorithmique <b>2×</b>
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal as="article" className="lp-card lp-card--mid" delay={80}>
                <span className="lp-card-icon">
                  <IconFile size={24} />
                </span>
                <h3>Cours, sujets et corrigés au même endroit</h3>
                <p>Des cours, des sujets d&apos;examen et leurs corrigés, réunis dans une seule application.</p>
                <div className="lp-card-visual" aria-hidden="true">
                  <div className="lp-sheets">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </Reveal>

              <Reveal as="article" className="lp-card" delay={0}>
                <span className="lp-card-icon">
                  <IconFilter size={24} />
                </span>
                <h3>Affinez par école, filière et niveau</h3>
                <p>Choisissez votre école, votre filière et votre niveau, de L1 à M2, pour ne voir que vos documents.</p>
                <div className="lp-card-visual" aria-hidden="true">
                  <div className="lp-toggles">
                    <span className="lp-toggle">L1</span>
                    <span className="lp-toggle" data-on="true">
                      L2
                    </span>
                    <span className="lp-toggle">L3</span>
                    <span className="lp-toggle">M1</span>
                    <span className="lp-toggle">M2</span>
                  </div>
                </div>
              </Reveal>

              <Reveal as="article" className="lp-card" delay={80}>
                <span className="lp-card-icon">
                  <IconFolderDown size={24} />
                </span>
                <h3>Vos téléchargements, toujours sous la main</h3>
                <p>L&apos;onglet « Fichiers » regroupe tout ce que vous avez téléchargé.</p>
                <div className="lp-card-visual" aria-hidden="true">
                  <div className="lp-tabs">
                    <span className="lp-tab" data-on="true">
                      <IconSearch size={18} />
                      Recherche
                    </span>
                    <span className="lp-tab">
                      <span className="lp-tab-badge">2</span>
                      <IconFolderDown size={18} />
                      Fichiers
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal as="article" className="lp-card" delay={160}>
                <span className="lp-card-icon">
                  <IconShield size={24} />
                </span>
                <h3>Sans compte, sans mot de passe</h3>
                <p>L&apos;accès est public : installez l&apos;APK et commencez à réviser.</p>
                <div className="lp-card-visual" aria-hidden="true">
                  <span className="lp-bigcheck">
                    <IconCheck size={30} />
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Guide                                                         */}
        {/* ------------------------------------------------------------ */}
        <section className="lp-section lp-guide" id="guide">
          <div className="lp-wrap">
            <Reveal className="lp-head lp-head--center">
              <span className="lp-eyebrow lp-eyebrow--dark">Guide étudiant</span>
              <h2 className="lp-h2">Installée en trois étapes.</h2>
              <p className="lp-sub">
                Campus Edu s&apos;installe depuis un fichier APK. Voici comment faire, pas à pas.
              </p>
            </Reveal>

            <ol className="lp-steps">
              {STEPS.map((s, i) => (
                <Reveal as="li" className="lp-step" delay={i * 90} key={s.title}>
                  <span className="lp-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Téléchargement                                                */}
        {/* ------------------------------------------------------------ */}
        <section className="lp-section lp-download" id="telechargement">
          <div className="lp-wrap lp-download-grid">
            <Reveal className="lp-head">
              <span className="lp-eyebrow">Téléchargement</span>
              <h2 className="lp-h2">Installez Campus Edu sur votre téléphone.</h2>
              <p className="lp-sub">
                Téléchargez la dernière version sans compte, installez le fichier APK et accédez
                tout de suite à vos ressources numériques.
              </p>
              <div className="lp-docs">
                <a
                  className="lp-btn lp-btn--outline"
                  href="/docs/campus-edu-documentation.pptx"
                  download
                >
                  <IconFile size={20} />
                  Documentation (PPTX)
                </a>
                <a className="lp-btn lp-btn--outline" href="#guide">
                  Guide étudiant
                </a>
              </div>
            </Reveal>

            <Reveal delay={100}>
              {current && (
                <div className="lp-featured">
                  <div className="lp-featured-top">
                    <span className="lp-tag">
                      <span className="lp-dot" aria-hidden="true" />
                      Version actuelle
                    </span>
                    <span className="lp-featured-logo">
                      <Image src="/logo.png" alt="" width={50} height={50} />
                    </span>
                  </div>
                  <h3>v{current.version}</h3>
                  <p>{current.subtitle}</p>
                  <a className="lp-btn lp-btn--primary" href={current.apkUrl} download>
                    <IconDownload size={22} />
                    Télécharger l&apos;APK
                  </a>
                  <small>Fichier APK pour Android</small>
                </div>
              )}

              {older.length > 0 && (
                <div className="lp-older">
                  <h4>Versions précédentes</h4>
                  {older.map((v) => (
                    <div className="lp-row" key={v.id}>
                      <div>
                        <strong>Version {v.version}</strong>
                        <span>{v.subtitle}</span>
                      </div>
                      <a href={v.apkUrl} download aria-label={`Télécharger la version ${v.version}`}>
                        <IconDownload size={18} />
                        APK
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* FAQ                                                           */}
        {/* ------------------------------------------------------------ */}
        <section className="lp-section lp-faq" id="faq">
          <div className="lp-wrap lp-faq-grid">
            <Reveal className="lp-head">
              <span className="lp-eyebrow">FAQ</span>
              <h2 className="lp-h2">Questions fréquentes.</h2>
              <p className="lp-sub">
                Un doute avant d&apos;installer ? Les réponses aux questions les plus courantes.
              </p>
            </Reveal>

            <Reveal delay={100}>
              {FAQ.map((item) => (
                <details className="lp-qa" key={item.q}>
                  <summary>
                    {item.q}
                    <IconChevronDown size={22} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------- */}
      {/* Appel final + pied de page                                      */}
      {/* -------------------------------------------------------------- */}
      <div className="lp-end">
        <div className="lp-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="lp-wrap lp-cta">
          <Reveal>
            <h2>Prêt à réviser plus efficacement&nbsp;?</h2>
            <p>
              Installez Campus Educatif et gardez vos cours, sujets et corrigés dans votre poche.
            </p>
            <div className="lp-actions">
              <a className="lp-btn lp-btn--primary" href="#telechargement">
                <IconDownload size={20} />
                Télécharger l&apos;APK
              </a>
            </div>
          </Reveal>
        </div>

        <footer className="lp-footer">
          <div className="lp-wrap lp-footer-grid">
            <a className="lp-brand" href="#accueil" aria-label="Campus Edu, retour à l'accueil">
              <span className="lp-brand-mark">
                <Image src="/logo.png" alt="" width={40} height={40} />
              </span>
              <span className="lp-brand-word">
                Campus <span>Edu</span>
              </span>
            </a>

            <ul className="lp-footer-links">
              <li>
                <a href="#fonctionnalites">Fonctionnalités</a>
              </li>
              <li>
                <a href="#guide">Guide étudiant</a>
              </li>
              <li>
                <a href="#telechargement">Versions</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>

            <p className="lp-copy">
              © {new Date().getFullYear()} Mbroumsadja Emmanuel. Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
