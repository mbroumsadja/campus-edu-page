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
    if (pret && connecte) window.location.replace("/");
  }, [pret, connecte]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setErreur("");
    setEnvoi(true);
    try {
      await seConnecter(matricule.trim().toUpperCase(), password);
      // la session enregistrée déclenche la redirection vers l'accueil
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Connexion impossible.");
      setEnvoi(false);
    }
  };

  return (
    <AuthShell
      titre="Connexion"
      intro="Entrez votre matricule et votre mot de passe."
      pied={<>Pas encore de compte ? <a href="/inscription">Créer un compte</a></>}
    >
      <form onSubmit={soumettre} noValidate>
        <Champ id="matricule" label="Matricule" value={matricule} onChange={setMatricule} autoComplete="username" maxLength={20} placeholder="ex : 24FS1234" mono aide="Étudiant : XXFSxxxx" />
        <Champ id="password" label="Mot de passe" type="password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Votre mot de passe" />
        {erreur && <p className="alert" role="alert">{erreur}</p>}
        <button className="btn btn--primary au-submit" type="submit" disabled={envoi || !matricule || !password}>
          {envoi ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}
