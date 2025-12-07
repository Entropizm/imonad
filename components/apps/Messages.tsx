"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";

interface MessagesProps {
  onClose: () => void;
}

interface Message {
  id: number;
  sender: string;
  preview: string;
  time: string;
}

export default function Messages({ onClose }: MessagesProps) {
  const [messages] = useState<Message[]>([
    { id: 1, sender: "Monad Team", preview: "Welcome to iOS 4! 🎉", time: "now" },
    { id: 2, sender: "Steve Jobs", preview: "One more thing...", time: "2m ago" },
    { id: 3, sender: "Developer", preview: "This is a functional messaging app", time: "10m ago" },
  ]);

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      <AppHeader title="Messages" onClose={onClose} />

      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <button
            key={msg.id}
            className="w-full p-4 bg-white border-b border-gray-200 text-left active:bg-gray-50 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
              {msg.sender[0]}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-800">{msg.sender}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <div className="text-sm text-gray-600 truncate">{msg.preview}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <input
          type="text"
          placeholder="Text Message"
          className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

