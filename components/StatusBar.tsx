"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export default function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (clickCount >= 5) {
      setShowEasterEgg(true);
      const timer = setTimeout(() => {
        setShowEasterEgg(false);
        setClickCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCarrierClick = () => {
    setClickCount(prev => prev + 1);
  };

  const formatBalance = () => {
    if (!balance) return "0.00";
    const formatted = parseFloat(formatEther(balance.value));
    return formatted.toFixed(2);
  };

  return (
    <>
      <div className="w-full h-5 bg-black/80 backdrop-blur-sm flex items-center justify-between px-2 text-white text-xs font-medium">
        <div className="flex items-center gap-1">
          <button onClick={handleCarrierClick} className="hover:opacity-70">
            Monad
          </button>
          <span className="ml-1">📶</span>
        </div>
        <div>{formatTime(time)}</div>
        <div className="flex items-center gap-1">
          <span className="hidden md:inline">🔒</span>
          <span className="hidden md:inline">100%</span>
          <span className="hidden md:inline">🔋</span>
          {/* Mobile: Show balance instead of battery */}
          <span className="md:hidden">{isConnected ? formatBalance() : "0.00"}</span>
          <span className="md:hidden">MON</span>
        </div>
      </div>

      {/* Easter Egg: Steve Jobs Quote */}
      {showEasterEgg && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border border-white/20">
            <p className="text-white text-sm italic text-center max-w-xs">
              "Stay hungry. Stay foolish."
              <br />
              <span className="text-gray-400 text-xs">- Steve Jobs</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

