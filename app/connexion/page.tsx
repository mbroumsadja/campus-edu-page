"use client";

import { useEffect, useState } from "react";
import AuthShell from "../components/AuthShell";
import Champ from "../components/Champ";
import { ApiError, seConnecter } from "../../lib/campus";
import { useSession } from "../../lib/useSession";

export default function Connexion() {
  const { pret, connecte } = useSession();
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (pret && connecte) window.location.replace("/supports");
  }, [pret, connecte]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setErreur("");
    setEnvoi(true);
    try {
      await seConnecter(matricule.trim().toUpperCase(), password);
      // la session enregistrée déclenche la redirection vers /supports
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Connexion impossible.");
      setEnvoi(false);
    }
  };

  return (
    <AuthShell
      titre="Connexion"
      intro="Connectez-vous pour rechercher les supports de cours de votre filière."
      pied={<>Pas encore de compte ? <a href="/inscription">Créer un compte</a></>}
    >
      <form onSubmit={soumettre} noValidate>
        <Champ id="matricule" label="Matricule" value={matricule} onChange={setMatricule} autoComplete="username" maxLength={20} />
        <Champ id="password" label="Mot de passe" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        {erreur && <p className="es-alert" role="alert">{erreur}</p>}
        <button className="lp-btn lp-btn--primary es-submit" type="submit" disabled={envoi || !matricule || !password}>
          {envoi ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}
