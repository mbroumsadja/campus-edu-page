import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function POST(request: Request) {
  const { secret, version, subtitle, isCurrent, url, size } =
    await request.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!version || !subtitle || !url) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  try {
    // TODO : remplace par ta logique existante (Sequelize, Prisma, etc.)
    // await Version.create({ version, subtitle, isCurrent, apkUrl: url, size });
    //
    // Si isCurrent, remets les autres versions à false.
    //
    // Optionnel, pour économiser le quota : supprimer l'ancien APK
    // await del(ancienneUrl);

    return NextResponse.json({ ok: true });
  } catch (e) {
    // En cas d'échec en base, on supprime le blob orphelin
    await del(url).catch(() => {});
    return NextResponse.json({ error: "Échec de l'enregistrement" }, { status: 500 });
  }
}