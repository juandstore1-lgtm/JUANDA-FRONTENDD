import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Upload, Sparkles, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, MapPin, Instagram, FileText, Link as LinkIcon, Image as ImageIcon, ClipboardList, PenTool, Send, Lock, ShieldCheck, Shirt, Ticket, User, Phone, Mail, CreditCard, AtSign, Check, Calendar, Gift, Camera, Crosshair } from "lucide-react";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import { ContestService } from "../services/api";
import { Contest as ContestType, ContestWinner } from "../types";
import AnimatedSection from "../components/AnimatedSection";

export default function Contest() {
  const [contest, setContest] = useState<ContestType | null>(null);
  const [winner, setWinner] = useState<ContestWinner | null>(null);
  const [publicParticipants, setPublicParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [outfitImageMode, setOutfitImageMode] = useState<"url" | "file">("url");
  const [outfitImageUrlInput, setOutfitImageUrlInput] = useState("");
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [agreesToPublicDisplay, setAgreesToPublicDisplay] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    loadContestData();
  }, []);

  const loadContestData = async () => {
    setLoading(true);
    try {
      let activeData = await ContestService.getActiveContest();
      if (!activeData) {
        const all = await ContestService.getAllContests().catch(() => []);
        if (all && all.length > 0) {
          activeData = all.sort((a, b) => b.id - a.id)[0];
        }
      }
      setContest(activeData);

      if (activeData?.id) {
        const winnerData = await ContestService.getPublicWinner(activeData.id);
        setWinner(winnerData);
        if (winnerData) {
          triggerConfetti();
        }
        const participants = await ContestService.getPublicParticipants(activeData.id);
        setPublicParticipants(participants);
      }
    } catch (err) {
      console.error("Error loading contest data:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Timer Effect
  useEffect(() => {
    if (!contest?.endDate) return;

    const interval = setInterval(() => {
      const target = new Date(contest.endDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsFinished(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest?.endDate]);

  // Compress Device Uploaded File
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setImageError("Formato no permitido. Usa JPG, PNG o WEBP.");
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setOutfitImage(compressedDataUrl);
    } catch {
      setImageError("Error al procesar la imagen.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalImage = outfitImage;

    if (!finalImage) {
      Swal.fire({
        icon: "warning",
        title: "Fotografía requerida",
        text: "Por favor adjunta o ingresa la URL de la fotografía de tu outfit.",
        confirmButtonColor: "#000000"
      });
      return;
    }

    if (!acceptedTerms) {
      Swal.fire({
        icon: "warning",
        title: "Términos requeridos",
        text: "Debes aceptar las condiciones y reglas del concurso para participar.",
        confirmButtonColor: "#000000"
      });
      return;
    }

    setSubmitting(true);
    try {
      await ContestService.submitParticipation({
        contest: { id: contest!.id },
        fullName,
        identificationNumber: idNumber,
        phone,
        email,
        city,
        socialMedia,
        outfitImageUrl: finalImage,
        acceptedTerms: true,
        agreesToPublicDisplay
      });

      Swal.fire({
        icon: "success",
        title: "¡Inscripción Exitosa! 🎉",
        text: "Tu participación ha sido registrada correctamente. ¡Mucha suerte!",
        confirmButtonColor: "#000000"
      });

      // Clear form
      setFullName("");
      setIdNumber("");
      setPhone("");
      setEmail("");
      setCity("");
      setSocialMedia("");
      setOutfitImageUrlInput("");
      setOutfitImage(null);
      setAcceptedTerms(false);
      setAgreesToPublicDisplay(false);

      // Reload public participants if user agreed
      if (agreesToPublicDisplay) {
        const participants = await ContestService.getPublicParticipants(contest!.id);
        setPublicParticipants(participants);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al participar",
        text: err.message || "No se pudo registrar tu participación.",
        confirmButtonColor: "#000000"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center text-white/50 font-mono">
        Cargando módulo de concursos...
      </div>
    );
  }

  if (!contest || contest.status === 'DISABLED') {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 text-center">
        <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-black dark:text-white">No hay concursos activos</h1>
        <p className="text-white/40 text-sm">
          Actualmente no hay ningún concurso disponible. ¡Mantente atento a nuestras redes sociales para próximos eventos!
        </p>
      </div>
    );
  }

  const isFormClosed = contest.status === 'FINISHED' || contest.status === 'UPCOMING' || isFinished || !contest.formEnabled;
  const isCompletelyClosed = contest.status === 'FINISHED';

  return (
    <div className="pt-28 pb-24 w-full bg-[#050505] min-h-screen text-white font-sans selection:bg-white/20">
      {/* Hero Banner */}
      <div className="relative w-full h-[450px] overflow-hidden flex flex-col items-center justify-center">
        <img
          src={contest.bannerUrl || "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop"}
          alt={contest.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl flex flex-col items-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-1.5 border border-white/20 bg-black/40 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-6 rounded-full"
          >
            <Trophy className="w-3.5 h-3.5" />
            {contest.status === 'ACTIVE' && !isFinished ? "Concurso Activo" : contest.status === 'UPCOMING' ? "Próximamente" : "Concurso Finalizado"}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 drop-shadow-2xl"
          >
            {contest.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto"
          >
            {contest.description}
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-20 space-y-8 -mt-10 pb-12">
        
        {/* WINNER SECTION */}
        {winner && (
          <AnimatedSection className="w-full">
            <div className="bg-[#0a0a0a] border border-yellow-500/30 p-8 md:p-12 rounded-xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trophy className="w-64 h-64 text-yellow-500" />
              </div>
              <div className="text-center mb-8 relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-full mb-3 shadow-lg">
                  <Trophy className="w-4 h-4" /> 🏆 GANADOR DEL CONCURSO
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic text-white">¡Felicitaciones! 🎉</h2>
                <p className="text-white/50 text-xs mt-2 uppercase tracking-widest">
                  Seleccionado el {new Date(winner.selectedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center max-w-3xl mx-auto relative z-10 bg-[#111] p-6 border border-white/10 rounded-xl">
                <div className="w-full md:w-1/2 aspect-[3/4] bg-black overflow-hidden border border-white/10 rounded-lg">
                  <img
                    src={winner.participant.outfitImageUrl}
                    alt={winner.participant.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-4 text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 block">Participante Ganador</span>
                    <h3 className="text-2xl font-black uppercase text-white tracking-wider">{winner.participant.fullName}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <span>{winner.participant.city}</span>
                    </p>
                    {winner.participant.socialMedia && (
                      <p className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-white/40" />
                        <span>{winner.participant.socialMedia}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Main Content Box */}
        {!isCompletelyClosed ? (
          <AnimatedSection className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px]">
              
              {/* Left Column: Form or Closed Message */}
              <div className="p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center">
                {isFormClosed ? (
                  <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-12">
                    <CheckCircle2 className="w-16 h-16 text-white/20" />
                    <h2 className="text-2xl font-black uppercase tracking-widest text-white">
                      {contest.status === 'UPCOMING' ? 'Próximamente' : 'Inscripciones Cerradas'}
                    </h2>
                    <p className="text-white/50 text-sm max-w-md mx-auto">
                      {contest.status === 'UPCOMING' 
                        ? 'El formulario de inscripción se habilitará pronto. Mantente atento.' 
                        : (contest.closedMessage || "Por el momento no estamos recibiendo más inscripciones.")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded bg-[#111] border border-white/10 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-6 h-6 text-white/70" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                          Formulario de Inscripción
                        </h2>
                        <p className="text-white/40 text-xs font-semibold mt-1">
                          Completa tus datos y sube tu mejor outfit para participar.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Nombre Completo *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-white/40" />
                        </div>
                        <input
                          type="text" required placeholder="Ej: Carlos Mendoza"
                          value={fullName} onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* ID Number */}
                    {contest.requireIdNumber && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Documento de Identidad *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <CreditCard className="w-4 h-4 text-white/40" />
                          </div>
                          <input
                            type="text" required placeholder="Ej: 1008765432"
                            value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Teléfono / WhatsApp *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-white/40" />
                        </div>
                        <input
                          type="tel" required placeholder="Ej: 3001234567"
                          value={phone} onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Correo Electrónico *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-white/40" />
                        </div>
                        <input
                          type="email" required placeholder="Ej: ejemplo@correo.com"
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Ciudad *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="w-4 h-4 text-white/40" />
                        </div>
                        <input
                          type="text" required placeholder="Ej: Cali"
                          value={city} onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70">Instagram / TikTok (Opcional)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <AtSign className="w-4 h-4 text-white/40" />
                        </div>
                        <input
                          type="text" placeholder="@usuario"
                          value={socialMedia} onChange={(e) => setSocialMedia(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#111] border border-white/10 rounded text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Section */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">Fotografía del Outfit *</label>
                    <div className="p-5 border border-dashed border-white/20 rounded-lg bg-[#111] flex flex-col md:flex-row gap-6">
                      
                      {/* Upload Area */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {outfitImage ? (
                          <div className="relative w-full max-w-[160px] aspect-[3/4] rounded overflow-hidden border border-white/10 group mx-auto">
                            <img src={outfitImage} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setOutfitImage(null)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-bold uppercase">Cambiar</span>
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-full min-h-[140px] flex flex-col items-center justify-center cursor-pointer group hover:bg-white/5 transition-colors rounded">
                            <Upload className="w-8 h-8 text-white/40 mb-3 group-hover:text-white/80 transition-colors" />
                            <span className="text-xs text-white/80 font-medium px-4">Arrastra tu foto aquí o haz clic para seleccionar</span>
                            <span className="text-[10px] text-white/40 mt-2">Formatos permitidos: JPG, PNG. Máx. 10MB</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        )}
                        {imageError && (
                          <p className="text-red-500 text-[10px] font-bold mt-2">{imageError}</p>
                        )}
                      </div>

                      {/* Tips Area */}
                      <div className="w-full md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Consejos para tu foto</h4>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <Check className="w-3.5 h-3.5 text-white/40" /> Foto en buena iluminación
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <Check className="w-3.5 h-3.5 text-white/40" /> Outfit completo y visible
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <Check className="w-3.5 h-3.5 text-white/40" /> Fondo limpio
                        </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                          <Check className="w-3.5 h-3.5 text-white/40" /> Sé creativo y auténtico
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="pt-2 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox" required checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="appearance-none w-5 h-5 bg-[#111] border border-white/20 rounded checked:bg-white checked:border-white transition-colors cursor-pointer"
                        />
                        {acceptedTerms && <Check className="absolute w-3.5 h-3.5 text-black pointer-events-none" />}
                      </div>
                      <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                        He leído y acepto los <a href="#" onClick={(e)=>{e.preventDefault(); setShowRules(true);}} className="text-white underline decoration-white/30 underline-offset-2">términos y condiciones</a>
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox" checked={agreesToPublicDisplay}
                          onChange={(e) => setAgreesToPublicDisplay(e.target.checked)}
                          className="appearance-none w-5 h-5 bg-[#111] border border-white/20 rounded checked:bg-white checked:border-white transition-colors cursor-pointer"
                        />
                        {agreesToPublicDisplay && <Check className="absolute w-3.5 h-3.5 text-black pointer-events-none" />}
                      </div>
                      <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                        Acepto que mi participación (Foto, Nombre, Ciudad y Redes Sociales) sea pública en esta página.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit" disabled={submitting}
                      className="w-full py-4 bg-gradient-to-b from-white to-[#d4d4d4] text-black rounded font-black uppercase tracking-[0.2em] text-[11px] hover:from-white hover:to-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? "ENVIANDO..." : "ENVIAR MI PARTICIPACIÓN"}
                    </button>
                    <p className="text-center text-[10px] text-white/30 flex items-center justify-center gap-1.5 mt-4">
                      <Lock className="w-3 h-3" /> Tu información está protegida y no será compartida.
                    </p>
                  </div>
                </form>
                </>
                )}
              </div>

              {/* Right Column: Info & Countdown */}
              <div className="bg-[#111] p-6 md:p-10 flex flex-col">
                
                {/* How to participate */}
                <div className="mb-10">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white mb-6">¿Cómo Participar?</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 text-xs font-bold text-white/80">1</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <PenTool className="w-4 h-4 text-white/60" />
                          <h4 className="text-sm font-bold text-white">Completa el formulario</h4>
                        </div>
                        <p className="text-xs text-white/40">Llena todos tus datos correctamente.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 text-xs font-bold text-white/80">2</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Camera className="w-4 h-4 text-white/60" />
                          <h4 className="text-sm font-bold text-white">Sube tu mejor foto</h4>
                        </div>
                        <p className="text-xs text-white/40">Muestra tu outfit con estilo y creatividad.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 text-xs font-bold text-white/80">3</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Send className="w-4 h-4 text-white/60" />
                          <h4 className="text-sm font-bold text-white">Envía tu participación</h4>
                        </div>
                        <p className="text-xs text-white/40">Y listo, ya estarás participando.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prizes */}
                <div className="mb-6 p-5 border border-white/10 rounded-lg bg-[#111]">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-white" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Premios Increíbles</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-4 leading-relaxed">Participa por premios exclusivos y sorpresas de JDQ STORE.</p>
                  <div className="flex items-center justify-between px-2 opacity-60">
                    <Shirt className="w-6 h-6" />
                    <Crosshair className="w-6 h-6" />
                    <Ticket className="w-6 h-6" />
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                {/* Dates */}
                <div className="mb-6 p-5 border border-white/10 rounded-lg bg-[#111]">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-white" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Fechas Importantes</h3>
                  </div>
                  <div className="space-y-3 text-xs text-white/60">
                    <div className="flex justify-between">
                      <span>Inicio del concurso:</span>
                      <span className="text-white">{new Date(contest.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cierre de inscripciones:</span>
                      <span className="text-white">{new Date(contest.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {/* Footer Disclaimer */}
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/5 mt-6">
                  <ShieldCheck className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Este concurso está sujeto a términos y condiciones. Consulta las bases completas en nuestra sección de <button onClick={(e) => { e.preventDefault(); setShowRules(true); }} className="underline hover:text-white">concursos</button>.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ) : (
          <AnimatedSection className="bg-[#0a0a0a] border border-white/10 rounded-xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Inscripciones Cerradas</h3>
            <p className="text-white/40 text-sm max-w-md mx-auto">{contest.closedMessage || "Este concurso ha finalizado. ¡Gracias a todos los participantes!"}</p>
          </AnimatedSection>
        )}
      </div>

      {/* Public Participants Grid */}
      {publicParticipants.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
              Participantes Recientes
            </h2>
            <p className="text-sm text-white/50">Inspírate con los mejores outfits de la comunidad.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {publicParticipants.map((participant) => (
              <div key={participant.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden group hover:border-white/20 transition-all">
                <div 
                  className="w-full aspect-[4/5] bg-[#111] overflow-hidden relative cursor-pointer"
                  onClick={() => {
                    if (participant.outfitImageUrl) {
                      Swal.fire({
                        imageUrl: participant.outfitImageUrl,
                        imageAlt: `Outfit de ${participant.fullName}`,
                        background: '#111',
                        confirmButtonColor: '#fff',
                        confirmButtonText: '<span style="color: black">Cerrar</span>',
                        width: 'auto',
                        padding: '1rem',
                        customClass: {
                          image: 'max-h-[80vh] object-contain rounded-xl',
                        }
                      });
                    }
                  }}
                >
                  {participant.outfitImageUrl ? (
                    <img
                      src={participant.outfitImageUrl}
                      alt={`Outfit de ${participant.fullName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <span className="text-xs uppercase tracking-widest">Sin Foto</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                      Ver Foto Completa
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider truncate mb-1">
                    {participant.fullName}
                  </h3>
                  <div className="flex items-center text-xs text-white/50 gap-1.5 mb-2 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{participant.city || "Ciudad Desconocida"}</span>
                  </div>
                  {participant.socialMedia && (
                    <div className="flex items-center text-xs text-white/40 gap-1.5 truncate bg-white/5 py-1 px-2 rounded w-fit">
                      <AtSign className="w-3 h-3 shrink-0" />
                      <span className="truncate">{participant.socialMedia}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Modal (Overlay) */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowRules(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Reglas del Concurso
              </h2>
              <div className="text-sm text-white/60 whitespace-pre-line leading-relaxed font-sans">
                {contest.rules || "No hay reglas especificadas."}
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="mt-8 px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
