# Campus Edu : page publique

Recherche publique des cours et des sujets d'examen de l'Université de Garoua. Un compte étudiant peut être créé et la session reste ouverte dans le navigateur. Le thème est celui de l'administration (charte Campus Edu v1.0 : Nuit, Azur, Ciel, Soleil, Sora et Inter).

## Pages

Interface de type application Android (Material 3, gestes et mouvement inspirés des principes d'Apple : retour immédiat au toucher, feuille de filtres qu'on peut attraper et renvoyer) : barre du haut, navigation du bas sur téléphone (rail latéral sur grand écran), bouton flottant « Filtres » avec feuille de filtres, snackbar.

| Route | Accès | Rôle |
|---|---|---|
| `/` | public | derniers documents, puis recherche (texte, niveau, type, filière) ; affichage en grille ou en liste ; téléchargement, partage et demande d'un document manquant (envoyée à l'administration), sans compte |
| `/favoris` | public | documents mis en favoris, gardés sur l'appareil et séparés par compte |
| `/compte` | public | profil et réglage « Mon niveau en premier » ; création de compte et connexion pour les visiteurs |
| `/inscription` | public | création d'un compte étudiant (matricule, e-mail, filière, niveau, mot de passe) |
| `/connexion` | public | connexion par matricule |

Un étudiant connecté démarre sur sa filière et son niveau (modifiable depuis le chip « Mon niveau » ou la page Compte). La session reste dans le navigateur (`localStorage`) et le jeton d'accès se renouvelle seul. Les appels partent directement du navigateur vers l'API (`lib/campus.ts`).

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_API_URL` | adresse de l'API, par défaut `https://campus-edu-backend.vercel.app/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | adresse publique de la page (métadonnées) |

## Côté backend

- `POST /auth/register` et `GET /search/documents?recents=1` (derniers documents) doivent être déployés.
- L'origine de la page doit figurer dans `CORS_ORIGINS` (`https://campus-edu-theta.vercel.app` est déjà autorisée par défaut).
- `INSCRIPTION_VALIDATION=true` met les nouveaux comptes en attente de validation par un admin.

## Développement

```
npm install
npm run dev
```
