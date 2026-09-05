import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getVersions, saveVersions, type AppVersion } from "@/lib/versions";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || 'campus2026';
  if (!adminSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET n'est pas configuré côté serveur." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const secret = formData.get("secret");

  if (secret !== adminSecret) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const version = formData.get("version");
  const subtitle = formData.get("subtitle");
  const isCurrent = formData.get("isCurrent") === "true";
  const apk = formData.get("apk");

  if (
    typeof version !== "string" ||
    !version.trim() ||
    typeof subtitle !== "string" ||
    !subtitle.trim() ||
    !(apk instanceof File) ||
    apk.size === 0
  ) {
    return NextResponse.json({ error: "Champs manquants ou invalides." }, { status: 400 });
  }

  if (!apk.name.toLowerCase().endsWith(".apk")) {
    return NextResponse.json({ error: "Le fichier doit être un .apk" }, { status: 400 });
  }

  const blob = await put(`campus-edu/apk/${Date.now()}-${apk.name}`, apk, {
    access: "public",
    addRandomSuffix: false,
  });

  const versions = await getVersions();

  const newVersion: AppVersion = {
    id: randomUUID(),
    version: version.trim(),
    subtitle: subtitle.trim(),
    isCurrent,
    apkUrl: blob.url,
    createdAt: new Date().toISOString(),
  };

  const updated = isCurrent
    ? versions.map((v) => ({ ...v, isCurrent: false }))
    : versions;

  await saveVersions([newVersion, ...updated]);

  return NextResponse.json({ ok: true, version: newVersion });
}
