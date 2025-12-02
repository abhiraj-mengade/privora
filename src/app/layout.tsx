import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Privora - Private Programmable Philanthropy",
  description: "Matching anonymous donors with verified-but-pseudonymous builders using Zcash, NEAR, and zk-proofs",
  manifest: "/manifest.json",
  themeColor: "#00ff41",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
