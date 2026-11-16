import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Recherche from "./components/Recherche";
import SupportsInvite from "./components/SupportsInvite";

export default function Accueil() {
  return (
    <div className="page">
      <SiteHeader />
      <main>
        <Recherche />
        <SupportsInvite />
      </main>
      <SiteFooter />
    </div>
  );
}
