"use client";

import AppHeader from "./AppHeader";

interface ComingSoonProps {
  onClose: () => void;
  title: string;
  icon: string;
  description: string;
}

export default function ComingSoon({ onClose, title, icon, description }: ComingSoonProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col">
      <AppHeader title={title} onClose={onClose} dark />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-8xl mb-6 animate-bounce">{icon}</div>
        
        <h2 className="text-white text-3xl font-bold mb-4 text-center">{title}</h2>
        
        <p className="text-gray-300 text-center mb-8 max-w-sm">
          {description}
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 w-full max-w-sm border border-white/20">
          <div className="text-center">
            <div className="text-gray-300 text-sm mb-2">Status</div>
            <div className="text-yellow-400 text-xl font-semibold">
              🚧 Coming Soon
            </div>
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 max-w-sm">
          <p className="text-blue-200 text-sm text-center">
            💡 <strong>Tip:</strong> Deploy smart contracts first with <code className="bg-black/30 px-2 py-1 rounded">npm run deploy</code>
          </p>
        </div>

        <div className="mt-8 space-y-2 w-full max-w-sm">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="text-green-400">✓</span>
            <span>Smart contract ready</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="text-yellow-400">○</span>
            <span>Deploy to testnet</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="text-yellow-400">○</span>
            <span>UI integration complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

