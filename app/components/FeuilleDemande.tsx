"use client";

import { useEffect, useState } from "react";
import Feuille from "./Feuille";
import Champ from "./Champ";
import { ApiError, demanderDocument } from "../../lib/campus";
import { useSession } from "../../lib/useSession";

type Props = { ouverte: boolean; fermer: () => void; propose: string; envoye: (message: string) => void };

// Demande d'un document absent de la recherche, envoyée à l'administration
export default function FeuilleDemande({ ouverte, fermer, propose, envoye }: Props) {
  const { connecte, user } = useSession();
  const [cours, setCours] = useState("");
  const [nom, setNom] = useState("");
  const [precisions, setPrecisions] = useState("");
  const [contact, setContact] = useState("");
  const [champs, setChamps] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (ouverte) {
      setCours(propose);
      setChamps({});
      setErreur("");
    }
  }, [ouverte, propose]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setChamps({});
    setErreur("");
    setEnvoi(true);
    try {
      const m = await demanderDocument({
        nom_cours: cours.trim(),
        nom_etudiant: connecte ? undefined : nom.trim(),
        message: precisions.trim() || undefined,
        contact: contact.trim() || undefined,
      });
      setPrecisions("");
      envoye(m);
      fermer();
    } catch (err) {
      if (err instanceof ApiError) {
        setChamps(err.fields);
        setErreur(Object.keys(err.fields).length ? "Corrigez les champs signalés." : err.message);
      } else setErreur("Envoi impossible. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Feuille ouverte={ouverte} fermer={fermer} titre="Demander un document">
      <form onSubmit={soumettre} noValidate className="demande">
        <p className="demande-intro">L&apos;administration reçoit votre demande et ajoute le document quand elle le trouve.</p>
        <Champ id="nom_cours" label="Cours ou matière" value={cours} onChange={setCours} erreur={champs.nom_cours} maxLength={200} />
        {!connecte && (
          <Champ id="nom_etudiant" label="Votre nom" value={nom} onChange={setNom} autoComplete="name" erreur={champs.nom_etudiant} maxLength={150} />
        )}
        {connecte && user && <p className="demande-auteur">Envoyée au nom de {user.prenom} {user.nom}.</p>}
        <div className="fd">
          <label htmlFor="precisions">Précisions (facultatif)</label>
          <div className="fd-input">
            <textarea id="precisions" value={precisions} onChange={(e) => setPrecisions(e.target.value)} rows={3} maxLength={1000} placeholder="Année, enseignant, type de sujet…" />
          </div>
          {champs.message && <small className="fd-err" role="alert">{champs.message}</small>}
        </div>
        <Champ id="contact" label="Téléphone ou e-mail (facultatif)" value={contact} onChange={setContact} required={false} erreur={champs.contact} aide="Pour vous prévenir quand le document est ajouté." maxLength={150} />
        {erreur && <p className="alert" role="alert">{erreur}</p>}
        <div className="sheet-actions">
          <button type="button" className="btn btn--text" onClick={fermer}>Annuler</button>
          <button type="submit" className="btn btn--primary" disabled={envoi || cours.trim().length < 2 || (!connecte && !nom.trim())}>
            {envoi ? "Envoi…" : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </Feuille>
  );
}
