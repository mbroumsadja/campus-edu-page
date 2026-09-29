"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadForm({ secret }: { secret: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("apk") as File;
    const version = String(data.get("version"));

    try {
      // 1) Upload direct navigateur -> Vercel Blob
      const blob = await upload(`apks/${version}.apk`, file, {
        access: "public",
        handleUploadUrl: "/",
        clientPayload: secret,
        multipart: true,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      // 2) Enregistrement des métadonnées
      const res = await fetch("/api/admin/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          version,
          subtitle: data.get("subtitle"),
          isCurrent: data.get("isCurrent") === "true",
          url: blob.url,
          size: file.size,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Échec de l'enregistrement");
      }

      setSuccess(true);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="version">Numéro de version</label>
        <input id="version" name="version" type="text" placeholder="1.0.5" required />
      </div>

      <div className="admin-field">
        <label htmlFor="subtitle">Sous-titre (affiché sous le numéro)</label>
        <input
          id="subtitle"
          name="subtitle"
          type="text"
          placeholder="Corrections et améliorations"
          required
        />
      </div>

      <div className="admin-field">
        <label htmlFor="apk">Fichier APK</label>
        <input id="apk" name="apk" type="file" accept=".apk" required />
      </div>

      <label className="admin-checkbox">
        <input type="checkbox" name="isCurrent" value="true" />
        Marquer comme version actuelle
      </label>

      <button className="btn-primary admin-submit" type="submit" disabled={pending}>
        {pending ? `Envoi en cours… ${progress}%` : "Publier la version"}
      </button>

      {error && (
        <p className="meta" style={{ color: "#c0392b", marginTop: 12 }}>
          {error}
        </p>
      )}
      {success && (
        <p className="meta" style={{ color: "#1a7a3c", marginTop: 12 }}>
          Version publiée avec succès.
        </p>
      )}
    </form>
  );
}