"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex flex-col items-center justify-center"
    >
      <div className="text-center max-w-md mx-auto p-8 rounded-xl bg-white/50 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-zinc-600 mb-6">
          Please connect your Solana wallet to view your Drift subaccounts and
          positions.
        </p>
        <div className="flex justify-center">
          <WalletMultiButton />
        </div>
      </div>
    </motion.div>
  );
}
