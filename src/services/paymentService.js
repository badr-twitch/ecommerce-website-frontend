import api from './api';

export const paymentService = {
  // Create a Stripe PaymentIntent for checkout
  createPaymentIntent: async (amount, currency = 'mad') => {
    const { data } = await api.post('/orders/create-payment-intent', { amount, currency });
    return data;
  },

  // Create an order after payment succeeds
  createOrder: async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  // Get all saved payment methods
  getPaymentMethods: async () => {
    const { data } = await api.get('/payment-methods');
    return data;
  },

  // Create a SetupIntent to save a card
  createSetupIntent: async () => {
    const { data } = await api.post('/payment-methods/setup-intent');
    return data;
  },

  // Delete a saved payment method
  deletePaymentMethod: async (id) => {
    const { data } = await api.delete(`/payment-methods/${id}`);
    return data;
  },

  // Set a payment method as default
  setDefaultPaymentMethod: async (id) => {
    const { data } = await api.put(`/payment-methods/${id}/default`);
    return data;
  }
};
