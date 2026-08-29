import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StoreService } from "../services/api";
import { Store } from "../types";
import AnimatedSection from "../components/AnimatedSection";
import { ArrowRight, MapPin } from "lucide-react";

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
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
                      {store.name}
                    </h2>
                    <div className="flex items-center text-white/90 space-x-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm tracking-widest">{store.address}</span>
                    </div>
                    <div className="inline-flex items-center space-x-2 text-white font-bold uppercase tracking-widest text-sm group/btn">
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
