import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_access_token');
    const adminUser = localStorage.getItem('admin_user');
    
    if (!token || !adminUser) {
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'admin') {
        showError('Admin access required');
        navigate('/admin/login');
      }
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const handleLogout = () => {
    // Only remove admin tokens, not customer tokens
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    showSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/admin/sections', label: 'Categories & Nav', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { path: '/admin/orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { path: '/admin/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/admin/dashboard" className="flex items-center space-x-3">
                <img 
                  src="/giftora.png" 
                  alt="Goftora Trading" 
                  className="h-10 w-auto"
                />
                <span className="text-2xl font-bold text-primary-600">
                  Goftora Trading Admin
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary-600 text-sm"
              >
                View Website
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
