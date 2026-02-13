import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers"
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerMind",
  description: "Smart receipt management powered by AI - Mock UI Prototype",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
