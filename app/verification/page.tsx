"use client";

import { useEffect, useState } from "react";
import AuthShell from "../components/AuthShell";
import Champ from "../components/Champ";
import {
  ApiError,
  confirmerInscription,
  effacerVerification,
  garderVerification,
  lireVerification,
  renvoyerCode,
} from "../../lib/campus";
import { useSession } from "../../lib/useSession";

// Adresse stable de l'étape « code » : on peut quitter la page pour lire le mail et la retrouver,
// ou arriver depuis le lien du mail (?email=…&code=…).
export default function Verification() {
  const { pret, connecte } = useSession();
  const [cible, setCible] = useState<{ email: string; saisie: string } | null | undefined>(undefined);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [delai, setDelai] = useState(0);
  const [attente, setAttente] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const email = p.get("email")?.trim().toLowerCase();
    const garde = lireVerification();
    if (email) {
      const saisie = garde?.email === email ? garde.saisie : email;
      garderVerification(email, saisie, 900);
      setCible({ email, saisie });
    } else setCible(garde);
    const c = (p.get("code") || "").replace(/\D/g, "").slice(0, 6);
    if (c) setCode(c);
    if (email || c) window.history.replaceState(null, "", "/verification"); // le code ne reste pas dans l'adresse
  }, []);

  useEffect(() => {
    if (pret && connecte) window.location.replace("/");
  }, [pret, connecte]);

  useEffect(() => {
    if (delai <= 0) return;
    const t = setTimeout(() => setDelai((d) => d - 1), 1000);
    return () => clearTimeout(t);
  }, [delai]);

  const confirmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi || !cible) return;
    if (!/^\d{6}$/.test(code)) return setErreur("Le code contient 6 chiffres.");
    setEnvoi(true);
    setErreur("");
    try {
      const r = await confirmerInscription(cible.email, code);
      if (r.etape === "termine" && r.statut !== "actif") setAttente(r.message || "Compte créé. Il sera activé après validation.");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 410 || err.status === 429)) {
        effacerVerification();
        setCible(null);
        setErreur(err.message);
      } else setErreur(err instanceof ApiError ? err.message : "Confirmation impossible.");
    }
    setEnvoi(false);
  };

  const redemander = async () => {
    if (!cible || delai > 0) return;
    setErreur("");
    setInfo("");
    try {
      const d = await renvoyerCode(cible.email);
      garderVerification(cible.email, cible.saisie, 900);
      setDelai(d);
      setInfo("Un nouveau code vient d'être envoyé.");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Envoi impossible.");
    }
  };

  if (cible === undefined) return <AuthShell titre="Confirmation" intro="Chargement…" pied={null}>{null}</AuthShell>;

  if (attente) {
    return (
      <AuthShell titre="Compte créé" intro={attente} pied={<a href="/connexion">Aller à la connexion</a>}>
        <p className="alert alert--ok">Vous pourrez vous connecter dès que l&apos;administration aura validé votre compte.</p>
      </AuthShell>
    );
  }

  if (!cible) {
    return (
      <AuthShell
        titre="Confirmation"
        intro="Aucune inscription en attente de confirmation sur cet appareil."
        pied={<>Déjà un compte ? <a href="/connexion">Se connecter</a></>}
      >
        {erreur && <p className="alert" role="alert">{erreur}</p>}
        <a className="btn btn--primary au-submit" href="/inscription">Créer un compte</a>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      titre="Confirmez votre adresse"
      intro={`Nous avons envoyé un code à 6 chiffres à ${cible.saisie}. Il est valable 15 minutes.`}
      pied={<a href="/inscription" onClick={() => effacerVerification()}>Modifier mon adresse</a>}
    >
      <form onSubmit={confirmer} noValidate>
        <Champ id="code" label="Code de confirmation" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" mono aide="Vous pouvez quitter cette page pour lire le mail : elle vous attend ici. Regardez aussi les courriers indésirables." />
        {info && <p className="alert alert--ok" role="status">{info}</p>}
        {erreur && <p className="alert" role="alert">{erreur}</p>}
        <button className="btn btn--primary au-submit" type="submit" disabled={envoi || code.length !== 6}>
          {envoi ? "Vérification…" : "Confirmer"}
        </button>
        <button className="btn btn--tonal au-submit" type="button" onClick={redemander} disabled={delai > 0}>
          {delai > 0 ? `Renvoyer le code dans ${delai} s` : "Renvoyer le code"}
        </button>
      </form>
    </AuthShell>
  );
}
