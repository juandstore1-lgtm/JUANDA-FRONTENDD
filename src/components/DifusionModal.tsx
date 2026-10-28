import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import qrImg from "@/assets/qr-difusion.png";

const BROADCAST_LINK = "https://chat.whatsapp.com/I6YF6CMPBza7KRDN1178oZ?mode=wwt";

interface DifusionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DifusionModal({ isOpen, onClose }: DifusionModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm sm:max-w-md bg-[#0c0c0c] border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
          >
            {/* Botón de cierre */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Etiqueta superior */}
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-chrome block mb-1">
              CANAL OFICIAL DE WHATSAPP
            </span>

            {/* Título principal */}
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2 leading-tight">
              ÚNETE A NUESTRA DIFUSIÓN
            </h2>

            {/* Subtítulo / Descripción */}
            <p className="text-xs sm:text-sm text-white/60 mb-6 font-light max-w-xs leading-relaxed">
              Escanea el código QR con tu celular o pulsa el botón directo para acceder a lanzamientos, promociones y descuentos exclusivos.
            </p>

            {/* Tarjeta del Código QR */}
            <div className="w-60 sm:w-68 rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-6 bg-white p-2">
              <img
                src={qrImg}
                alt="Código QR Difusión WhatsApp Juan'D Store"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            {/* Botón de acción WhatsApp */}
            <a
              href={BROADCAST_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#25D366]/20 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>UNIRME POR WHATSAPP</span>
            </a>

            <span className="text-[10px] text-white/40 uppercase tracking-widest mt-3 flex items-center gap-1.5 font-medium">
              Acceso directo e inmediato
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
