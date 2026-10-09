import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { formatPrice } from '../utils/priceFormatter';
import Breadcrumbs from '../components/Breadcrumbs';

const CartPage = () => {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal());

  const shipping = 0; // Free shipping
  const total = getTotal + shipping;

  const handleRemove = (item) => {
    removeItem(item.id, item.selectedSize, item.selectedColor);
  };

  const handleQuantityChange = (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity, item.selectedSize, item.selectedColor);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'Cart' }]} />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link
            to="/"
            className="btn-primary inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'Cart' }]} />

      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item) => {
            const price = item.is_on_sale ? item.price : item.original_price || item.price;
            return (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col sm:flex-row gap-3 md:gap-4"
              >
                <img
                  src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=500'}
                  alt={item.title}
                  className="w-full sm:w-32 h-32 md:h-32 object-cover rounded bg-gray-200"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=500') {
                      e.target.src = 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=500';
                    }
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">{item.title}</h3>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-sm text-gray-600 mb-2">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' • '}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-primary-600 mb-4">
                    {formatPrice(price)}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(getTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-primary-400 text-white text-center py-3 rounded-lg hover:bg-primary-500 transition-colors font-semibold"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/"
              className="block w-full text-center py-3 text-gray-600 hover:text-gray-800 mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

