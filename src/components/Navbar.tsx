import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import RouletteModal from "./RouletteModal";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import { HomeService, ContestService, RaffleService } from "../services/api";
import Logo from "./Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
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

  ];

  return (
    <>
      {/* Top Navbar Header Bar */}
      <nav className="fixed top-0 w-full z-50">
        <div className={`w-full transition-all duration-300 ${
          scrolled 
            ? "bg-black/95 dark:bg-black/95 backdrop-blur-md shadow-sm border-b border-gray-900" 
            : "bg-black dark:bg-black border-b border-gray-900"
        }`}>
          <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between relative z-50">
            <Link to="/" className="text-white dark:text-white py-1">
              <Logo className="h-11 md:h-12" />
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="group relative text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-chrome"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/40 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
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

      {/* Mobile Menu Overlay - Placed outside backdrop-blur container so fixed inset-0 covers 100% viewport */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-40 flex flex-col justify-start items-center pt-32 pb-12 overflow-y-auto space-y-5 px-6"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="group relative text-2xl md:text-3xl font-black uppercase tracking-tighter text-white/70 hover:text-chrome transition-colors text-center py-1 inline-block"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white/40 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            {showRouletteBtn && (
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsRouletteOpen(true);
                }}
                className="group relative flex items-center gap-3 text-2xl md:text-3xl font-black uppercase tracking-tighter text-white/70 hover:text-chrome transition-colors mt-6 inline-flex"
              >
                <svg 
                  className="w-7 h-7 text-current animate-[spin_5s_linear_infinite]" 
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
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white/40 transition-all duration-300 group-hover:w-full"></span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <RouletteModal isOpen={isRouletteOpen} onClose={() => setIsRouletteOpen(false)} />
      <CartDrawer />
    </>
  );
}
