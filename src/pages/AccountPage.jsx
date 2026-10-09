import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../utils/priceFormatter';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../utils/api';

const AccountPage = () => {
  const [searchParams] = useSearchParams();
  const { isLoggedIn, login, register, user } = useAuthStore();
  const defaultTab = isLoggedIn ? 'profile' : 'login';
  const tab = searchParams.get('tab') || defaultTab;
  const [isLogin, setIsLogin] = useState(tab === 'login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const wishlistItems = useWishlistStore((state) => state.items);
  const { showSuccess, showError } = useToast();
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: 'January 15, 1990',
    gender: 'Male',
  });

  // Initialize profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: 'January 15, 1990',
        gender: 'Male',
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    const { updateProfile } = useAuthStore.getState();
    const result = await updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    });
    
    if (result.success) {
      showSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      showError(result.error || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setProfileForm({
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: 'January 15, 1990',
      gender: 'Male',
    });
    setIsEditingProfile(false);
  };

  // Address management state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  // Fetch addresses when component mounts or tab changes to addresses
  useEffect(() => {
    if (isLoggedIn && tab === 'addresses') {
      fetchAddresses();
    }
  }, [isLoggedIn, tab]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await api.get('/addresses');
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      if (error.response?.status === 401) {
        showError('Please login to view addresses');
      } else if (error.response?.status === 500) {
        console.error('Server error:', error.response?.data);
        showError('Server error. Please try again later.');
      } else {
        showError('Failed to load addresses');
      }
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      full_name: user?.name || '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false,
    });
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (addressId) => {
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      setEditingAddressId(addressId);
      setAddressForm({
        full_name: address.full_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.is_default,
      });
      setIsAddressFormOpen(true);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.full_name || !addressForm.phone || !addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      if (editingAddressId) {
        // Update existing address
        await api.put(`/addresses/${editingAddressId}`, addressForm);
        showSuccess('Address updated successfully!');
      } else {
        // Add new address
        await api.post('/addresses', addressForm);
        showSuccess('Address added successfully!');
      }

      setIsAddressFormOpen(false);
      setEditingAddressId(null);
      setAddressForm({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
      });
      
      // Refresh addresses list
      fetchAddresses();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to save address');
    }
  };

  const handleCancelAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
    setAddressForm({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false,
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await api.delete(`/addresses/${addressId}`);
      showSuccess('Address deleted successfully!');
      fetchAddresses();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await api.post(`/addresses/${addressId}/set-default`);
      showSuccess('Default address updated!');
      fetchAddresses();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to set default address');
    }
  };

  useEffect(() => {
    if (tab === 'wishlist' || tab === 'orders' || tab === 'profile' || tab === 'addresses') {
      setIsLogin(false);
    } else if (tab === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
    // Reset edit mode when switching tabs
    if (tab !== 'profile') {
      setIsEditingProfile(false);
    }
    // Reset address form when switching tabs
    if (tab !== 'addresses') {
      setIsAddressFormOpen(false);
      setEditingAddressId(null);
    }
    // Scroll to top when tab changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [tab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      showSuccess('Successfully logged in');
      setLoginForm({ email: '', password: '' });
    } else {
      showError(result.error || 'Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (registerForm.password.length < 8) {
      showError('Password must be at least 8 characters long and contain uppercase, lowercase, and number');
      return;
    }
    
    const result = await register(registerForm.name, registerForm.email, registerForm.password);
    if (result.success) {
      showSuccess('Successfully registered and logged in!');
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } else {
      showError(result.error || 'Registration failed. Please try again.');
    }
  };

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (isLoggedIn && tab === 'orders') {
      fetchOrders();
    }
  }, [isLoggedIn, tab]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDownloadReceipt = async (orderId, receiptNumber) => {
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
      showError('Failed to download receipt');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'My Account' }]} />
        <div className="max-w-md mx-auto">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium ${
                isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium ${
                !isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-md p-8 space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-gray-600">Login to your account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                Login
              </button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Register here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="bg-white rounded-lg shadow-md p-8 space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                <p className="text-gray-600">Sign up to get started</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters with uppercase, lowercase, and number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                Create Account
              </button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Login here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'My Account' }]} />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Welcome, {user?.name || 'User'}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <nav className="space-y-2">
              <Link
                to="/account?tab=profile"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  tab === 'profile'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Profile
              </Link>
              <Link
                to="/account?tab=addresses"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  tab === 'addresses'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Addresses
              </Link>
              <Link
                to="/account?tab=wishlist"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  tab === 'wishlist'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Wishlist
              </Link>
              <Link
                to="/account?tab=orders"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  tab === 'orders'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Orders
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {tab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Profile</h1>
                {!isEditingProfile ? (
                  <button 
                    onClick={handleEditProfile}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-600">
                        {profileForm.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold mb-1">{profileForm.name}</h2>
                      <p className="text-gray-600">{profileForm.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {profileForm.name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {profileForm.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {profileForm.phone}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.dateOfBirth}
                          onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="e.g., January 15, 1990"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {profileForm.dateOfBirth}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      {isEditingProfile ? (
                        <select
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {profileForm.gender}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                        January 2024
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Account Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Email Notifications</span>
                        <span className="text-sm text-gray-500">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">SMS Notifications</span>
                        <span className="text-sm text-gray-500">Disabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Newsletter Subscription</span>
                        <span className="text-sm text-gray-500">Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'addresses' && (
            <div>
              <h1 className="text-3xl font-bold mb-8">My Addresses</h1>
              <div className="space-y-6">
                {/* Address Form */}
                {isAddressFormOpen && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-6">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveAddress();
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.full_name}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, full_name: e.target.value })
                            }
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, phone: e.target.value })
                            }
                            placeholder="+91 1234567890"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.address_line1}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address_line1: e.target.value })
                          }
                          placeholder="House/Flat No., Building Name, Street"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressForm.address_line2}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address_line2: e.target.value })
                          }
                          placeholder="Landmark, Area, Locality"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, city: e.target.value })
                            }
                            placeholder="City"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, state: e.target.value })
                            }
                            placeholder="State"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, pincode: e.target.value })
                            }
                            placeholder="Pincode"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={addressForm.is_default}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, is_default: e.target.checked })
                          }
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                          Set as default address
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddressForm}
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-md hover:shadow-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address List */}
                {loadingAddresses ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 && !isAddressFormOpen ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">No addresses saved yet</p>
                    <button
                      onClick={handleAddAddress}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{address.full_name}</h3>
                          <div className="text-gray-600 space-y-1">
                            <p className="font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {address.phone}
                            </p>
                            <p>{address.address_line1}</p>
                            {address.address_line2 && <p>{address.address_line2}</p>}
                            <p>
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address.id)}
                            className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {address.is_default && (
                        <div className="pt-4 border-t border-gray-200">
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            Default Address
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {!isAddressFormOpen && addresses.length > 0 && (
                  <button
                    onClick={handleAddAddress}
                    className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    + Add New Address
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'wishlist' && (
            <div>
              <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
                  <Link to="/" className="btn-primary inline-block">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {wishlistItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <h1 className="text-3xl font-bold mb-8">Order History</h1>
              
              {loadingOrders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">No orders yet</p>
                  <Link to="/" className="btn-primary inline-block">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                          <p className="text-sm text-gray-600">Receipt: {order.receipt_number}</p>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment: {order.payment_method?.toUpperCase() || 'N/A'}
                          </p>
                          {/* Show PayU Transaction ID if available */}
                          {order.payment_method === 'payu' && order.payu_mihpayid && (
                            <p className="text-xs text-gray-500 mt-1">
                              Transaction ID: {order.payu_mihpayid}
                            </p>
                          )}
                          {/* Show Bank Reference for PayU */}
                          {order.payment_method === 'payu' && order.payment_details?.payu_bank_ref_num && (
                            <p className="text-xs text-gray-500">
                              Bank Ref: {order.payment_details.payu_bank_ref_num}
                            </p>
                          )}
                          {/* Show UTR for manual UPI */}
                          {order.payment_method === 'upi' && order.payment_details?.utr && (
                            <p className="text-xs text-gray-500">
                              UTR: {order.payment_details.utr}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg text-primary-600">
                            {formatPrice(order.total_amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.order_items?.length || 0} item(s)
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mb-4 border-t pt-4">
                          <div className="space-y-2">
                            {order.order_items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.product_name} x {item.quantity}
                                </span>
                                <span className="text-gray-600">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between border-t pt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleDownloadReceipt(order.id, order.receipt_number)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountPage;

