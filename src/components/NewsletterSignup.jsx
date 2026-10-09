import { useState } from 'react';
import { useToastStore } from '../stores/toastStore';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      showToast('Successfully subscribed to newsletter!', 'success');
      setEmail('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16 mb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-white mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Stay Updated
            </h2>
            <p className="text-primary-100 text-lg">
              Subscribe to our newsletter and get exclusive deals, new product alerts, and special offers delivered to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className="text-primary-200 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;

