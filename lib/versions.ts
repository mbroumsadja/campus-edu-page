import { list, put } from "@vercel/blob";

export type AppVersion = {
  id: string;
  version: string;
  subtitle: string;
  isCurrent: boolean;
  apkUrl: string;
  createdAt: string;
};

const VERSIONS_KEY = "campus-edu/versions.json";

// Version de secours affichée tant qu'aucune version n'a encore été
// publiée via le panneau admin (reprend les données du site d'origine).
const FALLBACK_VERSIONS: AppVersion[] = [
  {
    id: "seed-1",
    version: "1.1.5",
    subtitle: "Recherche plus fluide",
    isCurrent: false,
    apkUrl:
      "https://xowkbau1lvjwbvnm.public.blob.vercel-storage.com/Campus%20Edu%20Docs-1.apk",
    createdAt: new Date(1).toISOString(),
  },
];

export async function getVersions(): Promise<AppVersion[]> {
  try {
    const { blobs } = await list({ prefix: VERSIONS_KEY, limit: 1 });
    if (blobs.length === 0) return FALLBACK_VERSIONS;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return FALLBACK_VERSIONS;
    const data = (await res.json()) as AppVersion[];
    return data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return FALLBACK_VERSIONS;
  }
}

export async function saveVersions(versions: AppVersion[]): Promise<void> {
  await put(VERSIONS_KEY, JSON.stringify(versions, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
