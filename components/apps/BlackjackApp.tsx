"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { loadContracts } from "@/lib/contracts";
import MonadBlackjackABI from "@/lib/abis/MonadBlackjack.json";

interface BlackjackAppProps {
  onClose: () => void;
}

export default function BlackjackApp({ onClose }: BlackjackAppProps) {
  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState("0.01");
  const [gameId, setGameId] = useState<bigint | null>(null);
  const [status, setStatus] = useState("");

  const contracts = loadContracts();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read game state
  const { data: gameData } = useReadContract({
    address: contracts.blackjack as `0x${string}`,
    abi: MonadBlackjackABI,
    functionName: "getGame",
    args: gameId !== null ? [gameId] : undefined,
  }) as { data: any };

  const startGame = async () => {
    if (!isConnected) {
      setStatus("Please connect wallet");
      return;
    }

    try {
      setStatus("Starting game...");
      writeContract({
        address: contracts.blackjack as `0x${string}`,
        abi: MonadBlackjackABI,
        functionName: "startGame",
        value: parseEther(betAmount),
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const hit = async () => {
    if (gameId === null) return;
    
    try {
      setStatus("Drawing card...");
      writeContract({
        address: contracts.blackjack as `0x${string}`,
        abi: MonadBlackjackABI,
        functionName: "hit",
        args: [gameId],
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const stand = async () => {
    if (gameId === null) return;
    
    try {
      setStatus("Standing...");
      writeContract({
        address: contracts.blackjack as `0x${string}`,
        abi: MonadBlackjackABI,
        functionName: "stand",
        args: [gameId],
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-green-900 to-gray-900 flex flex-col">
      <AppHeader title="Blackjack" onClose={onClose} theme="dark" />

      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-white mb-4">Connect wallet to play</p>
          </div>
        ) : !contracts.blackjack ? (
          <div className="text-center py-12">
            <p className="text-white mb-2">Contract not deployed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Game Table */}
            <div className="bg-green-800 rounded-2xl p-6 border-4 border-yellow-600 shadow-2xl min-h-[200px]">
              <div className="text-white text-center">
                <div className="text-4xl mb-4">🃏</div>
                {gameId === null ? (
                  <div>
                    <p className="text-xl font-bold mb-2">Place Your Bet</p>
                    <p className="text-sm opacity-80">Min: 0.001 MON | Max: 1 MON</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold mb-2">Game #{gameId.toString()}</p>
                    {gameData ? (
                      <div className="space-y-2">
                        <div>Player Score: {(gameData as any)[5]?.toString() || "0"}</div>
                        <div>Dealer Score: {(gameData as any)[6]?.toString() || "?"}</div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Bet Amount */}
            {gameId === null && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bet Amount (MON)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                  max="1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {gameId === null ? (
                <button
                  onClick={startGame}
                  disabled={isPending || isConfirming}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isPending || isConfirming ? "Starting..." : "🎲 Start Game"}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={hit}
                    disabled={isPending || isConfirming}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                  >
                    👆 Hit
                  </button>
                  <button
                    onClick={stand}
                    disabled={isPending || isConfirming}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                  >
                    ✋ Stand
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            {status && (
              <div className="bg-gray-800 border border-yellow-600 rounded-xl p-3 text-white text-center text-sm">
                {status}
              </div>
            )}

            {/* Info */}
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-3 text-xs text-white">
              <div className="font-semibold mb-1">🎯 How to Play:</div>
              <ul className="space-y-1 opacity-80">
                <li>• Get as close to 21 as possible without going over</li>
                <li>• Dealer must draw to 17</li>
                <li>• House edge: 0.5%</li>
                <li>• Win doubles your bet (minus fee)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

