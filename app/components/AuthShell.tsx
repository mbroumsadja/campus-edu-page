import SiteHeader from "./SiteHeader";
import { Logo } from "./Logo";

const POINTS = [
  "Cours et sujets d'examen en libre accès, sans compte",
  "Une session qui reste ouverte sur cet appareil",
];

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
    <div className="page">
      <SiteHeader />
      <main className="au">
        <aside className="au-side" aria-hidden="true">
          <Logo size={56} tone="dark" textClassName="text-2xl" />
          <h2>Révisez avec les documents de votre faculté.</h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </aside>
        <div className="au-main">
          <div className="au-card">
            <div className="au-logo">
              <Logo size={48} tone="light" textClassName="text-2xl" />
            </div>
            <h1>{titre}</h1>
            <p className="au-intro">{intro}</p>
            {children}
            <p className="au-foot">{pied}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
