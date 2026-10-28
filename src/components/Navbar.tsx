import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  BookOpen, 
  Package, 
  User, 
  MapPin, 
  Clock, 
  Radio, 
  ChevronRight, 
  Trophy, 
  Ticket 
} from "lucide-react";
import lionWatermark from "@/assets/lion-watermark.png";
import { motion, AnimatePresence } from "motion/react";
import RouletteModal from "./RouletteModal";
import DifusionModal from "./DifusionModal";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import { HomeService, ContestService, RaffleService } from "../services/api";
import Logo from "./Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isDifusionOpen, setIsDifusionOpen] = useState(false);
  const [showRouletteBtn, setShowRouletteBtn] = useState(false);
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [showContests, setShowContests] = useState(false);
  const [showRaffles, setShowRaffles] = useState(false);
  const location = useLocation();
  const { totalItemsCount, setIsCartOpen } = useCart();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    HomeService.getRouletteConfig()
      .then((config) => {
        if (!config || !config.activeDays) {
          setShowRouletteBtn(false);
          return;
        }
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const activeDaysList = config.activeDays.split(',').map(d => d.trim().toUpperCase());
        
        const isTodayActive = activeDaysList.includes(todayName);
        setShowRouletteBtn(isTodayActive);

        // Auto-popup if active today and hasn't spun yet
        const hasSpunThisWeek = localStorage.getItem('hasSpunRouletteThisWeek');
        if (isTodayActive && !hasSpunThisWeek) {
          const timer = setTimeout(() => {
            setIsRouletteOpen(true);
          }, 2500);
          return () => clearTimeout(timer);
        }
      })
      .catch((err) => {
        console.error("Error loading roulette config in navbar:", err);
        setShowRouletteBtn(false);
      });

    HomeService.getMysteryBoxConfig()
      .then((config) => {
        if (config && config.active) {
          setShowMysteryBox(true);
        } else {
          setShowMysteryBox(false);
        }
      })
      .catch((err) => {
        console.error("Error loading mystery box config in navbar:", err);
        setShowMysteryBox(false);
      });

    ContestService.getActiveContest()
      .then(async (contest) => {
        let target = contest;
        if (!target) {
          const all = await ContestService.getAllContests().catch(() => []);
          if (all && all.length > 0) {
            target = all.sort((a, b) => b.id - a.id)[0];
          }
        }
        if (target && (target.showInMenu === true || String(target.showInMenu) === 'true')) {
          setShowContests(true);
        } else {
          setShowContests(false);
        }
      })
      .catch((err) => {
        console.error("Error checking contest in navbar:", err);
        setShowContests(false);
      });

    RaffleService.getAllRaffles()
      .then((raffles) => {
        // Show in menu if there's at least one active raffle
        const hasActive = raffles.some(r => r.status === 'ACTIVE' || r.status === 'SOLD_OUT');
        setShowRaffles(hasActive);
      })
      .catch((err) => {
        console.error("Error loading raffles in navbar:", err);
        setShowRaffles(false);
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Catálogos", path: "/catalogs" },
    ...(showMysteryBox ? [{ name: "Caja Misteriosa", path: "/caja-misteriosa" }] : []),
    ...(showContests ? [{ name: "Concursos", path: "/concursos" }] : []),
    ...(showRaffles ? [{ name: "Rifas", path: "/rifas" }] : []),


    { name: "Mayorista", path: "/mayorista" },
    { name: "Ubicaciones", path: "/ubicaciones" },
    { name: "Horarios", path: "/horarios" },

  ];

  const mobileMenuItems = [
    { name: "CATÁLOGOS", path: "/catalogs", icon: BookOpen },
    ...(showMysteryBox ? [{ name: "CAJA MISTERIOSA", path: "/caja-misteriosa", icon: Package }] : []),
    ...(showContests ? [{ name: "CONCURSOS", path: "/concursos", icon: Trophy }] : []),
    ...(showRaffles ? [{ name: "RIFAS", path: "/rifas", icon: Ticket }] : []),
    { name: "MAYORISTA", path: "/mayorista", icon: User },
    { name: "UBICACIONES", path: "/ubicaciones", icon: MapPin },
    { name: "HORARIOS", path: "/horarios", icon: Clock },
    { 
      name: "DIFUSIÓN", 
      icon: Radio, 
      onClick: () => {
        setIsOpen(false);
        setIsDifusionOpen(true);
      } 
    },
  ];

  return (
    <>
      {/* Top Navbar Header Bar */}
      <nav className="fixed top-0 w-full z-[60]">
        <div className={`w-full transition-all duration-300 ${
          scrolled 
            ? "bg-black/95 dark:bg-black/95 backdrop-blur-md shadow-sm border-b border-gray-900" 
            : "bg-black dark:bg-black border-b border-gray-900"
        }`}>
          <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between relative z-50">
            <Link to="/" className="text-white dark:text-white py-1">
              <Logo className="h-30 md:h-30" />
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className={`group relative text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      isActive ? "text-white" : "text-white/70 hover:text-chrome"
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-[1px] bg-white transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 bg-white/40 group-hover:w-full"
                    }`}></span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => setIsDifusionOpen(true)}
                className="group relative text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-chrome cursor-pointer"
              >
                Difusión
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/40 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>

            <div className="flex items-center space-x-6">
              {showRouletteBtn && (
                <button 
                  onClick={() => setIsRouletteOpen(true)}
                  className="hidden md:flex items-center gap-2 group relative text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-chrome"
                >
                  <svg 
                    className="w-4 h-4 text-current animate-[spin_5s_linear_infinite]" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeDasharray="4 2" />
                    <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                  <span>Ruleta</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/40 transition-all duration-300 group-hover:w-full"></span>
                </button>
              )}

              <button 
                onClick={() => setIsCartOpen(true)}
                className="group relative text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-chrome"
              >
                Carrito ({totalItemsCount})
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/40 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              <button 
                className="md:hidden z-50 p-2 ml-4 text-white dark:text-white"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#070709] z-[55] flex flex-col pt-20 pb-8 px-4 overflow-y-auto"
          >
            <div className="w-full max-w-sm mx-auto flex flex-col space-y-2.5 pt-3.5 pb-6">
              {mobileMenuItems.map((item) => {
                const Icon = item.icon;
                const cardContent = (
                  <div className="w-full h-14 px-4 bg-[#111215] border border-zinc-700/80 hover:border-zinc-300 rounded-xl flex items-center justify-between transition-all duration-200 group active:scale-[0.99] shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#1b1c20] border border-zinc-600/80 group-hover:border-zinc-300 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-white group-hover:text-zinc-100 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                  </div>
                );

                if (item.path) {
                  return (
                    <Link 
                      key={item.name} 
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      {cardContent}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={item.onClick}
                    className="block w-full text-left cursor-pointer"
                  >
                    {cardContent}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="w-full h-[1px] bg-zinc-800/80 my-2"></div>

              {/* Ruleta Option */}
              {showRouletteBtn && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsRouletteOpen(true);
                  }}
                  className="block w-full text-left cursor-pointer"
                >
                  <div className="w-full h-14 px-4 bg-gradient-to-r from-[#14151a] to-[#101114] border border-zinc-500/90 hover:border-zinc-200 rounded-xl flex items-center justify-between transition-all duration-200 group shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.99]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#1c1d22] border border-zinc-400 group-hover:border-white flex items-center justify-center shrink-0 transition-colors">
                        <svg 
                          className="w-4 h-4 text-zinc-200 group-hover:text-white animate-[spin_8s_linear_infinite]" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeDasharray="4 2" />
                          <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" />
                          <circle cx="12" cy="12" r="2" fill="currentColor" />
                        </svg>
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-white group-hover:text-zinc-100 transition-colors">
                        RULETA
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
                  </div>
                </button>
              )}

              {/* Lion Watermark Emblem at Bottom */}
              <div className="flex items-center justify-center gap-3 pt-6 pb-2 w-full max-w-[220px] mx-auto select-none pointer-events-none">
                <div className="h-[1px] bg-gradient-to-r from-transparent to-zinc-700/60 flex-1"></div>
                <img 
                  src={lionWatermark} 
                  alt="" 
                  className="w-12 h-12 object-contain opacity-25 filter grayscale contrast-125" 
                />
                <div className="h-[1px] bg-gradient-to-l from-transparent to-zinc-700/60 flex-1"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <RouletteModal isOpen={isRouletteOpen} onClose={() => setIsRouletteOpen(false)} />
      <DifusionModal isOpen={isDifusionOpen} onClose={() => setIsDifusionOpen(false)} />
      <CartDrawer />
    </>
  );
}
