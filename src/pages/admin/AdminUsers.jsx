import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import adminApi from '../../utils/adminApi';

const AdminUsers = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    is_active: true,
  });

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== 'all') params.role = roleFilter;

      const response = await adminApi.get('/admin/users', { params });
      setUsers(response.data.users || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      showError('Failed to fetch users');
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserAddresses([]);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEditUser = async (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setShowModal(true);
    
    // Fetch user addresses
    if (user.role === 'customer') {
      setLoadingAddresses(true);
      try {
        const response = await adminApi.get(`/admin/users/${user.id}`);
        // Assuming the backend returns user with addresses
        setUserAddresses(response.data.user?.addresses || []);
      } catch (error) {
        console.error('Failed to fetch user addresses:', error);
        setUserAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    } else {
      setUserAddresses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await adminApi.put(`/admin/users/${editingUser.id}`, updateData);
        showSuccess('User updated successfully');
      } else {
        // Create user
        await adminApi.post('/admin/users', formData);
        showSuccess('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      showError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminApi.delete(`/admin/users/${userId}`);
      showSuccess('User deleted successfully');
      fetchUsers();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminApi.put(`/admin/users/${userId}`, {
        is_active: !currentStatus,
      });
      showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      showError('Failed to update user status');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password (min 8 characters):');
    if (!newPassword) return;

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    try {
      await adminApi.post(`/admin/users/${userId}/reset-password`, {
        new_password: newPassword,
      });
      showSuccess('Password reset successfully');
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={handleCreateUser}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Form */}
              <div>
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 1234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {editingUser && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required={!editingUser}
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
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
                      Active Account
                    </label>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
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

              {/* User Addresses */}
              {editingUser && formData.role === 'customer' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
                  {loadingAddresses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading addresses...</p>
                    </div>
                  ) : userAddresses.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-500">No addresses saved yet</p>
                      <p className="text-sm text-gray-400 mt-1">Customer will add addresses during checkout</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 ${
                            address.is_default ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                          }`}
                        >
                          {address.is_default && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded mb-2">
                              Default Address
                            </span>
                          )}
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">{address.full_name}</p>
                            <p className="text-gray-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {address.phone}
                            </p>
                            <p className="text-gray-600 mt-2">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
