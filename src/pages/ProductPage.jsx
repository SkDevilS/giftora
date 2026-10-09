import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/priceFormatter';
import ProductGallery from '../components/ProductGallery';
import Breadcrumbs from '../components/Breadcrumbs';
import Loader from '../components/Loader';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((state) =>
    product ? state.isInWishlist(product.id) : false
  );
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/slug/${slug}`);
        const productData = response.data.product || response.data;
        
        if (!productData || !productData.id) {
          console.error('Product not found:', slug);
          navigate('/');
          return;
        }
        
        setProduct(productData);
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      showError('Please login to add items to cart');
      navigate('/account?tab=login');
      return;
    }
    
    if (product && product.stock > 0) {
      addItem(product, quantity, selectedSize, selectedColor);
      showSuccess('Product added to cart');
    }
  };

  const handleAddToWishlist = () => {
    if (!isLoggedIn) {
      showError('Please login to add items to wishlist');
      navigate('/account?tab=login');
      return;
    }
    
    if (product) {
      addToWishlist(product);
      showSuccess('Successful Add in Wishlist');
    }
  };

  const handleRemoveFromWishlist = () => {
    if (product && product.id) {
      const removeItem = useWishlistStore.getState().removeItem;
      removeItem(product.id);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Product not found</p>
      </div>
    );
  }

  const categoryMap = {
    'grains-cereals': 'Grains & Cereals',
    'spices-herbs': 'Spices & Herbs',
    'cooking-oils': 'Cooking Oils',
    'organic-products': 'Organic Products',
    'beverages': 'Beverages',
    'dry-fruits-nuts': 'Dry Fruits & Nuts',
    'personal-care': 'Personal Care & Hygiene',
    'household-cleaning': 'Household Cleaning',
    'miscellaneous': 'Miscellaneous',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', link: '/' },
          { label: categoryMap[product.category] || 'Category', link: `/category/${product.category}` },
          { label: product.title },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={product.images || []} />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{product.title}</h1>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
            {product.price && (
              <span className="text-2xl md:text-3xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
            )}
            {product.is_on_sale && product.original_price && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
            {product.is_on_sale && (
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                SALE
              </span>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === size
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedColor === color
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-2.5 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  showError('Please login to buy now');
                  navigate('/account?tab=login');
                  return;
                }
                if (product.stock === 0) return;
                // Add to cart and navigate to checkout
                addItem(product, quantity, selectedSize, selectedColor);
                navigate('/checkout');
              }}
              disabled={product.stock === 0}
              className={`flex-1 py-2.5 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
            <button
              onClick={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base flex items-center justify-center gap-2 ${
                isInWishlist
                  ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isInWishlist ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>In Wishlist</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Add to Wishlist</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

