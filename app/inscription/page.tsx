"use client";

import { useEffect, useState } from "react";
import AuthShell from "../components/AuthShell";
import Champ from "../components/Champ";
import { ApiError, confirmerInscription, listerFilieres, NIVEAUX, renvoyerCode, sInscrire, type Filiere, type Niveau, type SuiteInscription } from "../../lib/campus";
import { useSession } from "../../lib/useSession";

export default function Inscription() {
  const { pret, connecte } = useSession();
  const [f, setF] = useState({ nom: "", prenom: "", matricule: "", email: "", password: "", filiere: "", niveau: "" });
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [chargement, setChargement] = useState(true);
  const [champs, setChamps] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [attente, setAttente] = useState("");
  const [verif, setVerif] = useState<{ email: string; saisie: string } | null>(null);
  const [code, setCode] = useState("");
  const [delai, setDelai] = useState(0);
  const [info, setInfo] = useState("");

  // Compte à rebours avant de pouvoir redemander un code
  useEffect(() => {
    if (delai <= 0) return;
    const t = setTimeout(() => setDelai((d) => d - 1), 1000);
    return () => clearTimeout(t);
  }, [delai]);

  const suite = (r: SuiteInscription, saisie = "") => {
    if (r.etape === "code") {
      setVerif({ email: r.email, saisie: saisie || r.email });
      setDelai(r.renvoiDans);
      setCode("");
      setErreur("");
      setInfo("");
    } else if (r.statut !== "actif") {
      setAttente(r.message || "Compte créé. Il sera activé après validation.");
    }
    setEnvoi(false);
  };

  const confirmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi || !verif) return;
    if (!/^\d{6}$/.test(code)) return setErreur("Le code contient 6 chiffres.");
    setEnvoi(true);
    setErreur("");
    try {
      suite(await confirmerInscription(verif.email, code));
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Confirmation impossible.");
      setEnvoi(false);
    }
  };

  const redemander = async () => {
    if (!verif || delai > 0) return;
    setErreur("");
    try {
      setDelai(await renvoyerCode(verif.email));
      setInfo("Un nouveau code vient d'être envoyé.");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Envoi impossible.");
    }
  };

  const maj = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (pret && connecte) window.location.replace("/");
  }, [pret, connecte]);

  useEffect(() => {
    listerFilieres()
      .then(setFilieres)
      .catch(() => setErreur("Impossible de charger les filières. Rechargez la page."))
      .finally(() => setChargement(false));
  }, []);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    const locales: Record<string, string> = {};
    if (!f.filiere) locales.filiere_id = "Choisissez votre filière";
    if (!f.niveau) locales.niveau = "Choisissez votre niveau";
    if (f.password.length < 8) locales.password = "8 caractères minimum";
    setChamps(locales);
    setErreur("");
    if (Object.keys(locales).length) return;
    setEnvoi(true);
    try {
      const r = await sInscrire({
        matricule: f.matricule.trim().toUpperCase(),
        nom: f.nom.trim(),
        prenom: f.prenom.trim(),
        email: f.email.trim(),
        filiere_id: Number(f.filiere),
        niveau: f.niveau as Niveau,
        password: f.password,
      });
      suite(r, f.email.trim());
    } catch (err) {
      if (err instanceof ApiError) {
        setChamps(err.fields);
        setErreur(Object.keys(err.fields).length ? "Corrigez les champs signalés." : err.message);
      } else setErreur("Inscription impossible.");
      setEnvoi(false);
    }
  };

  if (verif) {
    return (
      <AuthShell
        titre="Confirmez votre adresse"
        intro={`Nous avons envoyé un code à 6 chiffres à ${verif.saisie}. Il est valable 15 minutes.`}
        pied={<button type="button" className="lien-bouton" onClick={() => { setVerif(null); setCode(""); setErreur(""); }}>Modifier mon adresse</button>}
      >
        <form onSubmit={confirmer} noValidate>
          <Champ id="code" label="Code de confirmation" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" mono aide="Pensez à regarder dans les courriers indésirables." />
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

  if (attente) {
    return (
      <AuthShell titre="Compte créé" intro={attente} pied={<><a href="/connexion">Aller à la connexion</a></>}>
        <p className="alert alert--ok">Vous pourrez vous connecter dès que l&apos;administration aura validé votre compte.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      titre="Créer un compte"
      intro="Quelques informations suffisent pour créer votre compte."
      pied={<>Déjà inscrit ? <a href="/connexion">Se connecter</a></>}
    >
      <form onSubmit={soumettre} noValidate>
        <div className="fd-row">
          <Champ id="prenom" label="Prénom" value={f.prenom} onChange={maj("prenom")} autoComplete="given-name" erreur={champs.prenom} />
          <Champ id="nom" label="Nom" value={f.nom} onChange={maj("nom")} autoComplete="family-name" erreur={champs.nom} />
        </div>
        <Champ id="matricule" label="Matricule" value={f.matricule} onChange={maj("matricule")} autoComplete="username" maxLength={20} erreur={champs.matricule} placeholder="ex : 24FS1234" mono aide="Le matricule de votre carte étudiant, sans tiret." />
        <Champ id="email" label="Adresse e-mail" type="email" inputMode="email" value={f.email} onChange={maj("email")} autoComplete="email" erreur={champs.email} placeholder="vous@exemple.com" aide="Une adresse que vous consultez régulièrement." />
        <div className="fd-row">
          <div className="fd" data-error={Boolean(champs.filiere_id)}>
            <label htmlFor="filiere">Filière</label>
            <div className="fd-input">
              <select id="filiere" value={f.filiere} onChange={(e) => maj("filiere")(e.target.value)} disabled={chargement} aria-invalid={Boolean(champs.filiere_id)}>
                <option value="">{chargement ? "Chargement…" : "Choisir"}</option>
                {filieres.map((x) => (
                  <option key={x.id} value={x.id}>{x.nom}</option>
                ))}
              </select>
            </div>
            {champs.filiere_id && <small className="fd-err" role="alert">{champs.filiere_id}</small>}
          </div>
          <div className="fd" data-error={Boolean(champs.niveau)}>
            <label htmlFor="niveau">Niveau</label>
            <div className="fd-input">
              <select id="niveau" value={f.niveau} onChange={(e) => maj("niveau")(e.target.value)} aria-invalid={Boolean(champs.niveau)}>
                <option value="">Choisir</option>
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            {champs.niveau && <small className="fd-err" role="alert">{champs.niveau}</small>}
          </div>
        </div>
        <Champ id="password" label="Mot de passe" type="password" value={f.password} onChange={maj("password")} autoComplete="new-password" erreur={champs.password} aide="8 caractères minimum." placeholder="Choisissez un mot de passe" />
        {erreur && <p className="alert" role="alert">{erreur}</p>}
        <button className="btn btn--primary au-submit" type="submit" disabled={envoi}>
          {envoi ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </AuthShell>
  );
}
