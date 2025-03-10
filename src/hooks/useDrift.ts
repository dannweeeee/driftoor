"use client";

import { useState, useCallback } from "react";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import { Wallet } from "@drift-labs/sdk";
import { useDriftClientStore } from "@/stores/useDriftClientStore";
import { WalletContextState } from "@solana/wallet-adapter-react";

interface UseDriftOptions {
  autoConnect?: boolean;
  env?: "mainnet-beta" | "devnet";
  rpcUrl?: string;
  keypairPath?: string;
  perpMarketIndexes?: number[];
}

interface DriftPosition {
  totalDeposit: number;
  costBasis: number;
  positionSizeSol: number;
  positionSizeUsd: number;
  entryPrice: number;
  pnl: number;
  currentPrice: number;
}

export const useDrift = (options: UseDriftOptions = {}) => {
  const {
    autoConnect = false,
    env = "mainnet-beta",
    rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    keypairPath,
  } = options;

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const {
    connection,
    wallet,
    driftClient,
    driftUser,
    isInitialized,
    isSubscribed,
    isLoading,
    error,
    initializeDriftClient: storeInitializeDriftClient,
    subscribeToDriftClient,
    resetDriftClient,
    getUserAccount,
  } = useDriftClientStore();

  // Initialize Drift client with a wallet adapter
  const initializeWithWallet = useCallback(
    async (walletAdapter: WalletContextState, connection: Connection) => {
      if (
        !walletAdapter.publicKey ||
        !walletAdapter.signTransaction ||
        !walletAdapter.signAllTransactions
      ) {
        setConnectionError(
          new Error("Wallet not connected or missing required methods")
        );
        return false;
      }

      try {
        setIsConnecting(true);
        setConnectionError(null);

        // Create a Drift SDK compatible wallet from the wallet adapter
        const driftWallet: Wallet = {
          publicKey: walletAdapter.publicKey,
          signTransaction: walletAdapter.signTransaction,
          signAllTransactions: walletAdapter.signAllTransactions,
          // Create a dummy keypair for payer since we can't access the actual keypair
          payer: Keypair.generate(), // This is just a placeholder
          signVersionedTransaction: async (tx: VersionedTransaction) => {
            return await walletAdapter.signTransaction!(tx as any);
          },
          signAllVersionedTransactions: async (txs: VersionedTransaction[]) => {
            return await walletAdapter.signAllTransactions!(txs as any[]);
          },
        };

        // Initialize Drift client
        await storeInitializeDriftClient(connection, driftWallet, env);

        // Subscribe to Drift client
        await subscribeToDriftClient();

        // Check if user account exists
        const userExists = await getUserAccount();

        if (!userExists) {
          console.warn("User account does not exist - needs initialization");
        }

        setIsConnecting(false);
        return true;
      } catch (err) {
        console.error("Error initializing Drift client with wallet:", err);
        setConnectionError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        setIsConnecting(false);
        return false;
      }
    },
    [env, storeInitializeDriftClient, subscribeToDriftClient, getUserAccount]
  );

  return {
    connection,
    wallet,
    driftClient,
    driftUser,
    isInitialized,
    isSubscribed,
    isLoading: isLoading || isConnecting,
    error: error || connectionError,
    resetDriftClient,
    initializeWithWallet,
  };
};
