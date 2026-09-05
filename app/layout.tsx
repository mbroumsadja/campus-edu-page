import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Edu — Application Étudiants",
  description:
    "Tous vos sujets d'examen et cours sont accessibles via cette application, directement depuis votre téléphone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
