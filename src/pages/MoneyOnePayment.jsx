import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/priceFormatter';
import api from '../utils/api';
import QRCode from 'qrcode';

const MoneyOnePayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  const timerRef = useRef(null);
  const statusCheckRef = useRef(null);

  useEffect(() => {
    if (!orderId) {
      showError('Order ID is missing');
      navigate('/');
      return;
    }

    initiatePayment();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusCheckRef.current) clearInterval(statusCheckRef.current);
    };
  }, [orderId]);

  useEffect(() => {
    if (paymentData && timeLeft > 0 && paymentStatus === 'pending') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [paymentData, timeLeft, paymentStatus]);

  useEffect(() => {
    if (paymentData && paymentStatus === 'pending') {
      // Check payment status every 5 seconds
      statusCheckRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 5000);

      return () => clearInterval(statusCheckRef.current);
    }
  }, [paymentData, paymentStatus]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/moneyone/initiate/${orderId}`);
      
      console.log('Payment initiation response:', response.data);
      
      if (response.data.success) {
        setPaymentData(response.data);
        
        // Use QR code from backend if available, otherwise generate from payment URL or QR string
        if (response.data.qr_code) {
          // Backend already generated QR code as base64 image
          setQrCodeUrl(response.data.qr_code);
        } else if (response.data.qr_string) {
          // Generate QR code from QR string
          const qrUrl = await QRCode.toDataURL(response.data.qr_string, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeUrl(qrUrl);
        } else if (response.data.payment_url) {
          // Fallback: Generate QR code from payment URL
          const qrUrl = await QRCode.toDataURL(response.data.payment_url, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeUrl(qrUrl);
        } else {
          showError('No payment QR code or URL received');
          navigate('/checkout');
        }
      } else {
        showError(response.data.error || 'Failed to initiate payment');
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      console.error('Error response:', error.response?.data);
      showError(error.response?.data?.error || 'Failed to initiate payment');
      navigate('/checkout');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checkingPayment) return;
    
    try {
      setCheckingPayment(true);
      const response = await api.get(`/moneyone/status/${orderId}`);
      
      if (response.data.success) {
        const status = response.data.payment_status;
        
        if (status === 'paid') {
          setPaymentStatus('success');
          clearInterval(timerRef.current);
          clearInterval(statusCheckRef.current);
          
          showSuccess('Payment successful!');
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate(`/payment-success?orderId=${orderId}&orderNumber=${response.data.order_number}&amount=${response.data.amount}`);
          }, 2000);
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          clearInterval(timerRef.current);
          clearInterval(statusCheckRef.current);
          
          showError('Payment failed');
          
          // Redirect to failure page after 2 seconds
          setTimeout(() => {
            navigate('/payment-failure?error=Payment failed');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleTimeout = () => {
    setPaymentStatus('timeout');
    clearInterval(statusCheckRef.current);
    showError('Payment timeout. Please try again.');
    
    setTimeout(() => {
      navigate('/checkout');
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MoneyOne Payment Gateway</h1>
          <p className="text-gray-600">Scan the QR code to complete your payment</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
              timeLeft > 60 ? 'bg-green-100' : timeLeft > 30 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  timeLeft > 60 ? 'text-green-600' : timeLeft > 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-500">remaining</div>
              </div>
            </div>
          </div>

          {/* Amount */}
          {paymentData && (
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-primary-600">
                {formatPrice(paymentData.amount)}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  Order ID: {orderId}
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  Payment Mode: UPI
                </p>
              </div>
            </div>
          )}

          {/* QR Code */}
          {paymentStatus === 'pending' && qrCodeUrl && (
            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-primary-100">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Scan this QR code with any UPI app to pay
              </p>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">Redirecting to order confirmation...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
              <p className="text-gray-600">Redirecting back...</p>
            </div>
          )}

          {paymentStatus === 'timeout' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-orange-600 mb-2">Payment Timeout</h2>
              <p className="text-gray-600">Redirecting to checkout...</p>
            </div>
          )}

          {/* Instructions */}
          {paymentStatus === 'pending' && (
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>Scan the QR code shown above</li>
                <li>Verify the amount and complete the payment</li>
                <li>Wait for confirmation (this page will update automatically)</li>
              </ol>
            </div>
          )}

          {/* Cancel Button */}
          {paymentStatus === 'pending' && (
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/checkout')}
                className="text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Cancel and go back to checkout
              </button>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secured by MoneyOne Payment Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneyOnePayment;
