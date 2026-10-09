import { useState, useEffect, useCallback } from 'react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: 'Curated Gifts',
      title: 'The Art of',
      highlight: 'Gifting',
      subtitle: 'Discover premium gifts, lifestyle, and wellness essentials designed to bring joy to every occasion.',
      cta: 'Explore Collection',
      image: '/moisturizer/4.jpeg',
    },
    {
      id: 2,
      tag: 'Best Sellers',
      title: 'Unforgettable',
      highlight: 'Moments',
      subtitle: 'Experience our meticulously selected range of premium products and gift sets from top global brands.',
      cta: 'Shop Bestsellers',
      image: '/perfume/5.jpeg',
    },
    {
      id: 3,
      tag: 'Trending Now',
      title: 'Elevate',
      highlight: 'Everyday',
      subtitle: 'Premium wellness, cosmetics and personal care crafted for the perfect self-care gift.',
      cta: 'Shop Wellness',
      image: '/Soaps/1.jpeg',
    },
  ];

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleScrollToCategories = (e) => {
    e.preventDefault();
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full min-h-[92vh] lg:h-[92vh] overflow-hidden bg-primary-50 flex items-center">
      {/* 1. Immersive Blurred Background (Light Mode) */}
      {slides.map((s, idx) => (
        <div
          key={`bg-${s.id}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 scale-100 z-0' : 'opacity-0 scale-110 -z-10'
          }`}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover blur-[100px] opacity-70 saturate-150"
          />
        </div>
      ))}
      
      {/* Overlay gradient to soften the background and ensure text readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-0" />
      
      {/* Animated Floating Glass Orbs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/60 rounded-full mix-blend-overlay filter blur-[40px] animate-pulse z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-200/50 rounded-full mix-blend-multiply filter blur-[60px] animate-pulse z-0" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content: Light Glassmorphic Card */}
          <div className="order-2 lg:order-1 text-gray-900">
            <div 
              key={`content-${currentSlide}`} 
              className="bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] rounded-3xl p-8 md:p-12 animate-fadeInUp"
            >
              {/* Glowing Tag */}
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                </span>
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary-700">
                  {slide.tag}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6 text-gray-900">
                {slide.title}
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent italic font-medium">
                  {slide.highlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md font-medium">
                {slide.subtitle}
              </p>

              {/* Light Mode Glowing CTA Button */}
              <button
                onClick={handleScrollToCategories}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/70 backdrop-blur-md border border-white text-gray-900 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] shadow-md"
              >
                <span className="font-bold tracking-wide relative z-10">{slide.cta}</span>
                <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white to-transparent z-0 opacity-70" />
              </button>
            </div>
          </div>

          {/* Right Content: 3D Floating Product Image (Light Frame) */}
          <div className="order-1 lg:order-2 flex justify-center items-center relative h-[400px] lg:h-[600px]">
            {slides.map((s, idx) => (
              <div
                key={`img-${s.id}`}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 scale-100 z-10 rotate-0' : 'opacity-0 scale-90 z-0 -rotate-6'
                }`}
              >
                {/* The main product image housed inside a light glass frame */}
                <div className="relative w-3/4 sm:w-[350px] lg:w-[420px] rounded-2xl overflow-hidden bg-white/30 backdrop-blur-xl border border-white/60 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transform transition-transform duration-[5000ms] hover:scale-105">
                  <img
                    src={s.image}
                    alt={s.highlight}
                    className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-xl shadow-inner"
                  />
                  
                  {/* Floating Glass Badges over the image */}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-8 left-0 right-0 px-4 sm:px-12 flex justify-between items-center z-20">
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              className="w-12 h-12 bg-white/50 backdrop-blur-md border border-white text-gray-900 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 bg-white/50 backdrop-blur-md border border-white text-gray-900 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full border border-white/50 shadow-sm ${
                  idx === currentSlide ? 'w-10 h-3 bg-primary-500' : 'w-3 h-3 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Required for button shimmer animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </section>
  );
};

export default HeroSection;
