import Header from "./Header";

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
    <div className="lp es-page">
      <Header />
      <main className="es-auth">
        <div className="lp-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="es-card">
          <h1>{titre}</h1>
          <p className="es-intro">{intro}</p>
          {children}
          <p className="es-foot">{pied}</p>
        </div>
      </main>
    </div>
  );
}
