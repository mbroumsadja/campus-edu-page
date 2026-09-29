// Secret partagé entre la page admin et les routes API.
// Définis ADMIN_SECRET dans Vercel (valeur longue et aléatoire) et supprime le fallback.
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "campus2026";
