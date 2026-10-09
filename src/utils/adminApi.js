import axios from 'axios';

// Get API URL from environment variable (required)
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set. Please check your .env file.');
}

const adminApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add admin auth token
adminApi.interceptors.request.use(
  (config) => {
    // Use admin-specific token
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data;
          localStorage.setItem('admin_access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout admin
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 errors (forbidden - not admin)
    if (error.response?.status === 403) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default adminApi;
