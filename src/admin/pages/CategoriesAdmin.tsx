import React, { useEffect, useState } from 'react';
import { CategoryService, StoreService } from '../../services/api';
import { Category, Store } from '../../types';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function CategoriesAdmin() {
  const { user, refreshUser } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isGlobal = user?.role.name === 'GLOBAL_ADMIN';

  useEffect(() => {
    refreshUser();
  }, []);

  // Load stores first
  useEffect(() => {
    StoreService.getStores().then((allStores) => {
      if (isGlobal) {
        setStores(allStores);
        if (allStores.length > 0) {
          setSelectedStoreId(String(allStores[0].id));
        }
      } else {
        // Filter stores based on user's storeIds
        const allowedStores = allStores.filter((s) => user?.storeIds?.includes(String(s.id)));
        setStores(allowedStores);
        if (allowedStores.length > 0) {
          setSelectedStoreId(String(allowedStores[0].id));
        }
      }
    });
  }, [user, isGlobal]);

  // Load categories when selectedStoreId changes
  useEffect(() => {
    if (selectedStoreId) {
      CategoryService.getCategories(selectedStoreId).then(setCategories);
    } else {
      setCategories([]);
    }
    // Cancel editing if store changes
    cancelEdit();
  }, [selectedStoreId]);

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !selectedStoreId) return;

    setLoading(true);
    try {
      if (editingId) {
        // Edit existing category
        await CategoryService.updateCategory(editingId, {
          name: newCategoryName.trim(),
          image: newCategoryImage,
          storeId: selectedStoreId,
        });
        Swal.fire({
          icon: 'success',
          title: 'Categoría Actualizada',
          text: 'El nombre de la categoría ha sido modificado.',
          confirmButtonColor: '#000000'
        });
        cancelEdit();
      } else {
        // Create new category
        await CategoryService.createCategory({
          name: newCategoryName.trim(),
          image: newCategoryImage,
          storeId: selectedStoreId,
        });
        Swal.fire({
          icon: 'success',
          title: 'Categoría Creada',
          text: 'La categoría se ha agregado correctamente a esta sede.',
          confirmButtonColor: '#000000'
        });
        setNewCategoryName('');
        setNewCategoryImage('');
      }

      // Reload categories
      const updated = await CategoryService.getCategories(selectedStoreId);
      setCategories(updated);
    } catch (err: any) {
      console.error("Error saving category:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo guardar la categoría.',
        confirmButtonColor: '#000000'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryImage(category.image || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCategoryName('');
    setNewCategoryImage('');
  };

  const handleDeleteCategory = async (id: number | string) => {
    const result = await Swal.fire({
      title: '¿Eliminar esta categoría?',
      text: "¡Los productos en esta categoría podrían quedarse sin filtro asignado!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await CategoryService.deleteCategory(id);
        // Reload categories
        const updated = await CategoryService.getCategories(selectedStoreId);
        setCategories(updated);
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La categoría ha sido eliminada correctamente.',
          confirmButtonColor: '#000000'
        });
        // If we are currently editing the deleted category, cancel edit
        if (editingId === id) {
          cancelEdit();
        }
      } catch (err: any) {
        console.error("Error deleting category:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'No se pudo eliminar la categoría.',
          confirmButtonColor: '#000000'
        });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategoryImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Modal de previsualización de imagen */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-full">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Categorías por Sede</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Selector de Sede y Formulario */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Seleccionar Sede</h2>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              disabled={!!editingId} // Disable store change during edit to maintain integrity
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm uppercase tracking-wider font-bold disabled:opacity-50"
            >
              {stores.length === 0 && <option value="">Sin sedes disponibles</option>}
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStoreId && (
            <div className="bg-white p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Ej. T-Shirts"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Imagen (Opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer"
                  />
                  {newCategoryImage && (
                    <div className="mt-4 flex items-center justify-center bg-black/5 p-4 rounded-sm">
                      <img src={newCategoryImage} alt="Preview" className="h-16 w-16 object-cover border border-gray-200" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {!editingId && <Plus className="w-4 h-4 mr-2" />}
                    {loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Categoría')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="w-full border border-gray-300 text-gray-700 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" /> Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Listado de Categorías */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-widest">Categorías Registradas</h2>
              <span className="text-xs text-gray-500 font-mono">{categories.length} items</span>
            </div>
            
            {categories.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No hay categorías creadas para esta sede aún.
              </div>
            ) : (
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-50">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Imagen</th>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">{c.id}</td>
                      <td className="px-6 py-4">
                        {c.image ? (
                          <img 
                            src={c.image} 
                            alt={c.name} 
                            className="w-10 h-10 object-cover rounded-sm border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" 
                            onClick={() => setPreviewImage(c.image!)}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-gray-400 text-xs">Sin img</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold uppercase tracking-wider text-black">{c.name}</td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(c)}
                          disabled={loading}
                          className="p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-50"
                          title="Editar Nombre"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
