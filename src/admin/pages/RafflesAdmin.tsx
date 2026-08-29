import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { RaffleService } from "../../services/api";
import { Raffle } from "../../types";
import Swal from "sweetalert2";
import { formatPrice } from "../../utils/format";

export default function RafflesAdmin() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    prize: '',
    ticketPrice: '',
    totalTickets: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING'
  });

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

  const loadRaffles = async () => {
    setLoading(true);
    try {
      const data = await RaffleService.getAllRaffles();
      setRaffles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRaffles();
  }, []);

  const openModal = (raffle?: Raffle) => {
    if (raffle) {
      setEditingId(raffle.id);
      setFormData({
        name: raffle.name,
        description: raffle.description,
        imageUrl: raffle.imageUrl,
        prize: raffle.prize,
        ticketPrice: raffle.ticketPrice.toString(),
        totalTickets: raffle.totalTickets.toString(),
        startDate: raffle.startDate.split('.')[0], // strip timezone if necessary
        endDate: raffle.endDate.split('.')[0],
        status: raffle.status
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        prize: '',
        ticketPrice: '',
        totalTickets: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        status: 'UPCOMING'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ticketPrice: parseFloat(formData.ticketPrice),
      totalTickets: parseInt(formData.totalTickets)
    };
    
    try {
      if (editingId) {
        await RaffleService.updateRaffle(editingId, payload);
        Swal.fire({ icon: 'success', title: 'Rifa Actualizada', confirmButtonColor: '#000000' });
      } else {
        await RaffleService.createRaffle(payload);
        Swal.fire({ icon: 'success', title: 'Rifa Creada', confirmButtonColor: '#000000' });
      }
      setIsModalOpen(false);
      loadRaffles();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#000000' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar rifa?',
      text: 'Se eliminarán todas las boletas asociadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await RaffleService.deleteRaffle(id);
        loadRaffles();
        Swal.fire('Eliminada', '', 'success');
      } catch (err: any) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Gestión de Rifas</h1>
        <button
          onClick={() => openModal()}
          className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Crear Rifa
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 font-black tracking-widest">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Premio</th>
              <th className="px-4 py-3">Precio Boleta</th>
              <th className="px-4 py-3">Boletas</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {raffles.map((raffle) => (
              <tr key={raffle.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 font-bold">{raffle.name}</td>
                <td className="px-4 py-4">{raffle.prize}</td>
                <td className="px-4 py-4">{formatPrice(raffle.ticketPrice)}</td>
                <td className="px-4 py-4">
                  {raffle.availableTickets} / {raffle.totalTickets}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-white ${
                    raffle.status === 'ACTIVE' ? 'bg-green-600' :
                    raffle.status === 'UPCOMING' ? 'bg-blue-600' :
                    raffle.status === 'SOLD_OUT' ? 'bg-orange-600' : 'bg-gray-600'
                  }`}>
                    {raffle.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right space-x-2">
                  <Link to={`/admin/raffles/${raffle.id}`} className="inline-flex p-1.5 text-blue-600 hover:text-blue-800 transition-colors" title="Ver Dashboard">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => openModal(raffle)} className="p-1.5 text-gray-400 hover:text-black transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(raffle.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {raffles.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No hay rifas registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-black uppercase tracking-widest">
                {editingId ? 'Editar Rifa' : 'Nueva Rifa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black font-bold">X</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Premio</label>
                  <input type="text" required value={formData.prize} onChange={e => setFormData({...formData, prize: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Descripción</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Precio x Boleta</label>
                  <input type="number" required value={formData.ticketPrice} onChange={e => setFormData({...formData, ticketPrice: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Total Boletas</label>
                  <input type="number" required disabled={!!editingId} value={formData.totalTickets} onChange={e => setFormData({...formData, totalTickets: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Fecha Inicio</label>
                  <input type="datetime-local" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Fecha Cierre</label>
                  <input type="datetime-local" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Imagen/Banner de la Rifa</label>
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
                              setFormData({ ...formData, imageUrl: base64 });
                            } catch (error) {
                              console.error('Error compressing image:', error);
                              alert('Error al procesar la imagen');
                            }
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-gray-300 text-xs bg-white file:mr-4 file:py-1 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-black file:text-white hover:file:bg-gray-800"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border focus:ring-1 focus:ring-black">
                    <option value="UPCOMING">Próximamente</option>
                    <option value="ACTIVE">Activa</option>
                    <option value="SOLD_OUT">Agotada</option>
                    <option value="FINISHED">Finalizada</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t">
                <button type="submit" className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
