"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

const SolanaWalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
  }
);

const Navbar = () => {
  const { wallet } = useWallet();

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full isolate z-10 py-4"
      >
        <nav
          aria-label="Desktop navigation"
          className="mx-auto flex container items-center justify-between p-6 lg:!px-8 !py-4"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center px-4"
          >
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/drift-icon.png"
                  alt="drift-logo"
                  width={32}
                  height={32}
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              </motion.div>
            </Link>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 justify-end items-center hidden md:!flex gap-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SolanaWalletMultiButton>
                {wallet?.adapter?.publicKey
                  ? `${wallet?.adapter?.publicKey
                      ?.toBase58()
                      .slice(0, 4)}...${wallet?.adapter?.publicKey
                      ?.toBase58()
                      .slice(-4)}`
                  : "Connect Wallet"}
              </SolanaWalletMultiButton>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="block md:hidden ml-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SolanaWalletMultiButton>
                {wallet?.adapter?.publicKey
                  ? `${wallet?.adapter?.publicKey
                      ?.toBase58()
                      .slice(0, 4)}...${wallet?.adapter?.publicKey
                      ?.toBase58()
                      .slice(-4)}`
                  : "Connect Wallet"}
              </SolanaWalletMultiButton>
            </motion.div>
          </motion.div>
        </nav>
      </motion.header>
    </>
  );
};

export default Navbar;
