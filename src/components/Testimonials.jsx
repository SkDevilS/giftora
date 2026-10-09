import { useState, useEffect } from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      rating: 5,
      text: 'Excellent quality cosmetics and fast delivery! The skincare items I ordered were exactly as described — completely authentic. Highly recommended for genuine beauty products!',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,  
      text: 'Great shopping experience at Goftora Trading! The makeup and skincare products are top-notch and the customer service is amazing. Will definitely order again!',
    },
    {
      id: 3,
      name: 'Amit Patel',
      location: 'Bangalore',
      rating: 5,
      text: 'Best prices on genuine cosmetics products. The L\'Oreal and Lakme items I bought are 100% authentic and great quality. Fast shipping too — love Goftora Trading!',
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      location: 'Hyderabad',
      rating: 5,
      text: 'Love the variety of cosmetics and beauty products available. Easy navigation, smooth checkout, and quick delivery. Goftora Trading is now my go-to beauty store!',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
              Customer Reviews
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">What Our Customers Say</h2>
          <p className="text-gray-600 text-lg">Real reviews from real customers</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="min-w-full px-4 md:px-8"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-6 h-6 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-lg md:text-xl text-gray-700 mb-8 italic">
                      "{testimonial.text}"
                    </p>
                    <div className="text-center">
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
