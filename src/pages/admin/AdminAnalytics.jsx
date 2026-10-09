import { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({ views: 0, clicks: 0 });
  const [formData, setFormData] = useState({ views: '', clicks: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminApi.get('/analytics');
      setAnalytics(response.data);
      setFormData({
        views: response.data.views.toString(),
        clicks: response.data.clicks.toString()
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMessage({ type: 'error', text: 'Failed to load analytics data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Sending analytics update:', {
        views: parseInt(formData.views),
        clicks: parseInt(formData.clicks)
      });

      const response = await adminApi.put('/admin/analytics', {
        views: parseInt(formData.views),
        clicks: parseInt(formData.clicks)
      });

      console.log('Analytics update response:', response.data);

      // Update analytics state with the response data
      setAnalytics({
        views: response.data.views,
        clicks: response.data.clicks
      });
      setMessage({ type: 'success', text: 'Analytics updated successfully! These base numbers will increase with actual user activity.' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      console.error('Error updating analytics:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update analytics';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set custom base numbers for visits and clicks. These will automatically increase with actual user activity.
        </p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Visits</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {analytics.views.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-200 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Live tracking enabled
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Clicks</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {analytics.clicks.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-200 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
            Live tracking enabled
          </div>
        </div>
      </div>

      {/* Update Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Base Numbers</h2>
        <p className="text-sm text-gray-600 mb-6">
          Set custom starting values for your analytics counters. The system will automatically increment these numbers based on actual user visits and clicks.
        </p>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-start">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="views" className="block text-sm font-medium text-gray-700 mb-2">
                Base Visits Count
              </label>
              <input
                type="text"
                id="views"
                name="views"
                value={formData.views}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 10000"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This number will increase automatically with each page visit
              </p>
            </div>

            <div>
              <label htmlFor="clicks" className="block text-sm font-medium text-gray-700 mb-2">
                Base Clicks Count
              </label>
              <input
                type="text"
                id="clicks"
                name="clicks"
                value={formData.clicks}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 125000"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This number will increase automatically with each user click
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Changes take effect immediately
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Analytics'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Set your desired base numbers for visits and clicks</li>
              <li>The system automatically increments visits when users load pages</li>
              <li>Clicks are tracked whenever users interact with the website</li>
              <li>These counters are displayed in the footer for all visitors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
