import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../utils/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess } = useToast();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const receiptNumber = searchParams.get('receiptNumber');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
    
    // Show success message even if API fails
    if (orderNumber) {
      setTimeout(() => {
        showSuccess('Payment successful! Your order has been confirmed.');
      }, 500);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrderData(response.data.order);
      showSuccess('Payment successful! Your order has been confirmed.');
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      // Don't show error - we have the basic info from URL params
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!orderId) return;
    
    try {
      const response = await api.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Receipt download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{orderNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt Number:</span>
                  <span className="font-semibold">{receiptNumber || 'N/A'}</span>
                </div>
                {orderData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">₹{orderData.total_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-semibold text-green-600 capitalize">{orderData.payment_status}</span>
                    </div>
                    {/* Show PayU Transaction ID */}
                    {orderData.payment_method === 'payu' && orderData.payu_mihpayid && (
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-sm">{orderData.payu_mihpayid}</span>
                      </div>
                    )}
                    {/* Show Bank Reference */}
                    {orderData.payment_method === 'payu' && orderData.payment_details?.payu_bank_ref_num && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Reference:</span>
                        <span className="font-mono text-sm">{orderData.payment_details.payu_bank_ref_num}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadReceipt}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Receipt</span>
              </button>
              
              <button
                onClick={() => navigate('/account?tab=orders')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                View My Orders
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
