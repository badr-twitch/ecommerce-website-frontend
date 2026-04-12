vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../../services/api';
import { paymentService } from '../../../services/paymentService';

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('posts to /orders/create-payment-intent with amount and currency', async () => {
      api.post.mockResolvedValue({ data: { clientSecret: 'pi_secret_123' } });

      const result = await paymentService.createPaymentIntent(5000, 'mad');

      expect(api.post).toHaveBeenCalledWith('/orders/create-payment-intent', {
        amount: 5000,
        currency: 'mad',
      });
      expect(result).toEqual({ clientSecret: 'pi_secret_123' });
    });

    it('defaults currency to mad', async () => {
      api.post.mockResolvedValue({ data: { clientSecret: 'pi_secret_456' } });

      await paymentService.createPaymentIntent(3000);

      expect(api.post).toHaveBeenCalledWith('/orders/create-payment-intent', {
        amount: 3000,
        currency: 'mad',
      });
    });
  });

  describe('createOrder', () => {
    it('posts order data to /orders', async () => {
      const orderData = { items: [{ id: 'p1', quantity: 2 }], totalAmount: 59.98 };
      api.post.mockResolvedValue({ data: { success: true, order: { id: 'ord-1' } } });

      const result = await paymentService.createOrder(orderData);

      expect(api.post).toHaveBeenCalledWith('/orders', orderData);
      expect(result.success).toBe(true);
    });
  });

  describe('getPaymentMethods', () => {
    it('fetches saved payment methods', async () => {
      const methods = [{ id: 'pm_1', brand: 'visa', last4: '4242' }];
      api.get.mockResolvedValue({ data: { paymentMethods: methods } });

      const result = await paymentService.getPaymentMethods();

      expect(api.get).toHaveBeenCalledWith('/payment-methods');
      expect(result.paymentMethods).toEqual(methods);
    });
  });

  describe('createSetupIntent', () => {
    it('posts to /payment-methods/setup-intent', async () => {
      api.post.mockResolvedValue({ data: { clientSecret: 'seti_secret_789' } });

      const result = await paymentService.createSetupIntent();

      expect(api.post).toHaveBeenCalledWith('/payment-methods/setup-intent');
      expect(result.clientSecret).toBe('seti_secret_789');
    });
  });

  describe('deletePaymentMethod', () => {
    it('deletes payment method by id', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await paymentService.deletePaymentMethod('pm_123');

      expect(api.delete).toHaveBeenCalledWith('/payment-methods/pm_123');
      expect(result.success).toBe(true);
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('puts to /payment-methods/:id/default', async () => {
      api.put.mockResolvedValue({ data: { success: true } });

      const result = await paymentService.setDefaultPaymentMethod('pm_456');

      expect(api.put).toHaveBeenCalledWith('/payment-methods/pm_456/default');
      expect(result.success).toBe(true);
    });
  });
});
