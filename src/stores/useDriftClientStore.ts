"use client";

import { create } from "zustand";
import { Connection } from "@solana/web3.js";
import { Wallet, DriftClient, User } from "@drift-labs/sdk";

interface DriftState {
  connection: Connection | null;
  wallet: Wallet | null;
  driftClient: DriftClient | null;
  driftUser: User | null;
  isInitialized: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: Error | null;

  // Actions
  initializeDriftClient: (
    connection: Connection,
    wallet: Wallet,
    env: "mainnet-beta" | "devnet",
    perpMarketIndexes?: number[]
  ) => Promise<void>;
  subscribeToDriftClient: () => Promise<void>;
  resetDriftClient: () => void;
  getUserAccount: () => Promise<boolean>;
}

export const useDriftClientStore = create<DriftState>((set, get) => ({
  connection: null,
  wallet: null,
  driftClient: null,
  driftUser: null,
  isInitialized: false,
  isSubscribed: false,
  isLoading: false,
  error: null,

  initializeDriftClient: async (
    connection,
    wallet,
    env,
    perpMarketIndexes = [0]
  ) => {
    try {
      set({ isLoading: true, error: null });

      // If there's an existing client, unsubscribe first
      const {
        driftClient: existingClient,
        isSubscribed,
        driftUser: existingUser,
      } = get();
      if (existingClient && isSubscribed) {
        await existingClient.unsubscribe();
      }

      if (existingUser && existingUser.isSubscribed) {
        await existingUser.unsubscribe();
      }

      // Initialize the Drift client with websocket subscription
      const driftClient = new DriftClient({
        connection,
        wallet,
        env,
        perpMarketIndexes,
        accountSubscription: {
          type: "websocket",
          resubTimeoutMs: 30000,
          commitment: "confirmed",
        },
      });

      set({
        connection,
        wallet,
        driftClient,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize Drift client:", error);
      set({
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
        isLoading: false,
      });
    }
  },

  subscribeToDriftClient: async () => {
    const { driftClient, isInitialized } = get();

    if (!driftClient || !isInitialized) {
      set({
        error: new Error("Drift client not initialized"),
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      await driftClient.subscribe();

      // Initialize the User instance after client subscription
      const userAccountPublicKey = await driftClient.getUserAccountPublicKey();

      const driftUser = new User({
        driftClient,
        userAccountPublicKey,
        accountSubscription: {
          type: "websocket",
          resubTimeoutMs: 30000,
          commitment: "confirmed",
        },
      });

      await driftUser.subscribe();

      set({
        driftUser,
        isSubscribed: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to subscribe to Drift client:", error);
      set({
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
        isLoading: false,
      });
    }
  },

  getUserAccount: async () => {
    const { driftUser } = get();

    if (!driftUser) {
      set({
        error: new Error("Drift user not initialized"),
      });
      return false;
    }

    try {
      await driftUser.fetchAccounts();
      const userAccountExists = await driftUser.exists();
      return userAccountExists;
    } catch (error) {
      console.error("Failed to get user account:", error);
      set({
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      });
      return false;
    }
  },

  resetDriftClient: () => {
    const { driftClient, isSubscribed, driftUser } = get();

    if (driftClient && isSubscribed) {
      driftClient.unsubscribe();
    }

    if (driftUser && driftUser.isSubscribed) {
      driftUser.unsubscribe();
    }

    set({
      connection: null,
      wallet: null,
      driftClient: null,
      driftUser: null,
      isInitialized: false,
      isSubscribed: false,
      isLoading: false,
      error: null,
    });
  },
}));
