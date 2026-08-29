import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { X, RefreshCw, Lock } from "lucide-react";
import { HomeService } from "../services/api";
import { RouletteSetting } from "../types";

export default function RouletteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [rouletteSetting, setRouletteSetting] = useState<RouletteSetting | null>(null);
  const [prizes, setPrizes] = useState<number[]>([5, 10, 15, 20, 25, 10, 5, 15]);

  useEffect(() => {
    HomeService.getRouletteConfig()
      .then((config) => {
        if (config) {
          setRouletteSetting(config);
          if (config.values) {
            const vals = config.values.split(',').map(v => parseInt(v.trim(), 10) || 5);
            setPrizes(vals);
          }
        }
      })
      .catch((err) => console.error("Error loading roulette config inside modal:", err));
  }, [isOpen]);

  const spin = () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);

    let prizeIndex = 0;

    if (rouletteSetting && rouletteSetting.probabilities) {
      const probs = rouletteSetting.probabilities.split(',').map(p => parseFloat(p.trim()) || 0);
      const totalWeight = probs.reduce((sum, current) => sum + current, 0);
      
      let randomVal = Math.random() * (totalWeight > 0 ? totalWeight : 100);
      let cumulativeSum = 0;
      
      for (let i = 0; i < prizes.length; i++) {
        const weight = probs[i] !== undefined ? probs[i] : (100 / prizes.length);
        cumulativeSum += weight;
        if (randomVal <= cumulativeSum) {
          prizeIndex = i;
          break;
        }
      }
    } else {
      prizeIndex = Math.floor(Math.random() * prizes.length);
    }
    
    const spins = 5;
    const degreesPerSlice = 360 / prizes.length;
    const targetRotation = rotation + (360 * spins) + (prizes.length - prizeIndex) * degreesPerSlice - (degreesPerSlice / 2);
    
    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setResult(prizes[prizeIndex]);
      localStorage.setItem('hasSpunRouletteThisWeek', 'true');
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffffff', '#888888', '#000000']
      });
    }, 5000);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-none"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#080808] border border-white/10 rounded-xl p-8 max-w-[450px] w-full relative pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white mb-1">Día de</h2>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 mb-2 filter drop-shadow-lg">
              Ruleta
            </h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Gira y obtén tu descuento</p>
          </div>

          <div className="relative w-[300px] h-[300px] mx-auto mb-10">
            {/* Pointer Triangle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <div className="relative w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-red-600">
                <div className="absolute -top-[20px] -left-[3px] w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Outer Rim */}
            <div className="absolute inset-0 rounded-full border-[12px] border-[#1a1a1a] shadow-[0_0_20px_rgba(0,0,0,1)] z-20 pointer-events-none">
               {/* Decorative Rivets */}
               {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                 <div 
                   key={deg} 
                   className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"
                   style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-145px)` }}
                 />
               ))}
            </div>

            {/* Inner Center Circle (No Logo) */}
            <div className="absolute inset-0 m-auto w-[60px] h-[60px] bg-[#111] border-[6px] border-[#1a1a1a] rounded-full z-20 shadow-[inset_0_2px_10px_rgba(0,0,0,1),_0_4px_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <div className="w-3 h-3 bg-white/10 rounded-full"></div>
            </div>
            
            {/* Wheel */}
            <motion.div 
              className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                background: (() => {
                  const degs = 360 / prizes.length;
                  let gradient = "conic-gradient(";
                  for (let i = 0; i < prizes.length; i++) {
                    const color = i % 2 === 0 ? "#111111" : "#e5e5e5";
                    const start = i * degs;
                    const end = (i + 1) * degs;
                    gradient += `${color} ${start}deg ${end}deg${i === prizes.length - 1 ? "" : ", "}`;
                  }
                  gradient += ")";
                  return gradient;
                })()
              }}
            >
              {prizes.map((prize, i) => {
                const angle = i * (360 / prizes.length) + (360 / prizes.length) / 2;
                const isDark = i % 2 === 0;
                return (
                  <div 
                    key={i}
                    className="absolute inset-0 flex items-start justify-center"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div 
                      className={`pt-10 flex flex-col items-center leading-none ${isDark ? 'text-white' : 'text-black'}`}
                    >
                      <span className="font-black text-3xl tracking-tighter">{prize}<span className="text-xl">%</span></span>
                      <span className="font-bold text-[10px] tracking-widest mt-1">OFF</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="text-center px-4">
            {hasSpun ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-2xl font-black uppercase text-white">¡Ganaste un {result}%!</p>
                <div className="bg-white/5 p-4 border border-white/20 rounded-lg">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mb-2">Tu cupón:</p>
                  <p className="text-2xl font-black tracking-widest text-white">JDQSTORE{result}</p>
                </div>
                <p className="text-xs text-white/40 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" /> Válido por 24 horas.
                </p>
              </div>
            ) : (
              <>
                <button 
                  onClick={spin}
                  disabled={isSpinning}
                  className="w-full flex items-center justify-center gap-3 bg-transparent border border-white text-white py-4 px-6 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  {isSpinning ? 'Girando...' : 'Girar la Ruleta'}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-white/40 uppercase tracking-widest font-bold">
                  <Lock className="w-3 h-3" /> Promociones válidas por tiempo limitado
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
