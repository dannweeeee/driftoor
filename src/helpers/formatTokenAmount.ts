export const formatTokenAmount = (
  amount: number,
  decimals: number,
  divisor: number
): number => {
  return Number((amount / divisor).toFixed(decimals));
};
