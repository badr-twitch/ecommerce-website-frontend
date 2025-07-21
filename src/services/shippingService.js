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

export const shippingService = {
  // Get all shipping addresses
  getShippingAddresses: async () => {
    return await apiCall('/shipping-addresses');
  },

  // Add new shipping address
  addShippingAddress: async (addressData) => {
    return await apiCall('/shipping-addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },

  // Update shipping address
  updateShippingAddress: async (id, addressData) => {
    return await apiCall(`/shipping-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  },

  // Delete shipping address
  deleteShippingAddress: async (id) => {
    return await apiCall(`/shipping-addresses/${id}`, {
      method: 'DELETE'
    });
  },

  // Set shipping address as default
  setDefaultShippingAddress: async (id) => {
    return await apiCall(`/shipping-addresses/${id}/default`, {
      method: 'PUT'
    });
  }
}; 