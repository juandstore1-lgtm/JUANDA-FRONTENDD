import React from "react";
import logoImg from "C:/Users/JUBOLANO/.gemini/antigravity/brain/709624aa-3b69-4d76-b2fd-3ca8c16fdea4/.user_uploaded/media_1786159830515.png";

export default function Logo({ className = "h-12" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="JDQ STORE - NACIDOS DEL CÓDIGO"
        className="h-full w-auto object-contain mix-blend-screen contrast-125 brightness-110"
      />
    </div>
  );
}
