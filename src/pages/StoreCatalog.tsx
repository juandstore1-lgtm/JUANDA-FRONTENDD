import { useState, useEffect, useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ProductService, StoreService, CategoryService, HomeService } from "../services/api";
import { Store, Product, Category } from "../types";
import AnimatedSection from "../components/AnimatedSection";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, X, RefreshCw, Grid, List, Search, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function StoreCatalog() {
  const { storeId } = useParams();
  
  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | undefined>(storeId);
  const [isRouletteActive, setIsRouletteActive] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSize, sortBy]);

  useEffect(() => {
    if (!activeStoreId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [stores, rouletteConf] = await Promise.all([
          StoreService.getStores(),
          HomeService.getRouletteConfig()
        ]);
        setAllStores(stores);
        
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const currentDay = days[new Date().getDay()];
        if (rouletteConf && rouletteConf.activeDays && rouletteConf.activeDays.includes(currentDay)) {
          setIsRouletteActive(true);
        } else {
          setIsRouletteActive(false);
        }

        const foundStore = stores.find(s => s.id === activeStoreId || String(s.id) === activeStoreId);
        if (foundStore) {
            setStore(foundStore);
            const [prods, cats] = await Promise.all([
              ProductService.getProducts(String(foundStore.id)),
              CategoryService.getCategories(String(foundStore.id))
            ]);
            setProducts(prods);
            setCategories(cats);
        } else {
            setStore(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeStoreId]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      if (selectedCategory === 'Descuentos') {
        result = result.filter(p => p.discountPercentage && p.discountPercentage > 0);
      } else {
        result = result.filter(p => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().startsWith(query))
      );
    }
    if (selectedSize) {
      result = result.filter(p => p.sizes && p.sizes.includes(selectedSize));
    }

    if (maxPrice < 500000) {
      result = result.filter(p => {
        const finalPrice = p.discountPercentage ? p.price * (1 - p.discountPercentage / 100) : p.price;
        return finalPrice <= maxPrice;
      });
    }

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => {
          const priceA = a.discountPercentage ? a.price * (1 - a.discountPercentage / 100) : a.price;
          const priceB = b.discountPercentage ? b.price * (1 - b.discountPercentage / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const priceA = a.discountPercentage ? a.price * (1 - a.discountPercentage / 100) : a.price;
          const priceB = b.discountPercentage ? b.price * (1 - b.discountPercentage / 100) : b.price;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, selectedSize, sortBy, maxPrice, searchQuery]);

  const currentSizes = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'Descuentos') {
      return ["M", "L", "XL", "XXL", "XXXL", "30", "32", "34", "36", "38", "40", "41", "42", "43", "44", "45"];
    }

    const cat = selectedCategory.toLowerCase();

    if (cat.includes("jean") || cat.includes("mocho")) {
      return ["30", "32", "34", "36", "38", "40"];
    }

    if (cat.includes("zapatilla") || cat.includes("chancla")) {
      return ["40", "41", "42", "43", "44", "45"];
    }

    const noSizeCats = ["billetera", "canguro", "carriel", "correa", "gafa", "gorra", "locion", "lpocion", "maletin", "reloj"];
    if (noSizeCats.some(noSizeCat => cat.includes(noSizeCat))) {
      return [];
    }

    return ["M", "L", "XL", "XXL", "XXXL"];
  }, [selectedCategory]);

  if (loading) {
    return <div className="pt-32 text-center">Cargando catálogo...</div>;
  }

  if (!store && !loading) {
    return <Navigate to="/catalogs" />;
  }

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="pt-24 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
      <AnimatedSection>
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="text-sm text-white/40 mb-4 font-medium tracking-wide">Inicio <span className="mx-2">/</span> Productos</div>
            <div className="flex items-baseline gap-4">
               <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-3">PRODUCTOS</h1>
            </div>
          </div>
          
          <div className="bg-[#111111] border border-white/5 p-4 flex items-center gap-4 rounded-xl max-w-sm w-full md:w-auto shadow-xl">
            <div className="w-10 h-10 border border-white/10 flex items-center justify-center shrink-0 rounded-lg">
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-white tracking-widest uppercase">ENVÍOS A TODO COLOMBIA</h4>
              <p className="text-xs text-white/50">Rápido, seguro y confiable.</p>
            </div>
          </div>
        </div>

        {/* Search Bar & Popular Searches */}
        <div className="mb-10 relative z-50">
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
            <input 
              type="text" 
              placeholder="¿Qué estás buscando?      Ej: jean, camiseta, gorras..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-full text-white placeholder-white/40 pl-16 pr-32 py-5 focus:outline-none focus:border-white/50 transition-colors text-lg"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-white hover:text-white/70 transition-colors">
              BUSCAR
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </button>
            
            {/* Auto-preview Dropdown */}
            <AnimatePresence>
              {searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-sm shadow-2xl overflow-hidden z-50"
                >
                  {(() => {
                    const matchedCats = categories.filter(c => c.name.toLowerCase().startsWith(searchQuery.toLowerCase().trim()));
                    if (matchedCats.length > 0) {
                      return (
                        <div>
                          {matchedCats.map(cat => (
                            <button 
                              key={cat.id} 
                              onClick={() => {
                                setSelectedCategory(cat.name);
                                setSearchQuery("");
                              }}
                              className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                            >
                              <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-sm shrink-0 overflow-hidden">
                                {cat.image ? (
                                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Search className="w-5 h-5 text-white/50" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white uppercase tracking-wider">{cat.name}</div>
                                <div className="text-xs text-white/50 uppercase">Categoría</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div className="p-4 text-sm text-white/50 text-center uppercase tracking-widest font-bold">
                        No se encontraron categorías
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AnimatedSection>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-6 w-full">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <span className="text-sm text-white/40">{filteredProducts.length} Productos</span>
        </div>

        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-[260px] flex-shrink-0 order-1">
          <div className="sticky top-24 space-y-10">
            
            {/* Header sidebar */}
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-black uppercase tracking-widest text-sm text-white">FILTRAR POR</h2>
              <button 
                onClick={() => { setSelectedCategory(null); setSelectedSize(null); setSortBy(null); setMaxPrice(500000); setSearchQuery(""); }}
                className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                Limpiar <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Sede Filter */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white">SEDE</h3>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <select 
                  className="w-full bg-[#111] border border-white/10 text-white text-[13px] pl-10 pr-4 py-3 appearance-none focus:outline-none focus:border-white/30 transition-colors cursor-pointer rounded-sm"
                  value={activeStoreId || ""}
                  onChange={(e) => setActiveStoreId(e.target.value)}
                >
                  <option value="" disabled className="bg-[#111] text-white">Selecciona tu sede</option>
                  {allStores.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#111] text-white">{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white">ORDENAR POR</h3>
              <div className="space-y-4">
                <div className="relative">
                  <select 
                    className="w-full bg-[#111] border border-white/10 text-white text-sm px-4 py-3 appearance-none focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                    value={sortBy === null ? "newest" : sortBy}
                    onChange={(e) => setSortBy(e.target.value === "newest" ? null : e.target.value as any)}
                  >
                    <option value="newest" className="bg-[#111] text-white">Más recientes</option>
                    <option value="price_asc" className="bg-[#111] text-white">Precio: Menor a Mayor</option>
                    <option value="price_desc" className="bg-[#111] text-white">Precio: Mayor a Menor</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer group mt-4">
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${sortBy === "price_asc" ? "bg-white border-white" : "border-white/20 group-hover:border-white/50"}`}>
                    {sortBy === "price_asc" && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={sortBy === "price_asc"} onChange={() => setSortBy(sortBy === "price_asc" ? null : "price_asc")} />
                  <span className={`text-sm transition-colors ${sortBy === "price_asc" ? "text-white" : "text-white/50 group-hover:text-white"}`}>Precio: Menor a Mayor</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${sortBy === "price_desc" ? "bg-white border-white" : "border-white/20 group-hover:border-white/50"}`}>
                    {sortBy === "price_desc" && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={sortBy === "price_desc"} onChange={() => setSortBy(sortBy === "price_desc" ? null : "price_desc")} />
                  <span className={`text-sm transition-colors ${sortBy === "price_desc" ? "text-white" : "text-white/50 group-hover:text-white"}`}>Precio: Mayor a Menor</span>
                </label>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white">CATEGORÍA</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full block text-left text-[13px] transition-colors py-2.5 px-3 rounded-sm ${!selectedCategory ? 'bg-[#1a1a1a] text-white' : 'text-white/50 hover:text-white hover:bg-[#111]'}`}
                >
                  Todas las categorías
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full block text-left text-[13px] capitalize transition-colors py-2.5 px-3 rounded-sm ${selectedCategory === cat.name ? 'bg-[#1a1a1a] text-white' : 'text-white/50 hover:text-white hover:bg-[#111]'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {currentSizes.length > 0 && (
              <div>
                <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white">TALLA</h3>
                <div className="flex flex-wrap gap-2">
                  {currentSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`w-9 h-9 border flex items-center justify-center text-xs font-bold transition-all ${
                        selectedSize === size 
                          ? 'bg-white text-black border-white' 
                          : 'bg-[#111] text-white/70 border-white/10 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-xs mb-4 text-white">PRECIO MÁXIMO</h3>
              <div className="pt-2">
                <input 
                  type="range" 
                  min="0" 
                  max="150000" 
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'white' }}
                />
                <div className="flex justify-between items-center text-xs text-white/50 mt-4">
                  <span>$0</span>
                  <span>{maxPrice >= 150000 ? '$150.000+' : `$${maxPrice.toLocaleString('es-CO')}`}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar Filters - Mobile */}
        <aside className={`
          fixed inset-0 z-50 bg-white dark:bg-[#0a0a0a] p-6 md:p-12 transform transition-transform duration-300 lg:hidden overflow-y-auto
          ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl font-black uppercase tracking-tighter">Filtros</h2>
            <button onClick={() => setIsFilterOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-12">
            {/* Sort */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Ordenar Por</h3>
              <div className="space-y-3">
                {[
                  { value: "price_asc", label: "Precio: Menor a Mayor" },
                  { value: "price_desc", label: "Precio: Mayor a Menor" },
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-black dark:border-white flex items-center justify-center">
                      {sortBy === option.value && <div className="w-2 h-2 bg-black dark:bg-white" />}
                    </div>
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={sortBy === option.value}
                      onChange={() => setSortBy(option.value as any)}
                    />
                    <span className="text-sm text-black/60 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Categoría</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`block text-left text-sm uppercase transition-colors ${!selectedCategory ? 'text-black dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setSelectedCategory('Descuentos')}
                  className={`block text-left text-sm uppercase transition-colors ${selectedCategory === 'Descuentos' ? 'text-red-600 font-bold' : 'text-red-500 hover:text-red-600'}`}
                >
                  % Descuentos
                </button>
                {categories.length === 0 && <span className="text-xs text-black/50 dark:text-white/50">Sin categorías</span>}
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`block text-left text-sm uppercase transition-colors ${selectedCategory === cat.name ? 'text-black dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {currentSizes.length > 0 && (
              <div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {currentSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`w-10 h-10 border flex items-center justify-center text-sm font-medium transition-colors ${
                        selectedSize === size 
                          ? 'bg-red-600 text-white border-red-600' 
                          : 'bg-white dark:bg-transparent text-black dark:text-white border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Precio Máximo</h3>
              <div className="pt-2">
                <input 
                  type="range" 
                  min="0" 
                  max="150000" 
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-white/50 mt-4">
                  <span>$0</span>
                  <span>{maxPrice >= 150000 ? '$150.000+' : `$${maxPrice.toLocaleString('es-CO')}`}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="w-full lg:w-[calc(100%-260px-3rem)] order-2 lg:order-2 flex-1">
          {/* Banners Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
             <div className="relative bg-[#111] rounded-xl border border-white/10 p-6 flex flex-col justify-center overflow-hidden min-h-[140px] group cursor-pointer hover:border-white/30 transition-colors">
                <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-white">🔥 MÁS VENDIDOS</h3>
                  <p className="text-white/50 text-xs mb-4">Los favoritos de la semana</p>
                  <button className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors w-fit">VER AHORA</button>
                </div>
                <div className="absolute right-[-20%] bottom-[-20%] w-48 opacity-40 group-hover:opacity-60 transition-opacity grayscale">
                  <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" alt="Más Vendidos" className="w-full h-full object-cover" />
                </div>
             </div>

             <Link to="/caja-misteriosa" className="relative bg-[#111] rounded-xl border border-white/10 p-6 flex flex-col justify-center overflow-hidden min-h-[140px] group cursor-pointer hover:border-white/30 transition-colors">
                <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-white">🎁 CAJA MISTERIOSA</h3>
                  <p className="text-white/50 text-xs mb-4">¡Podés ganar premios!</p>
                  <button className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors w-fit">PARTICIPAR</button>
                </div>
                <div className="absolute right-[-10%] bottom-[-10%] w-32 opacity-40 group-hover:opacity-60 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <svg className="w-full h-full text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
             </Link>

             {isRouletteActive && (
               <div className="relative bg-[#111] rounded-xl border border-white/10 p-6 flex flex-col justify-center overflow-hidden min-h-[140px] group cursor-pointer hover:border-white/30 transition-colors">
                  <div className="relative z-10">
                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-white">🎰 GIRA LA RULETA</h3>
                    <p className="text-white/50 text-xs mb-4">Descuentos exclusivos</p>
                    <button className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors w-fit">GIRAR AHORA</button>
                  </div>
                  <div className="absolute right-[-25%] top-[-25%] w-48 opacity-30 group-hover:opacity-50 transition-transform duration-1000 group-hover:rotate-180">
                    <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="50" cy="50" r="45"/><path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18"/></svg>
                  </div>
               </div>
             )}
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-white">⚡ PRODUCTOS DESTACADOS</h2>
            <button className="text-xs text-white/50 hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center gap-2">VER TODOS <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></button>
          </div>

          <div className="flex-1">
            {/* Grid Toolbar */}
            <div className="flex items-center justify-between bg-[#111] border border-white/5 p-3 rounded-sm mb-6">
            <span className="text-sm text-white/50">
              Mostrando <strong className="text-white font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</strong> de {filteredProducts.length} productos
            </span>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <select 
                  className="bg-transparent text-sm text-white/70 appearance-none pr-6 cursor-pointer focus:outline-none"
                  value={activeStoreId || ""}
                  onChange={(e) => setActiveStoreId(e.target.value || null)}
                >
                  <option value="" className="bg-[#111] text-white">Todas las sedes</option>
                  {allStores.map(store => (
                    <option key={store.id} value={store.id} className="bg-[#111] text-white">{store.name}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-3 text-white/40">
                <span className="text-xs uppercase tracking-widest">Ver:</span>
                <button className="text-white hover:text-white transition-colors"><Grid className="w-4 h-4" /></button>
                <button className="hover:text-white transition-colors"><List className="w-4 h-4" /></button>
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="relative">
                <select className="bg-transparent text-sm text-white/70 appearance-none pr-6 cursor-pointer focus:outline-none">
                  <option className="bg-[#111] text-white">12 por página</option>
                  <option className="bg-[#111] text-white">24 por página</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex justify-end mb-8">
            <span className="text-sm text-white/40">{filteredProducts.length} Productos</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-white/40 text-lg">No se encontraron productos.</p>
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSize(null);
                  setSortBy(null);
                  setMaxPrice(500000);
                  setSearchQuery("");
                }}
                className="mt-6 text-sm font-bold uppercase tracking-widest border-b border-white pb-1"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-16">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 border flex items-center justify-center text-sm font-medium transition-colors ${
                      currentPage === pageNum 
                        ? 'bg-white text-black border-white' 
                        : 'bg-[#111] text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="w-10 h-10 border bg-[#111] text-white/50 border-white/10 flex items-center justify-center hover:border-white/30 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
