import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WDA Photo Agent",
  description: "Mobilny Wirtualny Dyrektor Artystyczny do analizy i postprodukcji fotografii.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
