"use client";

import { useCallback, useState, useEffect } from "react";
import { calculateEntryPrice, calculatePositionPNL } from "@drift-labs/sdk";
import { useDriftClient } from "@/contexts/drift-client-context";
import { formatTokenAmount } from "@/helpers/formatTokenAmount";

interface DriftPosition {
  totalDeposit: number;
  costBasis: number;
  positionSizeSol: number;
  positionSizeUsd: number;
  entryPrice: number;
  pnl: number;
  currentPrice: number;
}

export const useDriftPosition = () => {
  const { driftClient, driftUser, isSubscribed } = useDriftClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [position, setPosition] = useState<DriftPosition>({
    totalDeposit: 0,
    costBasis: 0,
    positionSizeSol: 0,
    positionSizeUsd: 0,
    entryPrice: 0,
    pnl: 0,
    currentPrice: 0,
  });

  // Fetch position data
  const fetchPositionData = useCallback(async () => {
    if (!driftClient || !driftUser || !isSubscribed) {
      return;
    }

    try {
      setIsLoading(true);
      await driftUser.fetchAccounts();

      // Get SOL-PERP position (index 0)
      const solPosition = driftUser.getPerpPosition(0);
      if (!solPosition) {
        console.log("No SOL-PERP position found");
        setIsLoading(false);
        return;
      }

      // Get deposit information (using JitoSOL as an example, index 6)
      const spotMarketAccount = driftUser.getSpotPosition(6);
      const totalDepositJitoSol =
        spotMarketAccount?.cumulativeDeposits.toNumber() || 0;

      const costBasis = solPosition.quoteEntryAmount.toNumber();
      const positionSizeSol = solPosition.baseAssetAmount.toNumber();
      const entryPrice = calculateEntryPrice(solPosition).toNumber();
      const oracleData = driftClient.getOracleDataForPerpMarket(0);
      const currentPrice = oracleData.price.toNumber();
      const positionSizeUsd = positionSizeSol * currentPrice;
      const marketAccount = await driftClient.getPerpMarketAccount(0);
      const pnl = calculatePositionPNL(
        marketAccount!,
        solPosition,
        false,
        oracleData
      ).toNumber();

      // Format and set position data
      setPosition({
        totalDeposit: formatTokenAmount(totalDepositJitoSol, 4, 1e9),
        costBasis: formatTokenAmount(costBasis, 2, 1e6),
        positionSizeSol: formatTokenAmount(positionSizeSol, 4, 1e9),
        positionSizeUsd: formatTokenAmount(Math.abs(positionSizeUsd), 2, 1e15),
        entryPrice: formatTokenAmount(entryPrice, 2, 1e6),
        currentPrice: formatTokenAmount(currentPrice, 2, 1e6),
        pnl: formatTokenAmount(pnl, 2, 1e6),
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching position data:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setIsLoading(false);
    }
  }, [driftClient, driftUser, isSubscribed]);

  // Fetch position data when client is subscribed
  useEffect(() => {
    if (isSubscribed && driftClient && driftUser) {
      fetchPositionData();
    }
  }, [isSubscribed, driftClient, driftUser, fetchPositionData]);

  return {
    position,
    isLoading,
    error,
    fetchPositionData,
  };
};
