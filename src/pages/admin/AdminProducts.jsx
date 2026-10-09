import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import adminApi from '../../utils/adminApi';
import { formatPrice } from '../../utils/priceFormatter';

const AdminProducts = () => {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkImages, setBulkImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    section_id: '',
    stock: '',
    is_active: true,
    is_on_sale: false,
  });

  useEffect(() => {
    fetchSections();
    fetchProducts();
  }, [currentPage, searchQuery, sectionFilter]);

  const fetchSections = async () => {
    try {
      const response = await adminApi.get('/admin/sections');
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      setSections([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (sectionFilter !== 'all') params.section_id = sectionFilter;

      const response = await adminApi.get('/admin/products', { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      showError('Failed to fetch products');
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      title: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      section_id: '',
      stock: '',
      is_active: true,
      is_on_sale: false,
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || '',
      section_id: product.section_id || '',
      stock: product.stock,
      is_active: product.is_active,
      is_on_sale: product.is_on_sale || false,
    });
    setImageFile(null);
    const images = product.images || [];
    setImagePreview(images.length > 0 ? images[0] : '');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = imagePreview;
      
      // Upload image first if a new file is selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const uploadResponse = await adminApi.post('/admin/upload-image', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadResponse.data.image_url;
      }

      // Prepare product data
      const productData = {
        ...formData,
        images: imageUrl ? [imageUrl] : [],
      };

      if (editingProduct) {
        await adminApi.put(`/admin/products/${editingProduct.id}`, productData);
        showSuccess('Product updated successfully');
      } else {
        await adminApi.post('/admin/products', productData);
        showSuccess('Product created successfully');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      showError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await adminApi.delete(`/admin/products/${productId}`);
      
      // Check if product was deactivated instead of deleted
      if (response.data.deactivated) {
        showSuccess(response.data.message || 'Product has been deactivated (cannot delete ordered products)');
      } else {
        showSuccess('Product deleted successfully');
      }
      
      fetchProducts();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await adminApi.put(`/admin/products/${productId}`, {
        is_active: !currentStatus,
      });
      showSuccess(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProducts();
    } catch (error) {
      showError('Failed to update product status');
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ['SKU', 'Title', 'Description', 'Price', 'Original Price', 'Stock', 'Section Name', 'Is Active', 'Is On Sale', 'Image Filename'];
    const sampleRow = ['PROD001', 'Sample Product', 'Product description here', '99.99', '149.99', '100', 'Personal Care & Hygiene', 'TRUE', 'TRUE', 'product1.jpg'];
    
    const csvContent = [
      headers.join(','),
      sampleRow.join(','),
      '# Instructions:',
      '# 1. Fill in product details in the rows below',
      '# 2. Section Name must match exactly with existing sections',
      '# 3. Is Active and Is On Sale should be TRUE or FALSE',
      '# 4. Image Filename should match the image files you upload (e.g., product1.jpg)',
      '# 5. Save as CSV and upload along with product images'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showSuccess('Template downloaded successfully');
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      showError('Please select a CSV file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', bulkFile);
      
      // Add all images
      bulkImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await adminApi.post('/admin/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      showSuccess(`Successfully uploaded ${response.data.created} products`);
      setShowBulkUploadModal(false);
      setBulkFile(null);
      setBulkImages([]);
      fetchProducts();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to upload products');
      console.error('Bulk upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setBulkFile(file);
    } else {
      showError('Please select a valid CSV file');
    }
  };

  const handleBulkImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setBulkImages(files);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Template
          </button>
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Upload
          </button>
          <button
            onClick={handleCreateProduct}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No products found</p>
          <button
            onClick={handleCreateProduct}
            className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const images = product.images || [];
                    const imageUrl = images.length > 0 ? images[0] : null;
                    const section = sections.find(s => s.id === product.section_id);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {section?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                          {product.is_on_sale && product.original_price && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.original_price)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {product.is_on_sale && (
                              <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                On Sale
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary-600 hover:text-primary-900 text-left flex items-center gap-1.5"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(product.id, product.is_active)}
                              className="text-blue-600 hover:text-blue-900 text-left flex items-center gap-1"
                            >
                              {product.is_active ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 text-left flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bulk Upload Products</h2>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Download the CSV template using the button above</li>
                  <li>Fill in your product details in the CSV file</li>
                  <li>Prepare product images (JPG, PNG) with filenames matching the CSV</li>
                  <li>Upload the CSV file and all product images together</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {bulkFile && (
                  <p className="mt-2 text-sm text-green-600">Selected: {bulkFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkImagesChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {bulkImages.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {bulkImages.length} image(s)
                  </p>
                )}
              </div>

              {isUploading && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || bulkImages.length === 0 || isUploading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Products'}
                </button>
                <button
                  onClick={() => setShowBulkUploadModal(false)}
                  disabled={isUploading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Row 1: SKU, Category, Stock */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    disabled={!!editingProduct}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No Category</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Row 2: Product Title (full width) */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, title, slug });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Row 3: Slug (full width) */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Slug * <span className="text-gray-500 font-normal">(auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                    required
                  />
                </div>

                {/* Row 4: Description (full width) */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Row 5: Price, Original Price, Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Row 6: Image Preview and Checkboxes */}
                {imagePreview && (
                  <div className="md:col-span-3">
                    <img src={imagePreview} alt="Preview" className="h-24 object-cover rounded" />
                  </div>
                )}
                
                <div className="md:col-span-3 flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_on_sale"
                      checked={formData.is_on_sale}
                      onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="is_on_sale" className="ml-2 text-sm text-gray-700">
                      On Sale
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
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

export default AdminProducts;
