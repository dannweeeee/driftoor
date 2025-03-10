"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { DriftClient, User } from "@drift-labs/sdk";

interface DriftPosition {
  totalDeposit: number;
  costBasis: number;
  positionSizeSol: number;
  positionSizeUsd: number;
  entryPrice: number;
  pnl: number;
  currentPrice: number;
}

interface DriftClientContextProps {
  children: ReactNode;
  driftClient: DriftClient | null;
  driftUser: User | null;
  isInitialized: boolean;
  isSubscribed: boolean;
  driftPosition: DriftPosition;
}

interface DriftContextType {
  driftClient: DriftClient | null;
  driftUser: User | null;
  isInitialized: boolean;
  isSubscribed: boolean;
  driftPosition: DriftPosition;
}

const DriftContext = createContext<DriftContextType | null>(null);

export const DriftClientContext: React.FC<DriftClientContextProps> = ({
  children,
  driftClient,
  driftUser,
  isInitialized,
  isSubscribed,
  driftPosition,
}) => {
  return (
    <DriftContext.Provider
      value={{
        driftClient,
        driftUser,
        isInitialized,
        isSubscribed,
        driftPosition,
      }}
    >
      {children}
    </DriftContext.Provider>
  );
};

export const useDriftClient = () => {
  const context = useContext(DriftContext);

  if (!context) {
    throw new Error("useDriftClient must be used within a DriftClientProvider");
  }

  return context;
};
