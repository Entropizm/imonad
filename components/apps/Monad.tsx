"use client";

import AppHeader from "./AppHeader";

interface MonadProps {
  onClose: () => void;
}

export default function Monad({ onClose }: MonadProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      <AppHeader title="Monad" onClose={onClose} dark />

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white">
        <div className="text-8xl mb-8 animate-pulse">🔷</div>
        
        <h1 className="text-4xl font-bold mb-4 text-center">Monad</h1>
        
        <p className="text-lg text-center text-blue-200 mb-8 max-w-md">
          Experience the future of blockchain technology
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Network Status</div>
            <div className="text-2xl font-semibold">🟢 Online</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Transactions</div>
            <div className="text-2xl font-semibold">1,234,567</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-sm text-blue-200 mb-1">Block Height</div>
            <div className="text-2xl font-semibold">987,654</div>
          </div>
        </div>

        <button className="mt-8 px-8 py-3 bg-white text-purple-900 rounded-full font-semibold active:scale-95 transition-transform">
          Explore Monad
        </button>
      </div>
    </div>
  );
}

