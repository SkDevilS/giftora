import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import adminApi from '../../utils/adminApi';

const AdminSections = () => {
  const { showSuccess, showError } = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
    show_in_nav: true,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/sections');
      setSections(response.data.sections || []);
    } catch (error) {
      showError('Failed to fetch sections');
      console.error(error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = () => {
    setEditingSection(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      display_order: sections.length,
      is_active: true,
      show_in_nav: true,
    });
    setShowModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      slug: section.slug,
      description: section.description || '',
      display_order: section.display_order,
      is_active: section.is_active,
      show_in_nav: section.show_in_nav !== undefined ? section.show_in_nav : true,
    });
    setShowModal(true);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await adminApi.put(`/admin/sections/${editingSection.id}`, formData);
        showSuccess('Section updated successfully');
      } else {
        await adminApi.post('/admin/sections', formData);
        showSuccess('Section created successfully');
      }
      setShowModal(false);
      fetchSections();
    } catch (error) {
      showError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this category? All products will be moved to "Miscellaneous" category.')) return;

    try {
      await adminApi.delete(`/admin/sections/${sectionId}`);
      showSuccess('Category deleted successfully');
      fetchSections();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (sectionId, currentStatus) => {
    try {
      await adminApi.put(`/admin/sections/${sectionId}`, {
        is_active: !currentStatus,
      });
      showSuccess(`Section ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchSections();
    } catch (error) {
      showError('Failed to update section status');
    }
  };

  const handleReorder = async (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];

    // Update display_order for both sections
    try {
      await Promise.all([
        adminApi.put(`/admin/sections/${newSections[currentIndex].id}`, {
          display_order: currentIndex,
        }),
        adminApi.put(`/admin/sections/${newSections[newIndex].id}`, {
          display_order: newIndex,
        }),
      ]);
      fetchSections();
    } catch (error) {
      showError('Failed to reorder sections');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <button
          onClick={handleCreateSection}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Add New Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No categories found</p>
          <button
            onClick={handleCreateSection}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Your First Category
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Nav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section, index) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleReorder(section.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleReorder(section.id, 'down')}
                          disabled={index === sections.length - 1}
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
                      <div className="text-sm font-medium text-gray-900">{section.name}</div>
                      {section.description && (
                        <div className="text-sm text-gray-500">{section.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {section.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {section.product_count || 0} products
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        section.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        section.show_in_nav 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.show_in_nav ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditSection(section)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(section.id, section.is_active)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {section.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
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
              {editingSection ? 'Edit Category' : 'Create New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version (auto-generated from name)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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
                  Active (visible on website)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_in_nav"
                  checked={formData.show_in_nav}
                  onChange={(e) => setFormData({ ...formData, show_in_nav: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="show_in_nav" className="ml-2 text-sm text-gray-700">
                  Show in Navigation Menu
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingSection ? 'Update Category' : 'Create Category'}
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

export default AdminSections;
