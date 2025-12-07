import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";
import { http } from "wagmi";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://monad-testnet.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://monad-testnet.socialscan.io",
    },
  },
  testnet: true,
});

// Get project ID with fallback for development
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder";

if (projectId === "placeholder" && typeof window !== "undefined") {
  console.warn(
    "⚠️ WalletConnect Project ID not set. Get one at https://cloud.walletconnect.com"
  );
}

export const config = getDefaultConfig({
  appName: "iOS 4 Monad",
  projectId,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http("https://monad-testnet.drpc.org"),
  },
  ssr: true,
  appDescription: "Retro iOS 4 experience on Monad Testnet",
  appUrl: "https://monad.xyz",
  appIcon: "/imonad-logo.png",
});

