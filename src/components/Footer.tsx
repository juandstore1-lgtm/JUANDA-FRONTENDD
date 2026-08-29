import { ShoppingBag, ShieldCheck, Headphones, RefreshCw, Phone, MapPin, Mail } from "lucide-react";
import Logo from "./Logo";

const trustItems = [
  { icon: ShoppingBag, title: "Compras Seguras", sub: "Productos full calidad y la mejor atención." },
  { icon: ShieldCheck, title: "Productos Full Calidad", sub: "Colecciones exclusivas." },
  { icon: Headphones, title: "Atención Personalizada", sub: "Soporte directo uno a uno vía chat." },
  { icon: RefreshCw, title: "Cambios y Garantías", sub: "Garantía de satisfacción y cambios rápidos." },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.08] text-white">
      <div className="w-full max-w-[104rem] mx-auto px-6 md:px-12 lg:px-16 pt-6 pb-2">
        
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col items-center space-y-4">
            <Logo className="h-10 md:h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            <p className="text-sm text-white/50 leading-relaxed max-w-xs text-justify">
JDQ STORE nace de la unión de dos conceptos: Quality Store y Juand Store. Una marca creada con la visión de ofrecer productos 1.1, destacando por su exclusividad, calidad y estilo para Colombia. Representamos una nueva etapa, manteniendo nuestra esencia y llevando nuestra identidad a otro nivel.            </p>
            <ul className="space-y-3 pt-2 flex flex-col items-center">
              <li>
                <a href="https://wa.me/573012690047" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-light">+57 301 269 0047</span>
                </a>
              </li>
              <li>
                <a href="mailto:juandstore1@gmail.com" className="flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-light">juandstore1@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Ubicaciones */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-chrome italic drop-shadow-md leading-none mb-4">Nuestras Sedes</h4>
            <ul className="space-y-4 flex flex-col items-center">
              <li>
                <span className="text-xs font-bold text-white uppercase block mb-1">Sede Villa Colombia 📍</span>
                <span className="text-sm text-white/50">Calle 52 #13A-6</span>
              </li>
              <li>
                <span className="text-xs font-bold text-white uppercase block mb-1">Sede República de Israel 📍</span>
                <span className="text-sm text-white/50">Carrera 46 #38A-59</span>
              </li>
              <li>
                <span className="text-xs font-bold text-white uppercase block mb-1">Sede Ciudad Modelo 📍</span>
                <span className="text-sm text-white/50">Calle 29 #40A-14</span>
              </li>
              <li>
                <span className="text-xs font-bold text-white uppercase block mb-1">Sede Mariano Ramos 📍</span>
                <span className="text-sm text-white/50">Carrera 46 #40-64</span>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-chrome italic drop-shadow-md leading-none mb-4 flex items-center gap-2 justify-center">Horarios<span className="text-2xl leading-none not-italic">🕣</span></h4>
            <ul className="space-y-4 text-sm text-white/70 font-light flex flex-col items-center">
              <li className="flex items-center justify-center gap-1.5"><span className="leading-tight">Lunes a Viernes 10:00AM - 8:00PM <span className="inline-block ml-0.5 text-base">📍⌛️</span></span></li>
              <li className="flex items-center justify-center gap-1.5"><span className="leading-tight">Sábado 10:00AM - 8:30PM <span className="inline-block ml-0.5 text-base">📍⌛️</span></span></li>
              <li className="flex items-center justify-center gap-1.5"><span className="leading-tight">Domingos 10:00AM - 5:00PM - 8:00PM <span className="inline-block ml-0.5 text-base">📍⌛️</span></span></li>
              <li className="flex items-center justify-center gap-1.5"><span className="leading-tight">Festivos 10:00AM - 5:00PM - 8:00PM <span className="inline-block ml-0.5 text-base">📍⌛️</span></span></li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-chrome italic drop-shadow-md leading-none">Síguenos</h4>
            
            <div className="space-y-6 flex flex-col items-center">
              {/* Juan'D Store */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-white/50 font-bold tracking-widest uppercase mb-3">Juan'D Store</p>
                <div className="flex items-center justify-center space-x-4">
                  <a 
                    href="https://www.instagram.com/storejuand?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-white/60 transition-colors p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
                    aria-label="Instagram Juan'D Store"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@juand.store?is_from_webapp=1&sender_device=pc" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-white/60 transition-colors p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
                    aria-label="TikTok Juan'D Store"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.43-.62-.67v6.62c.03 2.11-.6 4.36-2.14 5.82-1.7 1.67-4.39 2.23-6.65 1.61-2.58-.69-4.7-2.88-5.18-5.52-.61-3.32 1.37-6.84 4.67-7.61.94-.22 1.92-.21 2.86.03v4.1c-.8-.25-1.7-.22-2.45.19-.94.5-1.57 1.52-1.6 2.6-.04 1.46.99 2.83 2.44 3.06 1.45.24 3.01-.58 3.51-1.97.18-.5.22-1.05.21-1.57V.02z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quality Store */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-white/50 font-bold tracking-widest uppercase mb-3">Quality Store</p>
                <div className="flex items-center justify-center space-x-4">
                  <a 
                    href="https://www.instagram.com/qualitystoreco?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-white/60 transition-colors p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
                    aria-label="Instagram Quality Store"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@storequality_?is_from_webapp=1&sender_device=pc" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-white/60 transition-colors p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
                    aria-label="TikTok Quality Store"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.43-.62-.67v6.62c.03 2.11-.6 4.36-2.14 5.82-1.7 1.67-4.39 2.23-6.65 1.61-2.58-.69-4.7-2.88-5.18-5.52-.61-3.32 1.37-6.84 4.67-7.61.94-.22 1.92-.21 2.86.03v4.1c-.8-.25-1.7-.22-2.45.19-.94.5-1.57 1.52-1.6 2.6-.04 1.46.99 2.83 2.44 3.06 1.45.24 3.01-.58 3.51-1.97.18-.5.22-1.05.21-1.57V.02z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>


      </div>
    </footer>
  );
}
