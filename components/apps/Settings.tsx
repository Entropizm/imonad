"use client";

import AppHeader from "./AppHeader";

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const settingsSections = [
    {
      items: [
        { icon: "✈️", label: "Airplane Mode", value: "Off" },
        { icon: "📶", label: "Wi-Fi", value: "Monad Network" },
        { icon: "📱", label: "Carrier", value: "AT&T" },
      ],
    },
    {
      items: [
        { icon: "🔊", label: "Sounds", value: "" },
        { icon: "🌟", label: "Brightness", value: "" },
        { icon: "🖼️", label: "Wallpaper", value: "" },
      ],
    },
    {
      items: [
        { icon: "🔒", label: "Passcode Lock", value: "Off" },
        { icon: "🌐", label: "Safari", value: "" },
        { icon: "ℹ️", label: "About", value: "" },
      ],
    },
  ];

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      <AppHeader title="Settings" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg overflow-hidden">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                className={`w-full p-4 flex items-center justify-between active:bg-gray-50 ${
                  itemIndex !== section.items.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-800">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span className="text-gray-500 text-sm">{item.value}</span>
                  )}
                  <span className="text-gray-400">›</span>
                </div>
              </button>
            ))}
          </div>
        ))}

        <div className="text-center text-sm text-gray-500 py-4">
          <div>iOS 4.0</div>
          <div className="mt-1">Monad Edition</div>
        </div>
      </div>
    </div>
  );
}

