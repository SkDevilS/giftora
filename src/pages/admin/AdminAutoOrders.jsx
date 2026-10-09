import { useState } from 'react';

export default function AdminAutoOrders() {
  const [formData, setFormData] = useState({
    amount: '',
    orderid: '',
    payee_name: '',
    payee_email: '',
    payee_mobile: '',
    UTR: '',
    Refno: '',
    TimeStamp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Prepare data - remove empty timestamp
      const submitData = { ...formData };
      if (!submitData.TimeStamp) {
        delete submitData.TimeStamp;
      }
      
      const res = await fetch(`${apiUrl}/api/auto-order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
        // Reset form
        setFormData({
          amount: '',
          orderid: '',
          payee_name: '',
          payee_email: '',
          payee_mobile: '',
          UTR: '',
          Refno: '',
          TimeStamp: ''
        });
      } else {
        setError(data.error || 'Failed to create order');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const randomId = Math.floor(Math.random() * 1000000000000000);
    
    setFormData({
      amount: '1000',
      orderid: randomId.toString(),
      payee_name: 'Test Customer',
      payee_email: `test${Date.now()}@example.com`,
      payee_mobile: '9876543210',
      UTR: `UTR${Date.now()}`,
      Refno: `REF${Date.now()}`,
      TimeStamp: timestamp
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Auto Order API Tester</h1>
            <button
              type="button"
              onClick={generateSampleData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate Sample Data
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rs) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID *
                </label>
                <input
                  type="text"
                  name="orderid"
                  value={formData.orderid}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="93107952925922625"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee Name *
                </label>
                <input
                  type="text"
                  name="payee_name"
                  value={formData.payee_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Jagdish Bhai Kara"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee Email *
                </label>
                <input
                  type="email"
                  name="payee_email"
                  value={formData.payee_email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="jagdishbhaikara93915@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee Mobile *
                </label>
                <input
                  type="tel"
                  name="payee_mobile"
                  value={formData.payee_mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="7247611201"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UTR *
                </label>
                <input
                  type="text"
                  name="UTR"
                  value={formData.UTR}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="306187614962"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference No *
                </label>
                <input
                  type="text"
                  name="Refno"
                  value={formData.Refno}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="27157203825"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timestamp (Optional)
                </label>
                <input
                  type="text"
                  name="TimeStamp"
                  value={formData.TimeStamp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="2024-01-15 10:30:00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Order...' : 'Create Auto Order'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-red-800 font-semibold mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-green-800 font-semibold mb-2">Success!</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Order Number:</strong> {response.order?.order_number}</p>
                <p><strong>Receipt Number:</strong> {response.order?.receipt_number}</p>
                <p><strong>Total Amount:</strong> Rs {response.order?.total_amount}</p>
                <p><strong>Status:</strong> {response.order?.status}</p>
                <p><strong>Payment Status:</strong> {response.order?.payment_status}</p>
                {response.user_created && (
                  <p className="text-green-700 font-semibold">
                    New user created with password: {response.default_password}
                  </p>
                )}
                {response.order?.payment_details && (
                  <>
                    <p><strong>UTR:</strong> {response.order.payment_details.utr}</p>
                    <p><strong>Ref No:</strong> {response.order.payment_details.ref_no}</p>
                  </>
                )}
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-green-700 font-semibold">
                  View Full Response
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="text-blue-800 font-semibold mb-2">API Information</h3>
          <p className="text-sm text-blue-700 mb-2">
            <strong>Endpoint:</strong> POST /api/auto-order/create
          </p>
          <p className="text-sm text-blue-700">
            This API creates orders automatically from payment gateway data. 
            It will create a customer account if the email doesn't exist (password: test@123), 
            select products to match the amount, and generate a receipt with UTR and Ref No.
          </p>
        </div>
      </div>
    </div>
  );
}
