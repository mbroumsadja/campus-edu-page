import { notFound } from "next/navigation";
import { getVersions } from "@/lib/versions";
import UploadForm from "./upload-form";

export const revalidate = 0;

export default async function AdminPage({
  params,
}: {
  params: { secret: string };
}) {
  const adminSecret = process.env.ADMIN_SECRET || "campus2026";

  if (!adminSecret || params.secret !== adminSecret) {
    notFound();
  }

  const versions = await getVersions();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Administration</p>
          <h1>Panneau de publication</h1>
        </div>
        <span className="status-pill status-pill-soft">Campus Edu</span>
      </div>

      <div className="admin-shell">
        <div className="admin-card admin-card-primary">
          <div className="admin-card-header">
            <h2>Publier une version</h2>
            <p>Ajoutez une nouvelle APK, définissez la version et la description.</p>
          </div>
          <UploadForm secret={params.secret} />
        </div>

        <div className="admin-card admin-card-secondary">
          <div className="admin-card-header">
            <h2>Versions publiées</h2>
            <p>Historique des déclinaisons et des mises à jour.</p>
          </div>

          {versions.length === 0 && <p className="meta">Aucune version pour le moment.</p>}

          <div className="admin-list">
            {versions.map((v) => (
              <div className="admin-list-item" key={v.id}>
                <div className="admin-list-main">
                  <span className="admin-version-badge">v{v.version}</span>
                  {v.isCurrent && <span className="admin-current-badge">Actuelle</span>}
                </div>
                <span className="admin-list-copy">{v.subtitle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
