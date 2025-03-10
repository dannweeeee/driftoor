"use client";

import React, { useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { DriftClientContext } from "@/contexts/drift-client-context";
import { useDriftClient } from "@/hooks/useDriftClient";

interface DriftClientWrapperProps {
  children: React.ReactNode;
}

export const DriftClientProvider: React.FC<DriftClientWrapperProps> = ({
  children,
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const {
    driftClient,
    driftUser,
    isInitialized,
    isSubscribed,
    isLoading,
    error,
    initializeWithWallet,
    resetDriftClient,
    driftPosition,
  } = useDriftClient({
    env: "mainnet-beta",
    rpcUrl: connection.rpcEndpoint,
  });

  // Initialize Drift client when wallet is connected
  useEffect(() => {
    if (wallet.publicKey && !isInitialized && !isLoading) {
      initializeWithWallet(wallet, connection);
    }
  }, [
    wallet.publicKey,
    isInitialized,
    isLoading,
    initializeWithWallet,
    connection,
    wallet,
  ]);

  // Reset Drift client when wallet is disconnected
  useEffect(() => {
    if (!wallet.publicKey && isInitialized) {
      resetDriftClient();
    }
  }, [wallet.publicKey, isInitialized, resetDriftClient]);

  return (
    <DriftClientContext
      driftClient={driftClient}
      driftUser={driftUser}
      isInitialized={isInitialized}
      isSubscribed={isSubscribed}
      driftPosition={driftPosition}
    >
      {children}
    </DriftClientContext>
  );
};
