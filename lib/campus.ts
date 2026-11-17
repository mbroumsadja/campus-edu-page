// Client de l'API Campus Edu pour la page publique.
// Les appels partent directement du navigateur (CORS autorisé côté backend), ce qui garde
// l'IP réelle de l'étudiant pour les limiteurs. La session reste dans le navigateur.

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://campus-edu-backend.vercel.app/api/v1"
).replace(/\/+$/, "");

const ACCESS_KEY = "campus.accessToken";
const REFRESH_KEY = "campus.refreshToken";
const USER_KEY = "campus.user";

export type Filiere = { id: number; nom: string; code: string };
export type Niveau = "L1" | "L2" | "L3" | "M1" | "M2";
export const NIVEAUX: Niveau[] = ["L1", "L2", "L3", "M1", "M2"];

export type Utilisateur = {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  role: string;
  niveau?: Niveau | null;
  filiere?: Filiere | null;
};

export type ForfaitInfo = {
  code: string;
  nom: string;
  prix: number;
  duree_jours: number;
  instructions_paiement?: string;
};

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;
  code?: string;
  forfait?: ForfaitInfo;
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// ── Stockage de la session (localStorage, avec repli silencieux) ──────────
const lire = (k: string): string | null => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};
const ecrire = (k: string, v: string | null) => {
  try {
    if (v === null) window.localStorage.removeItem(k);
    else window.localStorage.setItem(k, v);
  } catch {
    /* navigation privée : la session ne durera que le temps de la page */
  }
};

let memoire: { access: string | null; refresh: string | null; user: Utilisateur | null } = {
  access: null,
  refresh: null,
  user: null,
};
const SESSION_EVENT = "campus:session";
const notifier = () => window.dispatchEvent(new Event(SESSION_EVENT));

export const lireSession = () => {
  if (typeof window === "undefined") return { access: null, refresh: null, user: null };
  const access = lire(ACCESS_KEY) ?? memoire.access;
  const refresh = lire(REFRESH_KEY) ?? memoire.refresh;
  let user: Utilisateur | null = memoire.user;
  const brut = lire(USER_KEY);
  if (brut) {
    try {
      user = JSON.parse(brut) as Utilisateur;
    } catch {
      user = null;
    }
  }
  return { access, refresh, user };
};

export const enregistrerSession = (access: string, refresh: string, user?: Utilisateur | null) => {
  memoire = { access, refresh, user: user ?? memoire.user };
  ecrire(ACCESS_KEY, access);
  ecrire(REFRESH_KEY, refresh);
  if (user) ecrire(USER_KEY, JSON.stringify(user));
  notifier();
};

export const effacerSession = () => {
  memoire = { access: null, refresh: null, user: null };
  ecrire(ACCESS_KEY, null);
  ecrire(REFRESH_KEY, null);
  ecrire(USER_KEY, null);
  notifier();
};

export const surChangementSession = (fn: () => void) => {
  window.addEventListener(SESSION_EVENT, fn);
  window.addEventListener("storage", fn); // autre onglet
  return () => {
    window.removeEventListener(SESSION_EVENT, fn);
    window.removeEventListener("storage", fn);
  };
};

// ── Requêtes ──────────────────────────────────────────────────────────────
type Enveloppe<T> = { success: boolean; message?: string; data: T; pagination?: Pagination; errors?: unknown };
export type Pagination = { total: number; page: number; limit: number; totalPages: number };

const erreurDepuis = async (res: Response): Promise<ApiError> => {
  let message = "Une erreur est survenue. Réessayez dans un instant.";
  const fields: Record<string, string> = {};
  let code: string | undefined;
  let forfait: ForfaitInfo | undefined;
  try {
    const corps = await res.json();
    if (typeof corps?.code === "string") code = corps.code;
    if (corps?.data?.forfait) forfait = corps.data.forfait;
    if (typeof corps?.message === "string") message = corps.message;
    else if (typeof corps?.error === "string") message = corps.error;
    const liste = Array.isArray(corps?.errors) ? corps.errors : [];
    for (const e of liste) {
      const champ = e?.field ?? e?.path ?? e?.param;
      const msg = e?.message ?? e?.msg;
      if (champ && msg && !fields[champ]) fields[champ] = String(msg);
    }
  } catch {
    /* corps non JSON */
  }
  if (res.status === 429) message = message || "Trop de tentatives. Patientez un moment.";
  const err = new ApiError(message, res.status, fields);
  err.code = code;
  err.forfait = forfait;
  return err;
};

const reseau = () => new ApiError("Connexion impossible. Vérifiez votre réseau puis réessayez.", 0);

let rafraichissement: Promise<boolean> | null = null;

const rafraichir = (): Promise<boolean> => {
  if (rafraichissement) return rafraichissement;
  rafraichissement = (async () => {
    const { refresh } = lireSession();
    if (!refresh) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) return false;
      const corps = (await res.json()) as Enveloppe<{ accessToken?: string; refreshToken?: string }>;
      const { accessToken, refreshToken } = corps.data ?? {};
      if (!accessToken || !refreshToken) return false;
      enregistrerSession(accessToken, refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    rafraichissement = null;
  });
  return rafraichissement;
};

type Options = { method?: string; body?: unknown; auth?: boolean; signal?: AbortSignal };

const appeler = async (chemin: string, opt: Options = {}, deuxieme = false): Promise<Response> => {
  const { access } = lireSession();
  const headers: Record<string, string> = {};
  if (opt.body !== undefined) headers["Content-Type"] = "application/json";
  if (opt.auth !== false && access) headers.Authorization = `Bearer ${access}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${chemin}`, {
      method: opt.method ?? "GET",
      headers,
      body: opt.body !== undefined ? JSON.stringify(opt.body) : undefined,
      signal: opt.signal,
    });
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    throw reseau();
  }
  if (res.status === 401 && opt.auth !== false && !deuxieme) {
    if (await rafraichir()) return appeler(chemin, opt, true);
    effacerSession();
  }
  return res;
};

const json = async <T,>(chemin: string, opt?: Options): Promise<Enveloppe<T>> => {
  const res = await appeler(chemin, opt);
  if (!res.ok) throw await erreurDepuis(res);
  return (await res.json()) as Enveloppe<T>;
};

// ── Services ──────────────────────────────────────────────────────────────
type Ouverture = { accessToken: string; refreshToken: string; utilisateur: Utilisateur };

export const seConnecter = async (matricule: string, password: string) => {
  const { data } = await json<Ouverture>("/auth/login", {
    method: "POST",
    auth: false,
    body: { matricule, password, appareil: "Page web" },
  });
  enregistrerSession(data.accessToken, data.refreshToken, data.utilisateur);
  return data.utilisateur;
};

export type Inscription = {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere_id: number;
  niveau: Niveau;
  password: string;
};

export type SuiteInscription =
  | { etape: "code"; email: string; renvoiDans: number; message: string }
  | { etape: "termine"; statut: "actif" | "en_attente"; message: string };

type ReponseInscription = Partial<Ouverture> & {
  statut?: "actif" | "en_attente";
  verification?: boolean;
  email?: string;
  renvoi_dans?: number;
};

const suiteInscription = (data: ReponseInscription, message?: string): SuiteInscription => {
  if (data.verification) {
    return { etape: "code", email: data.email ?? "", renvoiDans: data.renvoi_dans ?? 60, message: message ?? "" };
  }
  if (data.statut === "actif" && data.accessToken && data.refreshToken) {
    enregistrerSession(data.accessToken, data.refreshToken, data.utilisateur);
  }
  return { etape: "termine", statut: data.statut ?? "en_attente", message: message ?? "" };
};

// L'étape « code » survit à un rechargement ou à un changement d'application (aller lire le mail)
const CLE_VERIF = "campus.verification";
export type VerificationEnCours = { email: string; saisie: string };

export const lireVerification = (): VerificationEnCours | null => {
  try {
    const v = JSON.parse(localStorage.getItem(CLE_VERIF) || "null");
    return v && typeof v.email === "string" && v.expire > Date.now() ? { email: v.email, saisie: v.saisie || v.email } : null;
  } catch {
    return null;
  }
};
export const garderVerification = (email: string, saisie: string, expireDans = 900) => {
  try {
    localStorage.setItem(CLE_VERIF, JSON.stringify({ email, saisie, expire: Date.now() + expireDans * 1000 }));
  } catch {
    /* stockage indisponible : la page reste utilisable sans reprise */
  }
};
export const effacerVerification = () => {
  try {
    localStorage.removeItem(CLE_VERIF);
  } catch {
    /* rien à effacer */
  }
};

// Avec la confirmation par mail, l'inscription renvoie « code » ; le compte n'existe qu'après confirmerInscription
export const sInscrire = async (champs: Inscription) => {
  const { data, message } = await json<ReponseInscription>("/auth/register", { method: "POST", auth: false, body: champs });
  if (data.verification) garderVerification(data.email ?? champs.email, champs.email, 900);
  return suiteInscription(data, message);
};

export const confirmerInscription = async (email: string, code: string) => {
  const { data, message } = await json<ReponseInscription>("/auth/register/verifier", { method: "POST", auth: false, body: { email, code } });
  effacerVerification();
  return suiteInscription(data, message);
};

export const renvoyerCode = async (email: string) => {
  const { data } = await json<{ renvoi_dans: number }>("/auth/register/renvoyer", { method: "POST", auth: false, body: { email } });
  return data.renvoi_dans;
};

export const seDeconnecter = async () => {
  try {
    await appeler("/auth/logout", { method: "POST", body: {} });
  } catch {
    /* on efface la session locale quoi qu'il arrive */
  }
  effacerSession();
};

export const listerFilieres = async () => (await json<Filiere[]>("/filieres", { auth: false })).data;

export const rafraichirProfil = async () => {
  const { data } = await json<Utilisateur>("/auth/me");
  const { access, refresh } = lireSession();
  if (access && refresh) enregistrerSession(access, refresh, data);
  return data;
};

// ── Recherche publique (cours et sujets d'examen), sans compte ────────────
export type DocumentPublic = {
  id: number;
  cours_id?: number;
  type_contenu: "cours" | "sujet_examen";
  nom: string;
  tag_ordre?: string | null;
  type: string;
  type_epreuve?: string | null;
  session?: string | null;
  avec_corrige?: boolean;
  lien_telechargement: string;
  lien_corrige?: string | null;
  taille_lisible?: string;
  niveau: string;
  semestre: string;
  filiere_nom: string;
  code_ue: string;
  intitule_ue: string;
  annee_academique?: string | null;
  forfait?: "cours" | "sujets" | "supports";
  acces?: "libre" | "autorise" | "forfait_requis";
};

export type RechercheDocuments = {
  q?: string;
  niveau?: string;
  type?: "cours" | "sujet";
  filiere_id?: number;
  page?: number;
};

// Sans critère, l'API renvoie les derniers documents publiés (recents=1)
export const rechercherDocuments = async (p: RechercheDocuments, signal?: AbortSignal) => {
  const q = new URLSearchParams({ page: String(p.page ?? 1), limit: "12" });
  if (p.q) q.set("q", p.q);
  if (p.niveau) q.set("niveau", p.niveau);
  if (p.type) q.set("type", p.type);
  if (p.filiere_id) q.set("filiere_id", String(p.filiere_id));
  if (!p.q && !p.niveau && !p.type && !p.filiere_id) q.set("recents", "1");
  const res = await json<{ documents: DocumentPublic[]; nombre_resultats: number; pagination: Pagination }>(
    `/search/documents?${q}`,
    { signal } // jeton envoyé si connecté : l'API indique les documents déjà débloqués
  );
  return res.data;
};

// Les liens renvoyés par l'API sont relatifs à l'hôte du backend
export const urlTelechargement = (lien: string) => `${API_URL.replace(/\/api\/v1$/, "")}${lien}`;

// Le jeton voyage en en-tête : le téléchargement passe par fetch, puis le navigateur ouvre l'adresse du fichier
export const obtenirTelechargement = async (lien: string): Promise<string> => {
  const chemin = lien.replace(/^\/api\/v1/, "");
  const sep = chemin.includes("?") ? "&" : "?";
  const res = await json<{ url: string }>(`${chemin}${sep}format=json`);
  return res.data.url;
};

// ── Forfaits annuels ──────────────────────────────────────────────────────
export type Forfait = ForfaitInfo & { description: string | null; possede: boolean };
export type EtatForfaits = {
  actifs: boolean;
  libre_jusqu_au: string;
  instructions_paiement: string;
  paiement_en_ligne?: boolean;
  contact_whatsapp?: string | null;
  forfaits: Forfait[];
};
export type MonAbonnement = { id: number; forfait_code: string; debut: string; fin: string };

export const listerForfaits = async () => (await json<EtatForfaits>("/forfaits")).data;
export const payerForfait = async (code: string) =>
  (await json<{ paiement_id: number; lien: string }>("/paiements", { method: "POST", body: { forfait_code: code } })).data;
export const etatPaiement = async (id: string | number) =>
  (await json<{ id: number; statut: "en_attente" | "reussi" | "echoue" | "expire"; forfait_code: string }>(`/paiements/${id}`)).data;
export const mesAbonnements = async () => (await json<MonAbonnement[]>("/forfaits/moi")).data;

// ── Demande d'un document manquant (envoyée à l'administration) ───────────
export type DemandeDocument = { nom_cours: string; nom_etudiant?: string; message?: string; contact?: string };

export const demanderDocument = async (d: DemandeDocument) => {
  const corps: Record<string, string> = { type: "cours_demande", nom_cours: d.nom_cours };
  if (d.nom_etudiant) corps.nom_etudiant = d.nom_etudiant;
  if (d.message) corps.message = d.message;
  if (d.contact) corps.contact = d.contact;
  const res = await json<{ id: number | null }>("/demandes", { method: "POST", body: corps });
  return res.message ?? "Demande reçue. Merci !";
};
