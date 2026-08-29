import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent text-[#e8e8e8] selection:bg-white/10 selection:text-white transition-colors duration-500 ease-in-out">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
