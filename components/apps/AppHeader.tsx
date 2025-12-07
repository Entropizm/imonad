"use client";

interface AppHeaderProps {
  title: string;
  onClose: () => void;
  dark?: boolean;
  color?: string;
  theme?: "dark" | "light";
}

export default function AppHeader({ title, onClose, dark = false, color, theme }: AppHeaderProps) {
  const isDark = theme === "dark" || dark;
  const bgColor = color === "yellow" ? "bg-yellow-100" : isDark ? "bg-black/80" : "bg-gray-100";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const buttonColor = color === "yellow" ? "text-yellow-600" : isDark ? "text-blue-400" : "text-blue-600";

  return (
    <div className={`${bgColor} backdrop-blur-sm border-b ${isDark ? "border-gray-800" : "border-gray-300"} px-4 py-3 flex items-center justify-between`}>
      <button
        onClick={onClose}
        className={`${buttonColor} font-medium active:opacity-50`}
      >
        ← Back
      </button>
      <h1 className={`${textColor} font-semibold`}>{title}</h1>
      <div className="w-12"></div>
    </div>
  );
}

