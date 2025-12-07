"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";

interface SafariProps {
  onClose: () => void;
}

export default function Safari({ onClose }: SafariProps) {
  const [url, setUrl] = useState("monad.xyz");
  const [content, setContent] = useState("monad");

  const pages: Record<string, any> = {
    "monad.xyz": {
      title: "Monad",
      content: (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔷</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Monad</h1>
          <p className="text-gray-600">Building the future</p>
        </div>
      ),
    },
    "apple.com": {
      title: "Apple",
      content: (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍎</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Apple</h1>
          <p className="text-gray-600">Think Different</p>
        </div>
      ),
    },
    "google.com": {
      title: "Google",
      content: (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Google</h1>
          <input
            type="text"
            placeholder="Search..."
            className="mt-4 px-4 py-2 border rounded-full w-64"
          />
        </div>
      ),
    },
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Object.keys(pages).find((key) =>
      url.toLowerCase().includes(key.toLowerCase())
    );
    if (page) {
      setContent(page);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <AppHeader title="Safari" onClose={onClose} />

      {/* Address Bar */}
      <form onSubmit={handleNavigate} className="p-3 bg-gray-100 border-b border-gray-300">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter URL"
        />
      </form>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {pages[content]?.content || (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🌐</div>
            <div>Page not found</div>
            <div className="text-sm mt-2">Try: monad.xyz, apple.com, google.com</div>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div className="flex justify-around p-4 bg-gray-100 border-t border-gray-300">
        <button className="text-2xl">◀</button>
        <button className="text-2xl">▶</button>
        <button className="text-2xl">📑</button>
        <button className="text-2xl">📖</button>
      </div>
    </div>
  );
}

