"use client";

import { ReactNode } from "react";

interface IPhoneFrameProps {
  children: ReactNode;
}

export default function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      {/* Desktop: Show iPhone frame - iPhone 4 proportions (2:3 aspect ratio) */}
      <div className="hidden md:flex relative items-center justify-center">
        {/* iPhone 4 Frame - 640x960 proportions (2:3) */}
        <div className="relative bg-black rounded-[60px] p-3 shadow-2xl border-4 border-gray-800" 
             style={{ 
               height: '85vh',
               width: 'calc(85vh * 2 / 3)',
               maxWidth: '420px',
               maxHeight: '800px',
             }}>
          {/* Screen */}
          <div className="relative w-full h-full bg-black rounded-[50px] overflow-hidden">
            {/* Screen Content */}
            <div className="w-full h-full">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Fullscreen without frame */}
      <div className="md:hidden w-full h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}

