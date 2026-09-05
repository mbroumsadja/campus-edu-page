# Campus Edu — Page

Landing page Next.js 14 pour l'application CampusEduService, avec un panneau
admin caché pour publier de nouvelles versions de l'APK.

## Installation

```bash
npm install
cp .env.example .env.local
```

Remplis `.env.local` :
- `ADMIN_SECRET` : jeton secret qui forme l'URL de l'admin
  (`/admin/<ADMIN_SECRET>`). Génère-le avec `openssl rand -hex 24`.
- `BLOB_READ_WRITE_TOKEN` : ajoute un **Blob Store** à ton projet Vercel
  (Storage → Create → Blob), la variable est injectée automatiquement en
  production ; en local, copie-la depuis le dashboard.

## Développement

```bash
npm run dev
```

- Page publique : `http://localhost:3000`
- Admin (uniquement accessible en connaissant l'URL) :
  `http://localhost:3000/admin/<ADMIN_SECRET>`

Toute URL `/admin/<autre-chose>` renvoie une 404, comme une page inexistante —
personne ne peut deviner ou lister cette route.

## Documentation téléchargeable

Un fichier de documentation est disponible depuis la page d'accueil :

- `campus-edu-documentation.txt` : informations générales, installation et utilisation

## Déploiement (Vercel)

1. Push le projet sur GitHub.
2. Importe-le dans Vercel.
3. Ajoute un **Blob Store** au projet (Storage tab).
4. Ajoute la variable d'environnement `ADMIN_SECRET` dans Project Settings →
   Environment Variables.
5. Déploie. L'admin sera accessible sur
   `https://ton-domaine.vercel.app/admin/<ADMIN_SECRET>`.

## Fonctionnement

- `lib/versions.ts` lit/écrit la liste des versions dans un fichier JSON
  stocké sur Vercel Blob (`campus-edu/versions.json`).
- La page d'accueil (`app/page.tsx`) est un composant serveur qui relit cette
  liste à chaque requête (`revalidate = 0`).
- Le formulaire admin envoie l'APK + les métadonnées à
  `app/api/admin/upload/route.ts`, qui vérifie le secret, upload le fichier
  sur Blob, puis met à jour la liste des versions.
