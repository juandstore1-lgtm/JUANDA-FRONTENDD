import React, { useEffect, useState } from 'react';
import { ProductService, StoreService, CategoryService } from '../../services/api';
import { Product, Store, Category } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { formatPrice } from '../../utils/format';

// Sub-component for individual store product table with search & filters
function StoreProductTable({
  store,
  products,
  onEdit,
  onDelete
}: {
  store: Store;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
      CategoryService.getCategories(store.id).then(setCategories);
    }
  }, [isOpen, store.id]);

  // Filter products based on search term, category and status
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? p.status === selectedStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="border border-gray-100 mb-6 bg-white shadow-sm">
      {/* Collapsible Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors font-black uppercase tracking-wider text-sm text-left border-b border-gray-100"
      >
        <div className="flex items-center space-x-3">
          <span className="text-black">{store.name}</span>
          <span className="text-[10px] font-mono text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full lowercase">
            {products.length} productos
          </span>
        </div>
        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Toolbar Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm uppercase font-bold text-gray-700 bg-white"
              >
                <option value="">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm uppercase font-bold text-gray-700 bg-white"
              >
                <option value="">Todos los Estados</option>
                <option value="AVAILABLE">Disponible</option>
                <option value="OUT_OF_STOCK">Agotado</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No se encontraron productos con los filtros especificados.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <th className="pb-3 pr-4">Producto</th>
                    <th className="pb-3 pr-4">Categoría</th>
                    <th className="pb-3 pr-4">Precio</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3 pr-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() =>
                              Swal.fire({
                                title: product.name,
                                imageUrl: product.images[0] || 'https://via.placeholder.com/400',
                                imageAlt: product.name,
                                showConfirmButton: false,
                                showCloseButton: true,
                                confirmButtonColor: '#000000'
                              })
                            }
                            className="cursor-zoom-in overflow-hidden focus:outline-none flex-shrink-0"
                            title="Previsualizar imagen"
                          >
                            <img
                              src={product.images[0] || 'https://via.placeholder.com/400'}
                              alt={product.name}
                              className="w-10 h-10 object-cover bg-gray-100 border border-gray-100 hover:scale-110 transition-transform duration-200"
                            />
                          </button>
                          <div>
                            <div className="font-bold uppercase tracking-wider text-black">{product.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 uppercase text-gray-600 font-medium">{product.category}</td>
                      <td className="py-4 font-bold text-black">{formatPrice(product.price)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                            product.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.status === 'AVAILABLE' ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-1">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
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
      )}
    </div>
  );
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();

  const isGlobal = user?.role.name === 'GLOBAL_ADMIN';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    discountPercentage: '',
    sizes: '',
    colors: '',
    images: [] as string[],
    status: 'AVAILABLE' as 'AVAILABLE' | 'OUT_OF_STOCK',
    selectedStoreId: ''
  });

  const loadProducts = () => {
    ProductService.getProducts().then((data) => {
      if (isGlobal) {
        setProducts(data);
      } else {
        // Only show products belonging to the store admin's assigned store(s)
        const allowedProducts = data.filter((p) =>
          p.storeIds?.some((id) => user?.storeIds?.includes(String(id)))
        );
        setProducts(allowedProducts);
      }
    });
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    loadProducts();
    // Load stores list
    StoreService.getStores().then((allStores) => {
      if (isGlobal) {
        setStores(allStores);
      } else {
        const allowed = allStores.filter((s) => user?.storeIds?.includes(String(s.id)));
        setStores(allowed);
      }
    });
  }, [user, isGlobal]);

  // Load categories whenever the selected store in the form changes
  useEffect(() => {
    if (formData.selectedStoreId) {
      CategoryService.getCategories(formData.selectedStoreId).then(setCategories);
    } else {
      setCategories([]);
    }
  }, [formData.selectedStoreId]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      const initialStoreId = product.storeIds && product.storeIds.length > 0 ? String(product.storeIds[0]) : '';
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        category: product.category,
        discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : '',
        sizes: product.sizes.join(', '),
        colors: product.colors.join(', '),
        images: product.images || [],
        status: product.status,
        selectedStoreId: initialStoreId
      });
    } else {
      setEditingId(null);
      const defaultStoreId = stores.length > 0 ? String(stores[0].id) : '';
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        discountPercentage: '',
        sizes: 'S, M, L, XL',
        colors: 'Negro, Blanco, Gris',
        images: [],
        status: 'AVAILABLE',
        selectedStoreId: defaultStoreId
      });
    }
    setIsModalOpen(true);
  };

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
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setLoading(true);
    try {
      const compressedImages = await Promise.all(files.map(file => compressImage(file)));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...compressedImages]
      }));
    } catch (error) {
      console.error("Error compressing images", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron procesar las imágenes.', confirmButtonColor: '#000000' });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedStoreId) {
      Swal.fire({ icon: 'warning', title: 'Falta Sede', text: 'Por favor selecciona una sede.', confirmButtonColor: '#000000' });
      return;
    }
    if (!formData.category) {
      Swal.fire({ icon: 'warning', title: 'Falta Categoría', text: 'Por favor selecciona una categoría.', confirmButtonColor: '#000000' });
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Falta Imagen', text: 'Por favor añade al menos una imagen para el producto.', confirmButtonColor: '#000000' });
      return;
    }

    setLoading(true);
    const productData: Omit<Product, 'id'> = {
      name: formData.name,
      price: parseFloat(formData.price),
      discountPercentage: formData.discountPercentage ? parseInt(formData.discountPercentage) : undefined,
      description: formData.description,
      category: formData.category,
      sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean),
      images: formData.images.length > 0 ? formData.images : ['https://via.placeholder.com/400'],
      storeIds: [formData.selectedStoreId],
      status: formData.status,
      tags: ['Nuevo'],
      order: products.length + 1
    };

    try {
      if (editingId) {
        await ProductService.updateProduct(editingId, productData);
        Swal.fire({ icon: 'success', title: 'Producto Actualizado', text: 'Cambios guardados con éxito.', confirmButtonColor: '#000000' });
      } else {
        await ProductService.createProduct(productData);
        Swal.fire({ icon: 'success', title: 'Producto Creado', text: 'El producto fue agregado a la sede.', confirmButtonColor: '#000000' });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo guardar el producto.', confirmButtonColor: '#000000' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await ProductService.deleteProduct(id);
        loadProducts();
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El producto ha sido eliminado.', confirmButtonColor: '#000000' });
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo eliminar el producto.', confirmButtonColor: '#000000' });
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Productos</h1>
        <button
          onClick={() => openModal()}
          className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Agregar Producto
        </button>
      </div>

      {/* Renders dynamic accordions for each store */}
      <div className="space-y-4">
        {stores.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center text-gray-500 text-sm shadow-sm">
            No tienes sedes asignadas o disponibles para administrar.
          </div>
        ) : (
          stores.map((store) => {
            const storeProds = products.filter((p) => p.storeIds?.includes(String(store.id)));
            return (
              <StoreProductTable
                key={store.id}
                store={store}
                products={storeProds}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl h-[90vh] flex flex-col relative overflow-hidden rounded-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 flex-shrink-0">
              <h2 className="text-lg font-black uppercase tracking-widest">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Descuento (%) <span className="text-gray-400 font-normal normal-case">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="Ej. 20"
                  />
                </div>

                {/* Sede Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Sede
                  </label>
                  <select
                    value={formData.selectedStoreId}
                    onChange={(e) => setFormData({ ...formData, selectedStoreId: e.target.value, category: '' })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm uppercase font-bold text-gray-700 bg-white"
                  >
                    <option value="">Seleccionar Sede</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoría Select (Dynamic based on selected Store) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm uppercase font-bold text-gray-700 bg-white"
                    disabled={!formData.selectedStoreId}
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {!formData.selectedStoreId && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">Selecciona una sede primero</p>
                  )}
                  {formData.selectedStoreId && categories.length === 0 && (
                    <p className="text-[10px] text-red-500 mt-1 italic">
                      No hay categorías en esta sede. Créalas en la sección de Categorías.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-bold text-gray-700 bg-white"
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OUT_OF_STOCK">Agotado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Tallas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL (Opcional)"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Colores (separados por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="Negro, Blanco, Gris (Opcional)"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Imágenes del Producto (Se comprimirán automáticamente)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 border border-gray-200">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
