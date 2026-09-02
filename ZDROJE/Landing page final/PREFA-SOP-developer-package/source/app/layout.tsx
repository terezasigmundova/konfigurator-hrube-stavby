import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PREFA ŠOP | Online kalkulace hrubé stavby",
  description:
    "Nahrajte výkresy a během několika minut zjistěte kompletní cenu hrubé stavby včetně materiálu, dopravy a montáže.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">{children}</body>
    </html>
  );
}
