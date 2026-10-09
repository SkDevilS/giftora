import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductGrid from '../components/ProductGrid';
import HeroSection from '../components/HeroSection';
import CosmeticsCarousel from '../components/CosmeticsCarousel';
import FeaturedCategories from '../components/FeaturedCategories';
import StatsSection from '../components/StatsSection';
import Testimonials from '../components/Testimonials';
import WhyChooseUs from '../components/WhyChooseUs';
import SEO from '../components/SEO';

/* ─── Offer Banner ───────────────────────────────────────────────────── */
const OfferBanner = () => (
  <section className="py-10 md:py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            gradient: 'from-primary-600 to-primary-400',
            icon: (
              <svg className="w-8 h-8 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: 'Last Minute Gifts',
            sub: 'Perfect presents, delivered fast',
            cta: 'Shop Gifts',
            to: '/category/gifts',
          },
          {
            gradient: 'from-secondary-600 to-secondary-400',
            icon: (
              <svg className="w-8 h-8 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            ),
            title: 'For Her',
            sub: 'Curated beauty & wellness sets',
            cta: 'Explore',
            to: '/category/skincare',
          },
          {
            gradient: 'from-accent-600 to-accent-400',
            icon: (
              <svg className="w-8 h-8 text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 4v16M15 4v8M11 4v8M7 4v8M3 4v16h16" />
              </svg>
            ),
            title: 'Self-Care Bundles',
            sub: 'Elevate their daily routine',
            cta: 'View Bundles',
            to: '/category/body',
          },
        ].map((card, i) => (
          <Link
            key={i}
            to={card.to}
            className={`block relative bg-gradient-to-br ${card.gradient} rounded-3xl p-7 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
          >
            <div className="absolute -right-6 -bottom-6 text-white opacity-10 group-hover:opacity-20 transition-opacity select-none w-28 h-28">
              {card.icon}
            </div>
            {card.icon}
            <h3 className="text-2xl font-bold mb-1 font-serif">{card.title}</h3>
            <p className="text-white/80 text-sm mb-4">{card.sub}</p>
            <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold transition-colors">
              {card.cta}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Section Header ──────────────────────────────────────────────────── */
const SectionHeader = ({ tag, title, highlight, subtitle }) => (
  <div className="mb-10 md:mb-14 max-w-3xl">
    {tag && (
      <span className="inline-block bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-serif">
        {tag}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
      {title}{' '}
      {highlight && (
        <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          {highlight}
        </span>
      )}
    </h2>
    {subtitle && <p className="text-gray-500 text-lg md:text-xl leading-relaxed">{subtitle}</p>}
  </div>
);

/* ─── Newsletter ──────────────────────────────────────────────────────── */
const Newsletter = () => (
  <section className="py-16 md:py-24 bg-white relative overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-[2.5rem] p-10 md:p-16 lg:p-20 shadow-sm border border-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
        {/* Background blobs for inner container */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary-200/40 rounded-full blur-3xl" />
        
        <div className="flex-1 relative z-10">
          <span className="inline-block bg-white text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            Stay in the Loop
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-gray-900">
            Join the <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">Giftora</span> Inner Circle
          </h2>
          <p className="text-gray-600 text-lg max-w-lg">
            Subscribe and be the first to know about new curated gift boxes, exclusive collections, and premium offers.
          </p>
        </div>
        
        <div className="flex-1 w-full relative z-10 max-w-md">
          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300"
            >
              Subscribe Now
            </button>
            <p className="text-gray-400 text-xs text-center mt-2">No spam. Unsubscribe anytime.</p>
          </form>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Main Home Component ────────────────────────────────────────────── */
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: { is_featured: true, per_page: 8 },
        });
        setProducts(response.data?.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      <SEO
        title="Giftora - Premium Gifting & Wellness"
        description="Shop premium gifts, cosmetics and wellness products at GOFTORA TRADING PRIVATE LIMITED. The ultimate destination for perfect presents."
        keywords="gifts online, premium gifts, beauty products, self-care, Goftora Trading"
        url="/"
      />

      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. PREMIUM AESTHETIC COSMETICS SLIDER (BELOW HERO) */}
      <CosmeticsCarousel />

      {/* 3. CATEGORIES */}
      <FeaturedCategories />

      {/* 4. OFFER BANNERS */}
      <OfferBanner />

      {/* 5. FEATURED PRODUCTS */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            tag="⭐ Curated Collection"
            title="Gifts They'll"
            highlight="Cherish"
            subtitle="Discover our most loved items — carefully curated for the special people in your life."
          />

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-14 h-14 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
              <p className="mt-4 text-gray-400 text-lg">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <div className="text-center mt-12">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-10 py-4 rounded-full font-bold text-base hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  View All Products
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 text-xl font-medium">No products available yet.</p>
              <p className="text-gray-400 mt-2">Check back soon for amazing beauty deals!</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="py-14 md:py-20 bg-white">
        <WhyChooseUs />
      </section>

      {/* 7. STATS */}
      <section className="py-14 md:py-20 bg-primary-50">
        <StatsSection />
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-14 md:py-20 bg-white">
        <Testimonials />
      </section>

      {/* 9. NEWSLETTER */}
      <Newsletter />
    </div>
  );
};

export default Home;
