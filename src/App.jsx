import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastManager from './components/ToastManager';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import StaticPage from './pages/StaticPage';
import PrivacyPage from './pages/PrivacyPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import MoneyOnePayment from './pages/MoneyOnePayment';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSections from './pages/admin/AdminSections';
import AdminNavbar from './pages/admin/AdminNavbar';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLayout from './components/admin/AdminLayout';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import { useWishlistStore } from './stores/wishlistStore';

// Check if current domain is admin domain
const isAdminDomain = () => {
  const hostname = window.location.hostname;
  return hostname === 'admin.giftora.com' || hostname === 'localhost' && window.location.port === '5174';
};

// Component to redirect to admin login if on admin domain
function AdminDomainRedirect() {
  const location = useLocation();
  
  if (isAdminDomain() && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return null;
}

function App() {
  const { isLoggedIn, verifyAuth } = useAuthStore();
  const { syncCart, clearCart, fetchCart } = useCartStore();
  const { syncWishlist, clearWishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    // Verify authentication on app load
    const initAuth = async () => {
      const isAuthenticated = await verifyAuth();
      
      if (isAuthenticated) {
        // Sync cart and wishlist after successful authentication
        await Promise.all([
          fetchCart(),
          fetchWishlist(),
        ]);
      } else {
        // Clear cart and wishlist if not authenticated
        clearCart();
        clearWishlist();
      }
    };

    initAuth();
  }, []);

  // Sync or clear cart and wishlist when login state changes
  useEffect(() => {
    if (isLoggedIn) {
      // User logged in - fetch from backend
      fetchCart();
      fetchWishlist();
    } else {
      // User logged out - clear everything
      clearCart();
      clearWishlist();
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <ScrollToTop />
      <AdminDomainRedirect />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="sections" element={<AdminSections />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Routes>
          </AdminLayout>
        } />

        {/* Public Routes - Only accessible on main domain */}
        {!isAdminDomain() && (
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<CategoryPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/moneyone-payment" element={<MoneyOnePayment />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failure" element={<PaymentFailure />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/about" element={<StaticPage />} />
                  <Route path="/contact" element={<StaticPage />} />
                  <Route path="/shipping" element={<StaticPage />} />
                  <Route path="/refund-policy" element={<StaticPage />} />
                  <Route path="/terms" element={<StaticPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        )}
        
        {/* Fallback redirect for admin domain */}
        {isAdminDomain() && (
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        )}
      </Routes>
      <ToastManager />
    </Router>
  );
}

export default App;

