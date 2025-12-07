"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [time, setTime] = useState(new Date());
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const maxWidth = rect.width - 60;
    const newPosition = Math.max(0, Math.min(clientX - rect.left - 30, maxWidth));
    setSlidePosition(newPosition);

    // Only unlock when slider reaches the end (90% threshold)
    // This is checked in handleEnd, not during drag
  };

  const handleEnd = () => {
    setIsDragging(false);
    
    if (!sliderRef.current) {
      setSlidePosition(0);
      return;
    }
    
    const rect = sliderRef.current.getBoundingClientRect();
    const maxWidth = rect.width - 60;
    
    // Check if slider was dragged to at least 90% of the way
    // Allow unlock in guest mode (no wallet required)
    if (slidePosition >= maxWidth * 0.9) {
      // Unlock successful
      import("@/lib/sounds").then(({ playUnlockSound }) => {
        playUnlockSound();
      });
      onUnlock();
    } else {
      // Slider didn't reach the end, reset it
      setSlidePosition(0);
    }
  };

  // Note: Removed auto-unlock effect - user must slide to unlock manually

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-between py-8 px-6">
      {/* Status Bar */}
      <div className="w-full flex justify-between items-center text-white text-xs px-2">
        <div>AT&T</div>
        <div>{formatTime(time)}</div>
        <div className="flex items-center gap-1">
          <div>100%</div>
          <div>🔋</div>
        </div>
      </div>

      {/* Time Display */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <div className="text-white text-7xl font-thin text-shadow tracking-tight">
          {time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
        <div className="text-white text-xl mt-2 text-shadow">
          {formatDate(time)}
        </div>
      </div>

      {/* Slide to Unlock - Guest Mode */}
      <div className="w-full max-w-sm mb-8 space-y-4">
        {!mounted ? (
          <div className="flex justify-center">
            <div className="px-8 py-4 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/50">
              Loading...
            </div>
          </div>
        ) : (
          <>
            <div
              ref={sliderRef}
              className="relative w-full h-14 bg-white/30 rounded-full backdrop-blur-sm border border-white/50 overflow-hidden"
              onMouseMove={(e) => handleMove(e.clientX)}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
              onTouchEnd={handleEnd}
            >
              {/* Track Text */}
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium text-shadow pointer-events-none">
                slide to unlock
              </div>

              {/* Slider Button */}
              <div
                className="absolute left-1 top-1 w-12 h-12 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
                style={{ transform: `translateX(${slidePosition}px)` }}
                onMouseDown={(e) => handleStart(e.clientX)}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
              >
                <div className="text-gray-600 text-xl">→</div>
              </div>
            </div>
            {!isConnected && (
              <p className="text-white/70 text-xs text-center max-w-xs">
                🎮 Guest Mode - Connect wallet when you need blockchain features
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

