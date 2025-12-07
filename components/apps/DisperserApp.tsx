"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";
import { useAccount, useBalance } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { loadContracts } from "@/lib/contracts";
import TokenDisperserABI from "@/lib/abis/TokenDisperser.json";

interface DisperserAppProps {
  onClose: () => void;
}

export default function DisperserApp({ onClose }: DisperserAppProps) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [status, setStatus] = useState("");

  const contracts = loadContracts();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleDisperse = async () => {
    if (!isConnected || !address) {
      setStatus("Please connect your wallet");
      return;
    }

    if (!contracts.disperser) {
      setStatus("Contract not deployed yet");
      return;
    }

    try {
      // Parse recipients (one address per line)
      const recipientList = recipients
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      // Parse amounts (one amount per line in MON)
      const amountList = amounts
        .split("\n")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
        .map((a) => parseEther(a));

      if (recipientList.length === 0) {
        setStatus("Please enter at least one recipient");
        return;
      }

      if (recipientList.length !== amountList.length) {
        setStatus("Number of recipients must match number of amounts");
        return;
      }

      // Calculate total amount needed (including 0.5% fee)
      const totalAmount = amountList.reduce((sum, amt) => sum + amt, BigInt(0));
      const fee = (totalAmount * BigInt(50)) / BigInt(10000); // 0.5%
      const totalWithFee = totalAmount + fee;

      setStatus(`Dispersing ${formatEther(totalAmount)} MON to ${recipientList.length} addresses...`);

      writeContract({
        address: contracts.disperser as `0x${string}`,
        abi: TokenDisperserABI,
        functionName: "disperseNative",
        args: [recipientList, amountList],
        value: totalWithFee,
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message || "Transaction failed"}`);
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      setStatus("✅ Tokens dispersed successfully!");
      setRecipients("");
      setAmounts("");
    }, 1000);
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-50 to-white flex flex-col">
      <AppHeader title="Token Disperser" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Connect your wallet to use Token Disperser</p>
          </div>
        ) : !contracts.disperser ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Contract not deployed yet</p>
            <p className="text-sm text-gray-500">Deploy contracts first with `npm run deploy`</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balance Display */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="text-sm opacity-90">Your Balance</div>
              <div className="text-3xl font-bold mt-1">
                {balance ? formatEther(balance.value).slice(0, 8) : "0.00"} MON
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Enter one address per line and one amount per line. 
                A 0.5% fee will be added to the total.
              </p>
            </div>

            {/* Recipients Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients (one per line)
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0x1234567890abcdef..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
              />
            </div>

            {/* Amounts Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amounts in MON (one per line)
              </label>
              <textarea
                value={amounts}
                onChange={(e) => setAmounts(e.target.value)}
                placeholder="0.1&#10;0.05&#10;0.2"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
              />
            </div>

            {/* Disperse Button */}
            <button
              onClick={handleDisperse}
              disabled={isPending || isConfirming || !recipients || !amounts}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? "Processing..." : "💸 Disperse Tokens"}
            </button>

            {/* Status */}
            {status && (
              <div className={`text-center text-sm py-2 px-3 rounded-lg ${
                status.includes("✅") 
                  ? "bg-green-100 text-green-800" 
                  : status.includes("Error") 
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {status}
              </div>
            )}

            {/* Example */}
            <div className="bg-gray-50 rounded-xl p-3 text-xs">
              <div className="font-semibold text-gray-700 mb-2">Example:</div>
              <div className="space-y-1 text-gray-600">
                <div><strong>Recipients:</strong></div>
                <div className="font-mono">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</div>
                <div className="font-mono">0x1234567890abcdef1234567890abcdef12345678</div>
                <div className="mt-2"><strong>Amounts:</strong></div>
                <div className="font-mono">0.1</div>
                <div className="font-mono">0.05</div>
              </div>
            </div>

            {/* Contract Info */}
            <div className="text-xs text-gray-500 text-center pt-2">
              Contract: {contracts.disperser?.slice(0, 6)}...{contracts.disperser?.slice(-4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

