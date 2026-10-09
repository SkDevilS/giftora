import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import adminApi from '../../utils/adminApi';

const AdminNavbar = () => {
  const { showSuccess, showError } = useToast();
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/navbar');
      setNavItems(response.data.items || response.data.navbar_items || response.data || []);
    } catch (error) {
      showError('Failed to fetch navigation items');
      console.error(error);
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormData({
      label: '',
      url: '',
      display_order: navItems.length,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      url: item.url,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.put(`/admin/navbar/${editingItem.id}`, formData);
        showSuccess('Navigation item updated successfully');
      } else {
        await adminApi.post('/admin/navbar', formData);
        showSuccess('Navigation item created successfully');
      }
      setShowModal(false);
      fetchNavItems();
    } catch (error) {
      showError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this navigation item?')) return;

    try {
      await adminApi.delete(`/admin/navbar/${itemId}`);
      showSuccess('Navigation item deleted successfully');
      fetchNavItems();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleToggleActive = async (itemId, currentStatus) => {
    try {
      await adminApi.put(`/admin/navbar/${itemId}`, {
        is_active: !currentStatus,
      });
      showSuccess(`Navigation item ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchNavItems();
    } catch (error) {
      showError('Failed to update item status');
    }
  };

  const handleReorder = async (itemId, direction) => {
    const currentIndex = navItems.findIndex(item => item.id === itemId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === navItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newItems = [...navItems];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];

    try {
      await Promise.all([
        adminApi.put(`/admin/navbar/${newItems[currentIndex].id}`, {
          display_order: currentIndex,
        }),
        adminApi.put(`/admin/navbar/${newItems[newIndex].id}`, {
          display_order: newIndex,
        }),
      ]);
      fetchNavItems();
    } catch (error) {
      showError('Failed to reorder items');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Navigation Management</h1>
        <button
          onClick={handleCreateItem}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add Navigation Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading navigation...</p>
        </div>
      ) : navItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No navigation items found</p>
          <button
            onClick={handleCreateItem}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {navItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleReorder(item.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleReorder(item.id, 'down')}
                          disabled={index === navItems.length - 1}
                          className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {item.url}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {item.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? 'Edit Navigation Item' : 'Create Navigation Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Home, Shop, About"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g., /, /category/beauty, /about"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use relative URLs (starting with /)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active (visible in navigation)
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;
