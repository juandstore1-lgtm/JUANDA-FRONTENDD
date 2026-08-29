import React from "react";
const logoImg = "/logo.png";

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
