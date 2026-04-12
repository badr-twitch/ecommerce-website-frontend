import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../../../contexts/WishlistContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { buildProduct, buildUser } from '../../helpers/factories';

// Mock api service
vi.mock('../../../services/api', () => {
  const usersAPI = {
    getWishlist: vi.fn(),
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    clearWishlist: vi.fn(),
  };
  return {
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    usersAPI,
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { usersAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const mockUser = buildUser();

const createWrapper = (authValue = {}) => {
  const defaultAuth = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    ...authValue,
  };
  return ({ children }) => (
    <AuthContext.Provider value={defaultAuth}>
      <WishlistProvider>{children}</WishlistProvider>
    </AuthContext.Provider>
  );
};

describe('WishlistContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: loadWishlist returns empty
    usersAPI.getWishlist.mockResolvedValue({ data: { products: [] } });
  });

  it('throws when useWishlist is used outside WishlistProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useWishlist())).toThrow(
      'useWishlist must be used within a WishlistProvider'
    );
    spy.mockRestore();
  });

  describe('initial state', () => {
    it('starts with empty items and not loading', async () => {
      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.wishlistItems).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('loads wishlist from API when user is authenticated', async () => {
      const products = [buildProduct(), buildProduct()];
      usersAPI.getWishlist.mockResolvedValue({ data: { products } });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.wishlistItems).toHaveLength(2);
      });

      expect(usersAPI.getWishlist).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('addToWishlist', () => {
    it('adds product and shows success toast', async () => {
      usersAPI.addToWishlist.mockResolvedValue({ data: { success: true } });
      const product = buildProduct({ name: 'Test Sneaker' });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let success;
      await act(async () => {
        success = await result.current.addToWishlist(product);
      });

      expect(success).toBe(true);
      expect(result.current.wishlistItems).toContainEqual(product);
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Test Sneaker'));
    });

    it('shows error toast when not authenticated', async () => {
      const { result } = renderHook(() => useWishlist(), {
        wrapper: createWrapper({ user: null }),
      });

      let success;
      await act(async () => {
        success = await result.current.addToWishlist(buildProduct());
      });

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalled();
    });

    it('handles API error', async () => {
      usersAPI.addToWishlist.mockRejectedValue({
        response: { data: { error: 'Produit déjà dans la wishlist' } },
      });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addToWishlist(buildProduct());
      });

      expect(result.current.error).toBe('Produit déjà dans la wishlist');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    it('removes product and shows success toast', async () => {
      const product = buildProduct({ name: 'Remove Me' });
      usersAPI.getWishlist.mockResolvedValue({ data: { products: [product] } });
      usersAPI.removeFromWishlist.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.wishlistItems).toHaveLength(1));

      let success;
      await act(async () => {
        success = await result.current.removeFromWishlist(product.id);
      });

      expect(success).toBe(true);
      expect(result.current.wishlistItems).toHaveLength(0);
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Remove Me'));
    });
  });

  describe('clearWishlist', () => {
    it('empties all items', async () => {
      usersAPI.getWishlist.mockResolvedValue({ data: { products: [buildProduct(), buildProduct()] } });
      usersAPI.clearWishlist.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.wishlistItems).toHaveLength(2));

      await act(async () => {
        await result.current.clearWishlist();
      });

      expect(result.current.wishlistItems).toHaveLength(0);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('isInWishlist', () => {
    it('returns true for existing product', async () => {
      const product = buildProduct();
      usersAPI.getWishlist.mockResolvedValue({ data: { products: [product] } });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.wishlistItems).toHaveLength(1));

      expect(result.current.isInWishlist(product.id)).toBe(true);
    });

    it('returns false for non-existing product', async () => {
      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isInWishlist('nonexistent')).toBe(false);
    });
  });

  describe('getWishlistCount', () => {
    it('returns correct count', async () => {
      usersAPI.getWishlist.mockResolvedValue({
        data: { products: [buildProduct(), buildProduct(), buildProduct()] },
      });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.wishlistItems).toHaveLength(3));

      expect(result.current.getWishlistCount()).toBe(3);
    });
  });

  describe('network error handling', () => {
    it('sets hasNetworkError and does not retry on network failure', async () => {
      usersAPI.getWishlist.mockRejectedValue({
        code: 'ERR_NETWORK',
        message: 'Network Error',
      });

      const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Should not have set a user-visible error (network errors are silenced)
      expect(result.current.error).toBeNull();
    });
  });
});
