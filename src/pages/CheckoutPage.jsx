import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/priceFormatter';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal());
  const { showSuccess, showError } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod',
    upiId: '',
    upiName: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses();
    }
  }, [isLoggedIn]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      const addressList = response.data.addresses || [];
      setAddresses(addressList);
      
      // Auto-select default address
      const defaultAddr = addressList.find(addr => addr.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      } else {
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
    
    // Validate UPI fields if UPI is selected
    if (formData.paymentMethod === 'upi') {
      if (!formData.upiId) newErrors.upiId = 'UPI ID is required';
      if (!formData.upiName) newErrors.upiName = 'UPI Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      showError('Please login to place an order');
      navigate('/account?tab=login');
      return;
    }

    // If using saved address
    if (!useNewAddress && selectedAddressId) {
      // Validate UPI fields if UPI is selected
      if (formData.paymentMethod === 'upi') {
        if (!formData.upiId || !formData.upiName) {
          showError('Please fill in UPI ID and Name');
          return;
        }
      }
      
      try {
        setIsSubmitting(true);
        
        // Prepare order items from cart
        const orderItems = items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor
        }));
        
        const orderPayload = {
          address_id: selectedAddressId,
          payment_method: formData.paymentMethod,
          items: orderItems,
        };
        
        // Add UPI details if UPI payment is selected
        if (formData.paymentMethod === 'upi') {
          orderPayload.payment_details = {
            payment_method: 'upi',
            upi_id: formData.upiId,
            upi_name: formData.upiName,
          };
        }
        
        const response = await api.post('/orders', orderPayload);
        const order = response.data.order;

        // If PayU payment, redirect to PayU gateway
        if (formData.paymentMethod === 'payu') {
          try {
            // Initiate PayU payment - get form parameters
            const payuResponse = await api.post(`/payu/initiate/${order.id}`);
            
            // Clear cart before redirect
            clearCart();
            
            // Show loading message
            showSuccess('Redirecting to payment gateway...');
            
            // Create and submit form programmatically
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuResponse.data.action;
            form.style.display = 'none';
            
            // Add all form fields
            Object.keys(payuResponse.data.params).forEach(key => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = payuResponse.data.params[key];
              form.appendChild(input);
            });
            
            // Append form to body and submit
            document.body.appendChild(form);
            form.submit();
          } catch (error) {
            console.error('PayU initiation error:', error);
            showError('Failed to initiate payment. Please try again.');
            setIsSubmitting(false);
          }
        } else if (formData.paymentMethod === 'moneyone') {
          // For MoneyOne, redirect to QR payment page
          clearCart();
          navigate(`/moneyone-payment?orderId=${order.id}`);
        } else {
          // For COD and other methods, show success modal
          setOrderData(order);
          clearCart();
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error('Order placement error:', error);
        showError(error.response?.data?.error || 'Failed to place order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If using new address
    if (!validateForm()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare order items from cart
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor
      }));
      
      const orderPayload = {
        address: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.zipCode,
        },
        payment_method: formData.paymentMethod,
        items: orderItems,
      };
      
      // Add UPI details if UPI payment is selected
      if (formData.paymentMethod === 'upi') {
        orderPayload.payment_details = {
          payment_method: 'upi',
          upi_id: formData.upiId,
          upi_name: formData.upiName,
        };
      }
      
      const response = await api.post('/orders', orderPayload);
      const order = response.data.order;

      // If PayU payment, redirect to PayU gateway
      if (formData.paymentMethod === 'payu') {
        try {
          // Initiate PayU payment - get form parameters
          const payuResponse = await api.post(`/payu/initiate/${order.id}`);
          
          // Clear cart before redirect
          clearCart();
          
          // Show loading message
          showSuccess('Redirecting to payment gateway...');
          
          // Create and submit form programmatically
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = payuResponse.data.action;
          form.style.display = 'none';
          
          // Add all form fields
          Object.keys(payuResponse.data.params).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = payuResponse.data.params[key];
            form.appendChild(input);
          });
          
          // Append form to body and submit
          document.body.appendChild(form);
          form.submit();
        } catch (error) {
          console.error('PayU initiation error:', error);
          showError('Failed to initiate payment. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        // For COD and other methods, show success modal
        setOrderData(order);
        clearCart();
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      showError(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!orderData) return;
    
    try {
      const response = await api.get(`/orders/${orderData.id}/receipt`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${orderData.receipt_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Receipt download error:', error);
      showError('Failed to download receipt');
    }
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'Checkout' }]} />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const shipping = 0;
  const total = getTotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'Checkout' }]} />

      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Billing & Shipping Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Shipping Address</h2>
            
            {/* Saved Addresses */}
            {addresses.length > 0 && !useNewAddress && (
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Saved Address
                </label>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{addr.full_name}</p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {addr.address_line1}
                          {addr.address_line2 && `, ${addr.address_line2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      {addr.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setUseNewAddress(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Use a different address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(useNewAddress || addresses.length === 0) && (
              <>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(false)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
                  >
                    ← Use saved address
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>
              </>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Payment Method</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600"
                />
                <span className="text-gray-700">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="moneyone"
                  checked={formData.paymentMethod === 'moneyone'}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Pay Online (Gateway_1)</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="payu"
                  checked={formData.paymentMethod === 'payu'}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Pay with PayU (Cards/UPI/NetBanking)</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer opacity-50 cursor-not-allowed">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600"
                  disabled
                />
                <span className="text-gray-700">UPI Payment (Manual)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer opacity-50 cursor-not-allowed">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600"
                  disabled
                />
                <span className="text-gray-700">Credit/Debit Card (Manual)</span>
              </label>
            </div>
            
            {/* MoneyOne Info */}
            {formData.paymentMethod === 'moneyone' && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-sm font-semibold text-indigo-800 mb-2">Secure Online Payment</h3>
                <p className="text-indigo-700 text-sm mb-3">
                  You will be redirected to scan a QR code. Complete payment within 2 minutes using any UPI app.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-200">Google Pay</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-200">PhonePe</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-200">Paytm</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-200">Any UPI App</span>
                </div>
              </div>
            )}
            
            {/* UPI Details Form */}
            {formData.paymentMethod === 'upi' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">UPI Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.upiId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.upiId && (
                      <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on UPI <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="upiName"
                      value={formData.upiName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.upiName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.upiName && (
                      <p className="text-red-500 text-sm mt-1">{errors.upiName}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p>Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const price = item.is_on_sale ? item.price : item.original_price || item.price;
                return (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
                    <span>{item.title} x {item.quantity}</span>
                    <span>{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(getTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-400 text-white py-3 rounded-lg hover:bg-primary-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? 'Processing...' 
                : formData.paymentMethod === 'payu' 
                  ? 'Proceed to Payment'
                : formData.paymentMethod === 'moneyone'
                  ? 'Proceed to QR Payment'
                  : 'Place Order'}
            </button>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && orderData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            // Prevent closing when clicking backdrop
            if (e.target === e.currentTarget) {
              e.stopPropagation();
            }
          }}
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Order Number: <span className="font-semibold">{orderData?.order_number || 'N/A'}</span>
              </p>
              <p className="text-gray-600 mb-6">
                Receipt Number: <span className="font-semibold">{orderData?.receipt_number || 'N/A'}</span>
              </p>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/account?tab=orders');
                  }}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  View My Orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                  }}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

