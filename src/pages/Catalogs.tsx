import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StoreService } from "../services/api";
import { Store } from "../types";
import AnimatedSection from "../components/AnimatedSection";
import { ArrowRight, MapPin, Building2 } from "lucide-react";

function getStoreBarrioFallback(name?: string, address?: string): string {
  const n = (name || "").toUpperCase();
  const a = (address || "").toUpperCase();
  if (n.includes("CIUDAD MODELO") || a.includes("MODELO")) return "Ciudad Modelo";
  if (n.includes("VILLA COLOMBIA") || a.includes("52#13A") || a.includes("COLOMBIA")) return "Villa Colombia";
  if (n.includes("ISRAEL") || a.includes("ISRAEL")) return "República de Israel";
  if (n.includes("MARIANO RAMOS") || a.includes("MARIANO")) return "Mariano Ramos";
  return "";
}

export default function Catalogs() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StoreService.getStores().then(data => {
      setStores(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-chrome">
            Nuestros <span className="text-chrome">Catálogos</span>
          </h1>
           <p className="text-lg text-white">
            Explora las colecciones exclusivas disponibles en cada una de nuestras ubicaciones. 
            Cada sede cuenta con un inventario cuidadosamente seleccionado.
          </p>
        </div>
      </AnimatedSection>

      {loading ? (
        <div className="text-center py-20">Cargando sedes...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12">
          {stores.map((store, index) => (
            <AnimatedSection key={store.id} delay={index * 0.1}>
              <Link 
                to={`/catalogs/${store.id}`} // En un entorno real se podría usar un 'slug' de la sede, pero usamos el ID
                className="group block relative aspect-[4/3] overflow-hidden bg-gray-100"
              >
                <img
                  src={store.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:bg-black/60" />
                
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-2 flex flex-col items-start">
                    
                    {/* Badge de Barrio */}
                    {(store.barrio || getStoreBarrioFallback(store.name, store.address)) && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/80 backdrop-blur-md border border-white/30 rounded-full mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                        <Building2 className="w-3.5 h-3.5 text-zinc-300" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                          BARRIO {store.barrio || getStoreBarrioFallback(store.name, store.address)}
                        </span>
                      </div>
                    )}

                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 leading-none drop-shadow-md">
                      {store.name}
                    </h2>

                    <div className="flex items-center text-white/90 space-x-2 mb-4">
                      <MapPin className="w-4 h-4 text-white/60 shrink-0" />
                      <span className="text-xs md:text-sm tracking-wide text-white/80">{store.address}</span>
                    </div>

                    <div className="inline-flex items-center space-x-2 text-white font-bold uppercase tracking-widest text-sm group/btn mt-1">
                      <span>Ver Catálogo</span>
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
