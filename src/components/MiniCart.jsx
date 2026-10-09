import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { formatPrice } from '../utils/priceFormatter';

const MiniCart = ({ isOpen, onClose }) => {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal());

  const handleRemove = (item) => {
    removeItem(item.id, item.selectedSize, item.selectedColor);
  };

  const handleQuantityChange = (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity, item.selectedSize, item.selectedColor);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => {
                      const price = item.is_on_sale ? item.price : item.original_price || item.price;
                      return (
                        <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex space-x-4">
                          <img
                            src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=200'}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded bg-gray-200"
                            loading="lazy"
                            onError={(e) => {
                              if (e.target.src !== 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=200') {
                                e.target.src = 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=200';
                              }
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{item.title}</h3>
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-xs text-gray-500">
                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                {item.selectedSize && item.selectedColor && ', '}
                                {item.selectedColor && `Color: ${item.selectedColor}`}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-primary-600 mt-1">
                              {formatPrice(price)}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => handleQuantityChange(item, -1)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                              >
                                -
                              </button>
                              <span className="text-sm w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item, 1)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleRemove(item)}
                                className="ml-auto text-primary-600 hover:text-primary-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg text-primary-600">
                        {formatPrice(getTotal)}
                      </span>
                    </div>
                    <Link
                      to="/cart"
                      onClick={onClose}
                      className="block w-full bg-primary-400 text-white text-center py-3 rounded-lg hover:bg-primary-500 transition-colors"
                    >
                      View Cart
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;

