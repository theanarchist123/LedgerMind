import type { Metadata } from "next";
import { Providers } from "@/components/providers"
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerMind",
  description: "Smart receipt management powered by AI - Mock UI Prototype",
};

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
