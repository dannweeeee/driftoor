"use client";

import { useCallback, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  DRIFT_PROGRAM_ID,
  DriftClient,
  User,
  calculateEntryPrice,
  calculatePositionPNL,
  getUserAccountPublicKey,
} from "@drift-labs/sdk";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { useDriftClient } from "@/contexts/drift-client-context";

// Helper function to format token amounts
const formatTokenAmount = (
  amount: number,
  decimals: number,
  divisor: number
): number => {
  return Number((amount / divisor).toFixed(decimals));
};

interface DriftPositionData {
  totalDeposit: number;
  costBasis: number;
  positionSizeSol: number;
  positionSizeUsd: number;
  entryPrice: number;
  pnl: number;
  currentPrice: number;
}

export const useDriftPosition = (connection: Connection) => {
  const { driftClient, driftUser, driftPosition } = useDriftClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to initialize Drift client for a specific subaccount
  const initializeForSubaccount = useCallback(
    async (wallet: WalletContextState, subaccountIndex: number = 0) => {
      if (!wallet.publicKey) {
        setError(new Error("Wallet not connected"));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const client = new DriftClient({
          connection,
          wallet: wallet as any,
          perpMarketIndexes: [0], // SOL-PERP
          env: "mainnet-beta",
          accountSubscription: {
            type: "websocket",
            resubTimeoutMs: 30000,
            commitment: "confirmed",
          },
        });

        // Get the user account public key for the specified subaccount
        const userAccountPublicKey = await getUserAccountPublicKey(
          new PublicKey(DRIFT_PROGRAM_ID),
          wallet.publicKey,
          subaccountIndex
        );

        console.log(
          `Subaccount ${subaccountIndex} public key:`,
          userAccountPublicKey.toString()
        );

        await client.subscribe();

        const driftUser = new User({
          driftClient: client,
          userAccountPublicKey,
          accountSubscription: {
            type: "websocket",
            resubTimeoutMs: 30000,
            commitment: "confirmed",
          },
        });

        await driftUser.subscribe();
        await driftUser.fetchAccounts();

        const userAccountExists = await driftUser.exists();
        if (!userAccountExists) {
          console.log("User account does not exist - needs initialization");
          setError(
            new Error("User account does not exist - needs initialization")
          );
          setIsLoading(false);
          return;
        }

        // Get position data
        const positionData = await getPositionData(client, driftUser);

        setIsLoading(false);
        return {
          client,
          user: driftUser,
          positionData,
        };
      } catch (error) {
        console.error("Error initializing Drift client for subaccount:", error);
        setError(
          error instanceof Error ? error : new Error("Unknown error occurred")
        );
        setIsLoading(false);
        return null;
      }
    },
    [connection]
  );

  // Function to get position data from an existing user
  const getPositionData = useCallback(
    async (
      client: DriftClient,
      user: User
    ): Promise<DriftPositionData | null> => {
      try {
        await user.fetchAccounts();

        const solPosition = user.getPerpPosition(0); // SOL-PERP
        if (!solPosition) {
          console.log("No SOL-PERP position found");
          return null;
        }

        // Get deposit information (using JitoSOL as an example, index 6)
        const spotMarketAccount = user.getSpotPosition(6); // JITOSOL
        const totalDepositJitoSol =
          spotMarketAccount?.cumulativeDeposits.toNumber() || 0;

        const costBasis = solPosition.quoteEntryAmount.toNumber();
        const positionSizeSol = solPosition.baseAssetAmount.toNumber();
        const entryPrice = calculateEntryPrice(solPosition).toNumber();
        const oracleData = client.getOracleDataForPerpMarket(0);
        const currentPrice = oracleData.price.toNumber();
        const positionSizeUsd = positionSizeSol * currentPrice;
        const marketAccount = await client.getPerpMarketAccount(0);
        const pnl = calculatePositionPNL(
          marketAccount!,
          solPosition,
          false,
          oracleData
        ).toNumber();

        return {
          totalDeposit: formatTokenAmount(totalDepositJitoSol, 4, 1e9),
          costBasis: formatTokenAmount(costBasis, 2, 1e6),
          positionSizeSol: formatTokenAmount(positionSizeSol, 4, 1e9),
          positionSizeUsd: formatTokenAmount(
            Math.abs(positionSizeUsd),
            2,
            1e15
          ),
          entryPrice: formatTokenAmount(entryPrice, 2, 1e6),
          currentPrice: formatTokenAmount(currentPrice, 2, 1e6),
          pnl: formatTokenAmount(pnl, 2, 1e6),
        };
      } catch (error) {
        console.error("Error getting position data:", error);
        setError(
          error instanceof Error ? error : new Error("Unknown error occurred")
        );
        return null;
      }
    },
    []
  );

  // Function to refresh position data using the current driftClient and driftUser
  const refreshPositionData = useCallback(async () => {
    if (!driftClient || !driftUser) {
      setError(new Error("Drift client or user not initialized"));
      return null;
    }

    try {
      setIsLoading(true);
      const positionData = await getPositionData(driftClient, driftUser);
      setIsLoading(false);
      return positionData;
    } catch (error) {
      console.error("Error refreshing position data:", error);
      setError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      setIsLoading(false);
      return null;
    }
  }, [driftClient, driftUser, getPositionData]);

  return {
    initializeForSubaccount,
    refreshPositionData,
    driftPosition,
    isLoading,
    error,
  };
};
