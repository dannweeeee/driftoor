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

export const useDriftSpotUsdcPosition = () => {
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
  
      await driftUser.fetchAccounts();
  
      // Get the USDC spot market account
      const spotMarket = driftClient.getSpotMarketAccount(0);
      console.log("SPOT MARKET", spotMarket);
      if (!spotMarket) {
        console.error("Spot market not found");
        throw new Error("Spot market not found");
      }
  
      const spotPosition = driftClient.getSpotPosition(0);
      console.log("SPOT POSITION", spotPosition);
      if (!spotPosition) {
        console.error("Spot position not found");
        throw new Error("Spot position not found");
      }
  
      const scaledBalance = spotPosition.scaledBalance || ZERO;
      const balanceType = spotPosition.balanceType || SpotBalanceType.DEPOSIT;
  
      const tokenAmount = getTokenAmount(
        scaledBalance,
        spotMarket,
        balanceType
      );
  
      console.log("TOKEN AMOUNT", tokenAmount);
      const decimals = spotMarket.decimals;
      const convertedAmount = convertToNumber(tokenAmount, new BN(decimals));
  
      setSpotPosition({ tokenAmount: convertedAmount });
      console.log("Spot position fetched successfully:", convertedAmount);
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
