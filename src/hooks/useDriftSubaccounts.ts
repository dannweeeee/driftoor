"use client";

import { useCallback, useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  DriftClient,
  User,
  getUserAccountPublicKey,
  DRIFT_PROGRAM_ID,
} from "@drift-labs/sdk";
import { useDriftSubaccountStore } from "@/stores/useDriftSubaccountStore";

interface UseDriftSubaccountsProps {
  connection: Connection;
  driftClient: DriftClient | null;
}

interface SubaccountData {
  index: number;
  publicKey: string;
  user: User | null;
}

export const useDriftSubaccounts = ({
  connection,
  driftClient,
}: UseDriftSubaccountsProps) => {
  const wallet = useWallet();
  const [subaccounts, setSubaccounts] = useState<SubaccountData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { activeSubaccountIndex, setActiveSubaccountIndex } =
    useDriftSubaccountStore();

  const getSubaccountUser = useCallback(
    async (
      client: DriftClient,
      subAccountId: number = activeSubaccountIndex,
      authority?: PublicKey
    ) => {
      if (!client) {
        setError(new Error("Drift client not initialized"));
        return null;
      }

      try {
        const user = client.getUser(subAccountId, authority);
        return user;
      } catch (error) {
        console.error(
          `Error getting user for subaccount ${subAccountId}:`,
          error
        );
        setError(
          error instanceof Error ? error : new Error("Unknown error occurred")
        );
        return null;
      }
    },
    [activeSubaccountIndex]
  );

  const fetchSubaccounts = useCallback(async () => {
    if (!wallet.publicKey || !driftClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const subaccountPubkeysPromises = Array.from({ length: 10 }, (_, i) =>
        getUserAccountPublicKey(
          new PublicKey(DRIFT_PROGRAM_ID),
          wallet.publicKey!,
          i
        )
      );

      const subaccountPubkeys = await Promise.all(subaccountPubkeysPromises);

      const accountInfos = await connection.getMultipleAccountsInfo(
        subaccountPubkeys
      );

      const validSubaccounts: SubaccountData[] = [];

      for (let i = 0; i < accountInfos.length; i++) {
        if (accountInfos[i] !== null) {
          const user = await getSubaccountUser(
            driftClient,
            i,
            wallet.publicKey
          );
          if (user) {
            validSubaccounts.push({
              index: i,
              publicKey: subaccountPubkeys[i].toString(),
              user: user,
            });
          }
        }
      }

      setSubaccounts(validSubaccounts);
    } catch (error) {
      console.error("Error fetching subaccounts:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to fetch subaccounts")
      );
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, driftClient, getSubaccountUser, connection]);

  useEffect(() => {
    if (driftClient && wallet.publicKey) {
      fetchSubaccounts();
    }
  }, [driftClient, wallet.publicKey, fetchSubaccounts]);

  // Set the active subaccount in the Drift client when it changes or when the client is initialized
  useEffect(() => {
    if (driftClient && wallet.publicKey) {
      const switchToStoredSubaccount = async () => {
        try {
          await driftClient.switchActiveUser(activeSubaccountIndex);
          console.log(`Switched to stored subaccount ${activeSubaccountIndex}`);
        } catch (error) {
          console.error(
            `Error switching to subaccount ${activeSubaccountIndex}:`,
            error
          );
          if (activeSubaccountIndex !== 0) {
            setActiveSubaccountIndex(0);
            try {
              await driftClient.switchActiveUser(0);
            } catch (err) {
              console.error("Error switching to default subaccount:", err);
            }
          }
        }
      };

      switchToStoredSubaccount();
    }
  }, [
    driftClient,
    wallet.publicKey,
    activeSubaccountIndex,
    setActiveSubaccountIndex,
  ]);

  return {
    subaccounts,
    isLoading,
    error,
    activeSubaccountIndex,
    setActiveSubaccountIndex,
    getSubaccountUser,
    refreshSubaccounts: fetchSubaccounts,
  };
};
