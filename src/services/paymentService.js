const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && !options.headers?.Authorization && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de requête');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const paymentService = {
  // Get all payment methods
  getPaymentMethods: async () => {
    return await apiCall('/payment-methods');
  },

  // Add new payment method
  addPaymentMethod: async (paymentData) => {
    console.log('🔍 Frontend - Sending payment data:', paymentData);
    return await apiCall('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // Delete payment method
  deletePaymentMethod: async (id) => {
    return await apiCall(`/payment-methods/${id}`, {
      method: 'DELETE'
    });
  },

  // Set payment method as default
  setDefaultPaymentMethod: async (id) => {
    return await apiCall(`/payment-methods/${id}/default`, {
      method: 'PUT'
    });
  }
}; 