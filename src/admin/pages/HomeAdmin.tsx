import React, { useEffect, useState } from 'react';
import { HomeService } from '../../services/api';
import { HeroSlide, RouletteSetting, MysteryBoxSetting, HomeCategoryCollection } from '../../types';
import { Plus, Trash2, Edit2, Save, X, Gift, Timer } from 'lucide-react';
import Swal from 'sweetalert2';
import { formatPrice } from '../../utils/format';

export default function HomeAdmin() {
  const [activeTab, setActiveTab] = useState<'hero' | 'collections' | 'roulette' | 'mysteryBox'>('hero');
  const [loading, setLoading] = useState(false);


  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlideId, setEditingSlideId] = useState<string | number | null>(null);
  const [slideFormData, setSlideFormData] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: '',
    season: '',
    title: '',
    slideOrder: 0
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

  // Roulette State
  const [rouletteSetting, setRouletteSetting] = useState<RouletteSetting>({
    id: 1,
    activeDays: 'WEDNESDAY',
    values: '5,10,15,20,25,10,5,15',
    probabilities: '12.5,12.5,12.5,12.5,12.5,12.5,12.5,12.5'
  });

  // Mystery Box State
  const [mysteryBoxSetting, setMysteryBoxSetting] = useState<MysteryBoxSetting>({
    id: 1,
    title: 'Caja Misteriosa',
    description: 'Recibe de 2 a 3 prendas exclusivas seleccionadas de nuestra última colección. ¡Edición limitada con prendas de valor superior al costo de la caja!',
    price: 90000,
    estimatedValue: '+$160.000',
    revealedSubtext: '2-3 Prendas Premium Sorpresa',
    perk1: 'Contiene de 2 a 3 prendas premium.',
    perk2: 'Empaque de regalo oficial de edición limitada.',
    perk3: 'Garantía de prendas auténticas 100% de la marca.',
    sizes: 'S,M,L,XL,XXL',
    active: true
  });

  // Collections State (Las Mejores Colecciones)
  const [collections, setCollections] = useState<HomeCategoryCollection[]>([]);
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [collectionFormData, setCollectionFormData] = useState<Omit<HomeCategoryCollection, 'id'>>({
    name: '',
    description: '',
    imageUrl: '',
    categoryFilter: '',
    displayOrder: 1
  });

  // Help fields / parsed lists for visual verification
  const [activeDaysList, setActiveDaysList] = useState<string[]>(['WEDNESDAY']);
  const [wheelPrizes, setWheelPrizes] = useState<string[]>(['5', '10', '15', '20', '25', '10', '5', '15']);
  const [wheelProbabilities, setWheelProbabilities] = useState<string[]>(['12.5', '12.5', '12.5', '12.5', '12.5', '12.5', '12.5', '12.5']);

  useEffect(() => {
    loadHomeConfig();
  }, []);

  const loadHomeConfig = async () => {
    try {
      setLoading(true);
      const [heroData, rouletteData, mysteryData, collectionsData] = await Promise.all([
        HomeService.getHeroConfig(),
        HomeService.getRouletteConfig(),
        HomeService.getMysteryBoxConfig(),
        HomeService.getHomeCollections().catch(() => [])
      ]);

      setSlides(heroData.slides.sort((a, b) => a.slideOrder - b.slideOrder));
      setCollections(collectionsData);
      if (rouletteData) {
        setRouletteSetting(rouletteData);
        setActiveDaysList(rouletteData.activeDays.split(',').map(d => d.trim().toUpperCase()));
        setWheelPrizes(rouletteData.values.split(',').map(v => v.trim()));
        setWheelProbabilities(rouletteData.probabilities.split(',').map(p => p.trim()));
      }
      if (mysteryData) {
        setMysteryBoxSetting(mysteryData);
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la configuración de la Home.' });
    } finally {
      setLoading(false);
    }
  };

  // Collection CRUD Handlers
  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCollectionId) {
        await HomeService.updateHomeCollection(editingCollectionId, collectionFormData);
        Swal.fire({ icon: 'success', title: 'Colección Actualizada', confirmButtonColor: '#000000' });
      } else {
        const nextOrder = collections.length > 0 ? Math.max(...collections.map(c => c.displayOrder)) + 1 : 1;
        await HomeService.createHomeCollection({ ...collectionFormData, displayOrder: nextOrder });
        Swal.fire({ icon: 'success', title: 'Colección Creada', confirmButtonColor: '#000000' });
      }
      setEditingCollectionId(null);
      setCollectionFormData({ name: '', description: '', imageUrl: '', categoryFilter: '', displayOrder: 1 });
      const updatedList = await HomeService.getHomeCollections();
      setCollections(updatedList);
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Error al guardar colección.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCollectionClick = (item: HomeCategoryCollection) => {
    setEditingCollectionId(item.id || null);
    setCollectionFormData({
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      categoryFilter: item.categoryFilter,
      displayOrder: item.displayOrder
    });
  };

  const handleDeleteCollection = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar colección?',
      text: 'Esta categoría ya no se mostrará en el carrusel de inicio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await HomeService.deleteHomeCollection(id);
        const updatedList = await HomeService.getHomeCollections();
        setCollections(updatedList);
        Swal.fire({ icon: 'success', title: 'Eliminada', confirmButtonColor: '#000000' });
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo eliminar.' });
      }
    }
  };

  // Roulette Setting Save
  const handleSaveRoulette = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations & sanitization
    const sanitizedPrizes = wheelPrizes.map(p => p === '' ? '0' : p);
    const sanitizedProbs = wheelProbabilities.map(p => p === '' ? '0' : p);

    const activeDaysStr = activeDaysList.join(',');
    const valuesStr = sanitizedPrizes.join(',');
    const probabilitiesStr = sanitizedProbs.join(',');

    if (activeDaysList.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debes seleccionar al menos un día activo para la ruleta.' });
      return;
    }

    if (wheelPrizes.length !== wheelProbabilities.length) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'El número de porcentajes de descuento y probabilidades debe coincidir.' });
      return;
    }

    const totalProb = wheelProbabilities.reduce((sum, curr) => sum + (parseFloat(curr) || 0), 0);
    if (Math.abs(totalProb - 100) > 0.1) {
      const resultConfirm = await Swal.fire({
        title: 'Probabilidad Total Diferente de 100%',
        text: `La suma de probabilidades es ${totalProb.toFixed(1)}%. ¿Deseas guardar de todas formas? (Se normalizarán proporcionalmente en el cliente)`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#000000',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      });
      if (!resultConfirm.isConfirmed) return;
    }

    setLoading(true);
    try {
      const updated = await HomeService.updateRouletteConfig({
        ...rouletteSetting,
        activeDays: activeDaysStr,
        values: valuesStr,
        probabilities: probabilitiesStr
      });
      setRouletteSetting(updated);
      Swal.fire({
        icon: 'success',
        title: 'Ruleta Guardada',
        text: 'La configuración y probabilidades de la ruleta se actualizaron con éxito.',
        confirmButtonColor: '#000000'
      });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Error al guardar configuración de ruleta.' });
    } finally {
      setLoading(false);
    }
  };

  // Mystery Box Setting Save
  const handleSaveMysteryBox = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await HomeService.updateMysteryBoxConfig(mysteryBoxSetting);
      setMysteryBoxSetting(updated);
      Swal.fire({
        icon: 'success',
        title: 'Caja Misteriosa Guardada',
        text: 'La configuración de la Caja Misteriosa se actualizó con éxito.',
        confirmButtonColor: '#000000'
      });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Error al guardar Caja Misteriosa.' });
    } finally {
      setLoading(false);
    }
  };

  // Slide CRUD Actions
  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSlideId) {
        await HomeService.updateHeroSlide(editingSlideId, slideFormData);
        Swal.fire({ icon: 'success', title: 'Slide Actualizado', confirmButtonColor: '#000000' });
      } else {
        const nextOrder = slides.length > 0 ? Math.max(...slides.map(s => s.slideOrder)) + 1 : 0;
        await HomeService.addHeroSlide({ ...slideFormData, slideOrder: nextOrder });
        Swal.fire({ icon: 'success', title: 'Slide Agregado', confirmButtonColor: '#000000' });
      }
      setEditingSlideId(null);
      setSlideFormData({ imageUrl: '', season: '', title: '', slideOrder: 0 });
      // Reload slides
      const heroData = await HomeService.getHeroConfig();
      setSlides(heroData.slides.sort((a, b) => a.slideOrder - b.slideOrder));
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Error al procesar slide.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlideClick = (slide: HeroSlide) => {
    setEditingSlideId(slide.id || null);
    setSlideFormData({
      imageUrl: slide.imageUrl,
      season: slide.season,
      title: slide.title,
      slideOrder: slide.slideOrder
    });
  };

  const handleDeleteSlide = async (id: string | number) => {
    const result = await Swal.fire({
      title: '¿Eliminar slide?',
      text: 'Esta acción removerá esta imagen del carrusel de la página de inicio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await HomeService.deleteHeroSlide(id);
        const heroData = await HomeService.getHeroConfig();
        setSlides(heroData.slides.sort((a, b) => a.slideOrder - b.slideOrder));
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El slide fue removido.', confirmButtonColor: '#000000' });
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo eliminar.' });
      }
    }
  };

  const toggleDayFilter = (dayName: string) => {
    if (activeDaysList.includes(dayName)) {
      setActiveDaysList(activeDaysList.filter(d => d !== dayName));
    } else {
      setActiveDaysList([...activeDaysList, dayName]);
    }
  };

  const handleAddSlice = () => {
    setWheelPrizes([...wheelPrizes, '5']);
    setWheelProbabilities([...wheelProbabilities, '0']);
  };

  const handleRemoveSlice = (index: number) => {
    if (wheelPrizes.length <= 2) {
      Swal.fire({ icon: 'warning', title: 'Límite alcanzado', text: 'La ruleta debe tener al menos 2 sectores.' });
      return;
    }
    setWheelPrizes(wheelPrizes.filter((_, i) => i !== index));
    setWheelProbabilities(wheelProbabilities.filter((_, i) => i !== index));
  };

  const handleSlicePrizeChange = (index: number, val: string) => {
    const nextPrizes = [...wheelPrizes];
    nextPrizes[index] = val;
    setWheelPrizes(nextPrizes);
  };

  const handleSliceProbChange = (index: number, val: string) => {
    const nextProbs = [...wheelProbabilities];
    nextProbs[index] = val;
    setWheelProbabilities(nextProbs);
  };

  const weekDays = [
    { label: 'Lunes', value: 'MONDAY' },
    { label: 'Martes', value: 'TUESDAY' },
    { label: 'Miércoles', value: 'WEDNESDAY' },
    { label: 'Jueves', value: 'THURSDAY' },
    { label: 'Viernes', value: 'FRIDAY' },
    { label: 'Sábado', value: 'SATURDAY' },
    { label: 'Domingo', value: 'SUNDAY' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Personalizar Inicio</h1>
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'hero' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Banner Principal
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'collections' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            🎴 Colecciones Carrusel
          </button>
          <button
            onClick={() => setActiveTab('roulette')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'roulette' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            🎡 Ruleta
          </button>
          <button
            onClick={() => setActiveTab('mysteryBox')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'mysteryBox' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            🎁 Caja Misteriosa
          </button>
        </div>
      </div>

      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hero Settings (Left Panel - 1 col) */}
          <div className="lg:col-span-1 space-y-6">


            {/* Slide Form Panel */}
            <div className="bg-white p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-black mb-6 pb-2 border-b border-gray-100">
                {editingSlideId ? 'Editar Slide' : 'Nuevo Slide del Carrusel'}
              </h2>
              <form onSubmit={handleSlideSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Imagen del Slide *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressImage(file);
                          setSlideFormData({ ...slideFormData, imageUrl: base64 });
                        } catch (err) {
                          console.error('Error compressing image:', err);
                          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la imagen' });
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                  />
                  {slideFormData.imageUrl && (
                    <div className="mt-2 relative h-20 w-full bg-black overflow-hidden border border-gray-200">
                      <img src={slideFormData.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Temporada / Colección (Season)
                  </label>
                  <input
                    type="text"
                    value={slideFormData.season}
                    onChange={(e) => setSlideFormData({ ...slideFormData, season: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    placeholder="Ej. Season 01 / Drop 04"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Título del Slide (Title)
                  </label>
                  <input
                    type="text"
                    value={slideFormData.title}
                    onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    placeholder="Ej. Urban Resilience"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {!editingSlideId && <Plus className="w-4 h-4 mr-2" />}
                    {loading ? 'Procesando...' : (editingSlideId ? 'Guardar Slide' : 'Agregar al Carrusel')}
                  </button>
                  {editingSlideId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlideId(null);
                        setSlideFormData({ imageUrl: '', season: '', title: '', slideOrder: 0 });
                      }}
                      className="w-full border border-gray-300 text-gray-600 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" /> Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Slides List Panel (Right Panel - 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-widest">Imágenes del Carrusel</h2>
                <span className="text-xs text-gray-400 font-mono">{slides.length} slides</span>
              </div>

              {slides.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  No hay slides agregados al carrusel principal.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="p-6 flex flex-col sm:flex-row gap-6 items-center hover:bg-gray-50/50 transition-colors">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-32 aspect-[16/9] object-cover bg-gray-100 border border-gray-200"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180' }}
                      />
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 mb-1 block">
                          {slide.season}
                        </span>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-black mb-1">
                          {slide.title}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono block">
                          Orden: {slide.slideOrder} | ID: {slide.id}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlideClick(slide)}
                          className="p-2 border border-gray-200 hover:border-black text-gray-400 hover:text-black transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id!)}
                          className="p-2 border border-gray-200 hover:border-red-600 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collection Form (Left Panel - 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-black mb-6 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>{editingCollectionId ? 'Editar Colección' : 'Nueva Colección'}</span>
                {editingCollectionId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCollectionId(null);
                      setCollectionFormData({ name: '', description: '', imageUrl: '', categoryFilter: '', displayOrder: 1 });
                    }}
                    className="text-gray-400 hover:text-black text-xs font-bold uppercase"
                  >
                    Cancelar
                  </button>
                )}
              </h2>

              <form onSubmit={handleCollectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Nombre / Título de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CAMISETAS, JEANS, PANTALONETAS"
                    value={collectionFormData.name}
                    onChange={(e) => setCollectionFormData({ ...collectionFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    required
                    placeholder="Ej. Colección urbana de JDQSTORE con estilo oscuro..."
                    value={collectionFormData.description}
                    onChange={(e) => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    URL DE IMAGEN DE FONDO / CUADRO *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const base64 = await compressImage(file);
                          setCollectionFormData({ ...collectionFormData, imageUrl: base64 });
                        } catch (err) {
                          console.error('Error compressing image:', err);
                          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la imagen' });
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                  />
                  {collectionFormData.imageUrl && (
                    <div className="mt-4 p-2 bg-[#0a0a0a] rounded flex justify-center border border-white/10 h-32">
                      <img src={collectionFormData.imageUrl} alt="Preview" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Orden de Despliegue
                  </label>
                  <input
                    type="number"
                    value={collectionFormData.displayOrder}
                    onChange={(e) => setCollectionFormData({ ...collectionFormData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCollectionId ? 'Guardar Cambios' : 'Agregar Colección'}
                </button>
              </form>
            </div>
          </div>

          {/* Collections List (Right Panel - 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-black mb-6 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>Colecciones del Carrusel ({collections.length})</span>
              </h2>

              {collections.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">
                  No hay colecciones creadas aún. Agrega una desde el panel izquierdo.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collections.map((item) => (
                    <div key={item.id} className="border border-gray-200 bg-gray-50 p-4 rounded flex flex-col justify-between space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-20 h-24 bg-black rounded overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-white/20">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" />
                        </div>
                        <div className="space-y-1 text-left">
                          <span className="inline-block px-2 py-0.5 bg-black text-white text-[9px] font-mono font-bold rounded">
                            Orden: {item.displayOrder}
                          </span>
                          <h3 className="text-base font-black uppercase text-black">{item.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                          <span className="text-[10px] text-gray-400 block font-mono">Filtro: {item.categoryFilter || item.name}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEditCollectionClick(item)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-black hover:text-white text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => item.id && handleDeleteCollection(item.id)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-600 hover:text-white text-red-600 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roulette' && (
        <div className="bg-white p-8 border border-gray-100 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-gray-100">
            <Timer className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-black uppercase tracking-widest text-black">
              Personalizar Ruleta de Descuentos
            </h2>
          </div>

          <form onSubmit={handleSaveRoulette} className="space-y-6">
            {/* Days Selection */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                Días de la semana en que estará activa la ruleta
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => {
                  const isActive = activeDaysList.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayFilter(day.value)}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                        isActive
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                La opción de girar la ruleta en la barra de navegación pública solo se mostrará durante los días que marques aquí.
              </p>
            </div>

            {/* Slices list config */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Sectores de Descuento y Probabilidades</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Configura el porcentaje de descuento y el peso de probabilidad de cada sector.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlice}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  + Agregar Sector
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {wheelPrizes.map((prize, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 border border-gray-100">
                    <span className="text-xs font-mono text-gray-400 w-6">#{idx + 1}</span>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Descuento (%)</label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            value={prize === '0' || prize === 0 ? '' : prize}
                            onChange={(e) => handleSlicePrizeChange(idx, e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs font-bold bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Probabilidad (Peso)</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={wheelProbabilities[idx] === '0' || wheelProbabilities[idx] === 0 ? '' : wheelProbabilities[idx]}
                            onChange={(e) => handleSliceProbChange(idx, e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs font-bold bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">wt</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlice(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors mt-4 self-center"
                      title="Eliminar sector"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 mt-4 text-xs font-bold uppercase">
                <span className="text-gray-500">Suma total de Probabilidades:</span>
                <span className={Math.abs(wheelProbabilities.reduce((sum, curr) => sum + (parseFloat(curr) || 0), 0) - 100) < 0.1 ? 'text-green-600' : 'text-red-500'}>
                  {wheelProbabilities.reduce((sum, curr) => sum + (parseFloat(curr) || 0), 0).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-red-600 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" /> Guardar Configuración de Ruleta
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'mysteryBox' && (
        <div className="bg-white p-8 border border-gray-100 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8 pb-3 border-b border-gray-100">
            <Gift className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-black uppercase tracking-widest text-black">
              Configuración de la Caja Misteriosa
            </h2>
          </div>

          <form onSubmit={handleSaveMysteryBox} className="space-y-6">
            {/* Active Toggle Switch */}
            <div className="bg-gray-50 p-4 border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-black block">
                  Visibilidad de la Caja Misteriosa
                </span>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Activa o desactiva la opción en el menú de navegación y el acceso de los clientes a la página.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mysteryBoxSetting.active}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                <span className="ml-3 text-xs font-bold uppercase tracking-wider text-black">
                  {mysteryBoxSetting.active ? 'Activa (Visible)' : 'Inactiva (Oculta)'}
                </span>
              </label>
            </div>

            {/* Title & Price & Estimated Value */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Título Principal de la Caja
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Caja Misteriosa"
                  value={mysteryBoxSetting.title}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  URL de la Imagen Principal *
                </label>
                <input
                  type="url"
                  required
                  value={mysteryBoxSetting.imageUrl}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Precio de la Caja ($ COP)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="90000"
                  value={mysteryBoxSetting.price === 0 || !mysteryBoxSetting.price ? '' : mysteryBoxSetting.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setMysteryBoxSetting({ ...mysteryBoxSetting, price: 0 });
                    } else {
                      const parsed = parseFloat(val);
                      setMysteryBoxSetting({ ...mysteryBoxSetting, price: isNaN(parsed) ? 0 : parsed });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Valor Estimado (Etiqueta Verde)
                </label>
                <input
                  type="text"
                  placeholder="Ej. +$160.000"
                  value={mysteryBoxSetting.estimatedValue || ''}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, estimatedValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Subtexto al Revelar Contenido
                </label>
                <input
                  type="text"
                  placeholder="Ej. 2-3 Prendas Premium Sorpresa"
                  value={mysteryBoxSetting.revealedSubtext || ''}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, revealedSubtext: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                />
              </div>
            </div>

            {/* Perks 1, 2, 3 */}
            <div className="space-y-3 bg-gray-50 p-4 border border-gray-200">
              <span className="text-xs font-black uppercase tracking-widest text-black block mb-2">
                Beneficios / Puntos Clave de la Caja
              </span>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Beneficio 1</label>
                <input
                  type="text"
                  placeholder="Ej. Contiene de 2 a 3 prendas premium."
                  value={mysteryBoxSetting.perk1 || ''}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, perk1: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Beneficio 2</label>
                <input
                  type="text"
                  placeholder="Ej. Empaque de regalo oficial de edición limitada."
                  value={mysteryBoxSetting.perk2 || ''}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, perk2: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Beneficio 3</label>
                <input
                  type="text"
                  placeholder="Ej. Garantía de prendas auténticas 100% de la marca."
                  value={mysteryBoxSetting.perk3 || ''}
                  onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, perk3: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs bg-white"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Tallas Disponibles (Separadas por comas)
              </label>
              <input
                type="text"
                placeholder="S,M,L,XL,XXL"
                value={mysteryBoxSetting.sizes || ''}
                onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, sizes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm font-bold uppercase tracking-wider"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Los clientes elegirán una de estas tallas al agregar la caja a su carrito.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Descripción Informativa
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe qué contiene la caja, beneficios y detalles de la colección..."
                value={mysteryBoxSetting.description}
                onChange={(e) => setMysteryBoxSetting({ ...mysteryBoxSetting, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              />
            </div>

            {/* Live Preview Box */}
            <div className="bg-black text-white p-6 border border-gray-800 space-y-4">
              <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest block">VISTA PREVIA DE LA SECCIÓN PÚBLICA (AL ABRIR CAJA)</span>
              <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">{mysteryBoxSetting.title || 'Caja Misteriosa'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{mysteryBoxSetting.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-xl font-black text-white block">{formatPrice(mysteryBoxSetting.price || 0)}</span>
                  {mysteryBoxSetting.estimatedValue && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 inline-block mt-1">
                      VALOR ESTIMADO {mysteryBoxSetting.estimatedValue}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-300">
                {mysteryBoxSetting.perk1 && <p>✓ {mysteryBoxSetting.perk1}</p>}
                {mysteryBoxSetting.perk2 && <p>✓ {mysteryBoxSetting.perk2}</p>}
                {mysteryBoxSetting.perk3 && <p>✓ {mysteryBoxSetting.perk3}</p>}
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-900">
                <span>Tallas: {mysteryBoxSetting.sizes || 'S,M,L,XL,XXL'}</span>
                <span>Estado: {mysteryBoxSetting.active ? '🟢 Visible en Menú' : '🔴 Oculto en Menú'}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-red-600 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" /> Guardar Configuración de Caja
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
