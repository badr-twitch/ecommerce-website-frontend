import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrders } from '../../../hooks/useOrders';
import { AuthContext } from '../../../contexts/AuthContext';
import { buildOrder, buildUser } from '../../helpers/factories';

// Mock api service
vi.mock('../../../services/api', () => {
  const ordersAPI = {
    getAll: vi.fn(),
    getById: vi.fn(),
    cancel: vi.fn(),
  };
  return {
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    ordersAPI,
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { ordersAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const mockUser = buildUser();

const createWrapper = (authValue = {}) => {
  const defaultAuth = {
    user: mockUser,
    isLoading: false,
    ...authValue,
  };
  return ({ children }) => (
    <AuthContext.Provider value={defaultAuth}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('initial state', () => {
    it('starts with empty orders and no error', () => {
      ordersAPI.getAll.mockResolvedValue({ data: { success: true, orders: [], pagination: {} } });
      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      expect(result.current.orders).toEqual([]);
      expect(result.current.error).toBe('');
    });
  });

  describe('fetchOrders', () => {
    it('fetches orders when user is authenticated', async () => {
      const orders = [buildOrder(), buildOrder()];
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders, pagination: { currentPage: 1, totalPages: 1, totalItems: 2, itemsPerPage: 10 } },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(2);
      });

      expect(ordersAPI.getAll).toHaveBeenCalled();
    });

    it('does not fetch when user is null', () => {
      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper({ user: null }),
      });

      expect(ordersAPI.getAll).not.toHaveBeenCalled();
      expect(result.current.orders).toEqual([]);
    });

    it('sets error on 401 response', async () => {
      ordersAPI.getAll.mockRejectedValue({
        response: { status: 401 },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.error).toContain('Session expirée');
      });
    });

    it('sets error on 403 response', async () => {
      ordersAPI.getAll.mockRejectedValue({
        response: { status: 403 },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.error).toContain('Accès refusé');
      });
    });
  });

  describe('cancelOrder', () => {
    it('updates order status to cancelled on success', async () => {
      const order1 = buildOrder({ status: 'pending' });
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders: [order1], pagination: {} },
      });
      ordersAPI.cancel.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.orders).toHaveLength(1));

      let cancelled;
      await act(async () => {
        cancelled = await result.current.cancelOrder(order1.id);
      });

      expect(cancelled).toBe(true);
      expect(result.current.orders[0].status).toBe('cancelled');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('filters and pagination', () => {
    it('updateFilters resets currentPage to 1', async () => {
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handlePageChange(3);
      });

      act(() => {
        result.current.updateFilters({ status: 'delivered' });
      });

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.filters.status).toBe('delivered');
    });

    it('clearFilters resets to initial filters', async () => {
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders: [], pagination: {} },
      });

      const { result } = renderHook(() => useOrders({ status: '' }), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.updateFilters({ status: 'pending' });
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({ status: '' });
    });
  });

  describe('helper functions', () => {
    it('getOrdersByStatus filters correctly', async () => {
      const orders = [
        buildOrder({ status: 'delivered' }),
        buildOrder({ status: 'pending' }),
        buildOrder({ status: 'delivered' }),
      ];
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders, pagination: {} },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.orders).toHaveLength(3));

      expect(result.current.getOrdersByStatus('delivered')).toHaveLength(2);
      expect(result.current.getOrderCountByStatus('pending')).toBe(1);
    });

    it('getTotalSpent sums delivered orders', async () => {
      const orders = [
        buildOrder({ status: 'delivered', totalAmount: '50.00' }),
        buildOrder({ status: 'delivered', totalAmount: '30.00' }),
        buildOrder({ status: 'pending', totalAmount: '100.00' }),
      ];
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders, pagination: {} },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.orders).toHaveLength(3));

      expect(result.current.getTotalSpent()).toBe(80);
    });

    it('getAverageOrderValue returns correct average', async () => {
      const orders = [
        buildOrder({ status: 'delivered', totalAmount: '60.00' }),
        buildOrder({ status: 'delivered', totalAmount: '40.00' }),
      ];
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders, pagination: {} },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.orders).toHaveLength(2));

      expect(result.current.getAverageOrderValue()).toBe(50);
    });

    it('getAverageOrderValue returns 0 when no delivered orders', async () => {
      ordersAPI.getAll.mockResolvedValue({
        data: { success: true, orders: [buildOrder({ status: 'pending' })], pagination: {} },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.orders).toHaveLength(1));

      expect(result.current.getAverageOrderValue()).toBe(0);
    });
  });
});
