const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      title: 'Genuine Products',
      description: "We source only authentic cosmetics and beauty products from licensed manufacturers and trusted brands like Lakme, L'Oreal, Dove, and more.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping across India to get your beauty and cosmetics products delivered right to your doorstep, fast.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Best Prices',
      description: 'Competitive pricing with regular discounts and special offers on cosmetics, skincare, haircare, and makeup products.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Easy Returns',
      description: "Hassle-free 7-day return policy. If you're not satisfied with your beauty purchase, return within 7 days for a full refund.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      id: 5,
      title: 'Secure Shopping',
      description: 'Your data and payments are protected with industry-standard encryption and secure payment gateways.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 6,
      title: 'Expert Support',
      description: 'Our beauty experts and customer support team are always ready to help you choose the right cosmetics and skincare products.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 mb-16">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
            Our Promise
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">Why Choose Goftora Trading?</h2>
        <p className="text-gray-600 text-lg">We're committed to providing you with the best cosmetics & beauty shopping experience</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
          >
            <div className="text-blue-600 mb-4 group-hover:text-teal-600 transition-colors">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
