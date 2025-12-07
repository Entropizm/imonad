"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import StatusBar from "./StatusBar";
import Calculator from "./apps/Calculator";
import Notes from "./apps/Notes";
import Clock from "./apps/Clock";
import Messages from "./apps/Messages";
import Photos from "./apps/Photos";
import Safari from "./apps/Safari";
import Settings from "./apps/Settings";
import Monad from "./apps/Monad";
import FaucetApp from "./apps/FaucetApp";
import DisperserApp from "./apps/DisperserApp";
import BlackjackApp from "./apps/BlackjackApp";
import SlotsApp from "./apps/SlotsApp";
import DiceApp from "./apps/DiceApp";
import NFTApp from "./apps/NFTApp";
import ComingSoon from "./apps/ComingSoon";
import SuperApp from "./apps/SuperApp";
import MarketplaceApp from "./apps/MarketplaceApp";
import WalletConnectModal from "./WalletConnectModal";

interface App {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<{ onClose: () => void }> | "coming-soon" | "dynamic";
  isDApp?: boolean;
  requiresWallet?: boolean;
  description?: string;
  code?: string;
  _id?: string;
}

const defaultApps: App[] = [
  // Featured - Row 1
  { id: "superapp", name: "App Studio", icon: "🎨", component: SuperApp, requiresWallet: true },
  { id: "marketplace", name: "Marketplace", icon: "🏪", component: MarketplaceApp },
  { id: "faucet", name: "Faucet", icon: "💧", component: FaucetApp, isDApp: true, requiresWallet: true },
  { id: "monad", name: "Monad", icon: "🔷", component: Monad, isDApp: true, requiresWallet: true },
  
  // Row 2 - Games
  { id: "blackjack", name: "Blackjack", icon: "🃏", component: BlackjackApp, isDApp: true, requiresWallet: true },
  { id: "slots", name: "Slots", icon: "🎰", component: SlotsApp, isDApp: true, requiresWallet: true },
  { id: "dice", name: "Dice", icon: "🎲", component: DiceApp, isDApp: true, requiresWallet: true },
  { id: "photos", name: "Photos", icon: "🖼️", component: Photos },
  
  // Row 3
  { id: "nft", name: "NFT Mint", icon: "💎", component: NFTApp, isDApp: true, requiresWallet: true },
  { id: "disperser", name: "Disperser", icon: "💸", component: DisperserApp, isDApp: true, requiresWallet: true },
  { id: "messages", name: "Messages", icon: "💬", component: Messages },
  { id: "safari", name: "Safari", icon: "🧭", component: Safari },
  
  // Row 4
  { id: "calculator", name: "Calculator", icon: "🔢", component: Calculator },
  { id: "notes", name: "Notes", icon: "📝", component: Notes },
  { id: "clock", name: "Clock", icon: "⏰", component: Clock },
  { id: "settings", name: "Settings", icon: "⚙️", component: Settings },
];

export default function HomeScreen() {
  const { isConnected } = useAccount();
  const [openApp, setOpenApp] = useState<App | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [apps, setApps] = useState<App[]>(defaultApps);
  const [dynamicApps, setDynamicApps] = useState<App[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingApp, setPendingApp] = useState<App | null>(null);

  useEffect(() => {
    fetchDynamicApps();
  }, []);

  const fetchDynamicApps = async () => {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success && data.apps.length > 0) {
        const dynamicAppsList = data.apps.map((app: any) => ({
          id: `dynamic-${app._id}`,
          _id: app._id,
          name: app.name,
          icon: app.icon,
          component: "dynamic" as const,
          code: app.code,
          description: app.description,
        }));
        setDynamicApps(dynamicAppsList);
        setApps([...defaultApps, ...dynamicAppsList]);
      }
    } catch (error) {
      console.error('Error fetching dynamic apps:', error);
    }
  };

  const handleAppOpen = (app: App) => {
    // Check if app requires wallet and user is not connected
    if (app.requiresWallet && !isConnected) {
      setPendingApp(app);
      setShowWalletModal(true);
      return;
    }

    // Play tap sound
    import("@/lib/sounds").then(({ playTapSound }) => {
      playTapSound();
    });
    
    setIsTransitioning(true);
    setTimeout(() => {
      setOpenApp(app);
      setIsTransitioning(false);
    }, 300);
  };

  const handleWalletModalClose = () => {
    setShowWalletModal(false);
    setPendingApp(null);
  };

  useEffect(() => {
    // Auto-open pending app after wallet connection
    if (isConnected && pendingApp) {
      handleAppOpen(pendingApp);
      setPendingApp(null);
      setShowWalletModal(false);
    }
  }, [isConnected, pendingApp]);

  const handleAppClose = () => {
    // Play tap sound
    import("@/lib/sounds").then(({ playTapSound }) => {
      playTapSound();
    });
    
    setIsTransitioning(true);
    setTimeout(() => {
      setOpenApp(null);
      setIsTransitioning(false);
    }, 300);
  };

  if (openApp) {
    return (
      <div
        className={`w-full h-full transition-transform duration-300 ${
          isTransitioning ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {openApp.component === "coming-soon" ? (
          <ComingSoon 
            onClose={handleAppClose}
            title={openApp.name}
            icon={openApp.icon}
            description={openApp.description || "This feature is coming soon!"}
          />
        ) : openApp.component === "dynamic" ? (
          <DynamicAppRenderer 
            code={openApp.code || ""} 
            appName={openApp.name}
            onClose={handleAppClose} 
          />
        ) : (
          (() => {
            const AppComponent = openApp.component as React.ComponentType<{ onClose: () => void }>;
            return <AppComponent onClose={handleAppClose} />;
          })()
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex flex-col transition-transform duration-300 ${
        isTransitioning ? "-translate-x-full" : "translate-x-0"
      }`}
      style={{
        background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <StatusBar />

      {/* App Grid */}
      <div className="flex-1 p-4 pt-8 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3 gap-y-6">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppOpen(app)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className={`w-[60px] h-[60px] rounded-[14px] shadow-xl flex items-center justify-center text-3xl ${
                app.isDApp
                  ? "bg-gradient-to-br from-purple-500 to-blue-500"
                  : "bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500"
              }`}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {app.icon}
              </div>
              <span className="text-white text-[11px] text-shadow font-medium leading-tight text-center max-w-[65px]">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="h-24 flex items-start justify-center px-4">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 flex gap-4 border border-white/30">
          <button
            onClick={() => handleAppOpen(apps.find((a) => a.id === "superapp")!)}
            className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
          >
            🎨
          </button>
          <button
            onClick={() => handleAppOpen(apps.find((a) => a.id === "marketplace")!)}
            className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
          >
            🏪
          </button>
          <button
            onClick={() => handleAppOpen(apps.find((a) => a.id === "safari")!)}
            className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
          >
            🧭
          </button>
        </div>
      </div>

      {showWalletModal && (
        <WalletConnectModal
          onClose={handleWalletModalClose}
          appName={pendingApp?.name || "This app"}
        />
      )}
    </div>
  );
}

// Dynamic App Renderer Component
function DynamicAppRenderer({ code, appName, onClose }: { code: string; appName: string; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [AppComponent, setAppComponent] = useState<React.ComponentType<{ onClose: () => void }> | null>(null);

  useEffect(() => {
    try {
      // Clean the code - remove all import statements and "use client"
      let cleanCode = code
        .replace(/^["']use client["'];?\s*/gm, '')
        .replace(/^import\s+.*?from\s+["'].*?["'];?\s*/gm, '')
        .replace(/^import\s+["'].*?["'];?\s*/gm, '')
        .replace(/^import\s*{[^}]*}\s*from\s*["'][^"']*["'];?\s*/gm, '')
        .replace(/^export\s+default\s+/gm, '')
        .trim();
      
      // If code ends with export default MyApp, remove it
      cleanCode = cleanCode.replace(/export\s+default\s+MyApp;?\s*$/gm, '');
      
      console.log('Cleaned code:', cleanCode.substring(0, 200) + '...');
      
      // Use Function constructor to create component
      const createComponent = new Function(
        'React',
        'useState',
        'useEffect',
        'useCallback',
        'useMemo',
        'useRef',
        'useAccount',
        'useReadContract',
        'useWriteContract',
        'AppHeader',
        `
        ${cleanCode}
        
        // Return the component
        if (typeof MyApp !== 'undefined') return MyApp;
        if (typeof App !== 'undefined') return App;
        if (typeof Component !== 'undefined') return Component;
        return null;
        `
      );

      // Import required dependencies
      import('react').then((ReactModule) => {
        import('wagmi').then((wagmi) => {
          import('./apps/AppHeader').then((AppHeaderModule) => {
            try {
              const Component = createComponent(
                ReactModule,
                ReactModule.useState,
                ReactModule.useEffect,
                ReactModule.useCallback,
                ReactModule.useMemo,
                ReactModule.useRef,
                wagmi.useAccount,
                wagmi.useReadContract,
                wagmi.useWriteContract,
                AppHeaderModule.default
              );
              
              if (Component) {
                setAppComponent(() => Component);
              } else {
                setError('Component not found in generated code');
              }
            } catch (execError: any) {
              console.error('Error executing component:', execError);
              setError(execError.message);
            }
          });
        });
      });
    } catch (err: any) {
      console.error('Error loading dynamic app:', err);
      setError(err.message);
    }
  }, [code]);

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-red-50 to-red-100 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Failed to Load App
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            {error}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!AppComponent) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-gray-600">Loading {appName}...</div>
      </div>
    );
  }

  return <AppComponent onClose={onClose} />;
}

