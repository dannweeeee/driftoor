"use client";

import Dashboard from "@/components/dashboard";
import Navbar from "@/components/layout/navbar";
import Hero from "@/components/layout/hero";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {wallet.connected ? <Dashboard /> : <Hero />}
      </div>
    </div>
  );
}
