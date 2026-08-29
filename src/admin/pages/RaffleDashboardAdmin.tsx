import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, Calendar, DollarSign, Activity } from "lucide-react";
import { RaffleService, TicketService } from "../../services/api";
import { Raffle, Ticket } from "../../types";
import { formatPrice, formatDate } from "../../utils/format";
import Swal from 'sweetalert2';

export default function RaffleDashboardAdmin() {
  const { id } = useParams();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const [r, t] = await Promise.all([
          RaffleService.getRaffleById(id),
          TicketService.getTicketsByRaffle(id)
        ]);
        setRaffle(r);
        setTickets(t);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-500 font-bold uppercase">Cargando Dashboard...</div>;
  if (!raffle) return <div className="p-12 text-center text-red-500 font-bold">Rifa no encontrada</div>;

  const sold = tickets.filter(t => t.status === 'SOLD').length;
  const reserved = tickets.filter(t => t.status === 'RESERVED').length;
  const available = tickets.filter(t => t.status === 'AVAILABLE').length;
  const percentage = raffle.totalTickets > 0 ? ((sold + reserved) / raffle.totalTickets) * 100 : 0;
  const revenue = (sold + reserved) * raffle.ticketPrice;

  const filteredTickets = tickets.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      if (t.ticketNumber.toLowerCase().includes(q)) return true;
      if (t.buyer) {
        if (t.buyer.name.toLowerCase().includes(q)) return true;
        if (t.buyer.phone.toLowerCase().includes(q)) return true;
        if (t.buyer.email.toLowerCase().includes(q)) return true;
      }
      return false;
    }
    return true;
  });

  const handleApprove = async () => {
    if (!selectedTicket || !id) return;
    try {
      await TicketService.approveTicket(id, selectedTicket.id);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, status: 'SOLD', buyer: { ...t.buyer!, paymentStatus: 'CONFIRMED' } } 
          : t
      ));
      setSelectedTicket(prev => prev ? { ...prev, status: 'SOLD', buyer: { ...prev.buyer!, paymentStatus: 'CONFIRMED' } } : null);
      
      Swal.fire({
        icon: 'success',
        title: '¡Boleta Aprobada!',
        text: 'La boleta ha sido marcada como pagada.',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#16a34a'
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al aprobar boleta', background: '#0a0a0a', color: '#fff' });
    }
  };

  const handleCancel = async () => {
    if (!selectedTicket || !id) return;
    
    const result = await Swal.fire({
      title: '¿Cancelar Reserva?',
      text: "La boleta volverá a estar disponible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      background: '#0a0a0a',
      color: '#fff'
    });
    
    if (!result.isConfirmed) return;

    try {
      await TicketService.cancelTicket(id, selectedTicket.id);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, status: 'AVAILABLE', buyer: undefined } 
          : t
      ));
      setSelectedTicket(prev => prev ? { ...prev, status: 'AVAILABLE', buyer: undefined } : null);
      
      Swal.fire({
        icon: 'success',
        title: '¡Reserva Cancelada!',
        text: 'La boleta vuelve a estar disponible.',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#dc2626'
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cancelar boleta', background: '#0a0a0a', color: '#fff' });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link to="/admin/raffles" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Rifas
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Dashboard: {raffle.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Recaudación</p>
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-2 opacity-20" />
            <p className="text-3xl font-black">{formatPrice(revenue)}</p>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Progreso</p>
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-500 mr-2 opacity-20" />
            <p className="text-3xl font-black">{percentage.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Estado Boletas</p>
          <div className="flex justify-between items-end mt-2">
            <div className="text-center"><p className="text-2xl font-black text-green-600">{available}</p><p className="text-[10px] uppercase text-gray-400">Libres</p></div>
            <div className="text-center"><p className="text-2xl font-black text-orange-500">{reserved}</p><p className="text-[10px] uppercase text-gray-400">Rsv</p></div>
            <div className="text-center"><p className="text-2xl font-black text-red-600">{sold}</p><p className="text-[10px] uppercase text-gray-400">Vnd</p></div>
          </div>
        </div>
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total</p>
          <p className="text-4xl font-black">{raffle.totalTickets}</p>
        </div>
      </div>

      <div className="bg-white p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter">Buscar Boletas</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Número, Nombre, Teléfono..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="px-4 py-2 text-sm border focus:ring-1 focus:ring-black w-full md:w-64"
            />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 text-sm border focus:ring-1 focus:ring-black"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="AVAILABLE">Disponibles</option>
              <option value="RESERVED">Reservadas</option>
              <option value="SOLD">Vendidas</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
          {filteredTickets.map(t => (
            <button
              key={t.id}
              onClick={() => { if(t.buyer) setSelectedTicket(t); }}
              className={`aspect-square flex items-center justify-center text-xs font-bold transition-all ${
                t.status === 'AVAILABLE' ? 'bg-gray-100 text-gray-500 cursor-default' :
                t.status === 'RESERVED' ? 'bg-orange-100 text-orange-800 border-orange-300 border hover:bg-orange-200 cursor-pointer shadow-sm' :
                'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm'
              }`}
              title={t.buyer ? `${t.buyer.name} (${t.buyer.phone})` : 'Disponible'}
            >
              {t.ticketNumber}
            </button>
          ))}
        </div>
      </div>

      {selectedTicket && selectedTicket.buyer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 relative">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold">X</button>
            <div className="text-center mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Información de Boleta</p>
              <h2 className="text-4xl font-black">#{selectedTicket.ticketNumber}</h2>
              <span className={`inline-block mt-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${selectedTicket.status === 'SOLD' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                {selectedTicket.status === 'SOLD' ? 'Vendido' : 'Reservado'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <User className="w-5 h-5 mr-4 text-gray-400" />
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cliente</p><p className="font-bold">{selectedTicket.buyer.name}</p></div>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-5 h-5 mr-4 text-gray-400" />
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Teléfono</p><p className="font-bold">{selectedTicket.buyer.phone}</p></div>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-5 h-5 mr-4 text-gray-400" />
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Correo</p><p className="font-bold">{selectedTicket.buyer.email}</p></div>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-5 h-5 mr-4 text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fecha de Compra</p>
                  <p className="font-bold">{selectedTicket.buyer.createdAt ? formatDate(selectedTicket.buyer.createdAt) : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
              <p className="text-xs font-bold text-center text-gray-500 uppercase tracking-widest">
                Estado de Pago: <span className={selectedTicket.buyer.paymentStatus === 'CONFIRMED' ? 'text-green-600' : 'text-orange-500'}>{selectedTicket.buyer.paymentStatus}</span>
              </p>
              
              {selectedTicket.status === 'RESERVED' && (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleApprove}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest py-3 transition-colors"
                  >
                    Marcar como Pagado (Aprobar)
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
