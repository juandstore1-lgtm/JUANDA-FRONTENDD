import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductService, HomeService } from "../services/api";
import { Product, HeroSlide, HomeCategoryCollection, MysteryBoxSetting } from "../types";
import { ArrowRight, ChevronLeft, ChevronRight, Package, MapPin, Clock, ShieldCheck } from "lucide-react";
import AnimatedSection from "../components/AnimatedSection";
import ProductCard from "../components/ProductCard";
import { formatPrice } from "../utils/format";
import locationBannerImg from "@/assets/sedes.png";
import mysteryBoxImg from "@/assets/cajamisteriosa.jpg";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [mysteryBoxSetting, setMysteryBoxSetting] = useState<MysteryBoxSetting | null>(null);

  
  // Interactive Collections State
  const [categoryCollections, setCategoryCollections] = useState<HomeCategoryCollection[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  // Auto-play category collections carousel every 3 seconds (3000ms)
  useEffect(() => {
    if (categoryCollections.length <= 1) return;
    const interval = setInterval(() => {
      setActiveCategoryIndex((prev) => (prev + 1) % categoryCollections.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categoryCollections.length]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodList, heroConfig, collectionsList, mysteryConfig] = await Promise.all([
          ProductService.getProducts(),
          HomeService.getHeroConfig(),
          HomeService.getHomeCollections().catch(() => []),
          HomeService.getMysteryBoxConfig()
        ]);
        setProducts(prodList);
        setSlides(heroConfig.slides.sort((a, b) => a.slideOrder - b.slideOrder));
        setCategoryCollections(collectionsList);
        setMysteryBoxSetting(mysteryConfig);
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);





  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-sm tracking-widest uppercase">
        Cargando JDQSTORE...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Cinematic Full Width Banner */}
      <section className="relative h-[380px] md:h-[480px] lg:h-[540px] mt-20 w-full overflow-hidden bg-black group border-b border-gray-900">
        {slides.length > 0 && (
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-10000 group-hover:scale-105" 
                style={{backgroundImage: `url('${slides[currentSlide]?.imageUrl}')`}}
              ></div>

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40"></div>

              {/* Top / Right Subtext Overlay */}
              <div className="absolute top-10 right-12 z-10 text-right hidden md:block">
                <span className="text-white text-[11px] font-black tracking-[0.4em] uppercase opacity-90 block">
                  NUEVAS
                </span>
                <span className="text-white text-sm font-black tracking-[0.3em] uppercase block">
                  COLECCIONES
                </span>
              </div>

              {/* Bottom Left Slide Info Overlay */}
              <div className="absolute bottom-24 left-8 md:left-14 text-white z-10 text-left max-w-lg">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-bold tracking-[0.4em] uppercase mb-1 block text-white/60"
                >
                  {slides[currentSlide]?.season}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-4xl font-black italic uppercase leading-none text-white tracking-wider"
                >
                  {slides[currentSlide]?.title}
                </motion.h2>
              </div>

              {/* Center Bottom Glassmorphism COMPRAR Button */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-2xl px-4">
                <Link
                  to={"/catalogs"}
                  className="w-full py-3.5 px-8 bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/50 text-white font-black uppercase text-xs md:text-sm tracking-[0.3em] transition-all duration-300 shadow-2xl flex items-center justify-center rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  COMPRAR
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Carousel Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-10 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Seamless Infinite Marquee Ticker Banner */}
      <div className="bg-black border-b border-white/10 py-3.5 overflow-hidden select-none relative">
        <div className="flex w-max animate-marquee">
          {/* Track 1 */}
          <div className="flex shrink-0 items-center space-x-8 pr-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/90">
            <span>ENVÍOS A TODO COLOMBIA</span>
            <span>•</span>
            <span>NUEVA COLECCIÓN</span>
            <span>•</span>
            <span>ENVÍOS A TODO COLOMBIA</span>
            <span>•</span>
            <span>NUEVA COLECCIÓN</span>
            <span>•</span>
          </div>
          {/* Track 2 (Duplicate for 100% seamless loop) */}
          <div className="flex shrink-0 items-center space-x-8 pr-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/90" aria-hidden="true">
            <span>ENVÍOS A TODO COLOMBIA</span>
            <span>•</span>
            <span>NUEVA COLECCIÓN</span>
            <span>•</span>
            <span>ENVÍOS A TODO COLOMBIA</span>
            <span>•</span>
            <span>NUEVA COLECCIÓN</span>
            <span>•</span>
            <span>ENVÍOS A TODO COLOMBIA</span>

          </div>
        </div>
      </div>

      {/* LAS MEJORES COLECCIONES (Administrables desde el Panel Admin) */}
      <section className="py-20 w-full bg-black text-white border-b border-white/10">
        <div className="w-[80%] mx-auto text-center">
          <AnimatedSection>
            {/* Header Title */}
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/50 block mb-1">
              LAS MEJORES
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-10 text-chrome italic">
              COLECCIONES
            </h2>

            {/* Main Interactive Showcase Card Container */}
            {categoryCollections.length > 0 && (
              <div className="relative bg-[#080808] border border-white/20 rounded-3xl p-6 md:p-12 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] min-h-[520px] md:min-h-[620px] flex flex-col justify-between group">
                
                {/* 1. FULL BACKGROUND CATEGORY IMAGE COVERAGE */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategoryIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.65 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                  >
                    <img
                      src={categoryCollections[activeCategoryIndex]?.imageUrl}
                      alt={categoryCollections[activeCategoryIndex]?.name}
                      className="w-full h-full object-cover scale-105 transition-transform duration-10000"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Dark Gradient Overlay for optimal text and controls contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/50 z-10 pointer-events-none"></div>

                {/* Left/Right Navigation Arrows */}
                <button
                  onClick={() => setActiveCategoryIndex((prev) => (prev === 0 ? categoryCollections.length - 1 : prev - 1))}
                  className="absolute left-2 md:left-4 top-1/3 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/70 hover:bg-white text-white hover:text-black border border-white/30 flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-sm"
                  aria-label="Anterior categoría"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setActiveCategoryIndex((prev) => (prev === categoryCollections.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 md:right-4 top-1/3 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/70 hover:bg-white text-white hover:text-black border border-white/30 flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-sm"
                  aria-label="Siguiente categoría"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Bottom-Left Information Overlay */}
                <div className="relative z-20 text-left max-w-md mt-auto pt-44 md:pt-56 pl-2 md:pl-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 block mb-1">
                    COLECCIÓN
                  </span>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
                    {categoryCollections[activeCategoryIndex]?.name}
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 mb-6 leading-relaxed">
                    {categoryCollections[activeCategoryIndex]?.description}
                  </p>
                  <Link
                    to="/catalogs"
                    className="inline-flex items-center gap-3 px-6 py-3 border border-white/40 hover:border-white bg-black/80 hover:bg-white text-white hover:text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-lg group backdrop-blur-md shadow-xl"
                  >
                    <span>VER COLECCIÓN</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Bottom Thumbnails Carousel */}
                <div className="relative z-20 mt-8 pt-6 border-t border-white/10 overflow-x-auto hide-scrollbar">
                  <div className="flex space-x-4 min-w-max pb-2">
                    {categoryCollections.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCategoryIndex(idx)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 w-28 md:w-32 bg-[#141414]/90 backdrop-blur-md ${
                          activeCategoryIndex === idx
                            ? "border-white bg-white/20 ring-2 ring-white/60 scale-105"
                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/40"
                        }`}
                      >
                        <div className="w-12 h-12 mb-2 overflow-hidden flex items-center justify-center rounded-lg border border-white/10">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-white truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </AnimatedSection>
        </div>
      </section>





      {/* Mystery Box Banner Section */}
      {mysteryBoxSetting?.active && (
        <section className="py-20 bg-[#080808] border-b border-white/10 text-white relative overflow-hidden">
          <div className="w-[80%] mx-auto">
            <AnimatedSection>
              <div className="relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[420px]">
                {/* ── LEFT: Content ── */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-between relative z-10">
                  <div className="space-y-5">
                    <span className="inline-flex items-center px-3 py-1 border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-full">
                      Edición Limitada
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight text-chrome" dangerouslySetInnerHTML={{ __html: mysteryBoxSetting.title.replace(/\n/g, '<br />') }}></h2>
                    <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                      {mysteryBoxSetting.description}
                    </p>
                    <div className="flex flex-wrap gap-6 pt-1">
                      {mysteryBoxSetting.perk1 && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border border-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white leading-tight">{mysteryBoxSetting.perk1}</p>
                          </div>
                        </div>
                      )}
                      {mysteryBoxSetting.perk2 && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border border-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m-3 0h13.5M5.625 9l.75 10.5h12.25L19.375 9M9.75 13.5v3m4.5-3v3" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white leading-tight">{mysteryBoxSetting.perk2}</p>
                          </div>
                        </div>
                      )}
                      {mysteryBoxSetting.perk3 && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border border-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white leading-tight">{mysteryBoxSetting.perk3}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-8 border-t border-white/10 mt-8">
                    <div>
                      <p className="text-4xl md:text-5xl font-black text-white font-mono leading-none">
                        {formatPrice(mysteryBoxSetting.price)}
                      </p>
                      <div className="mt-1">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Valor estimado</p>
                        <p className="text-xs text-white/40 line-through font-mono">{mysteryBoxSetting.estimatedValue}</p>
                      </div>
                    </div>
                    <Link
                      to="/caja-misteriosa"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-white/90 transition-all duration-300 shadow-2xl whitespace-nowrap rounded-lg"
                    >
                      <span>OBTENER MI CAJA</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="relative w-full md:w-[45%] min-h-[280px] md:min-h-0 overflow-hidden flex-shrink-0">
                  <img
                    src={mysteryBoxSetting.imageUrl || mysteryBoxImg}
                    alt={mysteryBoxSetting.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/30 to-transparent pointer-events-none" />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}



      {/* Physical Stores Location Map Banner Card */}
      <section className="py-20 bg-black text-white border-b border-white/10">
        <div className="w-[80%] mx-auto">
          <AnimatedSection>
            <div className="relative bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[420px]">
              
              {/* ── LEFT (Top on mobile): Content ── */}
              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center w-full md:w-[55%] lg:w-[50%]">
                <div className="mb-6">
                  {/* JDQ STORE metallic title */}
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-chrome italic mb-3 drop-shadow-2xl">
                    SEDES
                  </h2>

                </div>

                <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-sm mb-10">
                Visítanos en nuestras 4 tiendas físicas oficiales en Cali, Colombia. Estamos ubicados en puntos estratégicos de la ciudad para brindarte una atención cercana, rápida y personalizada.                </p>

                <div className="flex gap-4 md:gap-6 max-w-md">
                  <div className="flex flex-col items-center text-center border-r border-white/10 pr-4 md:pr-6 flex-1">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-3" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/50 leading-tight">4 Tiendas<br/>Oficiales</span>
                  </div>
                  <div className="flex flex-col items-center text-center border-r border-white/10 px-4 md:px-6 flex-1">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-3" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/50 leading-tight">Horarios de atención<br/>Ampliados</span>
                  </div>
                  <div className="flex flex-col items-center text-center pl-4 md:pl-6 flex-1">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white/80 mb-3" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/50 leading-tight">Atención directa<br/>y personalizada</span>
                  </div>
                </div>
              </div>

              {/* ── RIGHT (Bottom on mobile): Image & Button ── */}
              <div className="relative w-full md:w-[45%] lg:w-[50%] min-h-[300px] md:min-h-0 flex items-end justify-center md:justify-end p-8 md:p-12 flex-shrink-0">
                {/* Background Map Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={locationBannerImg}
                    alt="JDQ STORE - Sedes y Ubicaciones"
                    className="absolute inset-0 w-full h-full object-cover object-center md:object-right opacity-90 transition-transform duration-1000 hover:scale-105"
                  />
                  {/* Mobile Gradient: Fade top down into background color */}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050505] to-transparent md:hidden"></div>
                  {/* Mobile Gradient: Fade bottom up slightly for button readability */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050505] to-transparent md:hidden"></div>
                  
                  {/* Desktop Gradient: Fade left to right */}
                  <div className="absolute inset-y-0 left-0 w-[65%] bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent hidden md:block"></div>
                </div>

                {/* Button */}
                <Link
                  to="/ubicaciones"
                  className="relative z-10 inline-flex items-center gap-3 px-6 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-white/90 transition-all duration-300 rounded-lg shadow-2xl hover:scale-105 whitespace-nowrap"
                >
                  <span>VER SEDES Y UBICACIONES</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 w-full bg-black text-white border-b border-white/10">
        <div className="w-[80%] mx-auto">
          <AnimatedSection>
            {/* Header Title */}
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/50 block mb-1 text-center">
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-16 text-chrome italic text-center">
              PREGUNTAS FRECUENTES
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: "¿Hacen envíos a toda Colombia?",
                  a: "Sí, realizamos envíos seguros a nivel nacional. El tiempo estimado de entrega varía según tu ciudad, generalmente tomando de 2 a 5 días hábiles."
                },
                {
                  q: "¿Puedo cambiar una prenda?",
                  a: "Claro que sí. Tienes garantía y opción de cambio por talla, siempre y cuando la prenda mantenga sus etiquetas y condiciones originales."
                },
                {
                  q: "¿Qué métodos de pago aceptan?",
                  a: "Aceptamos pagos rápidos y seguros a través de transferencia (Bancolombia, Nequi, Daviplata), tarjetas y efectivo en nuestras tiendas físicas."
                },
                {
                  q: "¿Venden al por mayor?",
                  a: "Sí. Contamos con una Línea Mayorista para distribuidores. Puedes solicitar acceso desde el menú principal para obtener precios preferenciales."
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-[#050505] border border-white/10 p-8 rounded-2xl hover:border-white/30 transition-colors">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-white/90">{faq.q}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
