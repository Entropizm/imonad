"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { loadContracts } from "@/lib/contracts";
import MonadNFTABI from "@/lib/abis/MonadNFT.json";

interface NFTAppProps {
  onClose: () => void;
}

export default function NFTApp({ onClose }: NFTAppProps) {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState("");
  const [minting, setMinting] = useState(false);

  const contracts = loadContracts();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read mint price
  const { data: mintPrice } = useReadContract({
    address: contracts.nft as `0x${string}`,
    abi: MonadNFTABI,
    functionName: "mintPrice",
  }) as { data: bigint | undefined };

  const mint = async () => {
    if (!isConnected) {
      setStatus("Please connect wallet");
      return;
    }

    if (!contracts.nft) {
      setStatus("Contract not deployed");
      return;
    }

    try {
      setMinting(true);
      setStatus("Minting NFT...");

      writeContract({
        address: contracts.nft as `0x${string}`,
        abi: MonadNFTABI,
        functionName: "mint",
        value: mintPrice || parseEther("0.01"),
      });

      setTimeout(() => {
        setMinting(false);
      }, 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setMinting(false);
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      setStatus("✅ NFT minted successfully!");
    }, 1000);
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50 flex flex-col">
      <AppHeader title="NFT Mint" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Connect wallet to mint NFTs</p>
          </div>
        ) : !contracts.nft ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Contract not deployed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* NFT Preview */}
            <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl p-6">
                <div className={`aspect-square bg-gradient-to-br from-purple-200 via-blue-200 to-cyan-200 rounded-2xl flex items-center justify-center ${minting ? "animate-pulse" : ""}`}>
                  <div className="text-center">
                    <div className="text-7xl mb-4">💎</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Monad Testnet NFT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mint Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {mintPrice ? formatEther(mintPrice) : "0.01"} MON
                </div>
                <div className="text-sm text-gray-600">Mint Price</div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Collection:</span>
                  <span className="font-semibold">Monad Testnet NFT</span>
                </div>
                <div className="flex justify-between">
                  <span>Symbol:</span>
                  <span className="font-semibold">MNFT</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard:</span>
                  <span className="font-semibold">ERC-721</span>
                </div>
              </div>
            </div>

            {/* Mint Button */}
            <button
              onClick={mint}
              disabled={minting || isPending || isConfirming}
              className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white font-bold text-xl py-4 rounded-2xl shadow-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {minting || isPending || isConfirming ? "💎 MINTING..." : "💎 MINT NFT"}
            </button>

            {/* Status */}
            {status && (
              <div className={`text-center text-sm py-2 px-3 rounded-xl ${
                status.includes("✅") 
                  ? "bg-green-100 text-green-800" 
                  : status.includes("Error") 
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {status}
              </div>
            )}

            {/* Features */}
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-2xl p-4 text-sm">
              <div className="font-bold text-gray-800 mb-2">✨ Features:</div>
              <ul className="space-y-1 text-gray-600">
                <li>• Unique on-chain NFT on Monad Testnet</li>
                <li>• Permanent ownership via ERC-721</li>
                <li>• Transferable & tradeable</li>
                <li>• Supports batch minting</li>
              </ul>
            </div>

            {/* Contract Info */}
            <div className="text-xs text-gray-500 text-center">
              Contract: {contracts.nft?.slice(0, 6)}...{contracts.nft?.slice(-4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

