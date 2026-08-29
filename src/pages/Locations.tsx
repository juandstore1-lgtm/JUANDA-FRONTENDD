import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StoreService } from "../services/api";
import { Store } from "../types";
import AnimatedSection from "../components/AnimatedSection";
import { MapPin, Clock, ExternalLink } from "lucide-react";

export default function Locations() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    StoreService.getStores().then(setStores);
  }, []);

  return (
    <div className="pt-28 pb-20 w-full">

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-14">
        <AnimatedSection>
          {/* Small chrome label */}
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-chrome block mb-3">
            Visítanos en Cali
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-chrome mb-6">
            Nuestras Sedes
          </h1>
          <p className="text-sm text-white max-w-sm leading-relaxed">
          </p>
        </AnimatedSection>
      </div>

      {/* ── Store Cards Grid ─────────────────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stores.map((store, index) => (
            <AnimatedSection key={store.id} delay={index * 0.08}>
              <div className="flex flex-col bg-[#0d0d0d] border border-white/[0.07] overflow-hidden group hover:border-white/20 transition-colors duration-300">

                {/* Photo */}
                <div className="aspect-[4/3] overflow-hidden bg-black/40 relative">
                  <img
                    src={store.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={store.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[20%]"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">

                  {/* Badge */}
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-chrome block mb-2">
                    Sede
                  </span>

                  {/* Store Name */}
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white leading-tight mb-4">
                    {store.name}
                  </h2>

                  {/* Info */}
                  <div className="space-y-3 mb-5 flex-1">
                    {/* Address */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <MapPin className="w-3 h-3 text-white/50 flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Dirección</span>
                      </div>
                      <p className="text-xs text-white font-medium leading-snug pl-4">{store.address}</p>
                    </div>

                    {/* Schedule */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Clock className="w-3 h-3 text-white/50 flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Horarios</span>
                      </div>
                      <p className="text-xs text-white font-medium leading-snug whitespace-pre-line pl-4">{store.schedule}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/[0.07] mb-4" />

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-white/20 text-white hover:bg-white/10 transition-colors px-3 py-2.5 text-[9px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-1.5"
                    >
                      Ver Mapa <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link
                      to={`/catalogs/${store.id}`}
                      className="flex-1 border border-white/20 text-white hover:bg-white/10 transition-colors px-3 py-2.5 text-[9px] font-black uppercase tracking-widest inline-flex items-center justify-center"
                    >
                      Ver Catálogo
                    </Link>
                  </div>

                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

    </div>
  );
}
