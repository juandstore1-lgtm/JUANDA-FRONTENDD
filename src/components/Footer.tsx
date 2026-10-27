import { Phone, Mail, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 text-white selection:bg-white/10 w-full">
      <div className="w-full max-w-5xl mx-auto px-6 lg:px-12 py-10 lg:py-14">
        
        {/* ================= 2 COLUMNAS: CONTACTANOS Y SÍGUENOS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/15 pb-10 border-b border-white/15">
          
          {/* COLUMNA 1: CONTACTANOS */}
          <div className="pb-8 md:pb-0 md:pr-10 lg:pr-16 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2.5 mb-6 text-xs md:text-sm font-semibold uppercase tracking-[0.28em] text-white">
              <Send className="w-4 h-4 text-white -rotate-12 shrink-0" />
              <span>CONTACTANOS</span>
            </div>

            <div className="space-y-4 flex flex-col items-center md:items-start text-xs sm:text-sm text-zinc-200">
              <a
                href="https://wa.me/573012690047"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-white shrink-0" />
                <span>+57 301 269 0047</span>
              </a>

              <a
                href="mailto:juandstore1@gmail.com"
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-white shrink-0" />
                <span>juandstore1@gmail.com</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: SÍGUENOS */}
          <div className="pt-8 md:pt-0 md:pl-10 lg:pl-16 flex flex-col items-center md:items-start">
            <div className="flex items-center mb-6 text-xs md:text-sm font-semibold uppercase tracking-[0.28em] text-white">
              <span>SÍGUENOS</span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-white/15 w-full max-w-md">
              {/* Juan'D Store */}
              <div className="flex flex-col items-center pr-4 sm:pr-8">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-300 mb-3 text-center">
                  JUAN'D STORE
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://www.instagram.com/storejuand?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors"
                    aria-label="Instagram Juan'D Store"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@juand.store?is_from_webapp=1&sender_device=pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors"
                    aria-label="TikTok Juan'D Store"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.43-.62-.67v6.62c.03 2.11-.6 4.36-2.14 5.82-1.7 1.67-4.39 2.23-6.65 1.61-2.58-.69-4.7-2.88-5.18-5.52-.61-3.32 1.37-6.84 4.67-7.61.94-.22 1.92-.21 2.86.03v4.1c-.8-.25-1.7-.22-2.45.19-.94.5-1.57 1.52-1.6 2.6-.04 1.46.99 2.83 2.44 3.06 1.45.24 3.01-.58 3.51-1.97.18-.5.22-1.05.21-1.57V.02z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quality Store */}
              <div className="flex flex-col items-center pl-4 sm:pl-8">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-300 mb-3 text-center">
                  QUALITY STORE
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://www.instagram.com/qualitystoreco?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors"
                    aria-label="Instagram Quality Store"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@storequality_?is_from_webapp=1&sender_device=pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors"
                    aria-label="TikTok Quality Store"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.43-.62-.67v6.62c.03 2.11-.6 4.36-2.14 5.82-1.7 1.67-4.39 2.23-6.65 1.61-2.58-.69-4.7-2.88-5.18-5.52-.61-3.32 1.37-6.84 4.67-7.61.94-.22 1.92-.21 2.86.03v4.1c-.8-.25-1.7-.22-2.45.19-.94.5-1.57 1.52-1.6 2.6-.04 1.46.99 2.83 2.44 3.06 1.45.24 3.01-.58 3.51-1.97.18-.5.22-1.05.21-1.57V.02z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= COPYRIGHT ================= */}
        <div className="pt-8 text-center">
          <p className="text-xs text-zinc-500 font-light tracking-wide">
            © 2026 JDQ STORE · Todos los derechos reservados
          </p>
        </div>

      </div>
    </footer>
  );
}
