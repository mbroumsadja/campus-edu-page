import { notFound } from "next/navigation";
import { getVersions } from "@/lib/versions";
import UploadForm from "./upload-form";

export const revalidate = 0;

export default async function AdminPage({
  params,
}: {
  params: { secret: string };
}) {
  const adminSecret = process.env.ADMIN_SECRET;

  // Si la variable n'est pas configurée, on bloque tout accès par sécurité.
  if (!adminSecret || params.secret !== adminSecret) {
    notFound();
  }

  const versions = await getVersions();

  return (
    <div className="admin-wrap">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Panneau admin</h1>
      <p className="meta" style={{ marginBottom: 24 }}>
        Publier une nouvelle version de l&apos;application
      </p>

      <div className="admin-card">
        <UploadForm secret={params.secret} />
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Versions publiées</h2>
        {versions.length === 0 && (
          <p className="meta">Aucune version pour le moment.</p>
        )}
        {versions.map((v) => (
          <div className="admin-list-item" key={v.id}>
            <span>
              <strong>v{v.version}</strong> {v.isCurrent ? "(actuelle)" : ""} —{" "}
              {v.subtitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
