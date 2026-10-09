import ProductCard from './ProductCard';
import Loader from './Loader';

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return <Loader />;
  }

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  if (productsArray.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {productsArray.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;

