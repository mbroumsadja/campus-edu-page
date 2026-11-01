import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";
import "./landing.css";
import PwaRegistration from "./components/PwaRegistration";

const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined;

export const metadata: Metadata = {
  title: "Campus Educatif | Cours et sujets d'examen de l'Université de Garoua",
  description:
    "Tous vos sujets d'examen et cours sont accessibles via cette application, directement depuis votre téléphone.",
  ...(publicSiteUrl ? { metadataBase: publicSiteUrl } : {}),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Campus Edu",
  },
  openGraph: {
    title: "Campus Educatif | Cours et sujets d'examen",
    description:
      "Téléchargez Campus Edu et retrouvez vos cours et sujets d'examen de l'Université de Garoua.",
    type: "website",
    ...(publicSiteUrl ? { images: ["/logo.png"] } : {}),
  },
  twitter: {
    card: "summary",
    title: "Campus Educatif",
    description: "Cours et sujets d'examen de l'Université de Garoua.",
    ...(publicSiteUrl ? { images: ["/logo.png"] } : {}),
  },
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
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
