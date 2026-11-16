import { Logo } from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="sf">
      <div className="wrap sf-in">
        <Logo size={28} tone="dark" textClassName="text-base" />
        <p>Cours et sujets d&apos;examen de l&apos;Université de Garoua.</p>
      </div>
    </footer>
  );
}
