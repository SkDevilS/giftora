import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import adminApi from '../../utils/adminApi';
import { formatPrice } from '../../utils/priceFormatter';

const AdminOrders = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await adminApi.get('/admin/orders', { params });
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      showError('Failed to fetch orders');
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await adminApi.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      showError('Failed to fetch order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminApi.put(`/admin/orders/${orderId}`, { status: newStatus });
      showSuccess('Order status updated successfully');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.delete(`/admin/orders/${orderId}`);
      showSuccess('Order deleted successfully');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowDetailsModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete order');
    }
  };

  const handleDownloadReceipt = async (orderId, receiptNumber) => {
    try {
      const response = await adminApi.get(`/admin/orders/${orderId}/receipt`, {
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, receipt #, customer name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(order.id, order.receipt_number)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download Receipt"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Order"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-gray-600">Order #{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedOrder.user?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.user?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.user?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method?.toUpperCase() || 'N/A'}</p>
                  <p><span className="font-medium">Payment Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.payment_status || 'pending'}
                    </span>
                  </p>
                  {/* PayU Transaction Details */}
                  {selectedOrder.payment_method === 'payu' && selectedOrder.payu_mihpayid && (
                    <>
                      <p><span className="font-medium">PayU Transaction ID:</span> {selectedOrder.payu_mihpayid}</p>
                      {selectedOrder.payment_details?.payu_bank_ref_num && (
                        <p><span className="font-medium">Bank Reference:</span> {selectedOrder.payment_details.payu_bank_ref_num}</p>
                      )}
                      {selectedOrder.payment_details?.payu_mode && (
                        <p><span className="font-medium">Payment Mode:</span> {selectedOrder.payment_details.payu_mode}</p>
                      )}
                    </>
                  )}
                  {/* Manual UPI Details */}
                  {selectedOrder.payment_method === 'upi' && selectedOrder.payment_details?.utr && (
                    <p><span className="font-medium">UTR:</span> {selectedOrder.payment_details.utr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shipping_address.street}</p>
                  {selectedOrder.shipping_address.apartment && <p>{selectedOrder.shipping_address.apartment}</p>}
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}</p>
                  <p>{selectedOrder.shipping_address.country}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{item.product_name}</td>
                        <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal || selectedOrder.total_amount)}</span>
                </div>
                {selectedOrder.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleDownloadReceipt(selectedOrder.id, selectedOrder.receipt_number)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Receipt</span>
              </button>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <>
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Confirm Order
                    </button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Cancel Order
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Order</span>
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
