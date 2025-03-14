"use client";

import { useCallback, useState, useEffect } from "react";
import {
  getTokenAmount,
  convertToNumber,
  BN,
  ZERO,
  SpotBalanceType,
} from "@drift-labs/sdk";
import { useDriftClient } from "@/contexts/drift-client-context";

interface SpotUsdcPosition {
  tokenAmount: number;
}

export const useDriftSpotPosition = () => {
  const { driftClient, driftUser, isSubscribed } = useDriftClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [spotPosition, setSpotPosition] = useState<SpotUsdcPosition | null>(
    null
  );

  const fetchSpotPosition = useCallback(async () => {
    if (!driftClient || !driftUser || !isSubscribed) {
      console.log("Error in driftClient, driftUser, or isSubscribed");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching spot market account for index:", 0);

      try {
        await driftUser.fetchAccounts();
      } catch (fetchError) {
        console.warn("Error fetching accounts, continuing anyway:", fetchError);
      }

      let userExists = false;
      try {
        userExists = await driftUser.exists();
      } catch (error) {
        console.warn("Error checking if user exists:", error);
      }

      if (!userExists) {
        console.log("User does not exist yet, setting default position");
        setSpotPosition({ tokenAmount: 0 });
        setIsLoading(false);
        return;
      }

      let spotMarket;
      try {
        try {
          spotMarket = driftClient.getSpotMarketAccount(0);
          console.log("SPOT MARKET", spotMarket);
        } catch (marketError) {
          console.warn(
            "Error getting spot market account directly:",
            marketError
          );
        }

        if (!spotMarket) {
          console.log("Spot market not found, trying to reinitialize");

          try {
            await driftClient.unsubscribe();

            const currentOptions =
              (driftClient as any)._driftClientInternalOptions || {};
            const newOptions = {
              ...currentOptions,
              spotMarketIndexes: [0], // usdc market
            };

            await driftClient.subscribe();

            spotMarket = driftClient.getSpotMarketAccount(0);
          } catch (subError) {
            console.warn("Error reinitializing drift client:", subError);
          }
        }
      } catch (error) {
        console.warn("Error getting spot market account:", error);
      }

      if (!spotMarket) {
        console.log("Spot market not found, setting default position");
        setSpotPosition({ tokenAmount: 0 });
        setIsLoading(false);
        return;
      }

      let spotPosition;
      try {
        spotPosition = driftUser.getSpotPosition(0);
        console.log("SPOT POSITION", spotPosition);
      } catch (error) {
        console.warn("Error getting spot position:", error);
      }

      if (!spotPosition) {
        console.log("Spot position not found, setting default position");
        setSpotPosition({ tokenAmount: 0 });
        setIsLoading(false);
        return;
      }

      const scaledBalance = spotPosition.scaledBalance || ZERO;
      const balanceType = spotPosition.balanceType || SpotBalanceType.DEPOSIT;

      let tokenAmount;
      try {
        tokenAmount = getTokenAmount(scaledBalance, spotMarket, balanceType);
      } catch (error) {
        console.warn("Error getting token amount:", error);
        setSpotPosition({ tokenAmount: 0 });
        setIsLoading(false);
        return;
      }

      const decimals = spotMarket.decimals || 6;

      let basicAmount = 0;
      try {
        basicAmount = convertToNumber(tokenAmount, new BN(decimals));
      } catch (error) {
        console.warn("Error in basic conversion:", error);
        basicAmount = Number(tokenAmount.toString()) / Math.pow(10, decimals);
      }

      const convertedAmount = basicAmount * 6;

      setSpotPosition({ tokenAmount: convertedAmount });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching spot position data:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setIsLoading(false);
    }
  }, [driftClient, driftUser, isSubscribed]);

  useEffect(() => {
    if (isSubscribed && driftClient && driftUser) {
      console.log("Fetching spot position");
      fetchSpotPosition();
    }
  }, [isSubscribed, driftClient, driftUser, fetchSpotPosition]);

  return {
    spotPosition,
    isLoading,
    error,
    fetchSpotPosition,
  };
};
