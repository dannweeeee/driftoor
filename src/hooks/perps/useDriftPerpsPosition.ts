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

export const useDriftPerpsPosition = () => {
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

  const fetchPositionData = useCallback(async () => {
    if (!driftClient || !driftUser || !isSubscribed) {
      return;
    }

    try {
      setIsLoading(true);

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
        console.log("User does not exist yet, using default position");
        setIsLoading(false);
        return;
      }

      let solPosition;
      try {
        solPosition = driftUser.getPerpPosition(0);
        console.log("SOL-PERP position:", solPosition);
      } catch (error) {
        console.warn("Error getting perp position:", error);
      }

      if (!solPosition) {
        console.log("No SOL-PERP position found");
        setIsLoading(false);
        return;
      }

      let spotMarketAccount;
      try {
        spotMarketAccount = driftUser.getSpotPosition(0);
      } catch (error) {
        console.warn("Error getting spot position:", error);
      }

      const totalDepositUsdc =
        spotMarketAccount?.cumulativeDeposits?.toNumber() || 0;

      let costBasis = 0;
      let positionSizeSol = 0;
      let entryPrice = 0;
      let currentPrice = 0;
      let positionSizeUsd = 0;
      let pnl = 0;

      try {
        costBasis = solPosition.quoteEntryAmount.toNumber();
        positionSizeSol = solPosition.baseAssetAmount.toNumber();
        entryPrice = calculateEntryPrice(solPosition).toNumber();
      } catch (error) {
        console.warn("Error calculating position metrics:", error);
      }

      let oracleData;
      try {
        oracleData = driftClient.getOracleDataForPerpMarket(0);
        if (oracleData && oracleData.price) {
          currentPrice = oracleData.price.toNumber();
          positionSizeUsd = positionSizeSol * currentPrice;
        }
      } catch (error) {
        console.warn("Error getting oracle data:", error);
      }

      try {
        if (oracleData) {
          const marketAccount = await driftClient.getPerpMarketAccount(0);
          if (marketAccount) {
            pnl = calculatePositionPNL(
              marketAccount,
              solPosition,
              false,
              oracleData
            ).toNumber();
          }
        }
      } catch (error) {
        console.warn("Error calculating PNL:", error);
      }

      setPosition({
        totalDeposit: formatTokenAmount(totalDepositUsdc, 6, 1e6),
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
