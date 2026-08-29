import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { StoreService } from "../services/api";
import { formatPrice } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [storeNames, setStoreNames] = useState<string[]>([]);

  useEffect(() => {
    if (product.storeIds && product.storeIds.length > 0) {
      StoreService.getStores()
        .then((allStores) => {
          const matched = allStores
            .filter((s) => product.storeIds?.includes(String(s.id)))
            .map((s) => s.name);
          setStoreNames(matched);
        })
        .catch((err) => console.error("Error resolving stores for product card:", err));
    }
  }, [product.storeIds]);

  const mainImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const finalPrice = hasDiscount 
    ? product.price * (1 - (product.discountPercentage! / 100))
    : product.price;

  let sizesText = "Talla: Única";
  if (product.category) {
    const cat = product.category.toLowerCase();
    const noSizeCats = ["billetera", "canguro", "carriel", "correa", "gafa", "gorra", "locion", "lpocion", "maletin", "reloj"];
    if (noSizeCats.some(noSizeCat => cat.includes(noSizeCat))) {
      sizesText = "Talla: Única";
    } else if (cat.includes("jean") || cat.includes("mocho")) {
      sizesText = "Tallas: 30, 32, 34, 36, 38, 40";
    } else if (cat.includes("zapatilla") || cat.includes("chancla")) {
      sizesText = "Tallas: 40, 41, 42, 43, 44, 45";
    } else {
      sizesText = "Tallas: M, L, XL";
    }
  }

  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col bg-[#111111] rounded-xl overflow-hidden hover:bg-[#1a1a1a] transition-all duration-300 border border-white/5">
      <div className="relative aspect-square overflow-hidden bg-gray-900">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Badges (Top-Left) */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.tags && product.tags.includes('Nuevo') && (
            <div className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm w-fit">
              NEW
            </div>
          )}
          {hasDiscount && (
            <div className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm w-fit">
              -{product.discountPercentage}%
            </div>
          )}
        </div>

        {/* Heart Icon (Top-Right) */}
        <button 
          className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors p-2"
          onClick={(e) => {
            e.preventDefault(); // Prevent navigating to product detail
            // Logic for wishlist could go here
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>

        {/* Sede Badges (Bottom-Left) */}
        {storeNames.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 z-10">
            {storeNames.map((name) => (
              <span
                key={name}
                className="bg-black/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm border border-white/10"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">{product.category || "General"}</span>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2 mb-3">
          <p className="text-[15px] text-white font-bold">
            {formatPrice(finalPrice)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-white/30 line-through">{formatPrice(product.price)}</p>
          )}
          {!hasDiscount && product.oldPrice && (
            <p className="text-xs text-white/30 line-through">{formatPrice(product.oldPrice)}</p>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between">
           <span className="text-[10px] sm:text-[11px] text-white/40">
             {sizesText}
           </span>
           <button className="text-white/40 hover:text-white border border-white/10 hover:border-white/40 p-2 rounded transition-colors flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
             </svg>
           </button>
        </div>
      </div>
    </Link>
  );
}
