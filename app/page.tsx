"use client";

import { useState, useEffect } from "react";
import IPhoneFrame from "@/components/IPhoneFrame";
import BootScreen from "@/components/BootScreen";
import LockScreen from "@/components/LockScreen";
import HomeScreen from "@/components/HomeScreen";
import ChainSwitcher from "@/components/ChainSwitcher";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"boot" | "lock" | "home">("boot");

  useEffect(() => {
    // Boot sequence
    const bootTimer = setTimeout(() => {
      setCurrentScreen("lock");
    }, 3000);

    return () => clearTimeout(bootTimer);
  }, []);

  const handleUnlock = () => {
    setCurrentScreen("home");
  };

  return (
    <>
      <ChainSwitcher />
      <IPhoneFrame>
        {currentScreen === "boot" && <BootScreen />}
        {currentScreen === "lock" && <LockScreen onUnlock={handleUnlock} />}
        {currentScreen === "home" && <HomeScreen />}
      </IPhoneFrame>
    </>
  );
}

