"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletConnectModalProps {
  onClose: () => void;
  appName: string;
}

export default function WalletConnectModal({ onClose, appName }: WalletConnectModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Wallet Required
          </h2>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">{appName}</span> requires a connected wallet to interact with blockchain features.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
              >
                🔗 Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          We recommend using MetaMask or any Web3 wallet
        </p>
      </div>
    </div>
  );
}

