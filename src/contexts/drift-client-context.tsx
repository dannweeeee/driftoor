"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { DriftClient, User } from "@drift-labs/sdk";

interface DriftClientContextProps {
  children: ReactNode;
  driftClient: DriftClient | null;
  driftUser: User | null;
  isInitialized: boolean;
  isSubscribed: boolean;
}

interface DriftContextType {
  driftClient: DriftClient | null;
  driftUser: User | null;
  isInitialized: boolean;
  isSubscribed: boolean;
}

const DriftContext = createContext<DriftContextType | null>(null);

export const DriftClientContext: React.FC<DriftClientContextProps> = ({
  children,
  driftClient,
  driftUser,
  isInitialized,
  isSubscribed,
}) => {
  return (
    <DriftContext.Provider
      value={{
        driftClient,
        driftUser,
        isInitialized,
        isSubscribed,
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
