import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Settings, RefreshCw, Search, Eye, Filter, Sparkles, AlertTriangle, CheckCircle, Trash2, Calendar, FileText } from "lucide-react";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import { ContestService } from "../../services/api";
import { Contest, ContestParticipant, ContestWinner } from "../../types";

export default function ContestsAdmin() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [participants, setParticipants] = useState<ContestParticipant[]>([]);
  const [winner, setWinner] = useState<ContestWinner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "participants" | "settings">("summary");

  // Filters & Lightbox
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Winner Draw Animation State
  // Roulette Animation States
  const [rouletteActive, setRouletteActive] = useState(false);
  const [roulettePhase, setRoulettePhase] = useState<'READY' | 'SPINNING' | 'WINNER'>('READY');
  const [rouletteHighlightIndex, setRouletteHighlightIndex] = useState(-1);
  const [rouletteWinnerResult, setRouletteWinnerResult] = useState<ContestWinner | null>(null);


  // Form State
  const [formData, setFormData] = useState<Partial<Contest>>({});

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
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
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let target: Contest | null = null;
      const allContests = await ContestService.getAllContests().catch(() => []);
      if (allContests && allContests.length > 0) {
        target = allContests.sort((a, b) => b.id - a.id)[0];
      } else {
        target = await ContestService.getActiveContest();
      }

      if (target) {
        setContest(target);
        setFormData(target);
        const partsData = await ContestService.getParticipants(target.id).catch(() => []);
        setParticipants(partsData);
        const winnerData = await ContestService.getPublicWinner(target.id).catch(() => null);
        setWinner(winnerData);
      }
    } catch (err) {
      console.error("Error loading contest admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const formatDateTime = (val?: string) => {
      if (!val) return undefined;
      if (val.length === 16) return `${val}:00`;
      return val;
    };

    const payload: Partial<Contest> = {
      ...formData,
      startDate: formatDateTime(formData.startDate),
      endDate: formatDateTime(formData.endDate),
    };

    try {
      let targetId = contest?.id;
      if (!targetId) {
        const existingList = await ContestService.getAllContests().catch(() => []);
        if (existingList.length > 0) {
          targetId = existingList.sort((a, b) => b.id - a.id)[0].id;
        }
      }

      let updated: Contest;
      if (targetId) {
        updated = await ContestService.updateContest(targetId, payload);
      } else {
        updated = await ContestService.createContest(payload);
      }

      setContest(updated);
      setFormData(updated);

      Swal.fire({
        icon: "success",
        title: "¡Configuración Guardada!",
        text: "Los cambios del concurso se guardaron correctamente.",
        confirmButtonColor: "#000000"
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: err.message || "No se pudo actualizar la configuración.",
        confirmButtonColor: "#000000"
      });
    }
  };

  const handleSelectWinner = async () => {
    const validParts = participants.filter((p) => p.status === "PARTICIPANT" || p.status === "WINNER");
    if (validParts.length === 0) {
      Swal.fire("Sin participantes", "No hay participantes válidos para el sorteo.", "warning");
      return;
    }

    setRouletteActive(true);
    setRoulettePhase('READY');
    setRouletteWinnerResult(null);
    setRouletteHighlightIndex(-1);
  };

  const startRouletteSpinning = async () => {
    if (!contest?.id) return;
    const validParts = participants.filter((p) => p.status === "PARTICIPANT" || p.status === "WINNER");

    setRoulettePhase('SPINNING');
    setRouletteHighlightIndex(0);

    try {
      // 1. Elegir ganador real en backend (silenciosamente)
      const selectedWinner = await ContestService.selectWinner(contest.id);
      
      // 2. Iniciar animación de ruleta (saltos aleatorios)
      let speed = 50;
      let jumps = 0;
      const maxJumps = 50 + Math.floor(Math.random() * 20); // Entre 50 y 70 saltos (aprox 6 segundos)
      
      const jump = () => {
        jumps++;
        if (jumps > maxJumps) {
          // Detenerse exactamente en el ganador
          const winnerIndex = validParts.findIndex(p => p.id === selectedWinner.participant.id);
          setRouletteHighlightIndex(winnerIndex !== -1 ? winnerIndex : 0);
          setRoulettePhase('WINNER');
          setRouletteWinnerResult(selectedWinner);
          setWinner(selectedWinner);
          
          confetti({ particleCount: 300, spread: 160, origin: { y: 0.6 }, zIndex: 999999 });
          loadData();
          return;
        }
        
        // Salto aleatorio
        setRouletteHighlightIndex(Math.floor(Math.random() * validParts.length));
        
        // Desaceleración dramática (fricción) en los últimos 20 saltos
        if (jumps > maxJumps - 20) {
          speed += 40; 
        }
        
        setTimeout(jump, speed);
      };
      
      setTimeout(jump, speed);

    } catch (err: any) {
      setRouletteActive(false);
      Swal.fire({
        icon: "error",
        title: "Error en el Sorteo",
        text: err.message || "Ocurrió un error al seleccionar el ganador.",
        confirmButtonColor: "#000000"
      });
    }
  };



  const handleResetContest = async () => {
    if (!contest?.id) return;

    const firstConfirm = await Swal.fire({
      icon: "warning",
      title: "⚠️ ¿Reiniciar Concurso?",
      text: "Esta acción eliminará todos los participantes y sus fotografías asociadas. Esta operación no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33"
    });

    if (!firstConfirm.isConfirmed) return;

    const secondConfirm = await Swal.fire({
      icon: "error",
      title: "Confirmación Final Exigida",
      text: "Por favor confirma nuevamente que deseas eliminar PERMANENTEMENTE todos los participantes.",
      showCancelButton: true,
      confirmButtonText: "SÍ, ELIMINAR TODO Y REINICIAR",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33"
    });

    if (!secondConfirm.isConfirmed) return;

    try {
      await ContestService.resetContest(contest.id);
      Swal.fire({
        icon: "success",
        title: "Concurso Reiniciado",
        text: "Todos los datos de participaciones fueron eliminados correctamente.",
        confirmButtonColor: "#000000"
      });
      loadData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al reiniciar",
        text: err.message || "No se pudo reiniciar el concurso.",
        confirmButtonColor: "#000000"
      });
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-mono">Cargando administración de concursos...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Gestión de Concursos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra reglas, participantes, fechas, conmutadores y sorteo aleatorio de ganadores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectWinner}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase text-xs tracking-widest transition-colors shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> SELECCIONAR GANADOR
          </button>
          <button
            onClick={handleResetContest}
            className="px-4 py-3 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> REINICIAR CONCURSO
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8">
        {[
          { id: "summary", label: "Resumen & Sorteo", icon: Trophy },
          { id: "participants", label: `Participantes (${participants.length})`, icon: Users },
          { id: "settings", label: "Configuración del Concurso", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-2 font-bold text-xs uppercase tracking-widest border-b-2 transition-colors ${
                isActive ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Summary & Winner */}
      {activeTab === "summary" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado Actual</span>
              <div className="text-2xl font-black uppercase text-black mt-1">{contest?.status}</div>
            </div>
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Participantes</span>
              <div className="text-2xl font-black font-mono text-black mt-1">{participants.length}</div>
            </div>
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Menú Público</span>
              <div className="text-2xl font-black uppercase text-black mt-1">{contest?.showInMenu ? "Visible (SÍ)" : "Oculto (NO)"}</div>
            </div>
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Formulario</span>
              <div className="text-2xl font-black uppercase text-black mt-1">{contest?.formEnabled ? "Habilitado" : "Deshabilitado"}</div>
            </div>
          </div>

          {/* Winner Section Card */}
          {winner ? (
            <div className="bg-[#0a0a0a] border border-yellow-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-full mb-6 relative z-10 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                🏆 GANADOR REGISTRADO
              </span>
              
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-yellow-500 blur-md opacity-20 rounded"></div>
                  <img
                    src={winner.participant.outfitImageUrl}
                    alt={winner.participant.fullName}
                    className="relative w-44 aspect-[3/4] object-cover border border-yellow-500/50 rounded shadow-lg transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black uppercase text-white tracking-wider drop-shadow-md">{winner.participant.fullName}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400"><b>Email:</b> <span className="text-gray-100">{winner.participant.email}</span></p>
                    <p className="text-sm text-gray-400"><b>Teléfono:</b> <span className="text-gray-100">{winner.participant.phone}</span></p>
                    <p className="text-sm text-gray-400"><b>Ciudad:</b> <span className="text-gray-100">{winner.participant.city}</span></p>
                    {winner.participant.socialMedia && <p className="text-sm text-gray-400"><b>Red Social:</b> <span className="text-gray-100">{winner.participant.socialMedia}</span></p>}
                  </div>
                  <div className="pt-2">
                    <p className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold tracking-widest rounded border border-yellow-500/20">
                      Seleccionado el {new Date(winner.selectedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-black uppercase tracking-tight">Aún no se ha seleccionado ganador</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
                Cuando estés listo para cerrar el concurso, presiona el botón "SELECCIONAR GANADOR" para sortealo aleatoriamente entre los participantes activos.
              </p>
            </div>
          )}

          {/* Live Stream Roulette Overlay */}
          {rouletteActive && (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 sm:p-10">
              {/* Overlay Background */}
              <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/20 blur-[120px] rounded-full"></div>
              </div>

              {(roulettePhase === 'READY' || roulettePhase === 'SPINNING') && (
                <>
                  <div className="mb-4 text-center animate-in fade-in zoom-in z-10">
                    {roulettePhase === 'READY' ? (
                      <>
                        <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-pulse" />
                        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl">
                          ¿LISTO PARA EL SORTEO?
                        </h2>
                        <p className="text-gray-300 mt-2 mb-6">
                          Hay {participants.filter(p => p.status === 'PARTICIPANT' || p.status === 'WINNER').length} participantes esperando conocer el ganador.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <button 
                            onClick={startRouletteSpinning}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black uppercase tracking-widest text-xl rounded-full transition-transform hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.5)]"
                          >
                            ¡INICIAR SORTEO AHORA!
                          </button>
                          <button 
                            onClick={() => setRouletteActive(false)}
                            className="px-6 py-2 text-white/50 hover:text-white uppercase font-bold text-xs tracking-widest transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-spin" />
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-lg animate-pulse">
                          SORTEANDO GANADOR...
                        </h2>
                      </>
                    )}
                  </div>

                  {/* Shared Roulette Grid */}
                  <div className="w-full max-w-6xl flex-1 max-h-[60vh] overflow-hidden relative z-10 p-4 mt-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 h-full content-start">
                      {participants.filter(p => p.status === 'PARTICIPANT' || p.status === 'WINNER').map((p, index) => {
                        const isHighlighted = roulettePhase === 'SPINNING' && rouletteHighlightIndex === index;
                        return (
                          <div 
                            key={p.id} 
                            className={`relative aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden transition-all duration-75 ${
                              isHighlighted 
                                ? 'ring-4 ring-yellow-400 scale-110 z-20 shadow-[0_0_40px_rgba(250,204,21,0.6)]' 
                                : 'opacity-40 scale-95 grayscale'
                            }`}
                          >
                            <img src={p.outfitImageUrl} alt={p.fullName} className="w-full h-full object-cover" />
                            {isHighlighted && (
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 text-center">
                                <span className="text-yellow-400 font-black uppercase text-[10px] sm:text-xs truncate block">{p.fullName}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
              
              {roulettePhase === 'REVEAL' && (
                /* Winner Reveal */
                <div className="z-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
                  <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tight text-yellow-400 mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                    ¡TENEMOS GANADOR!
                  </h2>
                  {rouletteWinnerResult && (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-300 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                      <div className="relative bg-black border-2 border-yellow-400 rounded-2xl p-6 sm:p-10 shadow-2xl max-w-xl w-full">
                        <img 
                          src={rouletteWinnerResult.participant.outfitImageUrl} 
                          alt="Winner" 
                          className="w-48 sm:w-64 aspect-[3/4] object-cover mx-auto rounded-xl shadow-2xl border border-white/10 mb-6"
                        />
                        <h3 className="text-3xl sm:text-4xl font-black uppercase text-white mb-2">{rouletteWinnerResult.participant.fullName}</h3>
                        <p className="text-yellow-500 font-bold uppercase tracking-widest">{rouletteWinnerResult.participant.city}</p>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => setRouletteActive(false)}
                    className="mt-12 px-8 py-4 bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest rounded-full transition-transform hover:scale-105 active:scale-95"
                  >
                    CERRAR Y VOLVER
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Participants List & Filter */}
      {activeTab === "participants" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between bg-gray-50 p-4 border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 text-sm font-semibold uppercase tracking-wider"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="PARTICIPANT">Participantes</option>
                <option value="WINNER">Ganadores</option>
                <option value="DISQUALIFIED">Eliminados</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredParticipants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParticipants.map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
                  <div className="relative aspect-[3/4] bg-gray-900 overflow-hidden cursor-pointer" onClick={() => setSelectedImageModal(p.outfitImageUrl)}>
                    <img src={p.outfitImageUrl} alt={p.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1 bg-white text-black font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Ver Foto Completa
                      </span>
                    </div>
                    {p.status === "WINNER" && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest shadow-lg">
                        🏆 GANADOR
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-lg uppercase tracking-wide text-black">{p.fullName}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{p.email}</p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 pt-3 border-t border-gray-100">
                      <p><b>Teléfono:</b> {p.phone}</p>
                      <p><b>Ciudad:</b> {p.city}</p>
                      {p.socialMedia && <p><b>Red Social:</b> {p.socialMedia}</p>}
                      {p.identificationNumber && <p><b>Documento:</b> {p.identificationNumber}</p>}
                      <p className="text-[10px] text-gray-400 pt-1">Inscrito: {new Date(p.createdAt || "").toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500 bg-gray-50 border border-gray-200 text-sm">
              No se encontraron participantes que coincidan con la búsqueda.
            </div>
          )}

          {/* Lightbox Image Modal */}
          {selectedImageModal && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedImageModal(null)}>
              <div className="max-w-2xl max-h-[90vh] relative">
                <img src={selectedImageModal} alt="Outfit Grande" className="max-w-full max-h-[85vh] object-contain mx-auto" />
                <button className="absolute top-4 right-4 text-white font-bold bg-black/60 px-4 py-2 uppercase text-xs tracking-widest">
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Contest Settings Form */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 p-8 space-y-6 max-w-4xl">
          <h2 className="text-lg font-black uppercase tracking-wider text-black border-b border-gray-100 pb-3">
            Editar Parámetros del Concurso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Título del Concurso
              </label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Estado
              </label>
              <select
                value={formData.status || "ACTIVE"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="DRAFT">DRAFT (Borrador)</option>
                <option value="UPCOMING">UPCOMING (Próximamente)</option>
                <option value="ACTIVE">ACTIVE (Activo)</option>
                <option value="FINISHED">FINISHED (Finalizado)</option>
                <option value="DISABLED">DISABLED (Deshabilitado)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Reglas y Condiciones del Concurso
              </label>
              <textarea
                rows={6}
                value={formData.rules || ""}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Banner/Imagen del Concurso
              </label>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressImage(file);
                          setFormData({ ...formData, bannerUrl: base64 });
                        } catch (error) {
                          console.error('Error compressing image:', error);
                          alert('Error al procesar la imagen');
                        }
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 text-xs bg-white file:mr-4 file:py-1 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                </div>
                {formData.bannerUrl && (
                  <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={formData.bannerUrl} alt="Preview" className="max-w-full max-h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Fecha y Hora de Inicio
              </label>
              <input
                type="datetime-local"
                value={formData.startDate ? formData.startDate.substring(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Fecha y Hora de Cierre (Contador)
              </label>
              <input
                type="datetime-local"
                value={formData.endDate ? formData.endDate.substring(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showInMenu || false}
                onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                className="w-4 h-4 text-black focus:ring-black"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-black">Mostrar Concursos en el Menú Principal</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.formEnabled || false}
                onChange={(e) => setFormData({ ...formData, formEnabled: e.target.checked })}
                className="w-4 h-4 text-black focus:ring-black"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-black">Formulario de Participación Habilitado</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.countdownEnabled || false}
                onChange={(e) => setFormData({ ...formData, countdownEnabled: e.target.checked })}
                className="w-4 h-4 text-black focus:ring-black"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-black">Mostrar Contador Regresivo</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireIdNumber || false}
                onChange={(e) => setFormData({ ...formData, requireIdNumber: e.target.checked })}
                className="w-4 h-4 text-black focus:ring-black"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-black">Pedir Documento de Identificación</span>
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
