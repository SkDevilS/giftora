import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import MiniCart from './MiniCart';
import api from '../utils/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { isLoggedIn, logout } = useAuthStore();

  useEffect(() => {
    fetchSections();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('/sections');
      const navSections = response.data.filter(section => section.is_active && section.show_in_nav);
      setSections(navSections);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/account');
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Premium Slim Announcement Bar */}
      <div className="bg-secondary-900 text-primary-50 py-2.5 text-xs font-serif tracking-widest text-center relative z-50 uppercase shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span>
          <span>Free Shipping on Orders Above ₹500 | Authentic Premium Beauty</span>
        </div>
      </div>

      {/* Main Premium Sticky Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/85 backdrop-blur-md shadow-lg border-b border-gray-100 py-2' 
            : 'bg-white border-b border-gray-50 py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Mobile Menu Toggle & Search Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 text-gray-800 hover:text-primary-700 transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-800 hover:text-primary-700 transition-colors"
                aria-label="Open search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Logo - Centered on Mobile, Left-aligned on Desktop */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <Link to="/" className="flex items-center">
                <img 
                  src="/giftora.png" 
                  alt="Goftora Trading" 
                  className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-102"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              <Link 
                to="/" 
                className="text-gray-800 hover:text-primary-800 font-serif font-medium px-3 py-2 text-[15px] tracking-wide transition-all relative group"
              >
                Home
                <span className="absolute bottom-0 left-3 right-3 h-[1px] bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
              </Link>
              {sections.map((section) => (
                <Link
                  key={section.id}
                  to={`/category/${section.slug}`}
                  className="text-gray-800 hover:text-primary-800 font-serif font-medium px-3 py-2 text-[15px] tracking-wide transition-all relative group"
                >
                  {section.name}
                  <span className="absolute bottom-0 left-3 right-3 h-[1px] bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="hidden lg:flex items-center relative max-w-xs xl:max-w-sm flex-1 mx-4"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search premium collections..."
                  className="w-full px-5 py-2.5 pr-10 text-sm rounded-full border border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-50 focus:outline-none transition-all shadow-sm"
                />
                <button 
                  type="submit" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right: Actions (Wishlist, Cart, User Account) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Account icon */}
              <Link
                to="/account"
                className="p-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-all relative group"
                title="Account"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Wishlist icon */}
              <Link
                to="/account?tab=wishlist"
                className="p-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-all relative group"
                title="Wishlist"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-all relative group"
                title="Shopping Cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold shadow-md animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Side Slide-in Drawer Mobile Navigation Menu */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${
          isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
        />

        {/* Drawer container */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl z-10 p-6 flex flex-col transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <img src="/giftora.png" alt="Goftora Trading" className="h-9 w-auto object-contain" />
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Navigation Content */}
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center text-gray-800 hover:text-primary-700 font-serif text-lg px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors"
              >
                Home
              </Link>
              {sections.map((section) => (
                <Link
                  key={section.id}
                  to={`/category/${section.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center text-gray-800 hover:text-primary-700 font-serif text-lg px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  {section.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full bg-gray-50 text-gray-800 hover:bg-gray-100 px-4 py-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/account"
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-primary-600 text-white hover:bg-primary-700 px-4 py-3 rounded-xl font-bold transition-all text-center block shadow-md"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Floating Full-screen Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col animate-fadeIn lg:hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Search Products</h2>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search premium collections..."
              className="w-full px-5 py-4 pr-12 rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-50 focus:outline-none text-base shadow-sm"
            />
            <button 
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
