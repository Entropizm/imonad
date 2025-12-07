"use client";

import { useState, useEffect, useMemo } from "react";
import AppHeader from "./AppHeader";
import { useAccount } from "wagmi";
import WalletConnectModal from "../WalletConnectModal";

interface App {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  creator: string;
  tokenAddress?: string;
  downloads: number;
  createdAt: string;
}

interface MarketplaceAppProps {
  onClose: () => void;
}

// Generate deterministic random number based on seed
const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
};

// Generate fake price history for an app
const generatePriceHistory = (appId: string, downloads: number) => {
  const basePrice = 0.001 + seededRandom(appId) * 0.01;
  const volatility = 0.1 + seededRandom(appId + 'vol') * 0.2;
  const trend = downloads > 10 ? 1.2 : downloads > 5 ? 1.0 : 0.8;
  
  const hours = ['24h', '20h', '16h', '12h', '8h', '4h', '2h', '1h', '30m', 'Now'];
  let price = basePrice * 0.7;
  
  return hours.map((time, i) => {
    const change = (seededRandom(appId + time) - 0.4) * volatility;
    price = price * (1 + change) * (i > 5 ? trend * 0.05 + 0.95 : 1);
    return {
      time,
      price: Math.max(0.0001, price),
    };
  });
};

// Simple line chart component
const PriceChart = ({ data, positive }: { data: { time: string; price: number }[]; positive: boolean }) => {
  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const range = maxPrice - minPrice || 0.001;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.price - minPrice) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-32 relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={positive ? "greenGrad" : "redGrad"} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon 
          points={`0,100 ${points} 100,100`} 
          fill={`url(#${positive ? "greenGrad" : "redGrad"})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={positive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-gray-400 px-1">
        <span>24h</span>
        <span>12h</span>
        <span>Now</span>
      </div>
    </div>
  );
};

export default function MarketplaceApp({ onClose }: MarketplaceAppProps) {
  const { isConnected, address } = useAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [view, setView] = useState<"list" | "detail">("list");
  const [userTokens, setUserTokens] = useState<Record<string, number>>({});
  const [txPending, setTxPending] = useState(false);

  useEffect(() => {
    fetchApps();
  }, [selectedCategory]);

  // Load user tokens from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userAppTokens');
    if (saved) {
      setUserTokens(JSON.parse(saved));
    }
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "all" 
        ? '/api/apps' 
        : `/api/apps?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (app: App) => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }

    try {
      await fetch(`/api/apps/${app._id}/download`, { method: 'POST' });
      
      // Give user some tokens for downloading
      const rewardAmount = 100 + Math.floor(Math.random() * 50);
      const newTokens = { ...userTokens, [app._id]: (userTokens[app._id] || 0) + rewardAmount };
      setUserTokens(newTokens);
      localStorage.setItem('userAppTokens', JSON.stringify(newTokens));
      
      alert(`${app.name} added! 🎉\n\nYou earned ${rewardAmount} ${app.name} tokens!`);
      fetchApps();
    } catch (error) {
      console.error('Error downloading app:', error);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }
    if (!selectedApp || !buyAmount) return;

    setTxPending(true);
    
    // Simulate transaction delay
    await new Promise(r => setTimeout(r, 1500));
    
    const monadAmount = parseFloat(buyAmount);
    const tokensToReceive = Math.floor(monadAmount * 10000 * (1 + seededRandom(selectedApp._id)));
    
    const newTokens = { ...userTokens, [selectedApp._id]: (userTokens[selectedApp._id] || 0) + tokensToReceive };
    setUserTokens(newTokens);
    localStorage.setItem('userAppTokens', JSON.stringify(newTokens));
    
    setBuyAmount("");
    setTxPending(false);
    alert(`Bought ${tokensToReceive.toLocaleString()} ${selectedApp.name} tokens! 🚀`);
  };

  const handleSell = async () => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }
    if (!selectedApp || !sellAmount) return;

    const tokensToSell = parseFloat(sellAmount);
    const currentBalance = userTokens[selectedApp._id] || 0;
    
    if (tokensToSell > currentBalance) {
      alert("Insufficient token balance!");
      return;
    }

    setTxPending(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const monadReceived = (tokensToSell / 10000 * (0.9 + seededRandom(selectedApp._id) * 0.2)).toFixed(4);
    
    const newTokens = { ...userTokens, [selectedApp._id]: currentBalance - tokensToSell };
    setUserTokens(newTokens);
    localStorage.setItem('userAppTokens', JSON.stringify(newTokens));
    
    setSellAmount("");
    setTxPending(false);
    alert(`Sold tokens for ${monadReceived} MONAD! 💰`);
  };

  const categories = ["all", "games", "defi", "social", "tools", "entertainment"];

  // Generate app stats
  const getAppStats = (app: App) => {
    const basePrice = 0.001 + seededRandom(app._id) * 0.01;
    const priceHistory = generatePriceHistory(app._id, app.downloads);
    const currentPrice = priceHistory[priceHistory.length - 1].price;
    const price24hAgo = priceHistory[0].price;
    const priceChange = ((currentPrice - price24hAgo) / price24hAgo) * 100;
    const marketCap = currentPrice * (1000000 + app.downloads * 10000);
    const volume24h = marketCap * (0.05 + seededRandom(app._id + 'vol24') * 0.15);
    
    return {
      currentPrice,
      priceChange,
      marketCap,
      volume24h,
      priceHistory,
      totalSupply: 1000000 + app.downloads * 10000,
      holders: 50 + app.downloads * 5,
    };
  };

  // Detail View
  if (view === "detail" && selectedApp) {
    const stats = getAppStats(selectedApp);
    const userBalance = userTokens[selectedApp._id] || 0;
    const userValueInMonad = (userBalance / 10000 * stats.currentPrice).toFixed(6);

    return (
      <>
        <div className="w-full h-full bg-gradient-to-b from-slate-900 to-purple-900 flex flex-col">
          <AppHeader title={selectedApp.name} onClose={() => setView("list")} theme="dark" />

          <div className="flex-1 overflow-y-auto">
            {/* Token Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{selectedApp.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">${selectedApp.name.toUpperCase().slice(0, 4)}</h2>
                  <p className="text-sm text-gray-400">{selectedApp.name} Token</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {stats.currentPrice.toFixed(6)} MON
                </span>
                <span className={`text-sm font-medium ${stats.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.priceChange >= 0 ? '↑' : '↓'} {Math.abs(stats.priceChange).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Price Chart */}
            <div className="p-4">
              <PriceChart data={stats.priceHistory} positive={stats.priceChange >= 0} />
            </div>

            {/* Stats Grid */}
            <div className="px-4 grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-gray-400">Market Cap</div>
                <div className="text-sm font-semibold text-white">
                  {stats.marketCap.toFixed(2)} MON
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-gray-400">24h Volume</div>
                <div className="text-sm font-semibold text-white">
                  {stats.volume24h.toFixed(2)} MON
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-gray-400">Holders</div>
                <div className="text-sm font-semibold text-white">
                  {stats.holders.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-gray-400">Downloads</div>
                <div className="text-sm font-semibold text-white">
                  {selectedApp.downloads.toLocaleString()}
                </div>
              </div>
            </div>

            {/* User Balance */}
            {isConnected && (
              <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
                <div className="text-xs text-gray-400 mb-1">Your Balance</div>
                <div className="text-2xl font-bold text-white">
                  {userBalance.toLocaleString()} <span className="text-sm text-gray-400">${selectedApp.name.toUpperCase().slice(0, 4)}</span>
                </div>
                <div className="text-sm text-gray-400">≈ {userValueInMonad} MON</div>
              </div>
            )}

            {/* Buy/Sell Section */}
            <div className="p-4 space-y-3">
              {/* Buy */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm font-medium text-white mb-2">Buy Tokens</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="MONAD amount"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm"
                  />
                  <button
                    onClick={handleBuy}
                    disabled={txPending || !buyAmount}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    {txPending ? '...' : 'Buy'}
                  </button>
                </div>
                {buyAmount && (
                  <div className="text-xs text-gray-400 mt-2">
                    ≈ {Math.floor(parseFloat(buyAmount || '0') * 10000 * (1 + seededRandom(selectedApp._id))).toLocaleString()} tokens
                  </div>
                )}
              </div>

              {/* Sell */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm font-medium text-white mb-2">Sell Tokens</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Token amount"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm"
                  />
                  <button
                    onClick={handleSell}
                    disabled={txPending || !sellAmount}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 text-sm"
                  >
                    {txPending ? '...' : 'Sell'}
                  </button>
                </div>
                {sellAmount && (
                  <div className="text-xs text-gray-400 mt-2">
                    ≈ {(parseFloat(sellAmount || '0') / 10000 * stats.currentPrice).toFixed(6)} MONAD
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(selectedApp)}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                ⬇️ Download App & Earn 100+ Tokens
              </button>
            </div>
          </div>
        </div>

        {showWalletModal && (
          <WalletConnectModal
            onClose={() => setShowWalletModal(false)}
            appName="Marketplace"
          />
        )}
      </>
    );
  }

  // List View
  return (
    <>
      <div className="w-full h-full bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
        <AppHeader title="Marketplace" onClose={onClose} />

        {/* Categories */}
        <div className="p-3 bg-white border-b overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap capitalize ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* App List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading apps...</div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No apps yet. Create one in App Studio! 🚀
            </div>
          ) : (
            apps.map((app) => {
              const stats = getAppStats(app);
              return (
                <button
                  key={app._id}
                  onClick={() => {
                    setSelectedApp(app);
                    setView("detail");
                  }}
                  className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{app.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {app.name}
                        </h3>
                        <span className={`text-xs font-medium ${stats.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {stats.currentPrice.toFixed(6)} MON
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                          {app.category}
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {app.downloads} ⬇️
                        </span>
                      </div>
                    </div>
                    <div className="w-16 h-10">
                      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <polyline
                          points={stats.priceHistory.map((p, i) => `${i * 11},${40 - (p.price / stats.currentPrice) * 30}`).join(' ')}
                          fill="none"
                          stroke={stats.priceChange >= 0 ? "#10b981" : "#ef4444"}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {showWalletModal && (
        <WalletConnectModal
          onClose={() => setShowWalletModal(false)}
          appName="Marketplace"
        />
      )}
    </>
  );
}
