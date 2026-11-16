"use client";

import { useState } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  erreur?: string;
  aide?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  mono?: boolean;
};

export default function Champ({ id, label, value, onChange, erreur, aide, type = "text", autoComplete, inputMode, required = true, maxLength, placeholder, mono }: Props) {
  const [visible, setVisible] = useState(false);
  const mdp = type === "password";
  return (
    <div className="fd" data-error={Boolean(erreur)}>
      <label htmlFor={id}>{label}</label>
      <div className="fd-input">
        <input
          id={id}
          name={id}
          type={mdp && visible ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          data-mono={mono || undefined}
          aria-invalid={Boolean(erreur)}
          aria-describedby={erreur ? `${id}-e` : aide ? `${id}-a` : undefined}
          autoCapitalize={id === "matricule" ? "characters" : "none"}
          spellCheck={false}
        />
        {mdp && (
          <button type="button" className="fd-eye" onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
            {visible ? "Masquer" : "Afficher"}
          </button>
        )}
      </div>
      {erreur ? (
        <small id={`${id}-e`} className="fd-err" role="alert">{erreur}</small>
      ) : aide ? (
        <small id={`${id}-a`}>{aide}</small>
      ) : null}
    </div>
  );
}
