import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Ticket as TicketIcon, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import AnimatedSection from "../components/AnimatedSection";
import { RaffleService, TicketService } from "../services/api";
import { Raffle, Ticket, TicketReservation } from "../types";
import { formatPrice } from "../utils/format";
import { BuyerErrors, BuyerForm, formatReservationDeadline, unavailableSelection, validateBuyer } from "../utils/purchase";

const EMPTY_BUYER: BuyerForm = { name: '', phone: '', email: '' };

export default function RaffleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  // Datos personales solo en memoria: se borran al cerrar la reserva
  const [buyerData, setBuyerData] = useState<BuyerForm>(EMPTY_BUYER);
  const [formErrors, setFormErrors] = useState<BuyerErrors>({});
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<TicketReservation | null>(null);
  const purchaseSuccess = reservation !== null;

  const refreshTickets = async () => {
    if (!id) return [];
    const fresh = await TicketService.getTicketsByRaffle(id);
    setTickets(fresh);
    return fresh;
  };

  const loadData = async () => {
    if (!id) return;
    try {
      const [r, t] = await Promise.all([
        RaffleService.getRaffleById(id),
        TicketService.getTicketsByRaffle(id)
      ]);
      setRaffle(r);
      setTickets(t);
    } catch (err) {
      console.error(err);
      navigate('/rifas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh tickets every 30s for realtime feel
    const interval = setInterval(() => {
      if (id && !showCheckout) {
        TicketService.getTicketsByRaffle(id).then(fresh => {
          setTickets(fresh);
          // Un número que otra persona reservó deja de estar seleccionado
          setSelectedIds(prev => prev.filter(sid => fresh.some((t: Ticket) => t.id === sid && t.status === 'AVAILABLE')));
        }).catch(() => undefined);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [id, showCheckout]);

  const toggleTicket = (ticket: Ticket) => {
    if (ticket.status !== 'AVAILABLE') return;
    
    setSelectedIds(prev => {
      if (prev.includes(ticket.id)) return prev.filter(id => id !== ticket.id);
      return [...prev, ticket.id];
    });
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    // Evita el doble envío mientras la petición está en curso
    if (!id || selectedIds.length === 0 || submitting) return;

    const errors = validateBuyer(buyerData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || !acceptedPrivacy) return;

    setSubmitting(true);
    try {
      const result = await TicketService.purchaseTickets(id, {
        ticketIds: selectedIds,
        buyer: buyerData
      });
      setReservation(result);
      refreshTickets().catch(() => undefined);
    } catch (err: any) {
      // Siempre se vuelve a leer la disponibilidad: si algún boleto se ocupó, se quita de la selección para elegir otros
      const fresh = await refreshTickets().catch(() => null);
      const taken = fresh ? unavailableSelection(selectedIds, fresh) : [];
      if (taken.length > 0) {
        setSelectedIds(prev => prev.filter(sid => !taken.some(t => t.id === sid)));
        setShowCheckout(false);
      }
      const text = taken.length > 0
        ? `Ya no están disponibles: ${taken.map(t => '#' + t.ticketNumber).join(', ')}. Elige otros números.`
        : err.message || 'No se pudo completar la reserva. Intenta de nuevo.';
      Swal.fire({ icon: 'error', title: 'No se pudo reservar', text, background: '#0a0a0a', color: '#fff' });
    } finally {
      setSubmitting(false);
    }
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    if (reservation) {
      setSelectedIds([]);
      setReservation(null);
      setBuyerData(EMPTY_BUYER);
      setAcceptedPrivacy(false);
    }
    setFormErrors({});
  };

  const generateWhatsAppLink = () => {
    if (!raffle || !reservation) return "#";
    const phone = "573012690047"; // Official JUANDSTORE number
    const ticketList = reservation.ticketNumbers.join(", ");
    const text = `Hola, acabo de reservar las boletas *${ticketList}* para la rifa *${raffle.name}*. Mi nombre es ${buyerData.name}. ¿A dónde transfiero?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (loading) return <div className="min-h-screen pt-32 text-center text-white font-black tracking-widest uppercase">Cargando Rifa...</div>;
  if (!raffle) return null;

  const totalAmount = selectedIds.length * raffle.ticketPrice;

  return (
    <div className="pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <Link to="/rifas" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Rifas
      </Link>

      <div className="grid lg:grid-cols-[1fr,400px] gap-12">
        {/* Left Column: Raffle Info & Tickets Grid */}
        <div>
          <AnimatedSection>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">{raffle.name}</h1>
            <p className="text-white/60 mb-8">{raffle.description}</p>
            <img src={raffle.imageUrl} alt={raffle.name} className="w-full aspect-video object-cover mb-12 border border-white/10" />

            <div className="mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">Selecciona tus números</h2>
              <div className="flex gap-4 mb-6">
                <div className="flex items-center text-xs text-white/50"><span className="w-3 h-3 bg-white/5 border border-white/10 mr-2"></span> Disponible</div>
                <div className="flex items-center text-xs text-white/50"><span className="w-3 h-3 bg-red-600 mr-2"></span> Seleccionado</div>
                <div className="flex items-center text-xs text-white/50"><span className="w-3 h-3 bg-orange-900/60 border border-orange-700/60 mr-2"></span> Reservado (pago pendiente)</div>
                <div className="flex items-center text-xs text-white/50"><span className="w-3 h-3 bg-gray-800 line-through decoration-white/30 mr-2"></span> Vendido</div>
              </div>
            </div>

            {/* TICKETS GRID */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {tickets.map((t, i) => {
                const isSelected = selectedIds.includes(t.id);
                const isAvailable = t.status === 'AVAILABLE';
                
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (i % 50) * 0.01 }}
                    whileHover={isAvailable ? { scale: 1.1, zIndex: 10 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => toggleTicket(t)}
                    disabled={!isAvailable}
                    title={t.status === 'RESERVED' ? 'Reservado: pago pendiente' : t.status === 'SOLD' ? 'Vendido' : undefined}
                    className={`aspect-square flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                      isSelected ? 'bg-red-600 text-white border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] z-10' :
                      t.status === 'RESERVED' ? 'bg-orange-900/40 text-orange-300/60 cursor-not-allowed border border-orange-700/40' :
                      !isAvailable ? 'bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800' :
                      'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 cursor-pointer'
                    }`}
                  >
                    {!isAvailable && !isSelected ? (
                      <span className="line-through decoration-gray-600">{t.ticketNumber}</span>
                    ) : t.ticketNumber}
                  </motion.button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="relative">
          <div className="sticky top-32 bg-[#0a0a0a] border border-white/10 p-6 md:p-8">
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6 border-b border-white/10 pb-4">Tu Selección</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {selectedIds.length === 0 ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-sm italic text-center py-4">No has seleccionado números.</motion.p>
                ) : (
                  selectedIds.map(id => {
                    const t = tickets.find(x => x.id === id);
                    if(!t) return null;
                    return (
                      <motion.div 
                        key={id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex justify-between items-center bg-white/5 p-3 border border-white/10"
                      >
                        <span className="font-black text-white">#{t.ticketNumber}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-white/60 mr-4">{formatPrice(raffle.ticketPrice)}</span>
                          <button onClick={() => toggleTicket(t)} className="text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm font-bold uppercase tracking-widest text-white/50">Total</span>
                <span className="text-2xl font-black text-red-500">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {raffle.status !== 'ACTIVE' && (
              <p className="text-xs text-orange-400 text-center mb-4">Esta rifa no está disponible para la venta en este momento.</p>
            )}
            <button
              disabled={selectedIds.length === 0 || raffle.status !== 'ACTIVE'}
              onClick={() => setShowCheckout(true)}
              className="w-full bg-white text-black py-4 font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-white/10 w-full max-w-lg p-8 relative"
            >
              <button onClick={closeCheckout} disabled={submitting} className="absolute top-6 right-6 text-white/50 hover:text-white disabled:opacity-30"><X className="w-6 h-6" /></button>

              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
                {purchaseSuccess ? "¡Boletas Reservadas!" : "Finalizar Reserva"}
              </h2>
              {/* Reservado no es pagado: el pago lo confirma un administrador después del comprobante por WhatsApp */}
              {purchaseSuccess && reservation ? (
                <div className="text-white/70 text-sm mb-8 space-y-3">
                  <p>
                    Separamos tus boletas <span className="font-black text-white">{reservation.ticketNumbers.map(n => '#' + n).join(', ')}</span> hasta
                    las <span className="font-black text-white">{formatReservationDeadline(reservation.reservedUntil)}</span>.
                  </p>
                  <p className="text-orange-300">
                    Tu reserva aún no está pagada. Envíanos el comprobante por WhatsApp antes de esa hora; si no confirmamos el pago a tiempo,
                    las boletas se liberan automáticamente.
                  </p>
                </div>
              ) : (
                <p className="text-white/50 text-sm mb-8">Ingresa tus datos para separar tus boletas. Te contactaremos para el pago.</p>
              )}

              {!purchaseSuccess ? (
                <form onSubmit={handlePurchase} noValidate className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Nombre Completo</label>
                    <input required type="text" maxLength={100} autoComplete="name" value={buyerData.name} onChange={e => setBuyerData({...buyerData, name: e.target.value})} className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-red-500 focus:outline-none" />
                    {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">WhatsApp</label>
                    <input required type="tel" maxLength={20} autoComplete="tel" value={buyerData.phone} onChange={e => setBuyerData({...buyerData, phone: e.target.value})} className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-red-500 focus:outline-none" />
                    {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Correo Electrónico (Opcional)</label>
                    <input type="email" maxLength={254} autoComplete="email" value={buyerData.email} onChange={e => setBuyerData({...buyerData, email: e.target.value})} className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-red-500 focus:outline-none" />
                    {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Aviso de privacidad: texto pendiente de revisión legal por el negocio */}
                  <label className="flex items-start gap-3 text-xs text-white/60 cursor-pointer">
                    <input type="checkbox" checked={acceptedPrivacy} onChange={e => setAcceptedPrivacy(e.target.checked)} className="mt-0.5 accent-red-600" />
                    <span>
                      Autorizo a JUANDSTORE a usar mi nombre, teléfono y correo únicamente para gestionar esta reserva y contactarme por el pago.
                      No se publican ni se comparten con terceros.
                    </span>
                  </label>

                  <div className="pt-4 mt-8 border-t border-white/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-white/50 text-sm">Total a pagar ({selectedIds.length} boletas)</span>
                      <span className="text-xl font-black text-red-500">{formatPrice(totalAmount)}</span>
                    </div>
                    <button type="submit" disabled={submitting || !acceptedPrivacy} className="w-full bg-red-600 text-white py-4 font-black uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                      <Check className="w-5 h-5 mr-2" /> {submitting ? 'Reservando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setTimeout(closeCheckout, 0)}
                    className="w-full bg-green-500 text-black py-4 font-black uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center"
                  >
                    Enviar comprobante por WhatsApp
                  </a>
                  <button
                    onClick={closeCheckout}
                    className="text-white/50 hover:text-white uppercase text-xs font-bold tracking-widest text-center mt-4"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
