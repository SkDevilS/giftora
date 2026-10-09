import { useState, useEffect } from 'react';

const cosmeticsImages = [
  {
    id: 1,
    url: '/moisturizer/5.jpeg',
    title: 'Pure Hydration Serum',
    desc: 'Deep nourishing hydration for all skin types, crafted with botanical extracts.',
  },
  {
    id: 2,
    url: '/perfume/6.jpeg',
    title: 'Botanical Skincare Rituals',
    desc: 'Restore your natural glow with organic cold-pressed oils and creams.',
  },
  {
    id: 3,
    url: '/Soaps/2.jpeg',
    title: 'Aesthetic Clean Beauty',
    desc: 'Minimalist, eco-friendly formulas that respect both your skin and nature.',
  },
  {
    id: 4,
    url: '/shampoo/2.jpeg',
    title: 'Nourishing Shampoos',
    desc: 'Gentle cleansing formulas for strong, shiny, and fully revitalized hair.',
  },
  {
    id: 5,
    url: '/Soaps/3.jpeg',
    title: 'Natural Clay & Masks',
    desc: 'Purifying mineral treatments to detoxify and revitalize your complexion.',
  },
  {
    id: 6,
    url: '/perfume/1.jpeg',
    title: 'Regenerative Skin Serums',
    desc: 'Active vitamin-infused treatments for timeless and youthful radiance.',
  },
];

const CosmeticsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [currentIndex, isHovered]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cosmeticsImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cosmeticsImages.length) % cosmeticsImages.length);
  };

  return (
    <section 
      className="py-12 md:py-16 bg-gray-50 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block bg-teal-50 border border-teal-200 text-teal-700 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
            Aesthetic Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Our Premium{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Cosmetic Gallery
            </span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            A visual showcase of clean, organic, and elegant beauty formulations.
          </p>
        </div>

        {/* Carousel Slider */}
        <div className="relative w-full max-w-5xl mx-auto h-[250px] sm:h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 group">
          
          {/* Slides */}
          {cosmeticsImages.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-102 pointer-events-none'
              }`}
            >
              {/* Image */}
              <img
                src={slide.url}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              
              {/* Modern Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Text Card content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 text-white flex flex-col justify-end">
                <div className="max-w-2xl animate-fadeInUp">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 tracking-wide">
                    {slide.title}
                  </h3>
                  <p className="text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed opacity-90">
                    {slide.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Left Arrow Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-20"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Controls */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-20"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
            {cosmeticsImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default CosmeticsCarousel;
