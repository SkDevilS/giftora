import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Personal Care Essentials',
      subtitle: 'Premium Hygiene & Beauty Products',
      description: 'Get up to 30% off on selected items',
      cta: 'Shop Now',
      link: '/category/personal-care',
      gradient: 'from-purple-600 via-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1200&h=600&fit=crop',
    },
    {
      id: 2,
      title: 'Luxury Fragrances',
      subtitle: 'Discover Your Signature Scent',
      description: 'Free delivery on orders above ₹500',
      cta: 'Explore Perfumes',
      link: '/',
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&h=600&fit=crop',
    },
    {
      id: 3,
      title: 'Beauty & Cosmetics',
      subtitle: 'Enhance Your Natural Beauty',
      description: 'Special offers on makeup & skincare',
      cta: 'Shop Beauty',
      link: '/',
      gradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=600&fit=crop',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`}></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 md:px-8">
              <div className="max-w-2xl text-white">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fadeInUp">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl lg:text-3xl mb-3 animate-fadeInUp animation-delay-200">
                  {slide.subtitle}
                </p>
                <p className="text-lg md:text-xl mb-6 animate-fadeInUp animation-delay-400">
                  {slide.description}
                </p>
                <Link
                  to={slide.link}
                  className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg animate-fadeInUp animation-delay-600"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
