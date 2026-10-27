import AnimatedSection from "../components/AnimatedSection";
import { MapPin, Clock } from "lucide-react";

import ciudadModeloImg from "@/assets/sede-ciudad-modelo.png";
import villaColombiaImg from "@/assets/sede-villa-colombia.png";
import republicaIsraelImg from "@/assets/sede-republica-israel.png";
import marianoRamosImg from "@/assets/sede-mariano-ramos.png";

interface StoreSchedule {
  name: string;
  image: string;
  schedules: {
    days: string;
    hours: string;
  }[];
}

const storesScheduleData: StoreSchedule[] = [
  {
    name: "CIUDAD MODELO",
    image: ciudadModeloImg,
    schedules: [
      { days: "LUNES A VIERNES", hours: "10:00 A.M. - 8:00 P.M." },
      { days: "SÁBADOS", hours: "10:00 A.M. - 8:30 P.M." },
      { days: "DOMINGOS", hours: "10:00 A.M. - 8:00 P.M." },
    ],
  },
  {
    name: "VILLA COLOMBIA",
    image: villaColombiaImg,
    schedules: [
      { days: "LUNES A VIERNES", hours: "10:00 A.M. - 8:00 P.M." },
      { days: "SÁBADOS", hours: "10:00 A.M. - 8:30 P.M." },
      { days: "DOMINGOS", hours: "10:00 A.M. - 8:00 P.M." },
    ],
  },
  {
    name: "REPÚBLICA DE ISRAEL",
    image: republicaIsraelImg,
    schedules: [
      { days: "LUNES A VIERNES", hours: "10:00 A.M. - 8:00 P.M." },
      { days: "SÁBADOS", hours: "10:00 A.M. - 8:30 P.M." },
      { days: "DOMINGOS", hours: "10:00 A.M. - 5:00 P.M." },
    ],
  },
  {
    name: "MARIANO RAMOS",
    image: marianoRamosImg,
    schedules: [
      { days: "LUNES A VIERNES", hours: "10:00 A.M. - 8:00 P.M." },
      { days: "SÁBADOS", hours: "10:00 A.M. - 8:30 P.M." },
      { days: "DOMINGOS", hours: "10:00 A.M. - 5:00 P.M." },
    ],
  },
];

export default function Schedules() {
  return (
    <div className="pt-28 md:pt-36 pb-24 w-full bg-black text-white min-h-screen">
      
      {/* ── Encabezado ────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-14 text-center">
        <AnimatedSection>
          <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400 block mb-2">
            HORARIOS DE ATENCIÓN
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-chrome italic leading-none mb-4 drop-shadow-[0_10px_20px_rgba(255,255,255,0.12)]">
            HORARIOS
          </h1>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-zinc-400">
            NUESTRAS 4 SEDES, SIEMPRE CERCA DE TI
          </p>
        </AnimatedSection>
      </div>

      {/* ── Cuadrícula de 4 Sedes ─────────────────────────────────── */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {storesScheduleData.map((store, index) => (
            <AnimatedSection key={store.name} delay={index * 0.08}>
              <div className="flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 h-full group">
                
                {/* Foto superior con difuminado suave */}
                <div className="aspect-[16/10] overflow-hidden bg-black/60 relative">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[15%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col flex-1">
                  
                  {/* Ícono de ubicación */}
                  <MapPin className="w-5 h-5 text-white mb-2 shrink-0" />

                  {/* Nombre de la Sede */}
                  <h2 className="text-xl font-black italic uppercase tracking-wider text-white leading-tight">
                    {store.name}
                  </h2>

                  {/* Línea divisoria decorativa bajo el nombre */}
                  <div className="w-12 h-[2px] bg-white/40 mb-6 mt-2"></div>

                  {/* Lista de horarios */}
                  <div className="space-y-4 flex-1">
                    {store.schedules.map((schedule, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
                            {schedule.days}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                            {schedule.hours}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* ── Mensaje de cierre inferior ────────────────────────────── */}
      <AnimatedSection delay={0.35}>
        <div className="flex items-center justify-center gap-4 mt-20 max-w-2xl mx-auto px-6">
          <div className="h-[1px] bg-white/15 flex-1"></div>
          <Clock className="w-4 h-4 text-white/40 shrink-0" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-white/50 uppercase text-center whitespace-nowrap">
            GRACIAS POR SER PARTE DE NUESTRA COMUNIDAD
          </span>
          <div className="h-[1px] bg-white/15 flex-1"></div>
        </div>
      </AnimatedSection>

    </div>
  );
}
