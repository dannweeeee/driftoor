import { PublicKey } from "@solana/web3.js";

/**
 * Formats a PublicKey object to a string representation.
 * If the input is null or undefined, returns null.
 * 
 * @param publicKey - The PublicKey object to format or null/undefined
 * @returns The string representation of the PublicKey or null
 */
export const formatPublicKey = (
  publicKey: PublicKey | null | undefined
): string | null => {
  if (!publicKey) return null;
  return publicKey.toString();
};
