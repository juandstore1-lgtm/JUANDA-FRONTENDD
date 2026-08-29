import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ProductService, StoreService } from "../services/api";
import { Product } from "../types";
import AnimatedSection from "../components/AnimatedSection";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Shield, ThumbsUp, Medal, ChevronDown, ChevronUp, MoveLeft, MoveRight, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import Swal from 'sweetalert2';
import { formatPrice } from "../utils/format";

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const { addToCart } = useCart();
  
  const [expandedSection, setExpandedSection] = useState<string | null>('descripcion');
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [quickAddSize, setQuickAddSize] = useState<string | null>(null);
  const [quickAddColor, setQuickAddColor] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setSelectedSize(null);
    setSelectedColor(null);

    if (!productId) return;

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const allProducts = await ProductService.getProducts();
        const found = allProducts.find(p => String(p.id) === productId);
        
        if (found) {
          setProduct(found);
          const otherProducts = allProducts.filter(p => {
            if (String(p.id) === productId) return false;
            if (p.category === found.category) return false;
            
            // Si el producto actual tiene sedes, los recomendados deben compartir al menos una sede
            if (found.storeIds && found.storeIds.length > 0) {
              const pStoreIds = p.storeIds || [];
              const sharesStore = found.storeIds.some(sid => pStoreIds.includes(String(sid)));
              if (!sharesStore) return false;
            }
            return true;
          });
          
          const uniqueCategories = new Set<string>();
          const related: Product[] = [];
          
          for (const p of otherProducts) {
            const cat = p.category?.toLowerCase() || 'general';
            if (!uniqueCategories.has(cat)) {
              uniqueCategories.add(cat);
              related.push(p);
              if (related.length >= 4) break;
            }
          }
          
          // Si no hay 4 categorías distintas, rellenamos con otros productos de la misma sede al azar
          if (related.length < 4) {
            const remaining = allProducts.filter(p => {
              if (String(p.id) === productId) return false;
              if (related.find(r => r.id === p.id)) return false;
              if (found.storeIds && found.storeIds.length > 0) {
                const pStoreIds = p.storeIds || [];
                return found.storeIds.some(sid => pStoreIds.includes(String(sid)));
              }
              return true;
            });
            for (const p of remaining) {
              related.push(p);
              if (related.length >= 4) break;
            }
          }
          
          setRelatedProducts(related);

          if (found.storeIds && found.storeIds.length > 0) {
            const allStores = await StoreService.getStores();
            const matched = allStores
              .filter(s => found.storeIds?.includes(String(s.id)))
              .map(s => s.name);
            setStoreNames(matched);
          } else {
            setStoreNames([]);
          }
        } else {
          setProduct(null);
          setStoreNames([]);
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  if (loading) {
    return <div className="pt-32 text-center text-white/40">Cargando producto...</div>;
  }

  if (!product) {
    return <Navigate to="/catalogs" />;
  }

  const handleWhatsApp = () => {
    if ((colors.length > 0 && !selectedColor) || (sizes.length > 0 && !selectedSize)) {
      Swal.fire({
        icon: 'warning',
        title: 'Opciones incompletas',
        text: 'Por favor selecciona una talla y un color antes de continuar.',
        confirmButtonColor: '#000000'
      });
      return;
    }
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const formattedPrice = formatPrice(product.price);
    const message = `Hola, estoy interesado en el producto *${product.name}* (Talla: ${selectedSize || 'Única'}, Color: ${selectedColor || 'Único'}).\n\n*Total:* ${formattedPrice}\n*Link:* ${productUrl}`;
    window.open(`https://wa.me/573012690047?text=${encodeURIComponent(message)}`, "_blank");
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  let colors = product.colors || [];
  let sizes = product.sizes || [];

  const colorMap: Record<string, string> = {
    'negro': '#111111',
    'blanco': '#FFFFFF',
    'gris': '#808080',
    'rojo': '#FF0000',
    'azul': '#0000FF',
    'verde': '#008000',
    'amarillo': '#FFFF00',
    'cafe': '#6F4E37',
    'beige': '#F5F5DC',
    'rosado': '#FFC0CB',
  };

  const getColorHex = (name: string) => {
    return colorMap[name.toLowerCase()] || '#cccccc';
  };

  return (
    <div className="pt-24 pb-24 w-full bg-[#0a0a0a] min-h-screen text-white font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-12 mb-20">
        
        {/* Left Side: Images */}
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-4 h-[600px] md:h-[800px]">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-24 flex-shrink-0">
            {images.slice(0, 4).map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 md:w-full aspect-square md:aspect-[3/4] flex-shrink-0 transition-all duration-300 rounded-md overflow-hidden bg-[#111] border ${selectedImage === idx ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">+{images.length - 4}</span>
                    <span className="text-[10px] text-white">Ver más</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Main Viewer */}
          <div className="flex-1 bg-[#111] rounded-xl relative overflow-hidden h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-contain md:object-cover"
              />
            </AnimatePresence>

          </div>
        </div>

        {/* Right Side: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col pt-4">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{product.name}</h1>
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded tracking-widest uppercase flex-shrink-0">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-3 mb-4">
              {product.discountPercentage && product.discountPercentage > 0 ? (
                <>
                  <p className="text-2xl font-black text-red-500">
                    {formatPrice(product.price * (1 - product.discountPercentage / 100))}
                  </p>
                  <p className="text-lg text-white/40 line-through decoration-white/40">
                    {formatPrice(product.price)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-black text-red-500">{formatPrice(product.price)}</p>
              )}
            </div>
            
            <p className="text-[#39ff14] text-xs font-bold tracking-widest flex items-center gap-2 mb-8">
               <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
               ¡ÚLTIMAS UNIDADES!
            </p>

            <div className="w-full h-px bg-white/10 mb-8"></div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-white/60 font-bold uppercase tracking-widest">COLOR:</span>
                  <span className="text-white">{selectedColor || "Elige un color"}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
                        selectedColor === color 
                          ? 'border-white bg-white/10 text-white' 
                          : 'border-white/20 hover:border-white/50 text-white/70'
                      }`}
                    >
                      <span 
                        className="w-4 h-4 rounded-full border border-white/20" 
                        style={{ backgroundColor: getColorHex(color) }}
                      ></span>
                      <span className="text-sm font-medium">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-white/60 font-bold uppercase tracking-widest">TALLA:</span>
                  <span className="text-white">{selectedSize || "Elige tu talla"}</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.5rem] h-10 border rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                        selectedSize === size 
                          ? 'border-white bg-white/10 text-white' 
                          : 'border-white/20 hover:border-white/50 text-white/70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => Swal.fire({
                    title: 'Guía de Tallas',
                    html: '<div class="text-left text-sm text-gray-600"><p><b>S:</b> Pecho 86-91cm / Cintura 71-76cm</p><p><b>M:</b> Pecho 96-101cm / Cintura 81-86cm</p><p><b>L:</b> Pecho 106-111cm / Cintura 91-96cm</p><p><b>XL:</b> Pecho 116-121cm / Cintura 101-106cm</p><br/><p><i>Nota: Las medidas pueden variar ligeramente según el fabricante.</i></p></div>',
                    confirmButtonColor: '#000000',
                    confirmButtonText: 'Cerrar'
                  })}
                  className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-2 underline underline-offset-4"
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                   ¿No sabes cuál es tu talla? Ver guía de tallas
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={() => {
                  if (colors.length > 0 && !selectedColor) {
                    Swal.fire({ icon: 'warning', title: 'Falta Color', text: 'Por favor selecciona un color para tu prenda.', confirmButtonColor: '#000000' });
                    return;
                  }
                  if (sizes.length > 0 && !selectedSize) {
                    Swal.fire({ icon: 'warning', title: 'Falta Talla', text: 'Por favor selecciona una talla para tu prenda.', confirmButtonColor: '#000000' });
                    return;
                  }
                  addToCart(product, selectedSize || 'Única', selectedColor || 'Único');
                }}
                className="flex-1 bg-black text-white hover:bg-[#111] border border-white/20 rounded-md flex items-center justify-center py-4 px-6 text-sm font-bold uppercase tracking-widest transition-colors"
              >
                AGREGAR AL CARRITO
              </button>
              <button 
                onClick={handleWhatsApp}
                className="flex-[1.5] bg-[#25D366] hover:bg-[#1DA851] text-white rounded-md flex items-center justify-center py-4 px-6 transition-colors shadow-[0_0_20px_rgba(37,211,102,0.3)]"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold uppercase tracking-widest">COMPRAR POR WHATSAPP</span>
                    <span className="text-[10px] font-medium opacity-90">Te asesoramos al instante</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-4 border border-white/10 rounded-lg mb-8 bg-[#111]">
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                  <Shield className="w-5 h-5 text-white/70" />
                  <div>
                     <p className="text-[10px] font-bold text-white">COMPRA 100% SEGURA</p>
                     <p className="text-[9px] text-white/50">Tus datos protegidos</p>
                  </div>
               </div>
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                  <ThumbsUp className="w-5 h-5 text-white/70" />
                  <div>
                     <p className="text-[10px] font-bold text-white">+500 CLIENTES FELICES</p>
                     <p className="text-[9px] text-white/50">Calificación 4.9/5</p>
                  </div>
               </div>
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                  <Medal className="w-5 h-5 text-white/70" />
                  <div>
                     <p className="text-[10px] font-bold text-white">CALIDAD PREMIUM</p>
                     <p className="text-[9px] text-white/50">Materiales seleccionados</p>
                  </div>
               </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-white/10">
               {[
                 { id: 'descripcion', title: 'DESCRIPCIÓN', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>, content: product.description || 'Sin descripción detallada.' },
                 { id: 'envios', title: 'ENVÍOS Y DEVOLUCIONES', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>, content: 'Envíos a todo el país. Tiempos de entrega entre 2 a 5 días hábiles. Tienes hasta 7 días para realizar devoluciones por defectos de fábrica.' },
                 { id: 'cuidados', title: 'CUIDADOS', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>, content: 'Lavar a máquina en ciclo suave. No usar blanqueador. Secar a la sombra. No planchar sobre el estampado.' }
               ].map(acc => (
                 <div key={acc.id} className="border-b border-white/10">
                   <button 
                     onClick={() => setExpandedSection(expandedSection === acc.id ? null : acc.id)}
                     className="w-full flex items-center justify-between py-4 focus:outline-none"
                   >
                     <div className="flex items-center gap-3 text-sm font-bold text-white/90">
                       <span className="text-white/50">{acc.icon}</span>
                       {acc.title}
                     </div>
                     {expandedSection === acc.id ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                   </button>
                   <AnimatePresence>
                     {expandedSection === acc.id && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         <p className="pb-4 text-sm text-white/50 leading-relaxed pl-7">
                           {acc.content}
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               ))}
            </div>

            {/* Related Products inline */}
            {relatedProducts.length > 0 && (
              <div className="mt-12 w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black uppercase tracking-widest text-white">COMBÍNALO CON</h2>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><MoveLeft className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"><MoveRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {relatedProducts.slice(0, 4).map((p, idx) => (
                    <AnimatedSection key={p.id} delay={idx * 0.1}>
                      <Link to={`/product/${p.id}`} className="flex flex-col group bg-[#111] rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-colors pb-3">
                        <div className="relative aspect-square w-full bg-[#1a1a1a] overflow-hidden">
                          <img 
                            src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              const hasSizes = p.sizes && p.sizes.length > 0;
                              const hasColors = p.colors && p.colors.length > 0;
                              
                              if (hasSizes || hasColors) {
                                setQuickAddProduct(p);
                                setQuickAddSize(hasSizes && p.sizes.length === 1 ? p.sizes[0] : null);
                                setQuickAddColor(hasColors && p.colors.length === 1 ? p.colors[0] : null);
                              } else {
                                addToCart(p, 'Única', 'Único');
                                Swal.fire({
                                  icon: 'success',
                                  title: '¡Agregado!',
                                  text: 'Producto agregado al carrito',
                                  confirmButtonColor: '#000000',
                                  timer: 1500,
                                  showConfirmButton: false
                                });
                              }
                            }}
                            className="absolute bottom-2 right-2 w-7 h-7 bg-black/80 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors z-10"
                            title="Agregar al carrito"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-col pt-3 px-3">
                          <h4 className="text-[11px] md:text-xs font-bold text-white mb-1 truncate group-hover:text-white/80 transition-colors">{p.name}</h4>
                          <div className="flex items-baseline gap-2">
                            {p.discountPercentage ? (
                              <span className="text-xs md:text-sm font-black text-white">{formatPrice(p.price * (1 - p.discountPercentage / 100))}</span>
                            ) : (
                              <span className="text-xs md:text-sm font-black text-white">{formatPrice(p.price)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>

      {/* Trust Banner Below */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 mb-20">
         <div className="border border-white/10 rounded-xl p-8 bg-[#111] grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center gap-4 text-center md:text-left">
               <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
               </div>
               <div>
                  <h4 className="font-bold text-sm tracking-wider">ENVÍOS 24/48H</h4>
                  <p className="text-xs text-white/50">A todo Colombia</p>
               </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-center md:text-left">
               <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-bold text-sm tracking-wider">PAGO CONTRA ENTREGA</h4>
                  <p className="text-xs text-white/50">Paga al recibir tu pedido</p>
               </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-center md:text-left">
               <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h4l2-2 4 4 4-4 4 4 2-2h2"></path></svg>
               </div>
               <div>
                  <h4 className="font-bold text-sm tracking-wider">CAMBIOS FÁCILES</h4>
                  <p className="text-xs text-white/50">Tienes hasta 7 días</p>
               </div>
            </div>
         </div>
      </div>
      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setQuickAddProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#111] border border-white/20 p-6 rounded-2xl shadow-2xl z-10"
            >
              <button 
                onClick={() => setQuickAddProduct(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="flex gap-4 items-center mb-6">
                <img 
                  src={quickAddProduct.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                  alt={quickAddProduct.name} 
                  className="w-16 h-16 object-cover rounded bg-white/5"
                />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white line-clamp-2">{quickAddProduct.name}</h3>
                  <p className="text-white/50 text-xs mt-1 font-bold">{formatPrice(quickAddProduct.price)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {quickAddProduct.sizes && quickAddProduct.sizes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Talla</label>
                    <div className="flex flex-wrap gap-2">
                      {quickAddProduct.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setQuickAddSize(size)}
                          className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${quickAddSize === size ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white/50'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {quickAddProduct.colors && quickAddProduct.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {quickAddProduct.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setQuickAddColor(color)}
                          className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${quickAddColor === color ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white/50'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (quickAddProduct.sizes?.length && !quickAddSize) {
                    Swal.fire({ icon: 'warning', title: 'Falta Talla', text: 'Por favor selecciona una talla', confirmButtonColor: '#000000' });
                    return;
                  }
                  if (quickAddProduct.colors?.length && !quickAddColor) {
                    Swal.fire({ icon: 'warning', title: 'Falta Color', text: 'Por favor selecciona un color', confirmButtonColor: '#000000' });
                    return;
                  }
                  addToCart(quickAddProduct, quickAddSize || 'Única', quickAddColor || 'Único');
                  setQuickAddProduct(null);
                  Swal.fire({
                    icon: 'success',
                    title: '¡Agregado!',
                    text: 'Producto agregado al carrito',
                    confirmButtonColor: '#000000',
                    timer: 1500,
                    showConfirmButton: false
                  });
                }}
                className="w-full mt-6 py-3 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
              >
                AGREGAR AL CARRITO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
