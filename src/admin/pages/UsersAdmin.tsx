import React, { useEffect, useState } from 'react';
import { UserService, StoreService } from '../../services/api';
import { User, Store } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleName: 'STORE_ADMIN' as 'GLOBAL_ADMIN' | 'STORE_ADMIN',
    storeIds: [] as string[],
    isActive: true
  });

  const loadUsersAndStores = async () => {
    const [u, s] = await Promise.all([UserService.getUsers(), StoreService.getStores()]);
    setUsers(u);
    setStores(s);
  };

  useEffect(() => {
    loadUsersAndStores();
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        roleName: user.role.name,
        storeIds: user.storeIds || [],
        isActive: user.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', email: '', password: '', roleName: 'STORE_ADMIN', storeIds: [], isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleStoreToggle = (storeId: string) => {
    setFormData(prev => ({
      ...prev,
      storeIds: prev.storeIds.includes(storeId) 
        ? prev.storeIds.filter(id => id !== storeId)
        : [...prev.storeIds, storeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
      roleName: formData.roleName,
      storeIds: formData.roleName === 'GLOBAL_ADMIN' ? [] : formData.storeIds.map(Number),
      isActive: formData.isActive
    };

    try {
      if (editingId) {
        await UserService.updateUser(editingId, userData as any);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Actualizado',
          text: 'Los cambios se han guardado exitosamente.',
          confirmButtonColor: '#000000'
        });
      } else {
        await UserService.createUser(userData as any);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Creado',
          text: 'El nuevo usuario se registró exitosamente.',
          confirmButtonColor: '#000000'
        });
      }
      setIsModalOpen(false);
      loadUsersAndStores();
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: error.message || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#000000'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await UserService.deleteUser(id);
        loadUsersAndStores();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El usuario ha sido eliminado.',
          confirmButtonColor: '#000000'
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'No se pudo eliminar el usuario.',
          confirmButtonColor: '#000000'
        });
      }
    }
  };

  const getStoreNames = (storeIds?: string[]) => {
    if (!storeIds || storeIds.length === 0) return 'Ninguna';
    return storeIds
      .map(id => stores.find(s => String(s.id) === String(id))?.name || `Sede ${id}`)
      .join(', ');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Usuarios</h1>
        <button 
          onClick={() => openModal()}
          className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar Usuario
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Nombre</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Email</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Rol</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Sedes Asociadas</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Estado</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="px-6 py-4">
                  <div className="font-bold uppercase tracking-wider text-sm">{user.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-black`}>
                    {user.role.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-bold uppercase tracking-wide">
                  {user.role.name === 'GLOBAL_ADMIN' ? 'TODAS' : getStoreNames(user.storeIds)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(user)} className="p-2 text-gray-400 hover:text-black transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-widest">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Contraseña</label>
                  <input 
                    type="password" 
                    required={!editingId} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black" 
                    placeholder={editingId ? "Dejar en blanco para conservar contraseña" : "Contraseña"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">Rol</label>
                  <select value={formData.roleName} onChange={e => setFormData({...formData, roleName: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                    <option value="STORE_ADMIN">Administrador de Sede</option>
                    <option value="GLOBAL_ADMIN">Administrador Global</option>
                  </select>
                </div>
                
                {formData.roleName === 'STORE_ADMIN' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Sedes Asignadas</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 p-3">
                      {stores.map(store => (
                        <div key={store.id} className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id={`store-${store.id}`} 
                            checked={formData.storeIds.includes(store.id)}
                            onChange={() => handleStoreToggle(store.id)}
                            className="rounded-none border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor={`store-${store.id}`} className="text-sm cursor-pointer">{store.name}</label>
                        </div>
                      ))}
                      {stores.length === 0 && <p className="text-xs text-gray-500">No hay sedes disponibles.</p>}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded-none border-gray-300 text-black focus:ring-black" />
                  <label htmlFor="isActive" className="text-sm uppercase font-bold tracking-widest text-gray-700">Usuario Activo</label>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
