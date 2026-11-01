"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QRShare() {
  const [pageUrl, setPageUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const url = new URL("/#telechargement", window.location.origin).toString();
    setPageUrl(url);
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 160,
    })
      .then(setQrCode)
      .catch((cause: unknown) => {
        console.error("Impossible de générer le QR code de partage.", cause);
        setError(true);
      });
  }, []);

  return (
    <div className="lp-share">
      <div className="lp-qr">
        {qrCode ? (
          <img src={qrCode} alt="QR code pour ouvrir la page de téléchargement Campus Edu" />
        ) : (
          <span>{error ? "QR indisponible" : "Préparation du QR code…"}</span>
        )}
      </div>
      <div className="lp-share-copy">
        <strong>Partagez Campus Edu</strong>
        <span>Scannez le code pour ouvrir cette page sur votre téléphone.</span>
        {pageUrl && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Découvrez Campus Edu : ${pageUrl}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Partager sur WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
