import React, { useEffect, useState } from 'react';
import { StoreService } from '../../services/api';
import { Store } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function StoresAdmin() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    schedule: '',
    image: '',
    description: ''
  });

  const loadStores = () => {
    StoreService.getStores().then(setStores);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const openModal = (store?: Store) => {
    if (store) {
      setEditingId(store.id);
      setFormData({
        name: store.name,
        address: store.address,
        phone: store.phone,
        schedule: store.schedule,
        image: store.image,
        description: store.description
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', address: '', phone: '', schedule: '', image: '', description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const storeData: Omit<Store, 'id'> = {
      ...formData,
      image: formData.image || 'https://via.placeholder.com/400'
    };

    try {
      if (editingId) {
        await StoreService.updateStore(editingId, storeData);
      } else {
        await StoreService.createStore(storeData);
      }
      setIsModalOpen(false);
      loadStores();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar sede?')) {
      await StoreService.deleteStore(id);
      loadStores();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Sedes</h1>
        <button 
          onClick={() => openModal()}
          className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar Sede
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Sede</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Dirección</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <img src={store.image} alt={store.name} className="w-12 h-12 object-cover bg-gray-100" />
                    <div>
                      <div className="font-bold uppercase tracking-wider text-sm">{store.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 uppercase">{store.address}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(store)} className="p-2 text-gray-400 hover:text-black transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(store.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <StoreModal
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          handleSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface StoreModalProps {
  editingId: string | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

function StoreModal({ editingId, formData, setFormData, loading, handleSubmit, onClose }: StoreModalProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(formData.address);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await compressImage(file);
        setFormData({ ...formData, image: compressedBase64 });
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Hubo un error al comprimir la imagen.");
      }
    }
  };

  useEffect(() => {
    if (!formData.address || formData.address.length < 3 || formData.address === selectedAddress) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      // Query OpenStreetMap Nominatim for addresses in Colombia (co)
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&countrycodes=co&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map((item: any) => {
              // Simplify long display names to keep them clean
              const parts = item.display_name.split(',');
              return parts.slice(0, 4).join(',').trim();
            });
            setSuggestions(formatted);
            setShowSuggestions(true);
          }
        })
        .catch(err => console.error("Error loading address suggestions:", err))
        .finally(() => setSearching(false));
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.address, selectedAddress]);

  const handleSelect = (address: string) => {
    setSelectedAddress(address);
    setFormData({ ...formData, address });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase tracking-widest">{editingId ? 'Editar Sede' : 'Nueva Sede'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Nombre</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black" />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Dirección</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={() => {
                  // Small delay to allow click event on suggestions dropdown
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black" 
                placeholder="Busca una dirección o lugar..."
              />
              {searching && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-[60] max-h-60 overflow-y-auto">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => handleSelect(sug)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 border-b border-gray-50 last:border-0 truncate font-semibold uppercase tracking-wider block"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Teléfono</label>
            <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Horario</label>
            <input type="text" required value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Imagen (Se comprimirá automáticamente)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload} 
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black" 
            />
            {formData.image && (
              <div className="mt-2">
                <img src={formData.image} alt="Preview" className="w-full h-32 object-cover border rounded-md" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Descripción</label>
            <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black"></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 text-black">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Sede'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
