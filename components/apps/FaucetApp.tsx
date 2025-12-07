"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import AppHeader from "./AppHeader";
import TransactionModal from "../TransactionModal";
import { loadContracts } from "@/lib/contracts";
import FaucetABI from "@/lib/abis/MonadFaucet.json";

interface FaucetAppProps {
  onClose: () => void;
}

export default function FaucetApp({ onClose }: FaucetAppProps) {
  const { address } = useAccount();
  const contracts = loadContracts();
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txMessage, setTxMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const { data: dripAmount } = useReadContract({
    address: contracts.faucet as `0x${string}`,
    abi: FaucetABI,
    functionName: "dripAmount",
  });

  const { data: cooldownTime } = useReadContract({
    address: contracts.faucet as `0x${string}`,
    abi: FaucetABI,
    functionName: "cooldownTime",
  });

  const { data: lastDripTime } = useReadContract({
    address: contracts.faucet as `0x${string}`,
    abi: FaucetABI,
    functionName: "lastDripTime",
    args: [address],
  });

  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleRequestDrip = async () => {
    if (!address) {
      setTxMessage("Please connect your wallet");
      setTxStatus("error");
      return;
    }

    if (!contracts.faucet) {
      setTxMessage("Faucet contract not deployed yet. Deploy contracts first with 'npm run deploy'");
      setTxStatus("error");
      return;
    }

    try {
      setTxStatus("pending");
      setTxMessage("Requesting tokens...");
      
      writeContract({
        address: contracts.faucet as `0x${string}`,
        abi: FaucetABI,
        functionName: "requestDrip",
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          setTxStatus("success");
          setTxMessage(`Successfully received ${formatEther(dripAmount as bigint)} MON!`);
        },
        onError: (error) => {
          setTxStatus("error");
          setTxMessage(error.message.includes("Cooldown") ? "Please wait for cooldown period" : "Transaction failed");
        },
      });
    } catch (error: any) {
      setTxStatus("error");
      setTxMessage(error.message || "Failed to request tokens");
    }
  };

  const canClaim = () => {
    if (!lastDripTime || !cooldownTime) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(lastDripTime) + Number(cooldownTime);
  };

  const getTimeUntilNextDrip = () => {
    if (!lastDripTime || !cooldownTime) return 0;
    const now = Math.floor(Date.now() / 1000);
    const nextDrip = Number(lastDripTime) + Number(cooldownTime);
    return Math.max(0, nextDrip - now);
  };

  return (
    <>
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col">
        <AppHeader title="Faucet" onClose={onClose} dark />

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-8xl mb-6">💧</div>
          
          <h2 className="text-white text-3xl font-bold mb-4">Testnet Faucet</h2>
          
          <p className="text-blue-100 text-center mb-8 max-w-sm">
            Get free MON tokens for testing on Monad Testnet
          </p>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 w-full max-w-sm border border-white/30">
            <div className="text-center">
              <div className="text-blue-100 text-sm mb-2">Amount per drip</div>
              <div className="text-white text-3xl font-bold">
                {dripAmount ? formatEther(dripAmount as bigint) : "0.1"} MON
              </div>
            </div>

            {!canClaim() && (
              <div className="mt-4 text-center">
                <div className="text-blue-100 text-sm">Next claim in</div>
                <div className="text-white text-xl font-semibold">
                  {Math.floor(getTimeUntilNextDrip() / 60)}m {getTimeUntilNextDrip() % 60}s
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRequestDrip}
            disabled={!canClaim() || isConfirming}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all ${
              canClaim() && !isConfirming
                ? "bg-white text-blue-600 active:scale-95"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isConfirming ? "Processing..." : "Request Tokens"}
          </button>

          {address && (
            <div className="mt-6 text-center">
              <div className="text-blue-100 text-xs">Your address</div>
              <div className="text-white text-sm font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        isOpen={txStatus !== "idle"}
        status={txStatus}
        message={txMessage}
        txHash={txHash}
        onClose={() => setTxStatus("idle")}
      />
    </>
  );
}

