import axios from 'axios';

// Get API URL from environment variable (required)
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set. Please check your .env file.');
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and fallback
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Fallback to local data in development if backend is not available
    if (import.meta.env.DEV && error.config) {
      const url = error.config.url || '';
      
      // Fallback for products endpoints
      if (url.includes('/products')) {
        console.warn('Backend not available, using local data fallback');
        const searchParams = new URLSearchParams(url.split('?')[1] || '');
        const category = searchParams.get('section');
        const slug = url.match(/\/products\/slug\/(.+)/)?.[1];
        const id = url.match(/\/products\/([^\/]+)$/)?.[1];
        
        if (slug) {
          const product = getProductBySlug(slug);
          if (product) {
            return Promise.resolve({ data: { product }, status: 200, config: error.config });
          }
        } else if (id && !id.includes('slug')) {
          const product = getProductById(id);
          if (product) {
            return Promise.resolve({ data: { product }, status: 200, config: error.config });
          }
        } else if (category) {
          const filteredProducts = getProductsByCategory(category);
          return Promise.resolve({ 
            data: { products: filteredProducts, total: filteredProducts.length }, 
            status: 200, 
            config: error.config 
          });
        } else {
          const allProducts = getProductsByCategory(null);
          return Promise.resolve({ 
            data: { products: allProducts, total: allProducts.length }, 
            status: 200, 
            config: error.config 
          });
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

