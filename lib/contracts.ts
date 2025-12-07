// Contract addresses - will be populated after deployment
export const CONTRACTS = {
  faucet: "",
  disperser: "",
  blackjack: "",
  slots: "",
  dice: "",
  nft: "",
  leaderboard: "",
  guestbook: "",
  escrow: "",
  prediction: "",
  savings: "",
};

// This function loads deployed contract addresses
export function loadContracts() {
  try {
    const deployments = require("../deployments/monadTestnet.json");
    return deployments.contracts;
  } catch {
    return CONTRACTS;
  }
}

