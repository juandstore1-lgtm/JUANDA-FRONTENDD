import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Ticket as TicketIcon } from "lucide-react";
import AnimatedSection from "../components/AnimatedSection";
import { RaffleService } from "../services/api";
import { Raffle } from "../types";
import { formatPrice } from "../utils/format";

export default function Raffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RaffleService.getAllRaffles().then(data => {
      // Only show active or sold out, not upcoming or finished (or maybe upcoming too)
      setRaffles(data.filter(r => r.status !== 'FINISHED'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-chrome">
            Rifas <span className="text-white">Exclusivas</span>
          </h1>
          <p className="text-lg text-white/60">
            Participa por premios premium. Boletas limitadas.
          </p>
        </div>
      </AnimatedSection>

      {loading ? (
        <div className="text-center py-20 text-white font-black tracking-widest uppercase">Cargando...</div>
      ) : raffles.length === 0 ? (
        <div className="text-center py-20 text-white/50 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <p className="font-bold uppercase tracking-widest">No hay rifas activas en este momento.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-12">
          {raffles.map((raffle, index) => {
            const soldPercentage = ((raffle.totalTickets - raffle.availableTickets) / raffle.totalTickets) * 100;
            return (
              <AnimatedSection key={raffle.id} delay={index * 0.1} className="w-full max-w-2xl">
                <Link to={`/rifas/${raffle.id}`} className="block group">
                  <div className="relative bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/30">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={raffle.imageUrl} alt={raffle.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white border ${
                          raffle.status === 'ACTIVE' ? 'bg-red-600 border-red-500' :
                          raffle.status === 'SOLD_OUT' ? 'bg-gray-800 border-gray-600 text-gray-300' :
                          'bg-blue-600 border-blue-500'
                        }`}>
                          {raffle.status === 'ACTIVE' ? 'Activa' : raffle.status === 'SOLD_OUT' ? 'Agotada' : 'Próximamente'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 relative">
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">{raffle.name}</h2>
                      <p className="text-sm text-white/60 mb-6 line-clamp-2">{raffle.description}</p>
                      
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Premio Principal</p>
                          <p className="text-lg font-black text-white">{raffle.prize}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Valor Boleta</p>
                          <p className="text-xl font-black text-red-500">{formatPrice(raffle.ticketPrice)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">
                          <span>Vendidas: {soldPercentage.toFixed(0)}%</span>
                          <span>Quedan: {raffle.availableTickets}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${soldPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${raffle.status === 'SOLD_OUT' ? 'bg-gray-500' : 'bg-red-600'}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-white border-t border-white/10 pt-4 mt-2">
                        <span className="text-xs font-bold uppercase tracking-widest group-hover:text-red-500 transition-colors flex items-center">
                          <TicketIcon className="w-4 h-4 mr-2" /> Comprar Boleta
                        </span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      )}
    </div>
  );
}
