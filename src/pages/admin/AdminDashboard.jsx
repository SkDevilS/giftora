import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApi from '../../utils/adminApi';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../utils/priceFormatter';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_sections: 0,
    total_orders: 0,
  });
  const [analytics, setAnalytics] = useState({ views: 0, clicks: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes, ordersRes] = await Promise.all([
        adminApi.get('/admin/stats').catch(() => ({ data: { total_users: 0, total_products: 0, total_sections: 0, total_orders: 0 } })),
        adminApi.get('/analytics').catch(() => ({ data: { views: 0, clicks: 0 } })),
        adminApi.get('/admin/orders?per_page=5').catch(() => ({ data: { orders: [] } })),
      ]);

      setStats(statsRes.data || { total_users: 0, total_products: 0, total_sections: 0, total_orders: 0 });
      setAnalytics(analyticsRes.data || { views: 0, clicks: 0 });
      setRecentOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total_users}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Manage Users →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total_products}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <Link to="/admin/products" className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block">
              Manage Products →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Categories</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total_sections}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <Link to="/admin/sections" className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-block">
              Manage Categories →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total_orders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <Link to="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 mt-2 inline-block">
              View Orders →
            </Link>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Site Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Views</span>
                <span className="text-2xl font-bold text-primary-600">{analytics.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Clicks</span>
                <span className="text-2xl font-bold text-primary-600">{analytics.clicks}</span>
              </div>
            </div>
            <Link to="/admin/analytics" className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block">
              View Analytics →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/products/new"
                className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                + Add New Product
              </Link>
              <Link
                to="/admin/sections/new"
                className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                + Add New Category
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">
              View All →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{order.order_number}</td>
                      <td className="py-3 px-4 text-sm">{order.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm font-semibold">{formatPrice(order.total_amount)}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminDashboard;
