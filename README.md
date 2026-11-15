# Campus Edu : page publique

Page de téléchargement de l'application Android, avec inscription, connexion et recherche des supports de cours.

## Pages

| Route | Rôle |
|---|---|
| `/` | présentation, téléchargement de l'APK, FAQ |
| `/inscription` | création d'un compte étudiant (matricule, e-mail, filière, niveau, mot de passe) |
| `/connexion` | connexion par matricule |
| `/supports` | recherche et téléchargement des supports de la filière et du niveau de l'étudiant |

La session reste dans le navigateur (`localStorage`) : le jeton d'accès est renouvelé automatiquement avec le refresh token, et l'étudiant revient sur `/connexion` seulement si la session est expirée ou révoquée. Les appels partent directement du navigateur vers l'API (`lib/campus.ts`).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_API_URL` | adresse de l'API, par défaut `https://campus-edu-backend.vercel.app/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | adresse publique de la page (métadonnées) |
| `BLOB_READ_WRITE_TOKEN` et variables admin | téléversement des versions de l'APK |

## Côté backend

- `POST /auth/register` doit être déployé (inscription publique).
- L'origine de la page doit figurer dans `CORS_ORIGINS` (ou `FRONTEND_URL`). `https://campus-edu-page.vercel.app` est déjà autorisée par défaut.
- `INSCRIPTION_VALIDATION=true` met les nouveaux comptes en attente de validation par un admin.

## Développement

```
npm install
npm run dev
```
