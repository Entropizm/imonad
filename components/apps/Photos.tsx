"use client";

import AppHeader from "./AppHeader";

interface PhotosProps {
  onClose: () => void;
}

export default function Photos({ onClose }: PhotosProps) {
  const photos = [
    { id: 1, color: "from-blue-400 to-blue-600", emoji: "🌅" },
    { id: 2, color: "from-purple-400 to-purple-600", emoji: "🌆" },
    { id: 3, color: "from-pink-400 to-pink-600", emoji: "🌸" },
    { id: 4, color: "from-green-400 to-green-600", emoji: "🌿" },
    { id: 5, color: "from-yellow-400 to-yellow-600", emoji: "🌻" },
    { id: 6, color: "from-red-400 to-red-600", emoji: "🌹" },
    { id: 7, color: "from-indigo-400 to-indigo-600", emoji: "🌊" },
    { id: 8, color: "from-teal-400 to-teal-600", emoji: "🦋" },
    { id: 9, color: "from-orange-400 to-orange-600", emoji: "🍊" },
  ];

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      <AppHeader title="Photos" onClose={onClose} dark />

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              className={`aspect-square bg-gradient-to-br ${photo.color} rounded-lg flex items-center justify-center text-4xl active:scale-95 transition-transform`}
            >
              {photo.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-around p-4 bg-black/50 backdrop-blur-sm">
        <button className="text-white text-sm">Albums</button>
        <button className="text-white text-sm">Photos</button>
        <button className="text-white text-sm">Shared</button>
      </div>
    </div>
  );
}

