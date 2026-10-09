import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('error') || 'Payment failed. Please try again.';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-8">
              {errorMessage}
            </p>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-red-800 mb-2">What happened?</h2>
              <p className="text-red-700 text-sm">
                Your payment could not be processed. This could be due to:
              </p>
              <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                <li>Insufficient funds in your account</li>
                <li>Incorrect payment details</li>
                <li>Bank declined the transaction</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/cart')}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Return to Cart
              </button>
              
              <button
                onClick={() => navigate('/checkout')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Try Again
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
