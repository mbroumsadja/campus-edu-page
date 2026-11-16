import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";
import "./site.css";

const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined;

export const metadata: Metadata = {
  title: "Campus Edu | Cours et sujets d'examen de l'Université de Garoua",
  description:
    "Recherchez et téléchargez les cours et les sujets d'examen de l'Université de Garoua. Connectez-vous pour consulter les supports de révision de votre filière.",
  ...(publicSiteUrl ? { metadataBase: publicSiteUrl } : {}),
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icon-192.png", sizes: "192x192" },
  ],
  openGraph: {
    title: "Campus Edu",
    description: "Cours et sujets d'examen de l'Université de Garoua.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1B3D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
