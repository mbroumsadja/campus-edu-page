import AppShell from "./AppShell";
import { Logo } from "./Logo";

export default function AuthShell({
  titre,
  intro,
  children,
  pied,
}: {
  titre: string;
  intro: string;
  children: React.ReactNode;
  pied: React.ReactNode;
}) {
  return (
    <AppShell retour="/" titre={titre}>
      <div className="au">
        <div className="au-card">
          <div className="au-logo"><Logo size={44} tone="light" textClassName="text-2xl" /></div>
          <p className="au-intro">{intro}</p>
          {children}
          <p className="au-foot">{pied}</p>
        </div>
      </div>
    </AppShell>
  );
}
