import Image from "next/image";
import { getVersions } from "@/lib/versions";

export const revalidate = 0;

export default async function HomePage() {
  const versions = await getVersions();

  return (
    <>
      <header>
        <div className="wrap brand">
          <Image src="/logo.png" alt="Campus Edu" width={64} height={64} priority />
          <div className="brand-text">
            <div className="word">
              Campus <span>Educatif</span>
            </div>
            <div className="tagline">Partagez · Téléchargez · Réussissez</div>
          </div>
        </div>
      </header>

      <main>
        <div className="wrap hero">
          <div className="eyebrow">Université de Garoua · Application Étudiants</div>
          <h1>
            Tout le campus, tous les <em>documents éducatifs</em>, dans votre poche.
          </h1>
          <p className="lead">
            Tous vos sujets d&apos;examen et cours sont accessibles via cette application,
            directement depuis votre téléphone.
          </p>

          <nav className="doc-menu" aria-label="Documentation">
            <a className="doc-link" href="/docs/campus-edu-documentation.txt" download>
              Télécharger la documentation
            </a>
          </nav>

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

          <div className="note">
            Application gratuite et sans compte. Après le téléchargement, ouvrez le fichier et
            autorisez l&apos;installation depuis cette source si votre téléphone vous le demande.
          </div>
        </div>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Mbroumsadja Emmanuel — Tous droits réservés</p>
      </footer>
    </>
  );
}
