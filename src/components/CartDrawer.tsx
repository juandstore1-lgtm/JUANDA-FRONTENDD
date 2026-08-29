import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, MessageSquare, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, getDiscountedPrice } from '../utils/format';

export default function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, isCartOpen, setIsCartOpen, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const itemsText = cartItems
      .map(
        (item) =>
          `• ${item.product.name} (Talla: ${item.size}, Color: ${item.color}) x${item.quantity} - ${formatPrice(
            getDiscountedPrice(item.product.price, item.product.discountPercentage) * item.quantity
          )}\nLink: ${window.location.origin}/product/${item.product.id}`
      )
      .join('\n');
    const message = `Hola JDQSTORE, me gustaría realizar el siguiente pedido:\n\n${itemsText}\n\n*Total a pagar: ${formatPrice(totalPrice)}*`;
    window.open(`https://wa.me/573012690047?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white text-black z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-black uppercase tracking-widest text-black">Carrito de Compras</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-200 transition-colors text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                  <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">El carrito está vacío</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 items-start pb-6 border-b border-gray-100">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.name}
                      className="w-20 aspect-[3/4] object-cover bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm uppercase tracking-wider truncate text-black">{item.product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                        Talla: {item.size} | Color: {item.color}
                      </p>

                      <div className="flex justify-between items-center mt-3">
                        {/* Interactive Quantity Control (- / +) */}
                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-none overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, -1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors border-r border-gray-200"
                            title="Disminuir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors border-l border-gray-200"
                            title="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-black text-black">
                          {formatPrice(getDiscountedPrice(item.product.price, item.product.discountPercentage) * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold uppercase tracking-widest text-gray-500">Subtotal</span>
                  <span className="text-lg font-black text-black">{formatPrice(totalPrice)}</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white hover:bg-red-600 transition-colors py-4 flex items-center justify-center font-bold uppercase tracking-widest text-xs gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Comprar por WhatsApp
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors py-2"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
