"use client";

import { useState, useCallback } from "react";
import { DriftClient } from "@drift-labs/sdk";
import { toast } from "sonner";
import { useDriftSubaccountStore } from "@/stores/useDriftSubaccountStore";

interface UseDriftSwitchSubaccountProps {
  driftClient: DriftClient | null;
}

interface SwitchSubaccountResult {
  switchSubaccount: (index: number) => Promise<boolean>;
  isSwitching: boolean;
  error: Error | null;
}

/**
 * Hook for switching between Drift subaccounts
 * Uses Zustand store to persist the active subaccount index
 *
 * @param driftClient The Drift client instance
 * @returns Object containing the switchSubaccount function, loading state, and error
 */
export const useDriftSwitchSubaccount = ({
  driftClient,
}: UseDriftSwitchSubaccountProps): SwitchSubaccountResult => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setActiveSubaccountIndex } = useDriftSubaccountStore();

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
        // Switch the active user in the Drift client
        await driftClient.switchActiveUser(index);

        // Update the active subaccount index in the Zustand store
        setActiveSubaccountIndex(index);

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
    [driftClient, setActiveSubaccountIndex]
  );

  return {
    switchSubaccount,
    isSwitching,
    error,
  };
};
