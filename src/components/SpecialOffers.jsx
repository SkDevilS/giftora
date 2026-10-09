import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SpecialOffers = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offers = [
    {
      id: 1,
      title: 'Flash Sale',
      subtitle: 'Up to 50% OFF',
      description: 'Limited time offer on selected items',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=300&fit=crop',
      link: '/category/personal-care',
      gradient: 'from-primary-600 to-primary-500',
      showTimer: true,
      badge: 'HOT DEAL',
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Fresh Products',
      description: 'Check out our latest collection',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop',
      link: '/category/household-cleaning',
      gradient: 'from-blue-500 to-purple-500',
      showTimer: false,
      badge: 'NEW',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 mb-8 md:mb-16">
      <div className="text-center mb-6 md:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">Special Offers</h2>
        <p className="text-gray-600 text-sm md:text-base lg:text-lg">Don't miss out on these amazing deals</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {offers.map((offer) => (
          <Link
            key={offer.id}
            to={offer.link}
            className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden rounded-xl md:rounded-2xl">
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.gradient} opacity-70`}></div>
              
              {/* Content Container with clear sections */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-8 text-white z-10">
                {/* Top Row - Badge and Timer (side by side) */}
                <div className="flex items-start justify-between w-full mb-2">
                  {/* Badge - Left Side */}
                  <span className="bg-white text-primary-600 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    {offer.badge}
                  </span>

                  {/* Timer - Right Side (only for flash sale) */}
                  {offer.showTimer && (
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-right">
                      <div className="text-white text-[9px] sm:text-[10px] font-medium mb-1">Ends in</div>
                      <div className="flex items-baseline space-x-1 text-white">
                        <div className="text-center">
                          <div className="text-sm sm:text-base md:text-lg font-bold leading-tight">{String(timeLeft.hours).padStart(2, '0')}</div>
                          <div className="text-[7px] sm:text-[8px]">HRS</div>
                        </div>
                        <span className="text-sm sm:text-base">:</span>
                        <div className="text-center">
                          <div className="text-sm sm:text-base md:text-lg font-bold leading-tight">{String(timeLeft.minutes).padStart(2, '0')}</div>
                          <div className="text-[7px] sm:text-[8px]">MIN</div>
                        </div>
                        <span className="text-sm sm:text-base">:</span>
                        <div className="text-center">
                          <div className="text-sm sm:text-base md:text-lg font-bold leading-tight">{String(timeLeft.seconds).padStart(2, '0')}</div>
                          <div className="text-[7px] sm:text-[8px]">SEC</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Section - Main Content (centered) */}
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3 md:space-y-4">
                  {/* Title Badge */}
                  <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 sm:px-4 md:px-5 py-1 sm:py-1.5">
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider">{offer.title}</span>
                  </div>
                  
                  {/* Main Heading */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold drop-shadow-lg leading-tight">
                    {offer.subtitle}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs sm:text-sm md:text-base max-w-sm drop-shadow-md">
                    {offer.description}
                  </p>
                  
                  {/* Shop Now Button */}
                  <button className="bg-white text-primary-600 px-6 sm:px-7 md:px-9 py-2 sm:py-2.5 md:py-3 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-gray-50 transition-colors shadow-xl border-2 border-primary-400">
                    Shop Now →
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SpecialOffers;

