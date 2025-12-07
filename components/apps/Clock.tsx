"use client";

import { useState, useEffect } from "react";
import AppHeader from "./AppHeader";

interface ClockProps {
  onClose: () => void;
}

export default function Clock({ onClose }: ClockProps) {
  const [time, setTime] = useState(new Date());
  const [tab, setTab] = useState<"world" | "alarm" | "stopwatch" | "timer">("world");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const worldCities = [
    { name: "New York", offset: -5 },
    { name: "London", offset: 0 },
    { name: "Tokyo", offset: 9 },
    { name: "Sydney", offset: 11 },
  ];

  const getTimeForOffset = (offset: number) => {
    const utc = time.getTime() + time.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + 3600000 * offset);
    return cityTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="w-full h-full bg-black flex flex-col">
      <AppHeader title="Clock" onClose={onClose} dark />

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {["world", "alarm", "stopwatch", "timer"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 py-3 text-sm capitalize ${
              tab === t ? "text-white border-b-2 border-white" : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "world" && (
          <div className="space-y-4">
            {worldCities.map((city) => (
              <div
                key={city.name}
                className="flex justify-between items-center p-4 bg-gray-900 rounded-lg"
              >
                <div>
                  <div className="text-white text-lg">{city.name}</div>
                  <div className="text-gray-500 text-sm">
                    {city.offset >= 0 ? "+" : ""}
                    {city.offset} GMT
                  </div>
                </div>
                <div className="text-white text-3xl font-light">
                  {getTimeForOffset(city.offset)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "alarm" && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">⏰</div>
            <div>No alarms set</div>
          </div>
        )}

        {tab === "stopwatch" && (
          <div className="text-center py-20">
            <div className="text-white text-7xl font-light mb-8">00:00.00</div>
            <button className="px-8 py-3 bg-green-600 text-white rounded-full">
              Start
            </button>
          </div>
        )}

        {tab === "timer" && (
          <div className="text-center py-20">
            <div className="text-white text-7xl font-light mb-8">00:05:00</div>
            <button className="px-8 py-3 bg-green-600 text-white rounded-full">
              Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

