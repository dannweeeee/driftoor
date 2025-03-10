"use client";

import { useState, useCallback } from "react";
import { DriftClient, User } from "@drift-labs/sdk";
import { toast } from "sonner";
import { useDriftSubaccountStore } from "@/stores/useDriftSubaccountStore";
import { useDriftClientStore } from "@/stores/useDriftClientStore";

interface UseDriftSwitchSubaccountProps {
  driftClient: DriftClient | null;
}

interface SwitchSubaccountResult {
  switchSubaccount: (index: number) => Promise<boolean>;
  isSwitching: boolean;
  error: Error | null;
}

export const useDriftSwitchSubaccount = ({
  driftClient,
}: UseDriftSwitchSubaccountProps): SwitchSubaccountResult => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setActiveSubaccountIndex } = useDriftSubaccountStore();

  const updateDriftUser = useDriftClientStore((state) => state.updateDriftUser);

  const switchSubaccount = useCallback(
    async (index: number): Promise<boolean> => {
      if (!driftClient) {
        const err = new Error("Drift client not initialized");
        setError(err);
        toast.error(err.message);
        return false;
      }

      setIsSwitching(true);
      setError(null);

      try {
        await driftClient.switchActiveUser(index);

        setActiveSubaccountIndex(index);

        // Update the driftUser in the useDriftClientStore
        try {
          const userAccountPublicKey =
            await driftClient.getUserAccountPublicKey();

          // Create a new User instance for the new subaccount
          const newDriftUser = new User({
            driftClient,
            userAccountPublicKey,
            accountSubscription: {
              type: "websocket",
              resubTimeoutMs: 30000,
              commitment: "confirmed",
            },
          });

          // Subscribe to the new user
          await newDriftUser.subscribe();

          // Update the driftUser in the store using the updateDriftUser function
          updateDriftUser(newDriftUser);
        } catch (userErr) {
          console.error("Error updating driftUser:", userErr);
        }

        toast.success(`Switched to Subaccount ${index}`);
        return true;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to switch subaccount");

        console.error("Error switching subaccount:", error);
        setError(error);
        toast.error(error.message);
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    [driftClient, setActiveSubaccountIndex, updateDriftUser]
  );

  return {
    switchSubaccount,
    isSwitching,
    error,
  };
};
