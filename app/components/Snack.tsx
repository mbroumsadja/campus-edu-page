"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const Ctx = createContext<(m: string) => void>(() => {});
export const useSnack = () => useContext(Ctx);

// Message bref en bas d'écran, comme un snackbar Android
export function SnackProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const montrer = useCallback((m: string) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), 3200);
  }, []);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  return (
    <Ctx.Provider value={montrer}>
      {children}
      <div className="snack-zone" role="status" aria-live="polite">
        {msg && <div className="snack">{msg}</div>}
      </div>
    </Ctx.Provider>
  );
}
