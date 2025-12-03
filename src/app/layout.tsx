import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/providers";
import Footer from "@/app/footer";
import Header from "@/app/header";
import MatrixRain from "@/components/MatrixRain";

export const metadata: Metadata = {
  title: "Privora | Private Programmable Philanthropy",
  description:
    "Matching anonymous donors with verified-but-pseudonymous builders using Zcash, NEAR, and zk-proofs",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#00ff41",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body className="antialiased">
        <Providers>
          {/* Gradient Background */}
          <div className="matrix-bg" />

          {/* Matrix Background */}
          <MatrixRain />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
