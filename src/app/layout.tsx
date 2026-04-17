import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JV Vault",
  description: "Notion-style encrypted credential vault for Jaiveeru",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
