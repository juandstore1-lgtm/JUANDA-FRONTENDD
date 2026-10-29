import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "../components/AnimatedSection";
import { MapPin, Clock, Play, Volume2, VolumeX, Store as StoreIcon, ArrowRight } from "lucide-react";

interface StoreVideo {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  city: string;
  src: string;
}

const physicalStoresVideos: StoreVideo[] = [
  {
    id: "punto-1",
    title: "Sede República de Israel",
    subtitle: "Juan'D Store",
    badge: "Punto Físico 1",
    city: "Cali, Valle del Cauca",
    src: "/videos/IMG_7165.MOV",
  },
  {
    id: "punto-2",
    title: "Sede Mariano Ramos",
    subtitle: "Quality Store",
    badge: "Punto Físico 2",
    city: "Cali, Valle del Cauca",
    src: "/videos/IMG_7248.MOV",
  },
  {
    id: "punto-3",
    title: "Sede Ciudad Modelo",
    subtitle: "Juan'D Store",
    badge: "Punto Físico 3",
    city: "Cali, Valle del Cauca",
    src: "/videos/IMG_7251.MOV",
  },
  {
    id: "punto-4",
    title: "Sede Villa Colombia",
    subtitle: "Quality Store",
    badge: "Punto Físico 4",
    city: "Cali, Valle del Cauca",
    src: "/videos/IMG_7253.MOV",
  },
];

function VideoCard({ video, index }: { video: StoreVideo; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <AnimatedSection delay={index * 0.08}>
      <div className="flex flex-col bg-[#0b0c0e] border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group h-full">
        {/* Contenedor del video en formato vertical (9:16) */}
        <div
          className="relative aspect-[9/16] bg-black overflow-hidden cursor-pointer select-none"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={video.src}
            playsInline
            muted={isMuted}
            loop
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          >
            <source src={video.src} type="video/mp4" />
            <source src={video.src} type="video/quicktime" />
            Tu navegador no soporta reproducción de video.
          </video>

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/15 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md">
              {video.badge}
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer shadow-md"
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/70" />
              ) : (
                <Volume2 className="w-4 h-4 text-green-400" />
              )}
            </button>
          </div>

          {/* Botón central de Play cuando está pausado */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-10 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Degradado inferior decorativo */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

          {/* Información superpuesta al pie del video */}
          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5">
              {video.subtitle}
            </span>
            <h3 className="text-base font-black uppercase tracking-wider text-white drop-shadow-md leading-tight">
              {video.title}
            </h3>
          </div>
        </div>

        {/* Pie de tarjeta interactivo */}
        <div className="p-4 flex items-center justify-between bg-[#0e0f13] border-t border-white/5 flex-1">
          <div className="flex items-center gap-1.5 text-white/60">
            <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              {video.city}
            </span>
          </div>
          <Link
            to="/horarios"
            className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Horarios</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function PhysicalStores() {
  return (
    <div className="pt-28 md:pt-36 pb-24 w-full bg-black text-white min-h-screen">
      {/* ── Encabezado Principal ───────────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-14 text-center">
        <AnimatedSection>
          <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.35em] text-zinc-400 block mb-2">
            VISÍTANOS EN CALI
          </span>
          <h1 className="text-5xl sm:text-5xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight text-chrome italic leading-none mb-4 drop-shadow-[0_10px_20px_rgba(255,255,255,0.12)]">
            PUNTOS FÍSICOS
          </h1>

        </AnimatedSection>
      </div>

      {/* ── Cuadrícula de 4 Videos ───────────────────────────────── */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {physicalStoresVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      </div>

      {/* ── Enlaces de navegación rápida ─────────────────────────── */}
      <AnimatedSection delay={0.35}>
        <div className="mt-16 max-w-3xl mx-auto px-6 text-center">
          <div className="p-6 bg-[#0c0d10] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">
                ¿Planeas visitarnos hoy?
              </h4>
              <p className="text-xs text-zinc-400">
                Consulta las direcciones exactas y los horarios de atención de cada sede.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/horarios"
                className="px-4 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider rounded-lg hover:bg-white/90 transition-all"
              >
                Horarios
              </Link>
              <Link
                to="/ubicaciones"
                className="px-4 py-2.5 bg-white/10 border border-white/20 text-white font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-white/20 transition-all"
              >
                Ubicaciones
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
