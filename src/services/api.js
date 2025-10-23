import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get fresh Firebase ID token instead of using stored token
    const { auth } = await import('../config/firebase');
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔍 API Request Interceptor - Fresh Firebase token added');
      } catch (error) {
        console.error('🔍 API Request Interceptor - Error getting fresh token:', error);
        // Fallback to stored token if fresh token fails
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
          console.log('🔍 API Request Interceptor - Using stored token as fallback');
        }
      }
    } else {
      console.log('🔍 API Request Interceptor - No authenticated user');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 API Response Interceptor - Error status:', error.response?.status);
    console.log('🔍 API Response Interceptor - Error URL:', error.config?.url);
    
    if (error.response?.status === 401) {
      console.log('🔍 API Response Interceptor - 401 Unauthorized error');
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login for non-orders requests to prevent infinite redirects
      if (!error.config?.url?.includes('/orders')) {
        console.log('🔍 API Response Interceptor - Redirecting to login');
        window.location.href = '/login';
      } else {
        console.log('🔍 API Response Interceptor - Orders request, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products', { params: { featured: true, limit: 8 } }),
  getOnSale: () => api.get('/products', { params: { onSale: true, limit: 8 } }),
  search: (query, params = {}) => api.get('/products', { params: { search: query, ...params } }),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  getProducts: (categoryId, params = {}) => api.get('/products', { params: { category: categoryId, ...params } }),
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getOrders: (id, params = {}) => api.get(`/users/${id}/orders`, { params }),
  verifyEmail: (id, data) => api.post(`/users/${id}/verify-email`, data),
  // Wishlist API
  getWishlist: (id) => api.get(`/users/${id}/wishlist`),
  addToWishlist: (id, data) => api.post(`/users/${id}/wishlist`, data),
  removeFromWishlist: (id, productId) => api.delete(`/users/${id}/wishlist/${productId}`),
  clearWishlist: (id) => api.delete(`/users/${id}/wishlist`),
};

// Cart API (if you want to persist cart on server)
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Recommendations API
export const recommendationsAPI = {
  getUserRecommendations: (limit = 10) => api.get('/recommendations/user', { params: { limit } }),
  getProductRecommendations: (productId, limit = 6) => api.get(`/recommendations/product/${productId}`, { params: { limit } }),
  getCategoryRecommendations: (categoryId, limit = 8) => api.get(`/recommendations/category/${categoryId}`, { params: { limit } }),
  getTrendingRecommendations: (limit = 12, categoryId = null) => {
    const params = { limit };
    if (categoryId) params.categoryId = categoryId;
    return api.get('/recommendations/trending', { params });
  },
  getFrequentlyBoughtTogether: (productId, limit = 4) => api.get(`/recommendations/frequently-bought/${productId}`, { params: { limit } }),
  getSimilarUsers: (userId, limit = 5) => api.get(`/recommendations/similar-users/${userId}`, { params: { limit } }),
  getInsights: () => api.get('/recommendations/insights'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Utility functions
export const formatPrice = (price, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;
    
    if (status === 400) {
      return data.error || 'Données invalides';
    } else if (status === 401) {
      return 'Session expirée. Veuillez vous reconnecter.';
    } else if (status === 403) {
      return 'Accès refusé';
    } else if (status === 404) {
      return 'Ressource non trouvée';
    } else if (status === 422) {
      return data.error || 'Données invalides';
    } else if (status >= 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    
    return data.error || 'Une erreur est survenue';
  } else if (error.request) {
    // Network error
    return 'Erreur de connexion. Vérifiez votre connexion internet.';
  } else {
    // Other error
    return 'Une erreur inattendue est survenue';
  }
};

export default api; 