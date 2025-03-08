import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/providers/solana-wallet-provider";

const lexendDeca = Lexend_Deca({
  variable: "--font-lexend-deca",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Driftoor",
  description: "Easily manage your positions on Drift via Driftoor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexendDeca.variable} font-lexend-deca antialiased min-h-screen circles`}
      >
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
