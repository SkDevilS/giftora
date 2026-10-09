import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const categoryIcons = {
  default: (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  skincare: (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  makeup: (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M6 7h12v11a3 3 0 01-3 3H9a3 3 0 01-3-3V7zM12 3v4" />
    </svg>
  ),
  haircare: (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 4v16M15 4v8M11 4v8M7 4v8M3 4v16h16" />
    </svg>
  ),
  perfume: (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8a4 4 0 100-8 4 4 0 000 8zm0 0v13m-4-7h8" />
    </svg>
  ),
  body: (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5h6M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5v14a2 2 0 002 2h2a2 2 0 002-2V5M12 9v4m-2-2h4" />
    </svg>
  ),
};

const gradients = [
  'from-blue-500 to-teal-400',
  'from-teal-500 to-cyan-400',
  'from-sky-500 to-blue-400',
  'from-indigo-500 to-blue-400',
  'from-cyan-500 to-teal-400',
  'from-blue-600 to-indigo-400',
];

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/sections');
      setCategories(response.data.filter(section => section.is_active));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (slug = '', name = '') => {
    const key = Object.keys(categoryIcons).find(k =>
      slug.toLowerCase().includes(k) || name.toLowerCase().includes(k)
    );
    return categoryIcons[key] || categoryIcons.default;
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-14 md:py-20 bg-white scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Our Categories
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Shop by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Explore our curated range of premium cosmetics and beauty collections
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5">
          {categories.map((category, idx) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gray-50 hover:bg-gradient-to-br hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-transparent overflow-hidden"
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />

              {/* Icon bubble */}
              <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {getIcon(category.slug, category.name)}
              </div>

              {/* Name */}
              <h3 className="relative z-10 text-sm md:text-base font-bold text-gray-800 group-hover:text-white text-center transition-colors duration-300 leading-tight">
                {category.name}
              </h3>

              {/* Arrow on hover */}
              <div className="relative z-10 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-white text-xs font-medium">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
