import { PERP_MARKETS, SPOT_MARKETS } from "@/constants";
import { MarketAndAccount } from "@drift-labs/react";
import { UIMarket } from "@drift-labs/common";

export const marketsAndAccounts: MarketAndAccount[] = [];

SPOT_MARKETS.forEach((market) => {
  marketsAndAccounts.push({
    market: UIMarket.createSpotMarket(market.marketIndex),
    accountToUse: market.oracle,
  });
});

PERP_MARKETS.forEach((market) => {
  marketsAndAccounts.push({
    market: UIMarket.createPerpMarket(market.marketIndex),
    accountToUse: market.oracle,
  });
});
