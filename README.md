# Campus Edu : page publique

Recherche publique des cours et des sujets d'examen de l'Université de Garoua. Un compte étudiant peut être créé et la session reste ouverte dans le navigateur. Le thème est celui de l'administration (charte Campus Edu v1.0 : Nuit, Azur, Ciel, Soleil, Sora et Inter).

## Pages

| Route | Accès | Rôle |
|---|---|---|
| `/` | public | recherche des cours et sujets d'examen (texte, type, niveau) et téléchargement, sans compte |
| `/inscription` | public | création d'un compte étudiant (matricule, e-mail, filière, niveau, mot de passe) |
| `/connexion` | public | connexion par matricule |

La session reste dans le navigateur (`localStorage`) : le jeton d'accès est renouvelé automatiquement avec le refresh token. Les appels partent directement du navigateur vers l'API (`lib/campus.ts`).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_API_URL` | adresse de l'API, par défaut `https://campus-edu-backend.vercel.app/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | adresse publique de la page (métadonnées) |

## Côté backend

- `POST /auth/register` doit être déployé (inscription publique).
- L'origine de la page doit figurer dans `CORS_ORIGINS` (`https://campus-edu-page.vercel.app` est déjà autorisée par défaut).
- `INSCRIPTION_VALIDATION=true` met les nouveaux comptes en attente de validation par un admin.

## Développement

```
npm install
npm run dev
```
