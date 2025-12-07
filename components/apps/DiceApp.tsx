"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { loadContracts } from "@/lib/contracts";
import MonadDiceABI from "@/lib/abis/MonadDice.json";

interface DiceAppProps {
  onClose: () => void;
}

export default function DiceApp({ onClose }: DiceAppProps) {
  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState("0.01");
  const [betType, setBetType] = useState<"over" | "under" | "exact">("over");
  const [threshold, setThreshold] = useState(50);
  const [exactNumber, setExactNumber] = useState(6);
  const [status, setStatus] = useState("");
  const [rolling, setRolling] = useState(false);

  const contracts = loadContracts();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const roll = async () => {
    if (!isConnected) {
      setStatus("Please connect wallet");
      return;
    }

    if (!contracts.dice) {
      setStatus("Contract not deployed");
      return;
    }

    try {
      setRolling(true);
      setStatus("Rolling dice...");

      if (betType === "exact") {
        writeContract({
          address: contracts.dice as `0x${string}`,
          abi: MonadDiceABI,
          functionName: "betExactNumber",
          args: [BigInt(exactNumber)],
          value: parseEther(betAmount),
        });
      } else {
        writeContract({
          address: contracts.dice as `0x${string}`,
          abi: MonadDiceABI,
          functionName: betType === "over" ? "betOver" : "betUnder",
          args: [BigInt(threshold)],
          value: parseEther(betAmount),
        });
      }

      setTimeout(() => {
        setRolling(false);
      }, 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setRolling(false);
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      setStatus("✅ Roll complete! Check transaction for result.");
    }, 1000);
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <AppHeader title="Dice Game" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Connect wallet to play</p>
          </div>
        ) : !contracts.dice ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Contract not deployed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dice Display */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
              <div className={`bg-white rounded-2xl p-8 flex items-center justify-center ${rolling ? "animate-bounce" : ""}`}>
                <div className="text-8xl">🎲</div>
              </div>
            </div>

            {/* Bet Type Selection */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Bet Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBetType("over")}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    betType === "over"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Over
                </button>
                <button
                  onClick={() => setBetType("under")}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    betType === "under"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Under
                </button>
                <button
                  onClick={() => setBetType("exact")}
                  className={`py-3 rounded-xl font-bold transition-all ${
                    betType === "exact"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Exact
                </button>
              </div>
            </div>

            {/* Threshold/Number Selection */}
            {betType === "exact" ? (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Exact Number (1-6) - Pays 6x!
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setExactNumber(num)}
                      className={`aspect-square rounded-xl font-bold text-xl transition-all ${
                        exactNumber === num
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Threshold: {threshold}
                </label>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>50</span>
                  <span>99</span>
                </div>
              </div>
            )}

            {/* Bet Amount */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Bet Amount (MON)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                step="0.001"
                min="0.001"
                max="1"
                disabled={rolling || isPending || isConfirming}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-center font-bold disabled:opacity-50"
              />
            </div>

            {/* Roll Button */}
            <button
              onClick={roll}
              disabled={rolling || isPending || isConfirming}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-black text-xl py-4 rounded-2xl shadow-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {rolling || isPending || isConfirming ? "🎲 ROLLING..." : "🎲 ROLL DICE"}
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

            {/* Info */}
            <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
              <div className="font-bold mb-2">🎯 Payouts:</div>
              <ul className="space-y-1">
                <li>• Over/Under win: ~2x (minus 0.5% fee)</li>
                <li>• Exact number: 6x!</li>
                <li>• Provably fair using blockchain randomness</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

