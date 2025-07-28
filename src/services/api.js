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
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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