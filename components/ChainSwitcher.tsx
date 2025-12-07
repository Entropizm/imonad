"use client";

import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/lib/wagmi";

export default function ChainSwitcher() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Automatically switch to Monad Testnet if connected to wrong network
    if (isConnected && chain && chain.id !== monadTestnet.id) {
      console.log("Wrong network detected, switching to Monad Testnet...");
      switchChain?.({ chainId: monadTestnet.id });
    }
  }, [isConnected, chain, switchChain]);

  // Show notification if on wrong network
  if (isConnected && chain && chain.id !== monadTestnet.id) {
    return (
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
        <div className="bg-yellow-500 text-black px-6 py-3 rounded-2xl shadow-2xl border-2 border-yellow-600">
          <p className="text-sm font-bold text-center">
            ⚠️ Please switch to Monad Testnet
          </p>
        </div>
      </div>
    );
  }

  return null;
}

