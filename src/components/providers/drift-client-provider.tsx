"use client";

import React, { useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { DriftClientContext } from "@/contexts/drift-client-context";
import { useDrift } from "@/hooks/useDrift";

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
  } = useDrift({
    env: "mainnet-beta",
    rpcUrl: connection.rpcEndpoint,
  });

  // Init drift client when wallet is connected
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
    >
      {children}
    </DriftClientContext>
  );
};
