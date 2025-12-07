"use client";

import { useEffect, useState } from "react";

interface TransactionModalProps {
  isOpen: boolean;
  status: "pending" | "success" | "error" | "idle";
  message?: string;
  txHash?: string;
  onClose: () => void;
}

export default function TransactionModal({
  isOpen,
  status,
  message,
  txHash,
  onClose,
}: TransactionModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Play sound based on status
      if (status === "success") {
        import("@/lib/sounds").then(({ playSuccessSound }) => {
          playSuccessSound();
        });
      } else if (status === "error") {
        import("@/lib/sounds").then(({ playErrorSound }) => {
          playErrorSound();
        });
      }
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, status]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-gray-800/95 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          {status === "pending" && (
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl">
              ✓
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-3xl">
              ✕
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">
            {status === "pending" && "Processing..."}
            {status === "success" && "Success!"}
            {status === "error" && "Error"}
          </h3>
          {message && <p className="text-gray-300 text-sm mb-4">{message}</p>}
          
          {txHash && (
            <a
              href={`https://monad-testnet.socialscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm hover:text-blue-300 underline"
            >
              View Transaction
            </a>
          )}
        </div>

        {/* Close Button */}
        {status !== "pending" && (
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium active:scale-95 transition-transform"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}

