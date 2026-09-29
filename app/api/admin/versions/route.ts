import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { ADMIN_SECRET } from "@/lib/admin";
import { getVersions, saveVersions, type AppVersion } from "@/lib/versions";

export async function POST(request: Request) {
  const { secret, version, subtitle, isCurrent, url } = await request.json();

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!version || !subtitle || !url) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  try {
    const existing = await getVersions();

    const entry: AppVersion = {
      id: crypto.randomUUID(),
      version: String(version),
      subtitle: String(subtitle),
      isCurrent: Boolean(isCurrent),
      apkUrl: String(url),
      createdAt: new Date().toISOString(),
    };

    // Une seule version « actuelle » à la fois
    const updated = entry.isCurrent
      ? existing.map((v) => ({ ...v, isCurrent: false }))
      : existing;

    await saveVersions([entry, ...updated]);

    revalidatePath("/");
    revalidatePath(`/admin/${secret}`);

    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    // Évite de laisser un APK orphelin si l'enregistrement échoue
    await del(String(url)).catch(() => {});
    return NextResponse.json(
      { error: "Échec de l'enregistrement" },
      { status: 500 }
    );
  }
}
