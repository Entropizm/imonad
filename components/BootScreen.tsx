"use client";

import { useEffect, useState } from "react";
import { playBootSound } from "@/lib/sounds";
import Image from "next/image";

export default function BootScreen() {
  const [fadeIn, setFadeIn] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFadeIn(true);
      playBootSound();
    }, 100);
  }, []);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div
        className={`transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* iMonad Logo - with fallback */}
        {!imageError ? (
          <Image
            src="/imonad-logo.png"
            alt="iMonad Logo"
            width={80}
            height={80}
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback: Show Monad diamond icon if logo not found
          <div className="text-8xl">🔷</div>
        )}
      </div>
    </div>
  );
}

