import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Package, Sparkles, Check, Gift, ShieldCheck, MessageCircle, ArrowRight, Zap, RefreshCw, Lock, Award } from 'lucide-react';
import { HomeService } from '../services/api';
import { MysteryBoxSetting, Product } from '../types';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { formatPrice } from '../utils/format';

export default function MysteryBox() {
  const [config, setConfig] = useState<MysteryBoxSetting>({
    id: 1,
    title: 'Caja Misteriosa',
    description: 'Recibe de 2 a 3 prendas exclusivas seleccionadas de nuestra última colección. ¡Edición limitada con prendas de valor superior al costo de la caja!',
    price: 90000,
    estimatedValue: '+$160.000',
    revealedSubtext: '2-3 Prendas Sorpresa',
    perk1: 'Contiene de 2 a 3 productos.',
    perk2: 'Empaque de regalo oficial de edición limitada.',
    perk3: '',
    sizes: 'S,M,L,XL,XXL',
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const { addToCart } = useCart();

  useEffect(() => {
    HomeService.getMysteryBoxConfig()
      .then((data) => {
        if (data) {
          setConfig(data);
          if (data.sizes) {
            const firstSize = data.sizes.split(',')[0]?.trim();
            if (firstSize) setSelectedSize(firstSize);
          }
        }
      })
      .catch((err) => console.error('Error fetching mystery box config:', err))
      .finally(() => setLoading(false));
  }, []);

  const availableSizes = config.sizes && config.sizes.trim().length > 0
    ? config.sizes.split(',').map(s => s.trim())
    : ['S', 'M', 'L', 'XL', 'XXL'];

  const handleOpenBox = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);

    // Fast multi-stage fireworks confetti (total under 1.2s)
    setTimeout(() => {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#ffffff', '#dc2626', '#eab308', '#000000', '#f59e0b']
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 50,
          origin: { x: 0 },
          colors: ['#ffffff', '#eab308', '#dc2626']
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 50,
          origin: { x: 1 },
          colors: ['#ffffff', '#eab308', '#dc2626']
        });
      }, 150);

      setIsOpening(false);
      setIsOpened(true);
    }, 1100);
  };

  const handleBuyOnWhatsApp = () => {
    const formattedPrice = formatPrice(config.price);
    const message = `Hola JDQSTORE!  Me interesa comprar la *${config.title}*\n\n` +
      ` *Detalles del pedido:*\n` +
      `• Producto: ${config.title}\n` +
      `• Talla de productos: ${selectedSize}\n` +
      `• Precio: ${formattedPrice}\n\n` +
      `¿Podrían confirmarme los métodos de pago disponibles para realizar el pedido?`;

    const whatsappUrl = `https://wa.me/573012690047?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-28">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Cargando la Experiencia Premium...</p>
        </div>
      </div>
    );
  }

  if (!config.active) {
    return (
      <div className="min-h-screen bg-black text-white pt-36 px-6 flex items-center justify-center">
        <div className="max-w-md text-center bg-gray-950 p-10 border border-gray-900 shadow-2xl">
          <div className="w-16 h-16 bg-red-950/50 border border-red-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-3">Caja Misteriosa Inactiva</h1>
          <p className="text-xs text-white/50 leading-relaxed mb-8">
            Las cajas misteriosas de esta temporada están agotadas o pausadas temporalmente por el administrador. ¡Vuelve pronto o revisa nuestros catálogos!
          </p>
          <Link
            to="/catalogs"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors"
          >
            Ver Catálogos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-10 overflow-hidden relative selection:bg-red-600 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[150px] pointer-events-none transition-all duration-1000 ${isOpened ? 'bg-amber-600/20' : 'bg-red-900/15'}`} />
      <div className="absolute top-2/3 left-1/3 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-4 shadow-lg shadow-red-950/50"
          >
            <Sparkles className="w-3.5 h-3.5" /> EDICIÓN LIMITADA MYSTERY DROP
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4"
          >
            {config.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/50 tracking-wide font-light max-w-lg mx-auto"
          >
            {config.description}
          </motion.p>
        </div>

        {/* Layout Container: Dynamic Transition from Centered Box to Grid */}
        <div className={`transition-all duration-700 ${isOpened ? 'grid grid-cols-1 lg:grid-cols-12 gap-10 items-center' : 'flex flex-col items-center justify-center'}`}>
          
          {/* Box Canvas Area */}
          <div className={`${isOpened ? 'lg:col-span-7' : 'w-full max-w-xl'} flex flex-col items-center justify-center relative min-h-[440px] bg-gradient-to-b from-gray-950/90 via-black to-gray-950/80 p-8 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-700`}>
            
            {/* Box Glow Halo */}
            <div className={`absolute w-80 h-80 rounded-full transition-all duration-1000 pointer-events-none ${isOpened ? 'bg-amber-500/25 blur-3xl scale-125' : 'bg-red-600/25 blur-2xl animate-pulse'}`} />

            {/* Light Beams background effect during opening */}
            <AnimatePresence>
              {isOpening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.4, rotate: 180 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                >
                  <div className="w-96 h-96 bg-gradient-to-r from-amber-400/20 via-red-600/30 to-amber-400/20 rounded-full blur-xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Box Motion Element */}
            <motion.div
              onClick={handleOpenBox}
              whileHover={{ scale: isOpened ? 1 : 1.06 }}
              whileTap={{ scale: isOpened ? 1 : 0.94 }}
              animate={
                isOpening
                  ? {
                      rotate: [0, -10, 10, -10, 10, -6, 6, 0],
                      scale: [1, 1.12, 1.05, 1.18, 1.02, 1],
                      transition: { duration: 1.0 }
                    }
                  : isOpened
                  ? { y: 0 }
                  : { y: [0, -12, 0] }
              }
              transition={isOpening || isOpened ? {} : { repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className={`relative select-none py-6 z-10 ${!isOpened ? 'cursor-pointer group' : ''}`}
            >
              {/* Box Container */}
              <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  
                  {/* Top Lid */}
                  <motion.div
                    animate={
                      isOpened
                        ? { y: -110, rotate: -32, opacity: 0.85 }
                        : isOpening
                        ? { y: -25, rotate: -5 }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
                    className="w-56 h-20 bg-gradient-to-r from-red-700 via-red-600 to-red-800 border-2 border-red-400 rounded-t-xl shadow-2xl relative z-20 flex items-center justify-center"
                  >
                    <div className="w-10 h-full bg-amber-400/90 border-x border-amber-300 shadow-inner" />
                    <div className="absolute -top-4 w-12 h-8 bg-amber-400 rounded-full border border-amber-200 flex items-center justify-center shadow-lg">
                      <Gift className="w-5 h-5 text-black" />
                    </div>
                  </motion.div>

                  {/* Main Box Body */}
                  <div className="w-56 h-40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-red-600/90 rounded-b-xl shadow-2xl relative z-10 flex flex-col items-center justify-center overflow-hidden">
                    {/* Golden Ribbon Vertical */}
                    <div className="absolute inset-y-0 w-10 bg-amber-400/90 border-x border-amber-300" />
                    
                    {/* Inside Revealed Content */}
                    <AnimatePresence>
                      {isOpened && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.4, y: 40 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="absolute inset-0 bg-gradient-to-t from-red-950/95 via-black/90 to-transparent z-30 flex flex-col items-center justify-center p-4 text-center"
                        >
                          <Sparkles className="w-9 h-9 text-amber-400 animate-bounce mb-1" />
                          <span className="text-xs font-black uppercase text-white tracking-widest drop-shadow-md">
                            ¡CONTENIDO REVELADO!
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono tracking-wider mt-1 px-2 py-0.5 bg-black/60 border border-amber-500/40 rounded">
                            {config.revealedSubtext || '2-3 Productos Premium Sorpresa'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isOpened && (
                      <div className="relative z-20 text-center">
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-4xl font-black text-white drop-shadow-lg block"
                        >
                          ?
                        </motion.span>
                        <p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mt-1">
                          JDQ EXCLUSIVE
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Floating Badges Popping out when Opened */}
                {isOpened && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 0, x: 0 }}
                      animate={{ opacity: 1, y: -135, x: -100, rotate: -15 }}
                      transition={{ duration: 0.7 }}
                      className="absolute bg-gray-900/90 backdrop-blur-md text-amber-400 p-3 border border-amber-400/60 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                      <Package className="w-4 h-4 text-red-500" /> Pack Exclusivo
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 0, x: 0 }}
                      animate={{ opacity: 1, y: -145, x: 90, rotate: 12 }}
                      transition={{ duration: 0.8 }}
                      className="absolute bg-gray-900/90 backdrop-blur-md text-white p-3 border border-white/30 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                      <Zap className="w-4 h-4 text-amber-400" /> Drop Exclusivo
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Instruction helper text */}
            <div className="mt-4 text-center relative z-20">
              {!isOpened ? (
                <motion.button
                  onClick={handleOpenBox}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 mx-auto animate-pulse"
                >
                  <Sparkles className="w-4 h-4" /> Toca para Abrir la Caja
                </motion.button>
              ) : (
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4" /> ¡Caja Abierta! Selecciona tu Talla abajo
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Card with Price, Perks, Sizes & Add to Cart (Appears when isOpened === true) */}
          <AnimatePresence>
            {isOpened && (
              <motion.div
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 space-y-6"
              >
                <div className="bg-gradient-to-b from-gray-950 via-black to-gray-950 p-8 border border-white/15 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
                  
                  {/* Subtle Top Accent Bar */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />

                  {/* Price Banner */}
                  <div className="flex items-baseline justify-between border-b border-gray-800/80 pb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Precio Especial</span>
                      <span className="text-4xl font-black text-white tracking-tight">{formatPrice(config.price)}</span>
                    </div>
                    <div className="text-right">
                      {config.estimatedValue && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/90 px-3 py-1.5 border border-emerald-800 block mb-1 shadow-sm">
                          VALOR ESTIMADO {config.estimatedValue}
                        </span>
                      )}
                      <span className="text-[10px] text-white/40 font-mono">Edición de Coleccionista</span>
                    </div>
                  </div>

                  {/* Perks List (Configurable by Admin) */}
                  <div className="space-y-3.5 py-1">
                    {config.perk1 && (
                      <div className="flex items-center gap-3 text-xs text-gray-200">
                        <div className="w-6 h-6 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shrink-0 shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{config.perk1}</span>
                      </div>
                    )}
                    {config.perk2 && (
                      <div className="flex items-center gap-3 text-xs text-gray-200">
                        <div className="w-6 h-6 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shrink-0 shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{config.perk2}</span>
                      </div>
                    )}
                    {config.perk3 && (
                      <div className="flex items-center gap-3 text-xs text-gray-200">
                        <div className="w-6 h-6 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shrink-0 shadow">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{config.perk3}</span>
                      </div>
                    )}
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-3 pt-3 border-t border-gray-800/80">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
                      SELECCIONA TU TALLA DE PRODUCTOS
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {availableSizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`py-3 text-xs font-black uppercase tracking-wider border transition-all ${
                            selectedSize === sz
                              ? 'bg-white text-black border-white shadow-lg scale-105'
                              : 'bg-black text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Direct Purchase CTA */}
                  <button
                    onClick={handleBuyOnWhatsApp}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-emerald-600/40 group rounded-none"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" />
                    COMPRAR POR WHATSAPP ({formatPrice(config.price)})
                  </button>

                  <p className="text-[10px] text-center text-white/40 tracking-wider uppercase font-mono">
                    ENVÍO RÁPIDO DISPONIBLE A NIVEL NACIONAL
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
