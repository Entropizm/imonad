"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { loadContracts } from "@/lib/contracts";
import MonadSlotsABI from "@/lib/abis/MonadSlots.json";

interface SlotsAppProps {
  onClose: () => void;
}

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];

export default function SlotsApp({ onClose }: SlotsAppProps) {
  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState("0.01");
  const [reels, setReels] = useState(["🎰", "🎰", "🎰"]);
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState("");

  const contracts = loadContracts();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const spin = async () => {
    if (!isConnected) {
      setStatus("Please connect wallet");
      return;
    }

    if (!contracts.slots) {
      setStatus("Contract not deployed");
      return;
    }

    try {
      setSpinning(true);
      setStatus("Spinning...");

      // Animate reels
      const interval = setInterval(() => {
        setReels([
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ]);
      }, 100);

      writeContract({
        address: contracts.slots as `0x${string}`,
        abi: MonadSlotsABI,
        functionName: "play",
        value: parseEther(betAmount),
      });

      setTimeout(() => {
        clearInterval(interval);
        setSpinning(false);
      }, 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setSpinning(false);
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      setStatus("✅ Spin complete! Check transaction for result.");
    }, 1000);
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-red-50 via-yellow-50 to-orange-50 flex flex-col">
      <AppHeader title="Slots" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Connect wallet to play</p>
          </div>
        ) : !contracts.slots ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Contract not deployed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Slot Machine */}
            <div className="bg-gradient-to-b from-red-600 via-red-500 to-red-600 rounded-3xl p-6 shadow-2xl border-4 border-yellow-500">
              {/* Display */}
              <div className="bg-black rounded-2xl p-6 mb-4">
                <div className="flex justify-center items-center gap-2">
                  {reels.map((symbol, i) => (
                    <div
                      key={i}
                      className={`bg-white rounded-xl w-20 h-24 flex items-center justify-center text-5xl ${
                        spinning ? "animate-pulse" : ""
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bet Amount */}
              <div className="bg-white/20 rounded-xl p-3 mb-4">
                <label className="block text-xs font-medium text-white mb-2">
                  Bet Amount (MON)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                  max="1"
                  disabled={spinning || isPending || isConfirming}
                  className="w-full px-4 py-2 rounded-lg border-2 border-yellow-500 bg-gray-900 text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                />
              </div>

              {/* Spin Button */}
              <button
                onClick={spin}
                disabled={spinning || isPending || isConfirming}
                className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black text-xl py-4 rounded-xl shadow-xl active:scale-95 transition-transform disabled:opacity-50 border-4 border-yellow-300"
              >
                {spinning || isPending || isConfirming ? "🎰 SPINNING..." : "🎰 SPIN"}
              </button>
            </div>

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

            {/* Payouts */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="font-bold text-gray-800 mb-3 text-center">💰 Payouts</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>7️⃣ 7️⃣ 7️⃣</span>
                  <span className="font-bold text-yellow-600">100x JACKPOT!</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>💎 💎 💎</span>
                  <span className="font-bold text-purple-600">50x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🍇 🍇 🍇</span>
                  <span className="font-bold text-blue-600">10x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Any 3 match</span>
                  <span className="font-bold text-green-600">5x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Any 2 match</span>
                  <span className="font-bold text-gray-600">2x</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
                House edge: 0.5%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

