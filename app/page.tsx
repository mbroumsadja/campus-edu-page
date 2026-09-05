import Image from "next/image";
import { getVersions } from "@/lib/versions";

export const revalidate = 0;

export default async function HomePage() {
  const versions = await getVersions();

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="wrap nav-wrap">
          <div className="brand">
            <Image src="/logo.png" alt="Campus Edu" width={52} height={52} priority />
            <div className="brand-text">
              <div className="word">Campus Edu</div>
              <div className="tagline">Partagez · Téléchargez · Réussissez</div>
            </div>
          </div>

          <nav className="main-menu" aria-label="Menu principal">
            <a href="#accueil">Campus Edu</a>
            <a href="#documentation">Documentation</a>
            <a href="#guide">Guide Etudiant</a>
            <a href="#telechargement">Téléchargement</a>
          </nav>

          <a className="pill-button" href="#telechargement">
            Télécharger
          </a>
        </div>
      </header>

      <main className="page-main">
        <section className="hero-section" id="accueil">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow eyebrow-light">Campus Edu · Application Étudiants</span>
              <h1>
                Optimisez
                <br />
                vos
                <br />
                révisions
              </h1>
              <p className="lead">
                Accédez à vos supports de cours, anciens examens et ressources académiques depuis
                votre téléphone, partout et à tout moment.
              </p>

              <div className="hero-actions">
                <a className="cta-primary" href="#telechargement">
                  Télécharger l&apos;APK
                </a>
                <a className="cta-secondary" href="#documentation">
                  Documentation
                </a>
              </div>
            </div>

            <div className="phone-scene" aria-hidden="true">
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div className="screen-grid">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="pdf-item">
                      <span className="pdf-icon">PDF</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="floating-badge">v {versions[0]?.version ?? "1.0.0"}</div>
            </div>
          </div>
        </section>

        <section className="info-section" id="documentation">
          <div className="wrap feature-band">
            <div className="brand-badge">
              <div className="brand-badge-mark">C</div>
              <div>
                <div className="brand-badge-name">CAMPUS EDU</div>
                <div className="brand-badge-sub">Partagez · Téléchargez · Réussissez</div>
              </div>
            </div>

            <h2>
              Améliorez vos notes
              <br />
              avec la plus grande
              <br />
              bibliothèque numérique
              <br />
              de l&apos;Université.
            </h2>
          </div>
        </section>

        <section className="download-panel" id="telechargement">
          <div className="wrap download-wrap">
            <div className="download-box">
              <div className="download-copy">
                <span className="eyebrow eyebrow-dark">Téléchargement</span>
                <h3>Tous les documents de cours en un seul endroit</h3>
                <p>
                  Téléchargez la dernière version de l&apos;application sans compte, installez le fichier
                  APK et accédez à vos ressources numériques immédiatement.
                </p>

                <nav className="doc-menu" aria-label="Documentation et accès">
                  <a className="doc-link" href="/docs/campus-edu-documentation.txt" download>
                    Documentation
                  </a>
                  <a className="doc-link doc-link--secondary" href="#guide">
                    Guide Étudiant
                  </a>
                </nav>
              </div>

              <div className="version-panel" id="guide">
                <div className="version-panel-head">
                  <div>
                    <div className="version-panel-kicker">Versions disponibles</div>
                    <h4>Dernières mises à jour</h4>
                  </div>
                  <span className="status-pill">Live</span>
                </div>

                <div className="version-list">
                  {versions.map((v) => (
                    <div className="version-card" key={v.id}>
                      <div className="version-card-info">
                        <span className={`version-tag ${v.isCurrent ? "version-tag-current" : ""}`}>
                          {v.isCurrent ? "Actuelle" : "Nouveau"}
                        </span>
                        <div className="version-card-text">
                          <div className="version-card-title">Version {v.version}</div>
                          <div className="version-card-sub">{v.subtitle}</div>
                        </div>
                      </div>
                      <a className="version-card-btn" href={v.apkUrl} download>
                        Télécharger
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Mbroumsadja Emmanuel — Tous droits réservés</p>
      </footer>
    </div>
  );
}
