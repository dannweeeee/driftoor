import { PublicKey } from "@solana/web3.js";

export const formatPublicKey = (
  publicKey: PublicKey | string | null | undefined
): string | null => {
  if (!publicKey) return null;

  const pubKeyStr =
    typeof publicKey === "string" ? publicKey : publicKey.toString();

  if (pubKeyStr.length <= 10) return pubKeyStr;

  return pubKeyStr;
};
