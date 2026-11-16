"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Action = { label: string; run: () => void };
type Montrer = (message: string, action?: Action) => void;

const Ctx = createContext<Montrer>(() => {});
export const useSnack = () => useContext(Ctx);

// Message bref en bas d'écran. Une action « Annuler » laisse revenir en arrière après une erreur de geste.
export function SnackProvider({ children }: { children: React.ReactNode }) {
  const [etat, setEtat] = useState<{ message: string; action?: Action } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  const montrer = useCallback<Montrer>((message, action) => {
    setEtat({ message, action });
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setEtat(null), action ? 6000 : 3200);
  }, []);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);

  return (
    <Ctx.Provider value={montrer}>
      {children}
      <div className="snack-zone" role="status" aria-live="polite">
        {etat && (
          <div className="snack">
            <span>{etat.message}</span>
            {etat.action && (
              <button
                type="button"
                onClick={() => {
                  etat.action?.run();
                  setEtat(null);
                }}
              >
                {etat.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
