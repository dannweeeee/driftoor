export const formatBalance = (user: any) => {
  if (!user || !user.getQuoteBalance) return "N/A";
  try {
    const balance = user.getQuoteBalance();
    return `$${balance.toFixed(2)}`;
  } catch (error) {
    return "N/A";
  }
};
