import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Ticket as TicketIcon, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import AnimatedSection from "../components/AnimatedSection";
import { RaffleService, TicketService } from "../services/api";
import { Raffle, Ticket } from "../types";
import { formatPrice } from "../utils/format";

export default function RaffleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [buyerData, setBuyerData] = useState({ name: '', phone: '', email: '' });

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
      if(id && !showCheckout) TicketService.getTicketsByRaffle(id).then(setTickets);
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
    if (!id || selectedIds.length === 0) return;
    
    try {
      await TicketService.purchaseTickets(id, {
        ticketIds: selectedIds,
        buyer: buyerData
      });
      setPurchaseSuccess(true);
      loadData();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#0a0a0a', color: '#fff' });
    }
  };

  const generateWhatsAppLink = () => {
    if (!raffle) return "#";
    const phone = "573012690047"; // Official JDQSTORE number
    const ticketList = selectedIds.map(id => tickets.find(t => t.id === id)?.ticketNumber).filter(Boolean).join(", ");
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
                <div className="flex items-center text-xs text-white/50"><span className="w-3 h-3 bg-gray-800 line-through decoration-white/30 mr-2"></span> Ocupado</div>
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
                    className={`aspect-square flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                      isSelected ? 'bg-red-600 text-white border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] z-10' :
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

            <button 
              disabled={selectedIds.length === 0}
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
              <button onClick={() => setShowCheckout(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
              
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
                {purchaseSuccess ? "¡Reserva Exitosa!" : "Finalizar Reserva"}
              </h2>
              <p className="text-white/50 text-sm mb-8">
                {purchaseSuccess 
                  ? "Tus boletas han sido separadas. Haz clic en el botón de abajo para enviarnos el comprobante de pago por WhatsApp y hacerlas tuyas oficialmente." 
                  : "Ingresa tus datos para asegurar tus boletas. Te contactaremos para el pago."}
              </p>

              {!purchaseSuccess ? (
                <form onSubmit={handlePurchase} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Nombre Completo</label>
                    <input required type="text" value={buyerData.name} onChange={e => setBuyerData({...buyerData, name: e.target.value})} className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-red-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">WhatsApp</label>
                    <input required type="tel" value={buyerData.phone} onChange={e => setBuyerData({...buyerData, phone: e.target.value})} className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-red-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Correo Electrónico (Opcional)</label>
                    <input type="email" value={buyerData.email} onChange={e => setBuyerData({...buyerData, email: e.target.value})} className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-red-500 focus:outline-none" />
                  </div>
                  
                  <div className="pt-4 mt-8 border-t border-white/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-white/50 text-sm">Total a pagar ({selectedIds.length} boletas)</span>
                      <span className="text-xl font-black text-red-500">{formatPrice(totalAmount)}</span>
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white py-4 font-black uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" /> Confirmar Reserva
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <a 
                    href={generateWhatsAppLink()} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => {
                      setShowCheckout(false);
                      setSelectedIds([]);
                      setPurchaseSuccess(false);
                    }}
                    className="w-full bg-green-500 text-black py-4 font-black uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center"
                  >
                    Pagar vía WhatsApp
                  </a>
                  <button 
                    onClick={() => {
                      setShowCheckout(false);
                      setSelectedIds([]);
                      setPurchaseSuccess(false);
                    }}
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
