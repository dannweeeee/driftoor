"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Connection,
  PublicKey,
  Keypair,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  Wallet,
  loadKeypair,
  calculateEntryPrice,
  calculatePositionPNL,
  DRIFT_PROGRAM_ID,
  getUserAccountPublicKey,
} from "@drift-labs/sdk";
import { useDriftClientStore } from "@/stores/useDriftClientStore";
import { WalletContextState } from "@solana/wallet-adapter-react";

interface UseDriftOptions {
  autoConnect?: boolean;
  env?: "mainnet-beta" | "devnet";
  rpcUrl?: string;
  keypairPath?: string;
  perpMarketIndexes?: number[];
}

interface DriftPosition {
  totalDeposit: number;
  costBasis: number;
  positionSizeSol: number;
  positionSizeUsd: number;
  entryPrice: number;
  pnl: number;
  currentPrice: number;
}

export const useDriftClient = (options: UseDriftOptions = {}) => {
  const {
    autoConnect = false,
    env = "mainnet-beta",
    rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    keypairPath,
    perpMarketIndexes = [0], // Default to SOL-PERP
  } = options;

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [driftPosition, setDriftPosition] = useState<DriftPosition>({
    totalDeposit: 0,
    costBasis: 0,
    positionSizeSol: 0,
    positionSizeUsd: 0,
    entryPrice: 0,
    pnl: 0,
    currentPrice: 0,
  });

  const {
    connection,
    wallet,
    driftClient,
    driftUser,
    isInitialized,
    isSubscribed,
    isLoading,
    error,
    initializeDriftClient: storeInitializeDriftClient,
    subscribeToDriftClient,
    resetDriftClient,
    getUserAccount,
  } = useDriftClientStore();

  const connectWithKeypair = async (keypairFilePath: string) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Create connection
      const newConnection = new Connection(rpcUrl, "confirmed");

      // Load wallet from keypair
      const newWallet = new Wallet(loadKeypair(keypairFilePath));

      // Initialize Drift client
      await storeInitializeDriftClient(
        newConnection,
        newWallet,
        env,
        perpMarketIndexes
      );

      // Subscribe to Drift client
      await subscribeToDriftClient();

      setIsConnecting(false);
    } catch (err) {
      console.error("Error connecting to Drift:", err);
      setConnectionError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setIsConnecting(false);
    }
  };

  // Initialize Drift client with a wallet adapter
  const initializeWithWallet = useCallback(
    async (walletAdapter: WalletContextState, connection: Connection) => {
      if (
        !walletAdapter.publicKey ||
        !walletAdapter.signTransaction ||
        !walletAdapter.signAllTransactions
      ) {
        setConnectionError(
          new Error("Wallet not connected or missing required methods")
        );
        return false;
      }

      try {
        setIsConnecting(true);
        setConnectionError(null);

        // Create a Drift SDK compatible wallet from the wallet adapter
        const driftWallet: Wallet = {
          publicKey: walletAdapter.publicKey,
          signTransaction: walletAdapter.signTransaction,
          signAllTransactions: walletAdapter.signAllTransactions,
          // Create a dummy keypair for payer since we can't access the actual keypair
          payer: Keypair.generate(), // This is just a placeholder
          signVersionedTransaction: async (tx: VersionedTransaction) => {
            return await walletAdapter.signTransaction!(tx as any);
          },
          signAllVersionedTransactions: async (txs: VersionedTransaction[]) => {
            return await walletAdapter.signAllTransactions!(txs as any[]);
          },
        };

        // Initialize Drift client
        await storeInitializeDriftClient(
          connection,
          driftWallet,
          env,
          perpMarketIndexes
        );

        // Subscribe to Drift client
        await subscribeToDriftClient();

        // Check if user account exists
        const userExists = await getUserAccount();

        if (!userExists) {
          console.warn("User account does not exist - needs initialization");
        }

        setIsConnecting(false);
        return true;
      } catch (err) {
        console.error("Error initializing Drift client with wallet:", err);
        setConnectionError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        setIsConnecting(false);
        return false;
      }
    },
    [
      env,
      perpMarketIndexes,
      storeInitializeDriftClient,
      subscribeToDriftClient,
      getUserAccount,
    ]
  );

  // Fetch position data
  const fetchPositionData = useCallback(async () => {
    if (!driftClient || !driftUser || !isSubscribed) {
      return;
    }

    try {
      await driftUser.fetchAccounts();

      // Get SOL-PERP position (index 0)
      const solPosition = driftUser.getPerpPosition(0);
      if (!solPosition) {
        console.log("No SOL-PERP position found");
        return;
      }

      // Get deposit information (using JitoSOL as an example, index 6)
      const spotMarketAccount = driftUser.getSpotPosition(6); // JITOSOL
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
      setDriftPosition({
        totalDeposit: formatTokenAmount(totalDepositJitoSol, 4, 1e9),
        costBasis: formatTokenAmount(costBasis, 2, 1e6),
        positionSizeSol: formatTokenAmount(positionSizeSol, 4, 1e9),
        positionSizeUsd: formatTokenAmount(Math.abs(positionSizeUsd), 2, 1e15),
        entryPrice: formatTokenAmount(entryPrice, 2, 1e6),
        currentPrice: formatTokenAmount(currentPrice, 2, 1e6),
        pnl: formatTokenAmount(pnl, 2, 1e6),
      });
    } catch (error) {
      console.error("Error fetching position data:", error);
    }
  }, [driftClient, driftUser, isSubscribed]);

  // Helper function to format token amounts
  const formatTokenAmount = (
    amount: number,
    decimals: number,
    divisor: number
  ): number => {
    return Number((amount / divisor).toFixed(decimals));
  };

  // Auto-connect if keypairPath is provided and autoConnect is true
  useEffect(() => {
    if (autoConnect && keypairPath && !isInitialized && !isConnecting) {
      connectWithKeypair(keypairPath);
    }
  }, [autoConnect, keypairPath, isInitialized, isConnecting]);

  // Fetch position data when client is subscribed
  useEffect(() => {
    if (isSubscribed && driftClient && driftUser) {
      fetchPositionData();
    }
  }, [isSubscribed, driftClient, driftUser, fetchPositionData]);

  return {
    connection,
    wallet,
    driftClient,
    driftUser,
    isInitialized,
    isSubscribed,
    isLoading: isLoading || isConnecting,
    error: error || connectionError,
    connectWithKeypair,
    resetDriftClient,
    initializeWithWallet,
    fetchPositionData,
    driftPosition,
  };
};

// Helper function to get a user account public key for a specific authority
export const getDriftUserAccountPublicKey = async (
  authority: PublicKey,
  accountNum = 0
): Promise<PublicKey> => {
  return await getUserAccountPublicKey(
    new PublicKey(DRIFT_PROGRAM_ID),
    authority,
    accountNum
  );
};
