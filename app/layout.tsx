import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "Campus Educatif | Cours et sujets d'examen de l'Université de Garoua",
  description:
    "Tous vos sujets d'examen et cours sont accessibles via cette application, directement depuis votre téléphone.",
};

export const viewport: Viewport = {
  themeColor: "#050f1f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
